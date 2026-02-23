// Generate PWA icons for ProConnectSA
// Run with: node generate-icons.js

const fs = require('fs');
const { createCanvas } = require('canvas');

// ProConnectSA brand colors
const BRAND_BLUE = '#2563eb';
const WHITE = '#ffffff';

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fill background with brand blue
  ctx.fillStyle = BRAND_BLUE;
  ctx.fillRect(0, 0, size, size);
  
  // Draw white "P" letter
  ctx.fillStyle = WHITE;
  ctx.font = `bold ${size * 0.6}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add subtle shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = size * 0.02;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = size * 0.01;
  
  ctx.fillText('P', size / 2, size / 2);
  
  return canvas.toBuffer('image/png');
}

// Generate icons
const icon192 = generateIcon(192);
const icon512 = generateIcon(512);

// Save icons
fs.writeFileSync('icon-192.png', icon192);
fs.writeFileSync('icon-512.png', icon512);

console.log('✅ Icons generated successfully!');
console.log('📁 icon-192.png (192x192)');
console.log('📁 icon-512.png (512x512)');
