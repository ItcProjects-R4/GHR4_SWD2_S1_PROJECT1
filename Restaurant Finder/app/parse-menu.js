import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(__dirname, 'gramercy-menu.html');
const text = readFileSync(file, 'utf8');
const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
const matches = [...text.matchAll(scriptRegex)];
if (!matches.length) {
  console.error('No JSON-LD script blocks found');
  process.exit(1);
}

const parsed = matches
  .map((match) => match[1].trim())
  .filter(Boolean)
  .map((payload, index) => {
    try {
      return { index, value: JSON.parse(payload) };
    } catch (err) {
      console.error(`Failed to parse JSON-LD block ${index}:`, err.message);
      return null;
    }
  })
  .filter(Boolean);

if (!parsed.length) {
  console.error('No valid JSON-LD payloads parsed');
  process.exit(1);
}

console.log(`Found ${parsed.length} JSON-LD blocks`);

const menus = parsed
  .flatMap(({ value }) => (Array.isArray(value) ? value : [value]))
  .filter((item) => item && item['@type'] === 'Menu');

if (!menus.length) {
  console.log('No Menu objects found in JSON-LD payloads. Printing all payload types...');
  parsed.forEach(({ index, value }) => {
    console.log(`Block ${index}: @type=${value['@type']} name=${value.name || ''}`);
  });
  process.exit(0);
}

console.log(`Found ${menus.length} menu(s)`);
menus.forEach((menu, menuIndex) => {
  console.log(`\nMenu ${menuIndex}:`, menu.name);
  console.log('Description:', menu.description || 'N/A');
  const sections = Array.isArray(menu.hasMenuSection) ? menu.hasMenuSection : [];
  console.log('Sections:', sections.length);
  sections.forEach((section, sectionIndex) => {
    const items = Array.isArray(section.hasMenuItem) ? section.hasMenuItem : [];
    console.log(`  Section ${sectionIndex}: ${section.name || 'Unnamed'} (${items.length} items)`);
    items.slice(0, 5).forEach((item, itemIndex) => {
      const price = item.offers?.price || item.price || 'N/A';
      console.log(`    ${itemIndex + 1}. ${item.name} — ${price}`);
      if (item.description) console.log(`       desc: ${item.description}`);
    });
  });
});
