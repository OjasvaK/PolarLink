// Equirectangular projection shared by the map build script and the map
// component. Latitudes are cropped to 84N..80S so Antarctica's interior
// doesn't dominate the frame.
export const MAP = { width: 1000, height: 456, north: 84, south: -80 };

export function project(lat, lon) {
  return {
    x: ((lon + 180) / 360) * MAP.width,
    y: ((MAP.north - lat) / (MAP.north - MAP.south)) * MAP.height,
  };
}
