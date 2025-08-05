const fs = require('fs');
const path = require('path');

// Simple icon generator using HTML5 Canvas (for Node.js with canvas package)
// For now, we'll create a simple SVG-based icon and then convert it

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background gradient -->
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#7559FF;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#5B47CC;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="avatar" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#E5E5E5;stop-opacity:1" />
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="url(#bg)" />
    
    <!-- Avatar silhouette -->
    <circle cx="${size * 0.5}" cy="${size * 0.35}" r="${size * 0.15}" fill="url(#avatar)" />
    <ellipse cx="${size * 0.5}" cy="${size * 0.75}" rx="${size * 0.22}" ry="${size * 0.18}" fill="url(#avatar)" />
    
    <!-- Chat bubble indicator -->
    <circle cx="${size * 0.75}" cy="${size * 0.25}" r="${size * 0.08}" fill="#00FF88" />
    <text x="${size * 0.75}" y="${size * 0.285}" font-family="Arial, sans-serif" font-size="${size * 0.08}" font-weight="bold" text-anchor="middle" fill="#000">AI</text>
  </svg>`;
};

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons for each size
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`Created icon-${size}x${size}.svg`);
});

console.log('Icon generation complete!');
console.log('Note: For production, convert SVG icons to PNG using a tool like:');
console.log('- Online converters (svg2png.com)');
console.log('- ImageMagick: convert icon.svg icon.png');
console.log('- Or keep as SVG (modern browsers support SVG in manifests)');