// helpers for geocoding reverse / small wrapper
export async function lookupCep(input: { lat: number; lon: number } | { cep?: string }) {
    // if lat/lon provided -> reverse geocode with Nominatim
    if ("lat" in input && input.lat !== undefined && input.lon !== undefined) {
      const { lat, lon } = input;
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "sos-iguacu-frontend",
          "Accept-Language": "pt-BR",
        },
      });
      if (!res.ok) throw new Error("Nominatim failure");
      const json = await res.json();
      return json;
    }
  
    // else if cep provided, fall back to ViaCEP elsewhere
    return null;
  }
  