import { NextResponse } from 'next/server';

// Generate a simple SVG placeholder
export function GET() {
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="#333333"/>
      <text x="400" y="300" font-family="Arial" font-size="30" text-anchor="middle" fill="#1DE954">BioScout Islamabad</text>
      <text x="400" y="350" font-family="Arial" font-size="20" text-anchor="middle" fill="#ffffff">Image Unavailable</text>
    </svg>
  `;
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}
