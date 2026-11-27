import { SWEEP_START, SWEEP_END, RELEASE_TIME, sweepPose, smooth } from './support-weighing.mjs';

// Artist-directed display geometry and motion only. These ribs are not slicer
// supports, a physical simulation, or evidence of support volume or mass.
// Coordinates are millimetres in the viewer's Z-up frame; the ground is Z = 0.
const MAX_FRAGMENTS = 96;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const noise = seed => {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

function pieceCount(height) {
  const minimum = Math.ceil(height / 9);
  const maximum = Math.max(1, Math.floor(height / 5));
  return Math.max(minimum, Math.min(maximum, Math.round(height / 7), MAX_FRAGMENTS));
}

/**
 * Build thin lattice fragments below sampled underside contacts.
 * Each fragment is one instancing group, not one draw call per bar. Bar start
 * and end are LOCAL to centre; width and height describe its cross-section.
 * Selected columns extend from the ground to the sampled underside. When the
 * fragment budget is exhausted, sample fewer complete columns, never huge slabs.
 */
export function buildIllustrativeFragments(contacts, { width = 3.6, maxContacts = 24 } = {}) {
  if (!Array.isArray(contacts)) return [];
  const footprint = Number.isFinite(width) && width > 0 ? clamp(width, .6, 12) : 3.6;
  const requested = Number.isFinite(maxContacts) ? clamp(Math.floor(maxContacts), 0, MAX_FRAGMENTS) : 24;
  const valid = contacts.filter(contact => contact && [contact.x, contact.y, contact.height].every(Number.isFinite)
    && contact.height > 0 && contact.height <= MAX_FRAGMENTS * 9);
  let selected = [];
  for (let count = Math.min(requested, valid.length); count > 0; count -= 1) {
    selected = Array.from({ length: count }, (_, index) => valid[Math.floor((index + .5) * valid.length / count)]);
    if (selected.reduce((sum, contact) => sum + pieceCount(contact.height), 0) <= MAX_FRAGMENTS) break;
    selected = [];
  }

  const fragments = [];
  selected.forEach((contact, column) => {
    const seed = contact.x * .31 + contact.y * .57 + contact.height * .11 + column * 7.13;
    const count = pieceCount(contact.height);
    const nominalHeight = contact.height / count;
    const variation = Math.max(0, Math.min(nominalHeight - 5, 9 - nominalHeight)) * .42;
    const boundaries = Array.from({ length: count + 1 }, (_, part) => part === 0 ? 0 : part === count ? contact.height
      : part * nominalHeight + (noise(seed + part * 1.7) * 2 - 1) * variation);
    const angle = noise(seed + 2.1) * Math.PI;
    const cosine = Math.cos(angle), sine = Math.sin(angle);
    const columnWidth = footprint * (.88 + noise(seed + 3.4) * .12);
    const ribWidth = Math.min(.56, footprint * .145, nominalHeight * .16);
    const ribHeight = ribWidth * .56;
    const padding = Math.hypot(ribWidth, ribHeight) / 2;

    for (let part = 0; part < count; part += 1) {
      const bottom = boundaries[part], top = boundaries[part + 1];
      const centre = [contact.x, contact.y, (bottom + top) / 2];
      const low = bottom + padding, high = top - padding;
      const bars = [];
      function corner(index, worldZ) {
        const taper = 1 - .18 * worldZ / contact.height;
        const extent = Math.max(.04, columnWidth / 2 - padding) * taper / Math.SQRT2;
        const x = (index === 0 || index === 3 ? -1 : 1) * extent;
        const y = index < 2 ? -extent : extent;
        return [x * cosine - y * sine, x * sine + y * cosine, worldZ - centre[2]];
      }
      function bar(start, end) {
        bars.push({ start, end, width: ribWidth, height: ribHeight });
      }
      // Slim uprights keep the initially attached lattice visually continuous.
      for (let cornerIndex = 0; cornerIndex < 4; cornerIndex += 1) bar(corner(cornerIndex, low), corner(cornerIndex, high));
      // Alternating deposited-looking ribs and two braces leave open space.
      const levels = Math.max(3, Math.ceil((high - low) / 1.25));
      for (let layer = 0; layer <= levels; layer += 1) {
        const z = low + (high - low) * layer / levels;
        const pairs = layer % 2 ? [[0, 3], [1, 2]] : [[0, 1], [3, 2]];
        pairs.forEach(([a, b]) => bar(corner(a, z), corner(b, z)));
      }
      bar(corner(part % 2 ? 1 : 0, low), corner(part % 2 ? 0 : 1, high));
      bar(corner(part % 2 ? 2 : 3, low), corner(part % 2 ? 3 : 2, high));
      const radius = Math.max(...bars.flatMap(rib => [Math.hypot(...rib.start), Math.hypot(...rib.end)])) + padding;
      fragments.push({ centre, bars, radius });
    }
  });
  return fragments;
}

function floorHeight(fragment, rotation) {
  // Z row of an Euler XYZ rotation, matching the caller's Three.js group.
  // Evaluate the trigonometry once per pose, not once for every rib endpoint.
  const [rx, ry, rz] = rotation;
  const sx = Math.sin(rx), cx = Math.cos(rx), sy = Math.sin(ry), cy = Math.cos(ry);
  const sz = Math.sin(rz), cz = Math.cos(rz);
  const zx = sx * sz - cx * sy * cz, zy = sx * cz + cx * sy * sz, zz = cx * cy;
  const rotatedZ = point => point[0] * zx + point[1] * zy + point[2] * zz;
  let lowest = 0;
  for (const bar of fragment.bars) {
    const padding = Math.hypot(bar.width, bar.height) / 2;
    lowest = Math.min(lowest, rotatedZ(bar.start) - padding, rotatedZ(bar.end) - padding);
  }
  return -lowest + .08;
}

/**
 * A deterministic, directly seekable presentation pose, not integrated physics.
 * Pieces remain full-size while they tumble; collection uses the same display
 * sweep/tray convention as the sliced examples, including its uniform shrink.
 */
export function illustrativeFragmentPose(fragment, index, time) {
  const ordinal = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
  const elapsed = Number.isFinite(time) ? clamp(time, 0, RELEASE_TIME) : 0;
  const seed = ordinal * 3.17 + fragment.centre[0] * .13 + fragment.centre[1] * .19 + fragment.centre[2] * .07;
  const finalRotation = [
    (noise(seed + 1) < .5 ? -1 : 1) * (1.1 + noise(seed + 2) * .7),
    (noise(seed + 3) - .5) * .9,
    (noise(seed + 4) - .5) * Math.PI * 2,
  ];
  const settled = [
    fragment.centre[0] + (noise(seed + 5) - .5) * 19,
    fragment.centre[1] - 3 - noise(seed + 6) * 11,
    floorHeight(fragment, finalRotation),
  ];
  if (elapsed >= SWEEP_START) {
    const sweep = sweepPose(settled, ordinal, fragment.radius, Math.min(elapsed, SWEEP_END));
    return { position: sweep.position, rotation: finalRotation, scale: sweep.scale };
  }

  const start = .7 + noise(seed + 7) * .18 + (ordinal % 4) * .025;
  if (elapsed <= start) return { position: [...fragment.centre], rotation: [0, 0, 0], scale: 1 };
  const flightDuration = .8 + noise(seed + 8) * .25;
  const flight = clamp((elapsed - start) / flightDuration, 0, 1);
  const progress = smooth(flight);
  const bounceProgress = clamp((elapsed - start - flightDuration) / .42, 0, 1);
  const bounce = Math.abs(Math.sin(bounceProgress * Math.PI * 2)) * (1 - bounceProgress) ** 2;
  const rotation = finalRotation.map((value, axis) => value * progress + (axis === 2 ? 0 : bounce * .12));
  const position = fragment.centre.map((value, axis) => value + (settled[axis] - value) * (axis === 2 ? flight * flight : progress));
  position[2] += Math.sin(flight * Math.PI) * .75 + bounce * 1.6;
  position[2] = Math.max(position[2], floorHeight(fragment, rotation));
  return { position, rotation, scale: 1 };
}
