import type { CityInfo, DrainageNode, DrainagePipe, StreetSegment } from '../types';

export const CITIES: CityInfo[] = [
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    center: [22.5726, 88.3639],
    zoom: 14,
    description: 'Flat deltaic topography with tidal backflow from Hooghly River & strained canal drainage networks (Palmer Bridge, Town Canal, Circular Canal).',
    vulnerableZonesCount: 14,
    drainageAuthority: 'Kolkata Municipal Corporation (KMC) & KMDA',
    elevationRange: '2.5m - 6.0m ASL',
    historicalHotspots: ['Thanthania Kalibari', 'Amherst Street', 'Ultadanga Underpass', 'Central Avenue', 'Park Street - Camac St', 'Ballygunge Circular Rd'],
    landmarks: [
      { id: 'KOL_L01', name: 'Howrah Railway Station Hub', coordinates: [22.5830, 88.3420], category: 'railway' },
      { id: 'KOL_L02', name: 'Esplanade Metro Interchange', coordinates: [22.5645, 88.3516], category: 'metro_station' },
      { id: 'KOL_L03', name: 'Thanthania Kalibari Crossing', coordinates: [22.5815, 88.3665], category: 'commercial' },
      { id: 'KOL_L04', name: 'Amherst Street Medical Center', coordinates: [22.5780, 88.3690], category: 'hospital' },
      { id: 'KOL_L05', name: 'Sealdah Terminal Station', coordinates: [22.5670, 88.3710], category: 'railway' },
      { id: 'KOL_L06', name: 'Ultadanga Railway Underpass', coordinates: [22.5950, 88.3850], category: 'transit_hub' }
    ]
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    center: [19.0176, 72.8467],
    zoom: 14,
    description: 'Estuarine coastal topography prone to cloudbursts coupled with high tide locks on Mithi River and Cleveland Bunder outfalls.',
    vulnerableZonesCount: 18,
    drainageAuthority: 'Brihanmumbai Municipal Corporation (BMC)',
    elevationRange: '1.0m - 12.0m ASL',
    historicalHotspots: ['Hindmata Junction', 'Dadar TT Circle', 'Kurla LBS Marg', 'Sion Station Box', 'Milan Subway', 'Andheri Subway'],
    landmarks: [
      { id: 'BOM_L01', name: 'Chhatrapati Shivaji Terminus (CSMT)', coordinates: [18.9400, 72.8350], category: 'railway' },
      { id: 'BOM_L02', name: 'Dadar TT Circle Bus Interchange', coordinates: [19.0180, 72.8465], category: 'transit_hub' },
      { id: 'BOM_L03', name: 'Hindmata Low Dip Junction', coordinates: [19.0065, 72.8430], category: 'commercial' },
      { id: 'BOM_L04', name: 'Kurla LBS Marg Commercial Hub', coordinates: [19.0680, 72.8830], category: 'commercial' }
    ]
  },
  {
    id: 'delhi',
    name: 'New Delhi',
    state: 'Delhi NCR',
    center: [28.6280, 77.2285],
    zoom: 14,
    description: 'Depression basin underpasses and stormwater drains spilling into Yamuna River during high peak rain runoff.',
    vulnerableZonesCount: 12,
    drainageAuthority: 'Municipal Corporation of Delhi (MCD) & PWD',
    elevationRange: '208m - 225m ASL',
    historicalHotspots: ['Minto Bridge Underpass', 'ITO Crossing', 'Rajghat Bypass', 'Zakhira Flyover Dip', 'Pul Prahladpur', 'Dhaula Kuan'],
    landmarks: [
      { id: 'DEL_L01', name: 'New Delhi Railway Station (NDLS)', coordinates: [28.6420, 77.2190], category: 'railway' },
      { id: 'DEL_L02', name: 'Minto Dip Railway Underpass', coordinates: [28.6330, 77.2230], category: 'transit_hub' },
      { id: 'DEL_L03', name: 'ITO Central Metro Junction', coordinates: [28.6280, 77.2410], category: 'metro_station' }
    ]
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    center: [13.0400, 80.2200],
    zoom: 14,
    description: 'Low-lying coastal plains with tidal backflow into Adyar & Cooum Rivers and Buckingham Canal.',
    vulnerableZonesCount: 16,
    drainageAuthority: 'Greater Chennai Corporation (GCC)',
    elevationRange: '2.0m - 8.0m ASL',
    historicalHotspots: ['Velachery Bypass', 'T. Nagar G.N. Chetty Rd', 'Mudichur Dip', 'Madipakkam Lake Basin', 'Otteri Nullah Junction'],
    landmarks: [
      { id: 'CHE_L01', name: 'Chennai Central Railway Station', coordinates: [13.0820, 80.2750], category: 'railway' },
      { id: 'CHE_L02', name: 'Velachery Lake Bypass Terminal', coordinates: [12.9810, 80.2220], category: 'transit_hub' },
      { id: 'CHE_L03', name: 'T. Nagar Commercial Complex', coordinates: [13.0420, 80.2380], category: 'commercial' }
    ]
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    center: [12.9166, 77.6200],
    zoom: 14,
    description: 'Ridged undulating terrain with fragmented Rajakaluve stormwater channels overflowing into tech corridor lakes.',
    vulnerableZonesCount: 15,
    drainageAuthority: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    elevationRange: '880m - 920m ASL',
    historicalHotspots: ['Silk Board Junction', 'Outer Ring Road Bellandur', 'Manyata Tech Park Dip', 'Koramangala 8th Block', 'Ecospace Flyover'],
    landmarks: [
      { id: 'BLR_L01', name: 'Majestic Bus & Metro Terminal', coordinates: [12.9770, 77.5710], category: 'metro_station' },
      { id: 'BLR_L02', name: 'Silk Board Central Junction', coordinates: [12.9175, 77.6235], category: 'transit_hub' },
      { id: 'BLR_L03', name: 'Outer Ring Road Bellandur Tech Park', coordinates: [12.9280, 77.6820], category: 'commercial' }
    ]
  }
];

