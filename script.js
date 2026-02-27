var homeScreen    = document.getElementById("homeScreen");
var resultsScreen = document.getElementById("resultsScreen");

var cityInput     = document.getElementById("cityInput");
var searchBtn     = document.getElementById("searchBtn");
var locationBtn   = document.getElementById("locationBtn");
var homeLoader    = document.getElementById("homeLoader");
var homeError     = document.getElementById("homeError");
var homeErrorText = document.getElementById("homeErrorText");

var cityInputR    = document.getElementById("cityInputR");
var searchBtnR    = document.getElementById("searchBtnR");
var locationBtnR  = document.getElementById("locationBtnR");
var resultsError  = document.getElementById("resultsError");
var resultsErrTxt = document.getElementById("resultsErrorText");

searchBtn.addEventListener("click", function() { doSearch(cityInput.value); });
cityInput.addEventListener("keydown", function(e) { if (e.key === "Enter") doSearch(cityInput.value); });
locationBtn.addEventListener("click", function() { useGeo(false); });

searchBtnR.addEventListener("click", function() { doSearch(cityInputR.value); });
cityInputR.addEventListener("keydown", function(e) { if (e.key === "Enter") doSearch(cityInputR.value); });
locationBtnR.addEventListener("click", function() { useGeo(true); });

function doSearch(raw) {
    var city = raw.trim();
    if (!city) return;
    fetchWeather("city=" + encodeURIComponent(city));
}

function useGeo(fromResults) {
    if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.", fromResults);
        return;
    }
    navigator.geolocation.getCurrentPosition(
        function(pos) {
            var q = "lat=" + pos.coords.latitude + "&lon=" + pos.coords.longitude;
            fetchWeather(q);
        },
        function() {
            setError("Location access denied. Please allow it and try again.", fromResults);
        }
    );
}

async function fetchWeather(query) {
    setLoading(true);
    try {
        var res  = await fetch("/api/weather?" + query);
        var data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong.");
        renderWeather(data.weather);
        renderForecast(data.forecast);
        showResultsScreen();
    } catch (err) {
        var onResults = !resultsScreen.classList.contains("hidden");
        setError(err.message || "Could not load weather. Please try again.", onResults);
    }
}

function renderWeather(w) {
    var tzOffset = w.timezone;

    document.getElementById("cityName").textContent    = w.name + ", " + w.sys.country;
    document.getElementById("description").textContent = w.weather[0].description;
    document.getElementById("temperature").textContent = Math.round(w.main.temp);
    document.getElementById("feelsLike").textContent   = Math.round(w.main.feels_like);
    document.getElementById("tempHigh").textContent    = Math.round(w.main.temp_max);
    document.getElementById("tempLow").textContent     = Math.round(w.main.temp_min);
    document.getElementById("humidity").textContent    = w.main.humidity + "%";
    document.getElementById("visibility").textContent  = (w.visibility / 1000).toFixed(1) + " km";
    document.getElementById("pressure").textContent    = w.main.pressure + " hPa";

    document.getElementById("windSpeed").textContent = (w.wind.speed * 3.6).toFixed(1) + " km/h";
    document.getElementById("windDir").textContent   = "Wind · " + getWindDirection(w.wind.deg);

    document.getElementById("sunrise").textContent = formatTime(w.sys.sunrise, tzOffset);
    document.getElementById("sunset").textContent  = formatTime(w.sys.sunset, tzOffset);

    document.getElementById("localTime").textContent = getLocalTime(tzOffset);
    document.getElementById("lastUpdated").textContent = "Updated " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    var icon = document.getElementById("weatherIcon");
    icon.src = "https://openweathermap.org/img/wn/" + w.weather[0].icon + "@2x.png";
    icon.alt = w.weather[0].description;
}

function renderForecast(data) {
    var container = document.getElementById("forecastContainer");
    var days = data.list.filter(function(item) {
        return item.dt_txt.includes("12:00:00");
    }).slice(0, 5);

    if (!days.length) {
        container.innerHTML = '<p class="no-forecast">No forecast data available.</p>';
        return;
    }

    container.innerHTML = days.map(function(item) {
        var label = new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "short" });
        var temp  = Math.round(item.main.temp);
        var icon  = item.weather[0].icon;
        var desc  = item.weather[0].description;
        return (
            '<div class="fc-day">' +
                '<span class="fc-lbl">' + label + '</span>' +
                '<img src="https://openweathermap.org/img/wn/' + icon + '.png" alt="' + desc + '">' +
                '<span class="fc-tmp">' + temp + '°</span>' +
            '</div>'
        );
    }).join("");
}

function showResultsScreen() {
    setLoading(false);
    homeScreen.classList.add("hidden");
    resultsScreen.classList.remove("hidden");
    resultsError.classList.add("hidden");
    cityInputR.value = "";
}

function setLoading(on) {
    homeError.classList.add("hidden");
    homeLoader.classList.toggle("hidden", !on);
}

function setError(msg, onResults) {
    homeLoader.classList.add("hidden");
    if (onResults) {
        resultsErrTxt.textContent = msg;
        resultsError.classList.remove("hidden");
    } else {
        homeErrorText.textContent = msg;
        homeError.classList.remove("hidden");
    }
}

function formatTime(unixTs, tzOffsetSeconds) {
    var utcMs   = unixTs * 1000;
    var localMs = utcMs + tzOffsetSeconds * 1000;
    var d       = new Date(localMs);
    var h       = d.getUTCHours();
    var m       = d.getUTCMinutes().toString().padStart(2, "0");
    var ampm    = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + m + " " + ampm;
}

function getLocalTime(tzOffsetSeconds) {
    var utcMs   = Date.now();
    var localMs = utcMs + tzOffsetSeconds * 1000;
    var d       = new Date(localMs);
    var h       = d.getUTCHours();
    var m       = d.getUTCMinutes().toString().padStart(2, "0");
    var ampm    = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    var day     = d.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
    return day + ", " + h + ":" + m + " " + ampm + " local time";
}

function getWindDirection(deg) {
    if (deg === undefined || deg === null) return "";
    var dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
}
