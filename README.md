# 🌱 Plant Parent
Plant Parent is a plant care journal designed to help you track your indoor garden while cultivating mindfulness. It allows users to browse a species catalog, "adopt" plants (or add their own), log their care routine, and track growth over time — with a fun, green-and-earthy visual style.

### 📖 About the Data
The plant catalog in the Explore section is sourced from the [Open Plantbook API](https://open.plantbook.io/), then hand-enriched with additional care details.

**Data Sourcing:** Plant details such as scientific names, watering requirements (```min_watering_benchmark_days```), sunlight needs (```min_light_lux```), and toxicity information were retrieved from the Open Plantbook database, then expanded with ```category```, ```difficulty```, ```growth_rate```, ```description```, ```common_issues```, and ```propagation``` for a more complete species reference (99 plants total).

**Imagery:** The plant images used in the Plant cards are sourced via the Open Plantbook image CDN.

**Implementation:** The catalog lives in ```plants.json``` (data of record) and is also mirrored into ```plants-data.js```, a plain ```window.PLANT_CATALOG = {...}``` script the app actually loads. Using a ```<script>``` tag instead of ```fetch()``` means Explore works even when you open ```index.html``` straight from disk — browsers block ```fetch()``` of local files, but not ```<script src>```.

### ✨ Features

* Interactive Journal: log watering, sunlight, and fertilizer with quick buttons everyday. Add personal notes and track your mood alongside your plant's health.

* Growth Tracking: log a photo, note, and height for any plant in your garden and watch its timeline build over time.

* Add Your Own Plant: found a cutting or a plant that isn't in our catalog? Add it as a custom plant and track it exactly like any other.

* Plant Database: browse a catalog of 99 species, filter by "Pet Safe," "Easy Care," and more, and read each plant's description, common issues, and propagation methods.

* Profile: a real profile with your name, photo, bio, and stats (plants, journal entries, days as a plant parent).

* Real persistence: your profile, garden, custom plants, growth logs, journal entries, and favourites are stored in a structured client-side database (IndexedDB) — no login, no server, no data loss on refresh.

### 🛠️ Tech Stack
* HTML5: Semantic structure for the Home, Explore, Journal, and Profile pages.

* CSS3: Custom properties (variables) for theming, CSS Grid/Flexbox for layout, and keyframe animations for hover and page-transition effects.

* JavaScript: All app logic, including a small IndexedDB wrapper (```db.js```) shared by every page for reading/writing the user's profile, garden, growth logs, journal, and favourites.

### 🚀 How to Run
Clone or download this repository or hosted on Github pages [here](https://mtandon27.github.io/plantparent/index.html).

Ensure the following files are in the same directory:
```
index.html
journal.html
browse.html
profile.html
db.js
plant-parent.css
plants.json
plants-data.js
assets/ folder (containing images)
```

Open index.html in any modern web browser.

### 🎨 Credits & Assets
* Design & Development: Manvi Tandon

* Plant Data & Images: [Open Plantbook API](https://open.plantbook.io/)

* Confetti Animation: [Canvas Confetti](https://github.com/catdad/canvas-confetti)

* Fonts: 'VT323' (Pixels) and 'Patrick Hand' (Handwriting) via Google Fonts.

* Icons: Unicode Emojis & Custom SVG Pixel Art.
