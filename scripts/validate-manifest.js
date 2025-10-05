import fs from 'fs';
import path from 'path';

// Minimal manifest lint: check required fields and icon sizes
const manifestPath = path.resolve(process.cwd(), 'public', 'manifest.json');
const raw = fs.readFileSync(manifestPath, 'utf-8');
let m;
try {
  m = JSON.parse(raw);
} catch (err) {
  console.error('Error: manifest.json is not valid JSON');
  console.error(err);
  process.exit(2);
}

const errors = [];
const warnings = [];

if (!m.name) errors.push('Missing `name`');
if (!m.short_name) warnings.push('Missing `short_name` (recommended)');
if (!m.start_url) warnings.push('Missing `start_url` (recommended)');
if (!m.icons || !Array.isArray(m.icons) || m.icons.length === 0) errors.push('No icons defined in `icons` array');

if (m.icons && Array.isArray(m.icons)) {
  m.icons.forEach((icon, i) => {
    if (!icon.src) errors.push(`icons[${i}].src is missing`);
    if (!icon.sizes) warnings.push(`icons[${i}].sizes is missing`);
    if (!icon.type) warnings.push(`icons[${i}].type is missing`);
  });
}

if (m.screenshots && !Array.isArray(m.screenshots)) warnings.push('screenshots should be an array');

// Check referenced files exist
const checkFiles = [];
if (m.icons) m.icons.forEach(ic => checkFiles.push(ic.src));
if (m.screenshots) m.screenshots.forEach(sc => checkFiles.push(sc.src));

checkFiles.forEach((p) => {
  const filePath = path.join(process.cwd(), 'public', p.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) errors.push(`Referenced file not found: ${p}`);
});

console.log('Manifest validation results:');
if (errors.length === 0 && warnings.length === 0) console.log('  OK — no issues found');
if (errors.length) {
  console.log('\nErrors:');
  errors.forEach(e => console.log('  -', e));
}
if (warnings.length) {
  console.log('\nWarnings:');
  warnings.forEach(w => console.log('  -', w));
}

if (errors.length) process.exit(3);
process.exit(0);
