const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  'taxi-logo192.png': 192,
  'taxi-logo512.png': 512,
};

async function generateIcons() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/taxi-icon.svg'));

  // Generar PNGs
  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, '../public', filename));
  }
}

generateIcons().catch(console.error); 