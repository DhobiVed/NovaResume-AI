const fs = require('fs');
const catalog = JSON.parse(fs.readFileSync('frontend/public/data/mcqs_100000/dataset_catalog_100000.json', 'utf8'));
console.log('Total languages in catalog:', catalog.languages.length);

for (const l of catalog.languages) {
  const d = JSON.parse(fs.readFileSync('frontend/public/data/mcqs_100000/' + l.fileName, 'utf8'));
  const topics = new Set(d.map(q => q.topicId));
  const concepts = new Set(d.map(q => q.primaryConcept).filter(Boolean));
  console.log(`${l.languageId} (${l.languageName}): ${d.length} Qs, ${topics.size} topics, ${concepts.size} concepts`);
}
