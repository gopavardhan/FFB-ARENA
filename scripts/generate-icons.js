import Jimp from 'jimp';
import path from 'path';
import fs from 'fs';

const src = path.resolve(process.cwd(), 'public', 'pwd2.png');
if (!fs.existsSync(src)) {
  console.error('Source icon not found at', src);
  process.exit(2);
}

const sizes = [144, 192, 256, 512, 1024];
(async () => {
  const image = await Jimp.read(src);
  for (const s of sizes) {
    const out = path.resolve(process.cwd(), 'public', `icon-${s}x${s}.png`);
    const resized = image.clone().cover(s, s);
    await resized.quality(90).writeAsync(out);
    console.log('Wrote', out);
  }
})();