export interface MetroGeoData {
  nodes: DrainageNode[];
  pipes: DrainagePipe[];
  streets: StreetSegment[];
}

export const METRO_DATASETS: Record<string, MetroGeoData> = {
  kolkata: {
    nodes: [
      {
        id: 'KOL_N01',
        name: 'Thanthania Kalibari Manhole',
        coordinates: [22.5815, 88.3665],
        type: 'manhole',
        groundElevation: 3.2,
        invertElevation: 1.2,
        depth: 2.0,
        capacityMax: 8.5,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'Ward 38 (North Kolkata)'
      },
      {
        id: 'KOL_N02',
        name: 'Amherst St Drainage Junction',
        coordinates: [22.5780, 88.3690],
        type: 'inlet',
        groundElevation: 3.0,
        invertElevation: 1.0,
        depth: 2.0,
        capacityMax: 9.0,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'Ward 37'
      },
      {
        id: 'KOL_N03',
        name: 'Central Avenue Sump Node',
        coordinates: [22.5730, 88.3620],
        type: 'sump',
        groundElevation: 2.8,
        invertElevation: 0.8,
        depth: 2.0,
        capacityMax: 12.0,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'Ward 40'
      },
      {
        id: 'KOL_N04',
        name: 'Ultadanga Underpass Inlet',
        coordinates: [22.5950, 88.3850],
        type: 'inlet',
        groundElevation: 2.2,
        invertElevation: -0.5,
        depth: 2.7,
        capacityMax: 7.0,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'Ward 14 (Ultadanga)'
      },
      {
        id: 'KOL_N05',
        name: 'Park St - Camac St Outfall Sump',
        coordinates: [22.5530, 88.3540],
        type: 'pumping_station',
        groundElevation: 3.5,
        invertElevation: 1.5,
        depth: 2.0,
        capacityMax: 15.0,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'Ward 63 (South-Central Kolkata)'
      },
      {
        id: 'KOL_N06',
        name: 'Palmer Bridge Pumping Outfall',
        coordinates: [22.5650, 88.3890],
        type: 'outfall',
        groundElevation: 2.5,
        invertElevation: 0.5,
        depth: 2.0,
        capacityMax: 22.0,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'Ward 57 (Town Canal Outfall)'
      }
    ],
    pipes: [
      {
        id: 'KOL_P01',
        sourceNodeId: 'KOL_N01',
        targetNodeId: 'KOL_N02',
        shape: 'circular',
        diameter: 1.5,
        length: 420,
        slope: 0.002,
        manningN: 0.014,
        maxHydraulicCapacity: 5.5,
        currentFlow: 2.1,
        fillRatio: 0.38,
        blockageRatio: 0.25,
        geometry: [[22.5815, 88.3665], [22.5780, 88.3690]]
      },
      {
        id: 'KOL_P02',
        sourceNodeId: 'KOL_N02',
        targetNodeId: 'KOL_N03',
        shape: 'box_culvert',
        diameter: 2.0,
        length: 680,
        slope: 0.0018,
        manningN: 0.015,
        maxHydraulicCapacity: 8.0,
        currentFlow: 3.2,
        fillRatio: 0.40,
        blockageRatio: 0.30,
        geometry: [[22.5780, 88.3690], [22.5730, 88.3620]]
      },
      {
        id: 'KOL_P03',
        sourceNodeId: 'KOL_N04',
        targetNodeId: 'KOL_N06',
        shape: 'box_culvert',
        diameter: 2.2,
        length: 1200,
        slope: 0.0012,
        manningN: 0.016,
        maxHydraulicCapacity: 9.5,
        currentFlow: 4.0,
        fillRatio: 0.42,
        blockageRatio: 0.45,
        geometry: [[22.5950, 88.3850], [22.5650, 88.3890]]
      },
      {
        id: 'KOL_P04',
        sourceNodeId: 'KOL_N03',
        targetNodeId: 'KOL_N05',
        shape: 'circular',
        diameter: 1.8,
        length: 1850,
        slope: 0.0015,
        manningN: 0.013,
        maxHydraulicCapacity: 7.2,
        currentFlow: 2.8,
        fillRatio: 0.39,
        blockageRatio: 0.15,
        geometry: [[22.5730, 88.3620], [22.5530, 88.3540]]
      },
      {
        id: 'KOL_P05',
        sourceNodeId: 'KOL_N05',
        targetNodeId: 'KOL_N06',
        shape: 'open_canal',
        diameter: 3.5,
        length: 2200,
        slope: 0.0010,
        manningN: 0.020,
        maxHydraulicCapacity: 18.0,
        currentFlow: 7.5,
        fillRatio: 0.41,
        blockageRatio: 0.20,
        geometry: [[22.5530, 88.3540], [22.5650, 88.3890]]
      }
    ],
    streets: [
      {
        id: 'KOL_ST01',
        name: 'Bidhan Sarani (Thanthania Temple Belt)',
        coordinates: [[22.5840, 88.3660], [22.5815, 88.3665], [22.5780, 88.3670]],
        associatedDrainNodeId: 'KOL_N01',
        elevationMeters: 3.1,
        lengthMeters: 650,
        widthMeters: 14,
        imperviousness: 0.90,
        currentWaterDepthCm: 4,
        riskLevel: 'clear'
      },
      {
        id: 'KOL_ST02',
        name: 'Amherst Street Corridor',
        coordinates: [[22.5800, 88.3695], [22.5780, 88.3690], [22.5750, 88.3685]],
        associatedDrainNodeId: 'KOL_N02',
        elevationMeters: 2.9,
        lengthMeters: 550,
        widthMeters: 12,
        imperviousness: 0.88,
        currentWaterDepthCm: 8,
        riskLevel: 'low'
      },
      {
        id: 'KOL_ST03',
        name: 'Chittaranjan Avenue (Central Ave)',
        coordinates: [[22.5760, 88.3625], [22.5730, 88.3620], [22.5690, 88.3615]],
        associatedDrainNodeId: 'KOL_N03',
        elevationMeters: 2.8,
        lengthMeters: 800,
        widthMeters: 22,
        imperviousness: 0.92,
        currentWaterDepthCm: 5,
        riskLevel: 'clear'
      },
      {
        id: 'KOL_ST04',
        name: 'Ultadanga Railway Underpass Dip',
        coordinates: [[22.5970, 88.3840], [22.5950, 88.3850], [22.5930, 88.3860]],
        associatedDrainNodeId: 'KOL_N04',
        elevationMeters: 2.2,
        lengthMeters: 400,
        widthMeters: 18,
        imperviousness: 0.95,
        currentWaterDepthCm: 14,
        riskLevel: 'low'
      },
      {
        id: 'KOL_ST05',
        name: 'Park Street - Camac Street Crossing',
        coordinates: [[22.5550, 88.3550], [22.5530, 88.3540], [22.5510, 88.3530]],
        associatedDrainNodeId: 'KOL_N05',
        elevationMeters: 3.4,
        lengthMeters: 500,
        widthMeters: 16,
        imperviousness: 0.85,
        currentWaterDepthCm: 2,
        riskLevel: 'clear'
      }
    ]
  },

  mumbai: {
    nodes: [
      {
        id: 'BOM_N01',
        name: 'Hindmata Flyover Junction Sump',
        coordinates: [19.0065, 72.8430],
        type: 'sump',
        groundElevation: 1.8,
        invertElevation: -0.2,
        depth: 2.0,
        capacityMax: 14.0,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'F-South Ward (Dadar East)'
      },
      {
        id: 'BOM_N02',
        name: 'Dadar TT Circle Inlet',
        coordinates: [19.0180, 72.8465],
        type: 'inlet',
        groundElevation: 2.2,
        invertElevation: 0.2,
        depth: 2.0,
        capacityMax: 11.0,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'F-North Ward'
      },
      {
        id: 'BOM_N03',
        name: 'Kurla LBS Marg Storm Drain',
        coordinates: [19.0680, 72.8830],
        type: 'manhole',
        groundElevation: 2.0,
        invertElevation: 0.0,
        depth: 2.0,
        capacityMax: 10.0,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'L Ward (Kurla West)'
      },
      {
        id: 'BOM_N04',
        name: 'Cleveland Bunder Tidal Outfall',
        coordinates: [19.0010, 72.8250],
        type: 'outfall',
        groundElevation: 1.2,
        invertElevation: -1.0,
        depth: 2.2,
        capacityMax: 28.0,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'G-South Ward Outfall'
      }
    ],
    pipes: [
      {
        id: 'BOM_P01',
        sourceNodeId: 'BOM_N02',
        targetNodeId: 'BOM_N01',
        shape: 'box_culvert',
        diameter: 2.4,
        length: 1300,
        slope: 0.0015,
        manningN: 0.015,
        maxHydraulicCapacity: 12.0,
        currentFlow: 5.5,
        fillRatio: 0.45,
        blockageRatio: 0.35,
        geometry: [[19.0180, 72.8465], [19.0065, 72.8430]]
      },
      {
        id: 'BOM_P02',
        sourceNodeId: 'BOM_N01',
        targetNodeId: 'BOM_N04',
        shape: 'box_culvert',
        diameter: 3.0,
        length: 2100,
        slope: 0.0010,
        manningN: 0.016,
        maxHydraulicCapacity: 24.0,
        currentFlow: 11.0,
        fillRatio: 0.46,
        blockageRatio: 0.20,
        geometry: [[19.0065, 72.8430], [19.0010, 72.8250]]
      }
    ],
    streets: [
      {
        id: 'BOM_ST01',
        name: 'Dr. Babasaheb Ambedkar Road (Hindmata)',
        coordinates: [[19.0100, 72.8440], [19.0065, 72.8430], [19.0030, 72.8420]],
        associatedDrainNodeId: 'BOM_N01',
        elevationMeters: 1.8,
        lengthMeters: 800,
        widthMeters: 24,
        imperviousness: 0.94,
        currentWaterDepthCm: 6,
        riskLevel: 'clear'
      },
      {
        id: 'BOM_ST02',
        name: 'LBS Marg Kurla Stretch',
        coordinates: [[19.0700, 72.8820], [19.0680, 72.8830], [19.0650, 72.8840]],
        associatedDrainNodeId: 'BOM_N03',
        elevationMeters: 2.0,
        lengthMeters: 900,
        widthMeters: 20,
        imperviousness: 0.91,
        currentWaterDepthCm: 10,
        riskLevel: 'low'
      }
    ]
  },

  delhi: {
    nodes: [
      {
        id: 'DEL_N01',
        name: 'Minto Bridge Underpass Dip Sump',
        coordinates: [28.6330, 77.2230],
        type: 'sump',
        groundElevation: 209.5,
        invertElevation: 206.5,
        depth: 3.0,
        capacityMax: 12.5,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'Central Delhi Zone'
      },
      {
        id: 'DEL_N02',
        name: 'ITO Junction Manhole',
        coordinates: [28.6280, 77.2410],
        type: 'manhole',
        groundElevation: 211.0,
        invertElevation: 209.0,
        depth: 2.0,
        capacityMax: 10.0,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'ITO Civic Center'
      },
      {
        id: 'DEL_N03',
        name: 'Barapullah Drain Yamuna Outfall',
        coordinates: [28.5860, 77.2620],
        type: 'outfall',
        groundElevation: 204.0,
        invertElevation: 202.0,
        depth: 2.0,
        capacityMax: 35.0,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'East Yamuna Floodplain'
      }
    ],
    pipes: [
      {
        id: 'DEL_P01',
        sourceNodeId: 'DEL_N01',
        targetNodeId: 'DEL_N02',
        shape: 'circular',
        diameter: 1.8,
        length: 1600,
        slope: 0.0025,
        manningN: 0.014,
        maxHydraulicCapacity: 8.5,
        currentFlow: 3.5,
        fillRatio: 0.41,
        blockageRatio: 0.30,
        geometry: [[28.6330, 77.2230], [28.6280, 77.2410]]
      },
      {
        id: 'DEL_P02',
        sourceNodeId: 'DEL_N02',
        targetNodeId: 'DEL_N03',
        shape: 'open_canal',
        diameter: 4.0,
        length: 4500,
        slope: 0.0012,
        manningN: 0.022,
        maxHydraulicCapacity: 30.0,
        currentFlow: 12.0,
        fillRatio: 0.40,
        blockageRatio: 0.15,
        geometry: [[28.6280, 77.2410], [28.5860, 77.2620]]
      }
    ],
    streets: [
      {
        id: 'DEL_ST01',
        name: 'Deen Dayal Upadhyaya Marg (Minto Dip)',
        coordinates: [[28.6350, 77.2220], [28.6330, 77.2230], [28.6310, 77.2240]],
        associatedDrainNodeId: 'DEL_N01',
        elevationMeters: 209.5,
        lengthMeters: 500,
        widthMeters: 20,
        imperviousness: 0.92,
        currentWaterDepthCm: 18,
        riskLevel: 'moderate'
      },
      {
        id: 'DEL_ST02',
        name: 'Vikas Marg ITO Crossing',
        coordinates: [[28.6300, 77.2390], [28.6280, 77.2410], [28.6260, 77.2430]],
        associatedDrainNodeId: 'DEL_N02',
        elevationMeters: 211.0,
        lengthMeters: 600,
        widthMeters: 26,
        imperviousness: 0.89,
        currentWaterDepthCm: 4,
        riskLevel: 'clear'
      }
    ]
  },

  chennai: {
    nodes: [
      {
        id: 'CHE_N01',
        name: 'Velachery Lake Overflow Sump',
        coordinates: [12.9810, 80.2220],
        type: 'sump',
        groundElevation: 4.1,
        invertElevation: 2.1,
        depth: 2.0,
        capacityMax: 11.5,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'Zone 13 (Velachery)'
      },
      {
        id: 'CHE_N02',
        name: 'T. Nagar G.N. Chetty Canal Inlet',
        coordinates: [13.0420, 80.2380],
        type: 'inlet',
        groundElevation: 5.5,
        invertElevation: 3.5,
        depth: 2.0,
        capacityMax: 9.5,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'Zone 9 (T. Nagar)'
      },
      {
        id: 'CHE_N03',
        name: 'Buckingham Canal Sea Outfall',
        coordinates: [12.9880, 80.2580],
        type: 'outfall',
        groundElevation: 1.8,
        invertElevation: -0.2,
        depth: 2.0,
        capacityMax: 32.0,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'Adyar River Mouth Outfall'
      }
    ],
    pipes: [
      {
        id: 'CHE_P01',
        sourceNodeId: 'CHE_N01',
        targetNodeId: 'CHE_N03',
        shape: 'box_culvert',
        diameter: 2.5,
        length: 3800,
        slope: 0.0008,
        manningN: 0.016,
        maxHydraulicCapacity: 14.0,
        currentFlow: 6.2,
        fillRatio: 0.44,
        blockageRatio: 0.28,
        geometry: [[12.9810, 80.2220], [12.9880, 80.2580]]
      }
    ],
    streets: [
      {
        id: 'CHE_ST01',
        name: 'Velachery Main Road Bypass',
        coordinates: [[12.9830, 80.2210], [12.9810, 80.2220], [12.9790, 80.2230]],
        associatedDrainNodeId: 'CHE_N01',
        elevationMeters: 4.1,
        lengthMeters: 750,
        widthMeters: 18,
        imperviousness: 0.88,
        currentWaterDepthCm: 9,
        riskLevel: 'low'
      }
    ]
  },

  bengaluru: {
    nodes: [
      {
        id: 'BLR_N01',
        name: 'Silk Board Junction Storm Channel',
        coordinates: [12.9175, 77.6235],
        type: 'manhole',
        groundElevation: 895.0,
        invertElevation: 893.0,
        depth: 2.0,
        capacityMax: 13.0,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'BTM Layout Ward'
      },
      {
        id: 'BLR_N02',
        name: 'Outer Ring Road Bellandur Channel',
        coordinates: [12.9280, 77.6820],
        type: 'inlet',
        groundElevation: 888.0,
        invertElevation: 886.0,
        depth: 2.0,
        capacityMax: 15.0,
        currentSurchargeHead: 0,
        overflowVolume: 0,
        status: 'normal',
        ward: 'Mahadevapura Zone'
      }
    ],
    pipes: [
      {
        id: 'BLR_P01',
        sourceNodeId: 'BLR_N01',
        targetNodeId: 'BLR_N02',
        shape: 'open_canal',
        diameter: 3.0,
        length: 6200,
        slope: 0.003,
        manningN: 0.025,
        maxHydraulicCapacity: 20.0,
        currentFlow: 8.0,
        fillRatio: 0.40,
        blockageRatio: 0.35,
        geometry: [[12.9175, 77.6235], [12.9280, 77.6820]]
      }
    ],
    streets: [
      {
        id: 'BLR_ST01',
        name: 'Silk Board Central Flyover Underpass',
        coordinates: [[12.9190, 77.6220], [12.9175, 77.6235], [12.9160, 77.6250]],
        associatedDrainNodeId: 'BLR_N01',
        elevationMeters: 895.0,
        lengthMeters: 600,
        widthMeters: 24,
        imperviousness: 0.93,
        currentWaterDepthCm: 11,
        riskLevel: 'low'
      }
    ]
  }
};
