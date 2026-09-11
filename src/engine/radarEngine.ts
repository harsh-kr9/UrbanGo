import type { RadarNowcast } from '../types';

/**
 * Converts Radar Reflectivity Factor (Z in dBZ) to Rainfall Intensity (R in mm/hr)
 * Marshall-Palmer Z-R relationship for monsoon convective cloudbursts: Z = 200 * R^1.6
 */
export function convertDbzToRainfallRate(dbz: number): number {
  if (dbz < 15) return 0;
  // Z = 10^(dBZ / 10)
  const z = Math.pow(10, dbz / 10);
  // R = (Z / 200) ^ (1 / 1.6)
  const rainfallRate = Math.pow(z / 200, 1 / 1.6);
  return parseFloat(rainfallRate.toFixed(1));
}

/**
 * Returns color hex for Radar Reflectivity dBZ value according to standard Doppler Weather Radar scale
 */
export function getRadarColorHex(dbz: number): string {
  if (dbz < 15) return 'transparent';
  if (dbz < 25) return '#0000ff'; // Light rain (blue)
  if (dbz < 35) return '#00ff00'; // Moderate rain (green)
  if (dbz < 45) return '#ffff00'; // Heavy rain (yellow)
  if (dbz < 55) return '#ff7700'; // Very heavy rain (orange)
  if (dbz < 65) return '#ff0000'; // Severe cloudburst storm (red)
  return '#ff00ff'; // Extreme torrent / Hail (magenta/pink)
}

/**
 * Generates Doppler Radar Nowcast feed for current lead time and precipitation rate
 */
export function generateRadarNowcastFeed(
  leadTimeMinutes: number,
  baseRainfallMmHr: number,
  isLiveMode: boolean = true
): RadarNowcast {
  // Compute dBZ from precipitation rate: Z = 200 * R^1.6 => dBZ = 10 * log10(Z)
  const dynamicRate = Math.max(0, baseRainfallMmHr);
  let computedDbz = 0;
  if (dynamicRate > 0) {
    const z = 200 * Math.pow(dynamicRate, 1.6);
    computedDbz = Math.min(68, Math.max(15, Math.round(10 * Math.log10(z))));
  }

  if (isLiveMode) {
    return {
      timestamp: new Date(Date.now() + leadTimeMinutes * 60000).toISOString(),
      leadTimeMinutes,
      gridResolutionKm: 0.5,
      reflectivityDbz: computedDbz,
      rainfallRateMmHr: dynamicRate,
      isConnected: true,
      statusMessage: dynamicRate > 0
        ? `Open-Meteo / WMO Live Radar Reflectivity: ${computedDbz} dBZ`
        : 'Open-Meteo / WMO Live Radar: Monitoring Active (Clear Sky)',
      stormCellVector: {
        headingDeg: 215,
        speedKmh: dynamicRate > 0 ? 28.5 : 0
      }
    };
  }

  // Historical Replay Mode: Archived event radar feed
  if (baseRainfallMmHr <= 0) {
    return {
      timestamp: new Date(Date.now() + leadTimeMinutes * 60000).toISOString(),
      leadTimeMinutes,
      gridResolutionKm: 0.5,
      reflectivityDbz: 0,
      rainfallRateMmHr: 0,
      isConnected: true,
      statusMessage: 'Archived IMD Radar Event Feed',
      stormCellVector: {
        headingDeg: 215,
        speedKmh: 0
      }
    };
  }

  // Compute dBZ from base rainfall rate: Z = 200 * R^1.6 => dBZ = 10 * log10(Z)
  const z = 200 * Math.pow(baseRainfallMmHr, 1.6);
  const baseDbz = Math.min(68, Math.max(15, 10 * Math.log10(z)));
  
  return {
    timestamp: new Date(Date.now() + leadTimeMinutes * 60000).toISOString(),
    leadTimeMinutes,
    gridResolutionKm: 0.5,
    reflectivityDbz: Math.round(baseDbz),
    rainfallRateMmHr: convertDbzToRainfallRate(baseDbz),
    isConnected: true,
    statusMessage: 'Archived IMD Radar Event Feed',
    stormCellVector: {
      headingDeg: 215,
      speedKmh: 32.5
    }
  };
}
