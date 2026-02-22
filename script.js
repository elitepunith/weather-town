const els = {
    input: document.getElementById("cityInput"),
    searchBtn: document.getElementById("searchBtn"),
    locationBtn: document.getElementById("locationBtn"),
    weatherCard: document.getElementById("weatherCard"),
    loader: document.getElementById("loader"),
    errorMsg: document.getElementById("errorMessage"),
    errorText: document.getElementById("errorText")
};

els.searchBtn.addEventListener("click", handleSearch);
els.input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") handleSearch();
});

els.locationBtn.addEventListener("click", function () {
    if (!navigator.geolocation) {
        showError("Your browser doesn't support geolocation.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (pos) {
            fetchWeather("lat=" + pos.coords.latitude + "&lon=" + pos.coords.longitude);
        },
        function () {
            showError("Couldn't access your location.");
        }
    );
});

function handleSearch() {
    var city = els.input.value.trim();
    if (!city) return;
    fetchWeather("city=" + encodeURIComponent(city));
}

async function fetchWeather(queryString) {
    toggleLoading(true);

    try {
        var response = await fetch("/api/weather?" + queryString);

        if (!response.ok) {
            var body = await response.json().catch(function () { return {}; });
            throw new Error(body.error || "Something went wrong");
        }

        var data = await response.json();
        renderWeather(data.weather);
        renderForecast(data.forecast);
        toggleLoading(false);
    } catch (err) {
        showError(err.message || "Unable to find weather for that location.");
    }
}

function renderWeather(data) {
    document.getElementById("cityName").textContent = data.name;
    document.getElementById("temperature").textContent = Math.round(data.main.temp);
    document.getElementById("feelsLike").textContent = Math.round(data.main.feels_like);
    document.getElementById("description").textContent = data.weather[0].description;
    document.getElementById("humidity").textContent = data.main.humidity + "%";
    document.getElementById("windSpeed").textContent = (data.wind.speed * 3.6).toFixed(1) + " km/h";
    document.getElementById("visibility").textContent = (data.visibility / 1000).toFixed(1) + " km";
    document.getElementById("pressure").textContent = data.main.pressure + " hPa";

    els.weatherCard.classList.remove("hidden");
}

function renderForecast(data) {
    var container = document.getElementById("forecastContainer");
    var dailyEntries = data.list.filter(function (item) {
        return item.dt_txt.includes("12:00:00");
    }).slice(0, 5);

    if (dailyEntries.length === 0) {
        container.innerHTML = '<p class="no-forecast">No forecast data available</p>';
        return;
    }

    var html = "";
    for (var i = 0; i < dailyEntries.length; i++) {
        var item = dailyEntries[i];
        var date = new Date(item.dt * 1000);
        var dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        var icon = item.weather[0].icon;
        var temp = Math.round(item.main.temp);

        html += '<div class="forecast-item">'
            + '<span class="day">' + dayName + '</span>'
            + '<img src="https://openweathermap.org/img/wn/' + icon + '.png" alt="' + item.weather[0].description + '">'
            + '<span class="temp">' + temp + '°</span>'
            + '</div>';
    }

    container.innerHTML = html;
}

function toggleLoading(isLoading) {
    els.errorMsg.classList.add("hidden");
    if (isLoading) {
        els.loader.classList.remove("hidden");
        els.weatherCard.classList.add("hidden");
    } else {
        els.loader.classList.add("hidden");
    }
}

function showError(msg) {
    toggleLoading(false);
    els.weatherCard.classList.add("hidden");
    els.errorText.textContent = msg;
    els.errorMsg.classList.remove("hidden");
}