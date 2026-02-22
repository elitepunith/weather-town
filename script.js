// ===== CONFIGURATION =====
// 🔑 Get your FREE API key at: https://openweathermap.org/api
const API_KEY = "9d2f22ff4f4e6966acd4895f15104bed"; // <-- Replace with your OpenWeatherMap API key
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// ===== DOM ELEMENTS =====
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const weatherCard = document.getElementById("weatherCard");
const forecastSection = document.getElementById("forecastSection");
const loader = document.getElementById("loader");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");

// ===== EVENT LISTENERS =====
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) fetchWeatherByCity(city);
});

cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const city = cityInput.value.trim();
        if (city) fetchWeatherByCity(city);
    }
});

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            () => {
                showError("Location access denied. Please search manually.");
            }
        );
    } else {
        showError("Geolocation is not supported by your browser.");
    }
});

// ===== FETCH FUNCTIONS =====
async function fetchWeatherByCity(city) {
    showLoader();
    try {
        const weatherRes = await fetch(
            `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );
        if (!weatherRes.ok) throw new Error("City not found");
        const weatherData = await weatherRes.json();

        const forecastRes = await fetch(
            `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );
        const forecastData = await forecastRes.json();

        displayWeather(weatherData);
        displayForecast(forecastData);
    } catch (err) {
        showError("City not found. Please check the name and try again.");
    }
}

async function fetchWeatherByCoords(lat, lon) {
    showLoader();
    try {
        const weatherRes = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        if (!weatherRes.ok) throw new Error("Location error");
        const weatherData = await weatherRes.json();

        const forecastRes = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const forecastData = await forecastRes.json();

        displayWeather(weatherData);
        displayForecast(forecastData);
    } catch (err) {
        showError("Unable to fetch weather for your location.");
    }
}

// ===== DISPLAY FUNCTIONS =====
function displayWeather(data) {
    hideLoader();
    hideError();

    // City & Date
    document.getElementById("cityName").textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById("dateTime").textContent = formatDateTime(data.dt, data.timezone);

    // Temperature
    document.getElementById("temperature").textContent = Math.round(data.main.temp);
    document.getElementById("feelsLike").textContent = Math.round(data.main.feels_like);
    document.getElementById("description").textContent = data.weather[0].description;

    // Icon
    const iconCode = data.weather[0].icon;
    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    document.getElementById("weatherIcon").alt = data.weather[0].description;

    // Details
    document.getElementById("humidity").textContent = `${data.main.humidity}%`;
    document.getElementById("windSpeed").textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    document.getElementById("visibility").textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;
    document.getElementById("sunrise").textContent = formatTime(data.sys.sunrise, data.timezone);
    document.getElementById("sunset").textContent = formatTime(data.sys.sunset, data.timezone);

    // Show card with animation
    weatherCard.classList.remove("hidden");
    weatherCard.style.animation = "none";
    weatherCard.offsetHeight; // Trigger reflow
    weatherCard.style.animation = "fadeInUp 0.6s ease";
}

function displayForecast(data) {
    const forecastContainer = document.getElementById("forecastContainer");
    forecastContainer.innerHTML = "";

    // Get one forecast per day (noon readings)
    const dailyForecasts = [];
    const seenDates = new Set();

    for (const item of data.list) {
        const date = new Date(item.dt * 1000).toDateString();
        const today = new Date().toDateString();

        if (date !== today && !seenDates.has(date)) {
            seenDates.add(date);
            dailyForecasts.push(item);
        }
        if (dailyForecasts.length >= 5) break;
    }

    dailyForecasts.forEach((item) => {
        const card = document.createElement("div");
        card.className = "forecast-card";

        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        card.innerHTML = `
            <p class="forecast-day">${dayName}<br>${dateStr}</p>
            <img class="forecast-icon" src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
            <p class="forecast-temp">${Math.round(item.main.temp_max)}°</p>
            <p class="forecast-temp-min">${Math.round(item.main.temp_min)}°</p>
        `;

        forecastContainer.appendChild(card);
    });

    forecastSection.classList.remove("hidden");
    forecastSection.style.animation = "none";
    forecastSection.offsetHeight;
    forecastSection.style.animation = "fadeInUp 0.6s ease 0.2s both";
}

// ===== HELPER FUNCTIONS =====
function formatDateTime(timestamp, timezone) {
    const date = new Date((timestamp + timezone) * 1000);
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
    }).format(date);
}

function formatTime(timestamp, timezone) {
    const date = new Date((timestamp + timezone) * 1000);
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
    }).format(date);
}

function showLoader() {
    loader.classList.remove("hidden");
    weatherCard.classList.add("hidden");
    forecastSection.classList.add("hidden");
    errorMessage.classList.add("hidden");
}

function hideLoader() {
    loader.classList.add("hidden");
}

function showError(message) {
    hideLoader();
    weatherCard.classList.add("hidden");
    forecastSection.classList.add("hidden");
    errorText.textContent = message;
    errorMessage.classList.remove("hidden");
}

function hideError() {
    errorMessage.classList.add("hidden");
}