/** Verified Wikimedia URLs — keep in sync with backend/destinations.json */
export const HERO_IMAGE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Beach%2C_pier_and_cloud._Eriyadu%2C_Maldives.jpg/1280px-Beach%2C_pier_and_cloud._Eriyadu%2C_Maldives.jpg";

export function getPlaceholderGradient(query: string): string {
  let hash = 0;
  for (let i = 0; i < query.length; i += 1) {
    hash = (hash << 5) - hash + query.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:hsl(${hue},55%,45%)"/><stop offset="100%" style="stop-color:hsl(${(hue + 40) % 360},65%,35%)"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
