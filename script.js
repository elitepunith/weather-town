const els = {
    input: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    weatherCard: document.getElementById('weatherCard'),
    loader: document.getElementById('loader'),
    errorMsg: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText')
};

els.searchBtn.addEventListener('click', handleSearch);
els.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSearch(); });

els.locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) return showError("Geolocation not supported.");
    
    navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`),
        err => showError("Couldn't access your location.")
    );
});

function handleSearch() {
    const city = els.input.value.trim();
    if (city) fetchWeather(`city=${encodeURIComponent(city)}`);
}

async function fetchWeather(queryString) {
    toggleLoading(true);
    
    try {
        // We are now calling our secure Vercel backend function!
        const response = await fetch(`/api/weather?${queryString}`);
        
        if (!response.ok) throw new Error("Location not found");
        
        const data = await response.json();
        
        renderWeather(data.weather);
        renderForecast(data.forecast);
        toggleLoading(false);
        
    } catch (err) {
        showError("Unable to find weather for that location.");
    }
}

function renderWeather(data) {
    document.getElementById('cityName').textContent = data.name;
    document.getElementById('temperature').textContent = Math.round(data.main.temp);
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like);
    document.getElementById('description').textContent = data.weather[0].description;
    
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;

    els.weatherCard.classList.remove('hidden');
}

function renderForecast(data) {
    const container = document.getElementById('forecastContainer');
    container.innerHTML = '';

    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);

    dailyData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        container.innerHTML += `
            <div class="forecast-item">
                <span class="day">${dayName}</span>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="icon">
                <span class="temp">${Math.round(item.main.temp)}°</span>
            </div>
        `;
    });
}

function toggleLoading(isLoading) {
    els.errorMsg.classList.add('hidden');
    if (isLoading) {
        els.loader.classList.remove('hidden');
        els.weatherCard.classList.add('hidden');
    } else {
        els.loader.classList.add('hidden');
    }
}

function showError(msg) {
    toggleLoading(false);
    els.weatherCard.classList.add('hidden');
    els.errorText.textContent = msg;
    els.errorMsg.classList.remove('hidden');
}