const fs = require('fs');
const txt = fs.readFileSync('frontend/src/data/programmingLanguagesData.ts', 'utf8');
const langs = [];
const re = /\{\s*"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)",\s*"slug":/g;
let m;
while ((m = re.exec(txt)) !== null) {
  langs.push({ id: m[1], name: m[2] });
}
console.log('Count:', langs.length);
console.log(langs.map((l, i) => `${i + 1}. ${l.id} (${l.name})`).join('\n'));
