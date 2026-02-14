import axios from "axios";

export async function getWeather(lat, lng) {
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather`,
    {
      params: {
        lat,
        lon: lng,
        appid: process.env.OPENWEATHER_KEY,
        units: "metric",
      },
    },
  );

  return {
    temperature: response.data.main.temp,
    condition: response.data.weather[0].description,
  };
}
