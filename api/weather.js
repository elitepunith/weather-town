export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: "Server configuration error" });
        return;
    }

    const { city, lat, lon } = req.query;

    if (!city && (!lat || !lon)) {
        res.status(400).json({ error: "Provide a city name or coordinates" });
        return;
    }

    const base = "https://api.openweathermap.org/data/2.5";
    const query = city ? `q=${encodeURIComponent(city)}` : `lat=${lat}&lon=${lon}`;

    try {
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(`${base}/weather?${query}&appid=${apiKey}&units=metric`),
            fetch(`${base}/forecast?${query}&appid=${apiKey}&units=metric`)
        ]);

        if (!weatherRes.ok || !forecastRes.ok) {
            res.status(404).json({ error: "Location not found" });
            return;
        }

        const weather = await weatherRes.json();
        const forecast = await forecastRes.json();

        res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
        res.status(200).json({ weather, forecast });
    } catch (err) {
        res.status(502).json({ error: "Could not reach weather service" });
    }
}