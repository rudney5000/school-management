import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svg = `
<svg width="300" height="120" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M 20 80 
       Q 40 30, 60 70 
       T 100 60 
       Q 120 40, 140 65 
       T 180 55
       Q 200 75, 220 50
       T 260 60
       L 280 45"
    stroke="#1e3a5f"
    stroke-width="3"
    fill="none"
    stroke-linecap="round"
  />
  <path
    d="M 30 90 L 250 90"
    stroke="#1e3a5f"
    stroke-width="1"
    stroke-dasharray="2,3"
    opacity="0.3"
  />
</svg>
`;

async function generate() {
  const outputDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'sample-signature.png');

  await sharp(Buffer.from(svg)).png().toFile(outputPath);

  console.log(`✓ Signature générée : ${outputPath}`);
}

generate().catch((err) => {
  console.error('✗ Échec génération signature:', err);
  process.exit(1);
});
