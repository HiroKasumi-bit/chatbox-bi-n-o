// Homes around the edge of downtown: a village of timber houses to the south-west, apartment
// blocks to the south-east, and the student residences and campus clinic to the north-west.
import { building, house, pine, lamp } from './kit.js';
import { road } from './ground.js';
import { rng } from './util.js';

const R = rng(909);

export function neighbourhoods(b) {
  // South-west village between Snowpine Residences and the Snow Garden Park.
  road(b, -205, 140, -126, 140, { width: 7, banks: true, marking: false, lamps: 22 });
  road(b, -205, 182, -126, 182, { width: 7, banks: true, marking: false });
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 6; i++) {
      const x = -196 + i * 13 + (row % 2) * 5;
      const z = 125 + row * 22;
      house(b, { x, z, w: 8, d: 9.5, h: 5.4, ry: (R() - 0.5) * 0.2 });
      if (R() < 0.7) pine(b, x + 6, z + 5, 0.75 + R() * 0.3);
    }
  }
  // South-east apartment blocks between the Aurora 81 District and the fusion station.
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      building(b, { x: 102 + j * 20, z: 140 + i * 30, w: 14, d: 22, h: 18 + ((i + j) % 2) * 7.2, facade: (i + j) % 2 ? 'residential' : 'brick' });
    }
  }
  for (let i = 0; i < 8; i++) pine(b, 112 + (R() - 0.5) * 8, 130 + i * 11, 0.8);
  // North-west: Student Residence Hall, campus clinic and a sports hall.
  road(b, -200, -150, -126, -150, { width: 8, banks: true, lamps: 24 });
  building(b, { x: -175, z: -172, w: 40, d: 14, h: 18, facade: 'brick' });
  building(b, { x: -175, z: -128, w: 40, d: 14, h: 14.4, facade: 'residential' });
  building(b, { x: -135, z: -172, w: 18, d: 18, h: 10.8, facade: 'civic' });
  for (let i = 0; i < 6; i++) {
    pine(b, -198 + i * 9, -140, 0.8);
    lamp(b, -196 + i * 9, -158, 5);
  }
}
