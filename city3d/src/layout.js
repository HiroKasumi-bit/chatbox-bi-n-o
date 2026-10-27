// The city plan: where every district and key place sits. x runs east, z runs south
// (north is -z), y is up; one unit is one metre. The 3D builders and the 2D plans both
// read this file, so the drawings always match the model.

export const BLOCK = 56; // downtown block size
export const STREET = 16; // street width
export const PITCH = BLOCK + STREET; // 72
export const RING = PITCH * 1.5 + STREET / 2 + 4; // half-size of the downtown ring road

// The nine downtown blocks, from north-west to south-east.
export const BLOCKS = [
  { id: 'polaris', name: 'Polaris Quarter', col: -1, row: -1 },
  { id: 'knowledge', name: 'Knowledge Quarter', col: 0, row: -1 },
  { id: 'financial', name: 'Financial District', col: 1, row: -1 },
  { id: 'westmarket', name: 'West Market Street', col: -1, row: 0 },
  { id: 'civic', name: 'Civic Core & Liberty Mall', col: 0, row: 0 },
  { id: 'eastgallery', name: 'East Gallery Avenue', col: 1, row: 0 },
  { id: 'snowpine', name: 'Snowpine Residences', col: -1, row: 1 },
  { id: 'approach', name: 'Mount Aurora Approach', col: 0, row: 1 },
  { id: 'aurora81', name: 'Aurora 81 District', col: 1, row: 1 },
].map((b) => ({ ...b, x: b.col * PITCH, z: b.row * PITCH }));

// Outer districts as rectangles [x0, z0, x1, z1].
export const DISTRICTS = {
  renewable: { name: 'Northern Renewable Park', rect: [-300, -360, 120, -215] },
  energyHub: { name: 'Energy Hub & Rescue Station', rect: [-90, -200, 90, -128] },
  airport: { name: 'Compact Polar Airport', rect: [150, -330, 520, -150] },
  airBase: { name: 'Aurora Air Base & Polar Garrison', rect: [-420, -150, -270, 120] },
  ecoHomes: { name: 'Eco-Homes', rect: [-240, -110, -150, 110] },
  greenhouses: { name: 'Evergreen Garden & Greenhouses', rect: [128, -110, 200, -20] },
  stadium: { name: 'Aurora Snow Stadium', rect: [215, -120, 345, 0] },
  foodPlant: { name: 'Snow-to-Food & Water Plant', rect: [140, 30, 330, 120], colour: 'food' },
  fusion: { name: 'Fusion Power Station', rect: [140, 150, 330, 270], colour: 'fusion' },
  spa: { name: 'Mount Aurora Geothermal Spa Resort', rect: [-75, 160, 85, 320], colour: 'spa' },
};

// Mount Aurora: an Ama Dablam-style peak, 35 m high, with the spa inside.
export const MOUNT = { x: 0, z: 250, height: 35, radius: 58, portalZ: 196 };

// Signature-district stages (positions of the halls), used by the builders and the plans.
export const FOOD_STAGES = [
  { n: '1', name: 'Snow Harvest & Melt Hall', x: 305, z: 75 },
  { n: '2', name: 'Drinking-Water & Mineral Works', x: 272, z: 75 },
  { n: '3', name: 'Electrolysis, Air-Capture & Ammonia Hall', x: 240, z: 75 },
  { n: '4', name: 'Carbon-Fixation Chemistry Hall', x: 208, z: 75 },
  { n: '5', name: 'Bioreactor Silos', x: 178, z: 75 },
  { n: '6', name: 'Food Kitchen, Bottling & Distribution', x: 152, z: 100 },
  { n: 'S', name: 'Snow stockpile bay', x: 305, z: 44 },
];

export const FUSION_STAGES = [
  { n: '1', name: 'Heavy-Water Separation Works', x: 290, z: 172 },
  { n: '2', name: 'Lithium Blanket & Tritium Fuel-Cycle Plant', x: 250, z: 172 },
  { n: '3', name: 'Fusion Core – Compact D-T Tokamak', x: 240, z: 222 },
  { n: '4', name: 'Power Conversion & Heat Export Hall', x: 300, z: 225 },
  { n: '5', name: 'Plasma Waste Converter', x: 180, z: 175 },
  { n: 'C', name: 'Control & Visitor Centre', x: 172, z: 235 },
];

// The 35 key places of the magazine, numbered as on the master plan.
export const PLACES = [
  ['President Ho Chi Minh Monument', 0, 0],
  ['Aurora Civic Center & Municipal Hall', -14, -18],
  ['Snowflake General Hospital', 17, -22],
  ['Northern Lights School & Botanical Conservatory', 16, -8],
  ['Igloo Fresh Supermarket & Food Hall', -18, 8],
  ['Aurora Cinema & Performing Arts Center', -15, 22],
  ['Underground Metro & Emergency Shelters', 0, -26],
  ['Aurora Core – AI Control Tower', -72, -80],
  ['Aurora Haven Police Headquarters', -86, -60],
  ['Arctic University – Main Hall', 0, -82],
  ['Aurora Public Library', 14, -60],
  ['West Market Fire & Ambulance Station', -86, 12],
  ['Aurora Glacier Mall & Crystal Atrium', 72, -6],
  ['Snow Lantern Primary School', 84, 18],
  ['Pinecone Kindergarten', -60, 86],
  ['Aurora 81 – Polar Landmark Tower', 72, 72],
  ['Aurora Snow Garden Park', -52, 205],
  ['Mount Aurora – Snow Peak & Hanging Glacier', 0, 250],
  ['Summit Sanctuary & Aurora Eye', 0, 214],
  ['Aurora Lagoon – Outdoor Geothermal Mineral Pool', 34, 204],
  ['Fusion Core – Compact D-T Tokamak', 240, 222],
  ['Power Conversion & Heat Export Hall', 300, 225],
  ['Plasma Waste Converter', 180, 175],
  ['Snow Harvest & Melt Hall', 305, 75],
  ['Drinking-Water & Mineral Works', 272, 75],
  ['Bioreactor Silos', 178, 75],
  ['Ice-Proof Wind Farm', -120, -320],
  ['Bifacial Solar Farm', -20, -240],
  ['Water Recycling Line – Recycled Water Tower', -170, -238],
  ['Geothermal Power Plant', -45, -165],
  ['Polar Rescue and Resilience Station', 45, -165],
  ['Glass Terminal, Control Tower & Gate 1 Dreamliner', 250, -190],
  ['Evergreen Greenhouse Dome', 160, -75],
  ['Circular Recycling Center', 165, -35],
  ['Aurora Snow Stadium', 280, -60],
].map(([name, x, z], i) => ({ n: i + 1, name, x, z }));

// Where the street-level pictures are taken from (x, z): nobody stands right in front of the lens.
export const CAMERA_SPOTS = [[0.8, 20.5], [-3.5, 44], [-29.5, -74], [-58, 63]];
