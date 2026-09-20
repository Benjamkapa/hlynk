/**
 * fix_border_radius.cjs
 * Replaces legacy rounded-md / rounded-lg / rounded-[.5rem] patterns
 * with the hospitality-module design language across all .tsx / .ts files.
 *
 * Mapping rules:
 *  rounded-[.5rem]  →  rounded-xl   (was ~8px, now 12px modern card/input corner)
 *  rounded-md       →  rounded-xl   (was 6px pill → now 12px for inputs/cards)
 *  rounded-lg       →  rounded-xl   (was 8px → now 12px consistent)
 *
 * Note: rounded-full is intentionally left as-is (buttons, badges, avatars).
 *       rounded-xl, rounded-2xl, rounded-3xl are intentionally left as-is.
 *       rounded-none is left as-is (intentional no-rounding).
 *       rounded-[N] custom values other than .5rem are left as-is.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
// Sanity check
if (!fs.existsSync(SRC_DIR)) { console.error('src dir not found:', SRC_DIR); process.exit(1); }
const EXTENSIONS = ['.tsx', '.ts', '.css'];

// Files/dirs to skip
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.cache', 'coverage']);

let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  let count = 0;

  // rounded-[.5rem] → rounded-xl
  const before1 = (content.match(/rounded-\[\.5rem\]/g) || []).length;
  content = content.replace(/rounded-\[\.5rem\]/g, 'rounded-xl');
  count += (content.match(/rounded-xl/g) || []).length - (original.match(/rounded-xl/g) || []).length;

  // rounded-md → rounded-xl
  // But only when it's a standalone class (surrounded by space, quote, or backtick boundary)
  const before2 = (content.match(/\brounded-md\b/g) || []).length;
  content = content.replace(/\brounded-md\b/g, 'rounded-xl');
  count += before2;

  // rounded-lg → rounded-xl  
  // (small interactive elements like table action buttons → keep consistent)
  const before3 = (content.match(/\brounded-lg\b/g) || []).length;
  content = content.replace(/\brounded-lg\b/g, 'rounded-xl');
  count += before3;

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFiles++;
    totalReplacements += (before1 + before2 + before3);
    console.log(`  ✓ ${path.relative(SRC_DIR, filePath)} (${before1 + before2 + before3} replacements)`);
  }

  totalFiles++;
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      processFile(fullPath);
    }
  }
}

console.log('🔧 Fixing border-radius patterns to match hospitality module design...\n');
walkDir(SRC_DIR);

console.log(`\n✅ Done!`);
console.log(`   Files scanned:    ${totalFiles}`);
console.log(`   Files modified:   ${modifiedFiles}`);
console.log(`   Total replacements: ${totalReplacements}`);
