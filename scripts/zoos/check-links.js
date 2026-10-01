#!/usr/bin/env node
// Build guard: every link to /zoos/?animal=<id> in the site's pages and blog posts must point at an animal that has data.
// A dead "Find the nearest zoo" button must never ship (getwildatlas#38). Run by `npm run build`.
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', '..');
const aliases = { 'giant-pacific-octopus': 'octopus', hippo: 'hippopotamus' }; // keep in sync with js/zoos.js
const skip = new Set(['node_modules', '_site', '.git', 'research', 'assets', 'js', 'css', 'fonts']);
function walk(dir, out) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(f.name) || f.name.startsWith('.')) continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, out); else if (/\.(md|njk|html)$/.test(f.name)) out.push(p);
  }
  return out;
}
let bad = 0, n = 0;
for (const file of walk(root, [])) {
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(/\/zoos\/\?animal=([A-Za-z0-9_%-]+)/g)) {
    n++;
    const id = aliases[m[1]] || m[1];
    if (!fs.existsSync(path.join(root, 'assets', 'zoos', 'a', id + '.json'))) { console.error('DEAD ZOO LINK: ' + path.relative(root, file) + ' -> animal "' + m[1] + '" has no data in assets/zoos/a/'); bad++; }
  }
}
console.log('zoo link check: ' + n + ' link(s) checked, ' + bad + ' dead');
process.exit(bad ? 1 : 0);
