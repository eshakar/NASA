// In-memory storage for search history (replacing localStorage for this environment)
let searchHistory = [];

const API_KEY = "NcXHaBFeA387hEom7METn5tZI2Kg0b0UNgMoqB4T";
const BASE_URL = "https://api.nasa.gov/planetary/apod";

// DOM elements
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const currentImageContainer = document.getElementById(
  "current-image-container"
);
const searchHistoryList = document.getElementById("search-history");

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  getCurrentImageOfTheDay();
  loadSearchHistory();

  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const selectedDate = searchInput.value;
    if (selectedDate) {
      getImageOfTheDay(selectedDate);
    }
  });
});

// Get current image of the day
async function getCurrentImageOfTheDay() {
  const currentDate = new Date().toISOString().split("T")[0];
  await fetchAndDisplayImage(currentDate);
}

// Get image for selected date
async function getImageOfTheDay(date) {
  await fetchAndDisplayImage(date);
  saveSearch(date);
  addSearchToHistory();
}

// Fetch and display image data
async function fetchAndDisplayImage(date) {
  try {
    currentImageContainer.innerHTML = '<div class="loading">Loading...</div>';

    const response = await fetch(`${BASE_URL}?date=${date}&api_key=${API_KEY}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    displayImageData(data);
  } catch (error) {
    console.error("Error fetching image:", error);
    currentImageContainer.innerHTML = `
                    <div class="error">
                        Error loading image data. Please try again later.<br>
                        <small>${error.message}</small>
                    </div>
                `;
  }
}

// Display image data in the UI
function displayImageData(data) {
  // Update header with the date
  const pictureHeader = document.getElementById("picture-header");
  pictureHeader.textContent = `Picture On ${data.date}`;

  let mediaElement = "";

  if (data.media_type === "image") {
    mediaElement = `<img src="${data.url}" alt="${data.title}" />`;
  } else if (data.media_type === "video") {
    mediaElement = `
                    <iframe 
                        src="${data.url}" 
                        frameborder="0" 
                        allowfullscreen>
                    </iframe>
                `;
  }

  currentImageContainer.innerHTML = `
                <div class="image-content">
                    ${mediaElement}
                    <h1 class="image-title">${data.title}</h1>
                    <p class="image-description">${data.explanation}</p>
                    ${
                      data.copyright
                        ? `<p class="copyright">Image Credit: ${data.copyright}</p>`
                        : ""
                    }
                </div>
            `;
}

// Save search to memory (replacing localStorage)
function saveSearch(date) {
  if (!searchHistory.includes(date)) {
    searchHistory.unshift(date);
    // Keep only the last 10 searches
    if (searchHistory.length > 10) {
      searchHistory = searchHistory.slice(0, 10);
    }
  }
}

// Add search to history UI
function addSearchToHistory() {
  if (searchHistory.length === 0) {
    searchHistoryList.innerHTML =
      '<div class="no-history">No previous searches</div>';
    return;
  }

  const historyHTML = searchHistory
    .map((date) => `<li onclick="getImageOfTheDay('${date}')">${date}</li>`)
    .join("");

  searchHistoryList.innerHTML = historyHTML;
}

// Load search history (would normally be from localStorage)
function loadSearchHistory() {
  addSearchToHistory();
}

// Set max date to today
const today = new Date().toISOString().split("T")[0];
searchInput.setAttribute("max", today);
