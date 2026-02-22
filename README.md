# Weather Town

A weather dashboard that shows real-time conditions and a 5-day forecast for any city. Built with plain HTML, CSS, and JavaScript. Uses a Vercel serverless function to keep the API key off the client.

## Features

- Current temperature, feels-like, high/low for the day
- Humidity, wind speed + direction, visibility, pressure, dew point, cloud cover
- Sunrise and sunset times (local to the searched city)
- Local time display for the searched city
- 5-day forecast with high/low temperatures
- °C / °F toggle
- "Use my location" button via browser geolocation
- Full desktop dashboard layout, responsive down to mobile
- API key never exposed to the browser

## How it works

The frontend sends requests to `/api/weather`, which is a Vercel serverless function. That function reads the API key from an environment variable (`WEATHER_API_KEY`), calls OpenWeatherMap, and returns the data. The key never touches the browser.

## Setup

1. Clone this repo
2. Sign up at [openweathermap.org](https://openweathermap.org/api) and grab a free API key
3. Install the Vercel CLI: `npm i -g vercel`
4. Link your project: `vercel link`
5. Add your key as an environment variable:
   ```
   vercel env add WEATHER_API_KEY
   ```
   Paste your key when prompted. Select all environments (Development, Preview, Production).
6. For local development: `vercel dev`
7. To deploy: `vercel --prod`

## Project structure

```
weather-town/
├── api/
│   └── weather.js    # serverless function, hides the API key
├── index.html        # the page
├── script.js         # fetches data, updates the DOM
├── style.css         # all the styling
├── vercel.json       # routing config
└── README.md
```

## Notes

- The API response is cached at the edge for 5 minutes to avoid hammering OpenWeatherMap on the free tier
- Wind speed is converted from m/s to km/h on the client
- Forecast skips today and shows the next 5 days, preferring midday readings
- Dew point is approximated from temperature and humidity (Magnus formula shortcut)
- Local city time is derived from the UTC offset returned by the API
- `vercel.json` explicitly routes `/api/*` before the catch-all SPA rewrite so API calls are never redirected to `index.html`
