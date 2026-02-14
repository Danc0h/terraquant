import axios from "axios";

const headers = {
  "User-Agent": "TerraQuantApp/1.0 (info.dancoda@email.com)",
};

export async function reverseGeocode(lat, lng) {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/reverse",
    {
      params: {
        lat,
        lon: lng,
        format: "json",
      },
      headers,
    },
  );

  return response.data.display_name;
}

export async function searchPlace(query) {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: query,
        format: "json",
        limit: 5,
      },
      headers,
    },
  );

  return response.data;
}
