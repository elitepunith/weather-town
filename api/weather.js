export default async function handler(req, res) {
   
    const { city, lat, lon } = req.query;
    
    const API_KEY = process.env.WEATHER_API_KEY; 
    const BASE_URL = "https://api.openweathermap.org/data/2.5";

    try {
      
        let queryParam = city ? `q=${encodeURIComponent(city)}` : `lat=${lat}&lon=${lon}`;
        
        
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(`${BASE_URL}/weather?${queryParam}&appid=${API_KEY}&units=metric`),
            fetch(`${BASE_URL}/forecast?${queryParam}&appid=${API_KEY}&units=metric`)
        ]);

        if (!weatherRes.ok) throw new Error("Location not found");

        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();

        res.status(200).json({ weather: weatherData, forecast: forecastData });
        
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch weather data." });
    }
}