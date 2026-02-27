var homeScreen    = document.getElementById("homeScreen");
var resultsScreen = document.getElementById("resultsScreen");
var dashboard     = document.getElementById("dashboard");

var cityInput     = document.getElementById("cityInput");
var searchBtn     = document.getElementById("searchBtn");
var locationBtn   = document.getElementById("locationBtn");
var loader        = document.getElementById("loader");
var errorBox      = document.getElementById("errorBox");
var errorText     = document.getElementById("errorText");

var cityInputR    = document.getElementById("cityInputR");
var searchBtnR    = document.getElementById("searchBtnR");
var locationBtnR  = document.getElementById("locationBtnR");
var resultsError  = document.getElementById("resultsError");
var resultsErrTxt = document.getElementById("resultsErrorText");

searchBtn.addEventListener("click", function() { doSearch(cityInput.value); });
cityInput.addEventListener("keydown", function(e) { if (e.key === "Enter") doSearch(cityInput.value); });
locationBtn.addEventListener("click", function() { doGeo(false); });

searchBtnR.addEventListener("click", function() { doSearch(cityInputR.value); });
cityInputR.addEventListener("keydown", function(e) { if (e.key === "Enter") doSearch(cityInputR.value); });
locationBtnR.addEventListener("click", function() { doGeo(true); });

function doSearch(raw) {
    var city = raw.trim();
    if (!city) return;
    fetchWeather("city=" + encodeURIComponent(city));
}

function doGeo(fromResults) {
    if (!navigator.geolocation) {
        if (fromResults) showResultsError("Geolocation not supported by your browser.");
        else showHomeError("Geolocation not supported by your browser.");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        function(pos) {
            var q = "lat=" + pos.coords.latitude + "&lon=" + pos.coords.longitude;
            fetchWeather(q);
        },
        function() {
            var msg = "Location access was denied. Please allow it and try again.";
            if (fromResults) showResultsError(msg);
            else showHomeError(msg);
        }
    );
}

async function fetchWeather(query) {
    setLoading(true);
    try {
        var res  = await fetch("/api/weather?" + query);
        var data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong.");

        renderCurrent(data.weather);
        renderForecast(data.forecast);
        showResults();
    } catch (err) {
        var msg = err.message || "Could not load weather. Please try again.";
        if (resultsScreen.classList.contains("hidden")) showHomeError(msg);
        else showResultsError(msg);
        setLoading(false);
    }
}

function renderCurrent(w) {
    document.getElementById("cityName").textContent    = w.name + ", " + w.sys.country;
    document.getElementById("description").textContent = w.weather[0].description;
    document.getElementById("temperature").textContent = Math.round(w.main.temp);
    document.getElementById("feelsLike").textContent   = Math.round(w.main.feels_like);
    document.getElementById("tempHigh").textContent    = Math.round(w.main.temp_max);
    document.getElementById("tempLow").textContent     = Math.round(w.main.temp_min);
    document.getElementById("humidity").textContent    = w.main.humidity + "%";
    document.getElementById("windSpeed").textContent   = (w.wind.speed * 3.6).toFixed(1) + " km/h";
    document.getElementById("visibility").textContent  = (w.visibility / 1000).toFixed(1) + " km";
    document.getElementById("pressure").textContent    = w.main.pressure + " hPa";

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

function showResults() {
    setLoading(false);
    homeScreen.classList.add("hidden");
    resultsScreen.classList.remove("hidden");
    resultsError.classList.add("hidden");
    cityInputR.value = "";
}

function setLoading(on) {
    errorBox.classList.add("hidden");
    if (on) {
        loader.classList.remove("hidden");
    } else {
        loader.classList.add("hidden");
    }
}

function showHomeError(msg) {
    loader.classList.add("hidden");
    errorText.textContent = msg;
    errorBox.classList.remove("hidden");
}

function showResultsError(msg) {
    loader.classList.add("hidden");
    resultsErrTxt.textContent = msg;
    resultsError.classList.remove("hidden");
}
