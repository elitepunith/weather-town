/* ══════════════════════════════════════════
   WEATHER TOWN — script.js
══════════════════════════════════════════ */

var els = {
    input:       document.getElementById("cityInput"),
    searchBtn:   document.getElementById("searchBtn"),
    locationBtn: document.getElementById("locationBtn"),
    weatherCard: document.getElementById("weatherCard"),
    loader:      document.getElementById("loader"),
    errorMsg:    document.getElementById("errorMessage"),
    errorText:   document.getElementById("errorText"),
    wrapper:     document.getElementById("pageWrapper")
};

/* ── Event listeners ── */
els.searchBtn.addEventListener("click", handleSearch);
els.input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") handleSearch();
});

els.locationBtn.addEventListener("click", function() {
    if (!navigator.geolocation) {
        showError("Your browser doesn't support geolocation.");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        function(pos) {
            fetchWeather("lat=" + pos.coords.latitude + "&lon=" + pos.coords.longitude);
        },
        function() {
            showError("Couldn't get your location. Please allow access and try again.");
        }
    );
});

function handleSearch() {
    var city = els.input.value.trim();
    if (!city) { els.input.focus(); return; }
    fetchWeather("city=" + encodeURIComponent(city));
}

/* ── Fetch ── */
async function fetchWeather(query) {
    setLoading(true);
    try {
        var res = await fetch("/api/weather?" + query);
        if (!res.ok) {
            var body = await res.json().catch(function() { return {}; });
            throw new Error(body.error || "Something went wrong.");
        }
        var data = await res.json();
        renderWeather(data.weather);
        renderForecast(data.forecast);
        setLoading(false);

        /* expand to dashboard layout */
        els.wrapper.classList.add("has-results");
        document.body.classList.add("results-active");

    } catch (err) {
        showError(err.message || "Unable to load weather for that location.");
    }
}

/* ── Render current weather ── */
function renderWeather(w) {
    document.getElementById("cityName").textContent    = w.name + ", " + w.sys.country;
    document.getElementById("temperature").textContent = Math.round(w.main.temp);
    document.getElementById("feelsLike").textContent   = Math.round(w.main.feels_like);
    document.getElementById("description").textContent = w.weather[0].description;
    document.getElementById("tempHigh").textContent    = Math.round(w.main.temp_max);
    document.getElementById("tempLow").textContent     = Math.round(w.main.temp_min);
    document.getElementById("humidity").textContent    = w.main.humidity + "%";
    document.getElementById("windSpeed").textContent   = (w.wind.speed * 3.6).toFixed(1) + " km/h";
    document.getElementById("visibility").textContent  = (w.visibility / 1000).toFixed(1) + " km";
    document.getElementById("pressure").textContent    = w.main.pressure + " hPa";

    var icon = document.getElementById("weatherIcon");
    icon.src = "https://openweathermap.org/img/wn/" + w.weather[0].icon + "@2x.png";
    icon.alt = w.weather[0].description;

    els.weatherCard.classList.remove("hidden");
}

/* ── Render 5-day forecast ── */
function renderForecast(data) {
    var container = document.getElementById("forecastContainer");
    var entries = data.list.filter(function(item) {
        return item.dt_txt.includes("12:00:00");
    }).slice(0, 5);

    if (!entries.length) {
        container.innerHTML = '<p class="no-forecast">No forecast data available.</p>';
        return;
    }

    container.innerHTML = entries.map(function(item) {
        var day  = new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "short" });
        var temp = Math.round(item.main.temp);
        var icon = item.weather[0].icon;
        var desc = item.weather[0].description;
        return (
            '<div class="forecast-item">' +
                '<span class="day">' + day + '</span>' +
                '<img src="https://openweathermap.org/img/wn/' + icon + '.png" alt="' + desc + '">' +
                '<span class="temp">' + temp + '°</span>' +
            '</div>'
        );
    }).join("");
}

/* ── State helpers ── */
function setLoading(on) {
    els.errorMsg.classList.add("hidden");
    if (on) {
        els.loader.classList.remove("hidden");
        els.weatherCard.classList.add("hidden");
    } else {
        els.loader.classList.add("hidden");
    }
}

function showError(msg) {
    setLoading(false);
    els.weatherCard.classList.add("hidden");
    els.wrapper.classList.remove("has-results");
    document.body.classList.remove("results-active");
    els.errorText.textContent = msg;
    els.errorMsg.classList.remove("hidden");
}
