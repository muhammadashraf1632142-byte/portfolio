import { BufferAttribute, BufferGeometry } from "three";

// Each square owns its vertices so the shader can separate and rotate it.
// One draw call, no per-fragment React components or DOM elements.
export function createFragmentGeometry(aspect: number) {
  const columns = 88;
  const rows = Math.max(24, Math.round(columns / aspect));
  const positions: number[] = [];
  const uvs: number[] = [];
  const centers: number[] = [];
  const seeds: number[] = [];
  const corners = [[0, 0], [1, 0], [1, 1], [0, 0], [1, 1], [0, 1]];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const seed = ((column * 127 + row * 311) % 997) / 997;
      for (const [x, y] of corners) {
        const u = (column + x) / columns;
        const v = (row + y) / rows;
        positions.push(u - 0.5, v - 0.5, 0);
        uvs.push(u, v);
        centers.push((column + 0.5) / columns, (row + 0.5) / rows);
        seeds.push(seed);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setAttribute("aCenter", new BufferAttribute(new Float32Array(centers), 2));
  geometry.setAttribute("aSeed", new BufferAttribute(new Float32Array(seeds), 1));
  return geometry;
}
