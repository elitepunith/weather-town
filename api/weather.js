export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "Server configuration error" });
    }

    const { city, lat, lon } = req.query;

    if (!city && (!lat || !lon)) {
        return res.status(400).json({ error: "Provide a city name or coordinates" });
    }

    const base  = "https://api.openweathermap.org/data/2.5";
    const query = city ? `q=${encodeURIComponent(city)}` : `lat=${lat}&lon=${lon}`;

    try {
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(`${base}/weather?${query}&appid=${apiKey}&units=metric`),
            fetch(`${base}/forecast?${query}&appid=${apiKey}&units=metric`)
        ]);

        if (!weatherRes.ok || !forecastRes.ok) {
            return res.status(404).json({ error: "Location not found. Check the city name and try again." });
        }

        const weather  = await weatherRes.json();
        const forecast = await forecastRes.json();

        res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
        return res.status(200).json({ weather, forecast });
    } catch (err) {
        return res.status(502).json({ error: "Could not reach the weather service. Try again shortly." });
    }
}
