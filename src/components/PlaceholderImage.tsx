export default function PlaceholderImage({ text = "Image Unavailable" }) {
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="#333333"/>
      <text x="400" y="350" font-family="Arial" font-size="20" text-anchor="middle" fill="#ffffff">${text}</text>
    </svg>
  `;
  
  // Create base64 encoded SVG
  const encodedSVG = btoa(svg);
  const dataURL = `data:image/svg+xml;base64,${encodedSVG}`;
  
  return dataURL;
}
