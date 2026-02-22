# Weather Town

A weather app that shows current conditions and a 5-day forecast for any city. Built with plain HTML, CSS, and JavaScript. Uses a Vercel serverless function to keep the API key off the client.

## What it does

- Shows temperature, humidity, wind speed, visibility, and pressure for a searched city
- 5-day forecast pulled from OpenWeatherMap
- "Use my location" button that grabs coordinates from your browser
- Glassmorphism card layout, dark theme, works on mobile

## How it works

The frontend sends requests to `/api/weather`, which is a Vercel serverless function. That function reads the API key from an environment variable, calls OpenWeatherMap, and returns the data. The key never touches the browser.

## Setup

1. Clone this repo
2. Sign up at [openweathermap.org](https://openweathermap.org/api) and grab a free API key
3. Install the Vercel CLI if you don't have it: `npm i -g vercel`
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
- Wind speed comes from the API in m/s and gets converted to km/h on the client
- Forecast picks the 12:00 entry for each day so you get a midday reading
- If you're testing locally without Vercel, the `/api/weather` route won't work since it needs the serverless runtime