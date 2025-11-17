// Interactive JS

// Button events
const exploreBtn = document.getElementById("exploreBtn");
const journalBtn = document.getElementById("journalBtn");
const browseNowBtn = document.getElementById("browseNowBtn");

exploreBtn.addEventListener("click", () => {
  alert("Exploring plants soon!");
});

journalBtn.addEventListener("click", () => {
  alert("Opening your plant journal...");
});

browseNowBtn.addEventListener("click", () => {
  alert("Let's browse some plants!");
});

// Smooth hover animation for feature cards
const featureCards = document.querySelectorAll(".feature-card");

featureCards.forEach(card => {
  card.addEventListener("mouseover", () => {
    card.style.backgroundColor = "#f0fff4";
  });

  card.addEventListener("mouseout", () => {
    card.style.backgroundColor = "white";
  });
});
