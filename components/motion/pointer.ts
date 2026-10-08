// Mutable frame data avoids React renders for pointer movement.
export const pointer = {
  x: 0,
  y: 0,
  previousX: 0,
  previousY: 0,
  velocityX: 0,
  velocityY: 0,
  speed: 0,
  timestamp: 0,
  active: false,
};
