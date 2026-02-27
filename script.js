var cityInput   = document.getElementById("cityInput");
var searchBtn   = document.getElementById("searchBtn");
var locationBtn = document.getElementById("locationBtn");
var results     = document.getElementById("results");
var loader      = document.getElementById("loader");
var errorBox    = document.getElementById("errorBox");
var errorText   = document.getElementById("errorText");
var page        = document.getElementById("page");

searchBtn.addEventListener("click", onSearch);
cityInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") onSearch();
});

locationBtn.addEventListener("click", function() {
    if (!navigator.geolocation) {
        showError("Geolocation is not supported by your browser.");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        function(pos) {
            var q = "lat=" + pos.coords.latitude + "&lon=" + pos.coords.longitude;
            fetchWeather(q);
        },
        function() {
            showError("Location access was denied. Please allow it and try again.");
        }
    );
});

function onSearch() {
    var city = cityInput.value.trim();
    if (!city) {
        cityInput.focus();
        return;
    }
    fetchWeather("city=" + encodeURIComponent(city));
}

async function fetchWeather(query) {
    setLoading(true);
    try {
        var res  = await fetch("/api/weather?" + query);
        var data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Something went wrong.");
        }
        renderCurrent(data.weather);
        renderForecast(data.forecast);
        results.classList.remove("hidden");
        page.classList.add("has-results");
        setLoading(false);
    } catch (err) {
        showError(err.message || "Could not load weather. Please try again.");
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
                '<span class="fc-label">' + label + '</span>' +
                '<img src="https://openweathermap.org/img/wn/' + icon + '.png" alt="' + desc + '">' +
                '<span class="fc-temp">' + temp + '°</span>' +
            '</div>'
        );
    }).join("");
}

function setLoading(on) {
    errorBox.classList.add("hidden");
    if (on) {
        loader.classList.remove("hidden");
        results.classList.add("hidden");
        page.classList.remove("has-results");
    } else {
        loader.classList.add("hidden");
    }
}

function showError(msg) {
    loader.classList.add("hidden");
    results.classList.add("hidden");
    page.classList.remove("has-results");
    errorText.textContent = msg;
    errorBox.classList.remove("hidden");
}
