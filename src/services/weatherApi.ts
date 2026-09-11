// Real-Time Open Weather & Precipitation Nowcast API Service (Open-Meteo)

export interface RealTimeWeatherData {
  latitude: number;
  longitude: number;
  currentPrecipitationMmHr: number | null;
  weatherCode: number;
  temperatureC: number | null;
  windSpeedKmh: number | null;
  isLiveApiData: boolean;
  sourceName: string;
  lastUpdated: string;
  errorMessage?: string;
}

/**
 * Fetches real-time live precipitation and weather data from Open-Meteo API
 * No API key required, 100% free real live weather data for any coordinate in India
 */
export async function fetchLiveWeatherData(lat: number, lng: number): Promise<RealTimeWeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=precipitation,rain,showers,weather_code,temperature_2m,wind_speed_10m&forecast_days=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API HTTP ${response.status}`);
    }

    const data = await response.json();
    const currentPrecip = data.current?.precipitation ?? data.current?.rain ?? 0;
    const weatherCode = data.current?.weather_code ?? 0;
    const temp = data.current?.temperature_2m;
    const wind = data.current?.wind_speed_10m;

    return {
      latitude: lat,
      longitude: lng,
      currentPrecipitationMmHr: parseFloat(currentPrecip.toFixed(1)), // Direct mm/hr live precipitation rate
      weatherCode,
      temperatureC: temp !== undefined ? Math.round(temp) : null,
      windSpeedKmh: wind !== undefined ? Math.round(wind) : null,
      isLiveApiData: true,
      sourceName: 'Open-Meteo Weather Model',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  } catch (error) {
    console.warn('Live weather API fetch failed:', error);
    return {
      latitude: lat,
      longitude: lng,
      currentPrecipitationMmHr: null, // Rainfall data unavailable
      weatherCode: 0,
      temperatureC: null,
      windSpeedKmh: null,
      isLiveApiData: false,
      sourceName: 'Open-Meteo Weather Model',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      errorMessage: 'Rainfall data unavailable'
    };
  }
}

/**
 * Optional reverse geocoding to resolve city/area name for user coordinates
 */
export async function reverseGeocodeLocation(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}&zoom=10`;
    const res = await fetch(url, { headers: { 'User-Agent': 'UrbanGo-Flood-System/1.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.suburb || data.address?.county || data.display_name?.split(',')[0] || null;
  } catch {
    return null;
  }
}

/**
 * Search any location or address on Earth via OpenStreetMap Nominatim Geocoding API
 */
export async function searchLocations(query: string): Promise<Array<{ name: string; lat: number; lng: number }>> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
    const res = await fetch(url, { headers: { 'User-Agent': 'UrbanGo-Flood-System/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  } catch (err) {
    console.warn('Location search failed:', err);
    return [];
  }
}

/**
 * Fetch 100% Real-Time SRTM Digital Elevation Model (DEM) terrain elevation in meters Above Sea Level (ASL)
 */
export async function fetchTerrainElevation(lat: number, lng: number): Promise<number | null> {
  try {
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.elevation && data.elevation.length > 0) {
      return parseFloat(data.elevation[0].toFixed(1));
    }
    return null;
  } catch (err) {
    console.warn('Elevation fetch error:', err);
    return null;
  }
}



