/* ============================================================
   PLANT PARENT — client-side database (IndexedDB)
   Real structured storage for the user's profile, garden (both
   catalog-linked and fully custom plants), growth logs, journal
   entries and favourites. No server — works unmodified on
   GitHub Pages. Loaded as a plain script (no bundler), exposes
   window.PPDB.
   ============================================================ */
(function () {
  const DB_NAME = 'plantparent';
  const DB_VERSION = 1;
  const LEGACY_FAVS_KEY = 'pp_favs';
  const KEY_PATHS = { profile: 'id', garden: 'id', growthLogs: 'id', journal: 'id', favorites: 'catalogId' };

  function reqP(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function openIDB() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') { reject(new Error('IndexedDB unavailable')); return; }
      let req;
      try { req = indexedDB.open(DB_NAME, DB_VERSION); }
      catch (e) { reject(e); return; }
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('garden')) {
          const s = db.createObjectStore('garden', { keyPath: 'id' });
          s.createIndex('catalogId', 'catalogId', { unique: false });
        }
        if (!db.objectStoreNames.contains('growthLogs')) {
          const s = db.createObjectStore('growthLogs', { keyPath: 'id' });
          s.createIndex('gardenId', 'gardenId', { unique: false });
        }
        if (!db.objectStoreNames.contains('journal')) {
          const s = db.createObjectStore('journal', { keyPath: 'id' });
          s.createIndex('gardenId', 'gardenId', { unique: false });
        }
        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', { keyPath: 'catalogId' });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  // ---------- in-memory fallback backend ----------
  // Used when IndexedDB is unavailable or blocked (some browsers restrict it
  // for file:// pages). Data won't survive a reload in that case, but the app
  // stays fully functional for the session instead of hanging forever.
  function makeMemoryBackend() {
    const maps = { profile: new Map(), garden: new Map(), growthLogs: new Map(), journal: new Map(), favorites: new Map() };
    return {
      getAll: async (name) => Array.from(maps[name].values()),
      put: async (name, value) => { maps[name].set(value[KEY_PATHS[name]], value); return value; },
      get: async (name, key) => maps[name].get(key),
      del: async (name, key) => { maps[name].delete(key); },
      getAllByIndex: async (name, indexName, value) => Array.from(maps[name].values()).filter((v) => v[indexName] === value),
    };
  }

  function makeIDBBackend(db) {
    async function store(name, mode = 'readonly') {
      return db.transaction(name, mode).objectStore(name);
    }
    return {
      getAll: async (name) => reqP((await store(name)).getAll()),
      put: async (name, value) => { await reqP((await store(name, 'readwrite')).put(value)); return value; },
      get: async (name, key) => reqP((await store(name)).get(key)),
      del: async (name, key) => reqP((await store(name, 'readwrite')).delete(key)),
      getAllByIndex: async (name, indexName, value) => reqP((await store(name)).index(indexName).getAll(value)),
    };
  }

  let backendPromise = null;
  function getBackend() {
    if (backendPromise) return backendPromise;
    backendPromise = openIDB().then(
      (db) => makeIDBBackend(db),
      (err) => { console.warn('[PlantParent] IndexedDB unavailable, falling back to in-memory storage (data will not persist across reloads):', err); return makeMemoryBackend(); }
    ).then(async (backend) => { await migrateLegacyFavorites(backend); return backend; });
    return backendPromise;
  }

  async function getAll(name) { return (await getBackend()).getAll(name); }
  async function put(name, value) { return (await getBackend()).put(name, value); }
  async function get(name, key) { return (await getBackend()).get(name, key); }
  async function del(name, key) { return (await getBackend()).del(name, key); }
  async function getAllByIndex(name, indexName, value) { return (await getBackend()).getAllByIndex(name, indexName, value); }

  // ---------- utils shared across pages ----------
  function uid(prefix) {
    return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
  }
  function nowISO() { return new Date().toISOString(); }
  function todayShort() { return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function todayLong() { return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }); }
  function formatDateShort(iso) { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function lightLabel(lux) { if (lux <= 1000) return 'Low light'; if (lux <= 4000) return 'Medium indirect'; if (lux <= 8000) return 'Bright indirect'; return 'Full sun'; }
  function waterLabel(mn, mx) { const a = Math.round((mn + mx) / 2); if (a <= 7) return 'Weekly'; if (a <= 14) return 'Every ~2 wks'; if (a <= 21) return 'Every ~3 wks'; return 'Monthly+'; }
  function initials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'PP';
    return (parts[0][0] + (parts[1] ? parts[1][0] : parts[0][1] || '')).toUpperCase();
  }
  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function computeHealth(row) {
    const baseline = row.lastWateredAt || row.addedAt;
    const benchmark = ((row.min_watering_benchmark_days || 7) + (row.max_watering_benchmark_days || 14)) / 2;
    const daysSince = (Date.now() - new Date(baseline).getTime()) / 86400000;
    const ratio = daysSince / Math.max(1, benchmark);
    let health = ratio <= 1 ? 100 - ratio * 15 : Math.max(10, 85 - (ratio - 1) * 45);
    return Math.round(Math.max(0, Math.min(100, health)));
  }
  function healthStatus(health) { return health < 40 ? 'crit' : health < 65 ? 'warn' : 'good'; }

  // ---------- one-time migration from the old raw-localStorage favourites ----------
  async function migrateLegacyFavorites(backend) {
    let raw;
    try { raw = JSON.parse(localStorage.getItem(LEGACY_FAVS_KEY) || 'null'); } catch { raw = null; }
    if (!Array.isArray(raw) || !raw.length) return;
    for (const catalogId of raw) {
      await backend.put('favorites', { catalogId });
    }
    localStorage.removeItem(LEGACY_FAVS_KEY);
  }

  // ---------- profile / account ----------
  const PROFILE_ID = 'me';
  async function getProfile() {
    let p = await get('profile', PROFILE_ID);
    if (!p) {
      p = { id: PROFILE_ID, name: 'Plant Parent', avatarEmoji: '🌱', photoDataUrl: null, bio: '', joinedAt: nowISO(), accountCreated: false };
      await put('profile', p);
    }
    return p;
  }
  async function saveProfile(patch) {
    const current = await getProfile();
    const next = Object.assign({}, current, patch, { id: PROFILE_ID });
    return put('profile', next);
  }
  // Nothing gets saved (garden, journal, favourites, growth logs) until the
  // user has created an account — just a name, username and password, kept
  // locally in this same profile record (there's no server to send it to).
  async function hasAccount() {
    return !!(await getProfile()).accountCreated;
  }
  async function createAccount({ name, username, password }) {
    return saveProfile({ name, username, password, accountCreated: true });
  }

  // ---------- garden ----------
  async function listGarden() {
    const rows = await getAll('garden');
    return rows.sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1));
  }
  async function getGardenItem(id) { return get('garden', id); }
  async function findGardenByCatalogId(catalogId) {
    const rows = await getAllByIndex('garden', 'catalogId', catalogId);
    return rows[0] || null;
  }
  async function isInGarden(catalogId) { return !!(await findGardenByCatalogId(catalogId)); }

  // catalogPlant: the raw object from plants.json (pid, display_pid, alias, emoji, image_url, ...)
  async function addCatalogPlantToGarden(catalogPlant) {
    const existing = await findGardenByCatalogId(catalogPlant.pid);
    if (existing) return existing;
    const row = {
      id: uid('g'),
      catalogId: catalogPlant.pid,
      isCustom: false,
      displayName: catalogPlant.display_pid,
      alias: catalogPlant.alias,
      emoji: catalogPlant.emoji || '🪴',
      image: catalogPlant.image_url || null,
      min_watering_benchmark_days: catalogPlant.min_watering_benchmark_days,
      max_watering_benchmark_days: catalogPlant.max_watering_benchmark_days,
      min_light_lux: catalogPlant.min_light_lux,
      toxicity: !!catalogPlant.toxicity,
      nickname: null,
      notes: '',
      addedAt: nowISO(),
    };
    return put('garden', row);
  }

  async function addCustomPlant({ displayName, alias, emoji, image, wateringDays, lightNeed, notes }) {
    const row = {
      id: uid('g'),
      catalogId: null,
      isCustom: true,
      displayName: displayName || 'My Plant',
      alias: alias || '',
      emoji: emoji || '🌱',
      image: image || null,
      min_watering_benchmark_days: wateringDays || 7,
      max_watering_benchmark_days: wateringDays || 14,
      min_light_lux: lightNeed || 2000,
      toxicity: false,
      nickname: null,
      notes: notes || '',
      addedAt: nowISO(),
    };
    return put('garden', row);
  }

  const CARE_FIELD = { water: 'lastWateredAt', sun: 'lastSunAt', feed: 'lastFedAt' };
  async function logCare(gardenId, type) {
    const field = CARE_FIELD[type];
    if (!field) return null;
    const row = await getGardenItem(gardenId);
    if (!row) return null;
    row[field] = nowISO();
    return put('garden', row);
  }

  async function removeFromGarden(id) {
    const logs = await getAllByIndex('growthLogs', 'gardenId', id);
    for (const l of logs) await del('growthLogs', l.id);
    return del('garden', id);
  }

  // ---------- growth logs ----------
  async function addGrowthLog({ gardenId, note, photoDataUrl, heightCm }) {
    const row = { id: uid('log'), gardenId, date: nowISO(), note: note || '', photoDataUrl: photoDataUrl || null, heightCm: heightCm || null };
    return put('growthLogs', row);
  }
  async function listGrowthLogs(gardenId) {
    const rows = await getAllByIndex('growthLogs', 'gardenId', gardenId);
    return rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  // ---------- journal ----------
  async function addJournalEntry({ gardenId, plantName, text, mood, photos }) {
    const row = { id: uid('j'), gardenId: gardenId || null, plantName: plantName || 'General', date: nowISO(), text: text || '', mood: mood || null, photos: photos || [] };
    return put('journal', row);
  }
  async function listJournalEntries() {
    const rows = await getAll('journal');
    return rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  }
  async function getJournalEntry(id) { return get('journal', id); }
  async function updateJournalEntry(id, patch) {
    const current = await get('journal', id);
    if (!current) return null;
    return put('journal', Object.assign({}, current, patch, { id }));
  }
  async function deleteJournalEntry(id) { return del('journal', id); }

  // ---------- favorites ----------
  async function isFavorite(catalogId) { return !!(await get('favorites', catalogId)); }
  async function listFavorites() { return (await getAll('favorites')).map((r) => r.catalogId); }
  async function toggleFavorite(catalogId) {
    const on = await isFavorite(catalogId);
    if (on) { await del('favorites', catalogId); return false; }
    await put('favorites', { catalogId });
    return true;
  }

  // ---------- derived stats ----------
  async function getStats() {
    const [garden, journal, profile] = await Promise.all([listGarden(), listJournalEntries(), getProfile()]);
    const joined = new Date(profile.joinedAt);
    const days = Math.max(0, Math.floor((Date.now() - joined.getTime()) / 86400000));
    return { gardenCount: garden.length, journalCount: journal.length, daysSinceJoined: days };
  }

  async function init() {
    await getBackend(); // also runs the one-time legacy-favourites migration
    await getProfile();
  }

  window.PPDB = {
    init,
    getProfile, saveProfile, hasAccount, createAccount,
    listGarden, getGardenItem, isInGarden, addCatalogPlantToGarden, addCustomPlant, removeFromGarden, logCare,
    addGrowthLog, listGrowthLogs,
    addJournalEntry, listJournalEntries, getJournalEntry, updateJournalEntry, deleteJournalEntry,
    isFavorite, listFavorites, toggleFavorite,
    getStats,
    util: { uid, nowISO, todayShort, todayLong, formatDateShort, lightLabel, waterLabel, escapeHtml, initials, computeHealth, healthStatus },
  };
})();
