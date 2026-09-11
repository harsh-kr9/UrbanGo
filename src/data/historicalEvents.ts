import type { HistoricalEvent } from '../types';

export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    id: 'HIST_KOL_2024',
    cityId: 'kolkata',
    name: 'Kolkata Amherst & Thanthania Flash Surge',
    date: '12 July 2024 (14:30 IST)',
    source: 'KMC Stormwater Dept & IMD Radar Archive',
    cloudburstIntensityMmHr: 85,
    durationHours: 2.5,
    tidalLevelMeters: 3.4,
    blockagePercent: 35,
    description: 'Intense monsoon downpour coupled with Hooghly River high tide lock causing surcharging at Palmer Bridge outfall.'
  },
  {
    id: 'HIST_BOM_2023',
    cityId: 'mumbai',
    name: 'Mumbai Hindmata & Kurla Cloudburst',
    date: '29 August 2023 (11:15 IST)',
    source: 'BMC Disaster Cell & IMD Mumbai Radar',
    cloudburstIntensityMmHr: 110,
    durationHours: 3.0,
    tidalLevelMeters: 4.2,
    blockagePercent: 40,
    description: 'High-volume sea outfall backpressure at Cleveland Bunder trapping runoff in low-elevation Hindmata dip.'
  },
  {
    id: 'HIST_DEL_2023',
    cityId: 'delhi',
    name: 'Delhi Minto Bridge Dip Inundation',
    date: '20 July 2023 (08:45 IST)',
    source: 'MCD Civic Center & PWD Yamuna Outfall Log',
    cloudburstIntensityMmHr: 95,
    durationHours: 2.0,
    tidalLevelMeters: 1.5,
    blockagePercent: 50,
    description: 'Underpass basin inundation spilling over DDU Marg stormwater inlets into Yamuna floodplains.'
  },
  {
    id: 'HIST_CHE_2023',
    cityId: 'chennai',
    name: 'Chennai Velachery Bypass Tidal Lock',
    date: '04 December 2023 (16:00 IST)',
    source: 'GCC Central Cell & IMD Radar Archive',
    cloudburstIntensityMmHr: 105,
    durationHours: 4.0,
    tidalLevelMeters: 3.8,
    blockagePercent: 30,
    description: 'Cyclone Michaung rain bands causing Velachery lake overflow and Buckingham canal sea backflow.'
  },
  {
    id: 'HIST_BLR_2022',
    cityId: 'bengaluru',
    name: 'Bengaluru Bellandur Tech Corridor Spill',
    date: '05 September 2022 (19:20 IST)',
    source: 'BBMP Rajakaluve Cell & IMD Radar Log',
    cloudburstIntensityMmHr: 90,
    durationHours: 2.0,
    tidalLevelMeters: 0.0,
    blockagePercent: 60,
    description: 'Rajakaluve stormwater channel blockages overflowing onto Silk Board and Outer Ring Road corridors.'
  }
];
