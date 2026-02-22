// OpenWeatherMap setup
// Note: It's bad practice to leave API keys in frontend code for production, 
// but it's fine for learning/local testing.
const API_KEY = "9d2f22ff4f4e6966acd4895f15104bed"; 
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Cache DOM elements
const els = {
    input: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    weatherCard: document.getElementById('weatherCard'),
    forecastSection: document.getElementById('forecastSection'),
    loader: document.getElementById('loader'),
    errorMsg: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText')
};

// Event bindings
els.searchBtn.addEventListener('click', handleSearch);
els.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
});

els.locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        showError("Your browser doesn't support geolocation.");
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`),
        err => showError("Couldn't access your location.")
    );
});

function handleSearch() {
    const city = els.input.value.trim();
    if (city) fetchWeather(`q=${encodeURIComponent(city)}`);
}

// Core fetch logic
async function fetchWeather(queryParam) {
    toggleLoading(true);
    
    try {
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(`${BASE_URL}/weather?${queryParam}&appid=${API_KEY}&units=metric`),
            fetch(`${BASE_URL}/forecast?${queryParam}&appid=${API_KEY}&units=metric`)
        ]);

        if (!weatherRes.ok) throw new Error("Location not found");

        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();

        renderWeather(weatherData);
        renderForecast(forecastData);
        toggleLoading(false);
        
    } catch (err) {
        showError("We couldn't find weather data for that location.");
    }
}

// UI Updates
function renderWeather(data) {
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('dateTime').textContent = formatTime(data.dt, data.timezone);
    document.getElementById('temperature').textContent = Math.round(data.main.temp);
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like);
    document.getElementById('description').textContent = data.weather[0].description;
    
    const icon = document.getElementById('weatherIcon');
    icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;

    els.weatherCard.classList.remove('hidden');
}

function renderForecast(data) {
    const container = document.getElementById('forecastContainer');
    container.innerHTML = '';

    // Filter list to get roughly one reading per day (around noon)
    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);

    dailyData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        container.innerHTML += `
            <div class="forecast-item">
                <p>${dayName}</p>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="icon">
                <p class="forecast-temp">${Math.round(item.main.temp)}°</p>
            </div>
        `;
    });

    els.forecastSection.classList.remove('hidden');
}

// Utils
function formatTime(timestamp, timezoneOffset) {
    const date = new Date((timestamp + timezoneOffset) * 1000);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric',
        timeZone: 'UTC' 
    });
}

function toggleLoading(isLoading) {
    els.errorMsg.classList.add('hidden');
    if (isLoading) {
        els.loader.classList.remove('hidden');
        els.weatherCard.classList.add('hidden');
        els.forecastSection.classList.add('hidden');
    } else {
        els.loader.classList.add('hidden');
    }
}

function showError(msg) {
    toggleLoading(false);
    els.weatherCard.classList.add('hidden');
    els.forecastSection.classList.add('hidden');
    els.errorText.textContent = msg;
    els.errorMsg.classList.remove('hidden');
}