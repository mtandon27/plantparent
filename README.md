# 🌱 Plant Parent
Plant Parent is a plant care journal designed to help you track your indoor garden while cultivating mindfulness. Built with a nostalgic pixel-art aesthetic, it allows users to "adopt" plants, log their care routine, and earn badges for being a great plant parent.

### 📖 About the Data
The plant data and imagery in the Explore section of this application are sourced from the [Open Plantbook API](https://open.plantbook.io/).

**Data Sourcing:** Plant details such as scientific names, watering requirements (```min_watering_benchmark_days```), sunlight needs (```min_light_lux```), and toxicity information were retrieved from the Open Plantbook database.

**Imagery:** The plant images used in the Plant cards are sourced via the Open Plantbook image CDN.

**Implementation:** To ensure a fast and offline-friendly experience for this static web application, a curated subset of the API data was processed and stored in a local plants.json file, which the application fetches on load.

### ✨ Features

* Interactive Journal: log watering, sunlight, and fertilizer with quick buttons everyday. Add personal notes and track your mood alongside your plant's health.

* Daily Quests: Complete mindful tasks to earn XP.

* Badges: Unlock stickers for streaks and milestones.

* Plant Database: Browse a catalog of plants, filter by "Pet Safe" or "Easy Care," and "Adopt" them into your personal garden.

* Local Storage: (coming soon) Your garden and journal entries are saved directly to your browser—no login required.

### 🛠️ Tech Stack
* HTML5: Semantic structure for the Journal, Explore, and Home pages.

* CSS3: Custom properties (variables) for theming, CSS Grid for layout, and keyframe animations for the "growing" vines and typewriter effects.

* JavaScript: Handles all logic, like fetching and parsing the plants.json data.

### 🚀 How to Run
Clone or download this repository or hosted on Github pages [here](https://mtandon27.github.io/plantparent/index.html).

Ensure the following files are in the same directory:
```
index.html
journal.html
browse.html
global.css
plants.json
assets/ folder (containing images)
```

Open index.html in any modern web browser.

### 🎨 Credits & Assets
* Design & Development: Manvi Tandon

* Plant Data & Images: [Open Plantbook API](https://open.plantbook.io/)

* Confetti Animation: [Canvas Confetti](https://github.com/catdad/canvas-confetti)

* Fonts: 'VT323' (Pixels) and 'Patrick Hand' (Handwriting) via Google Fonts.

* Icons: Unicode Emojis & Custom SVG Pixel Art.
