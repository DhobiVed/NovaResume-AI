import * as fs from 'fs';
import * as path from 'path';
import { validateSemanticIntegrity } from '../../services/aiQuestionIntelligence/semanticValidator';
import type { SkillQuestionBank } from '../../types/careerConnect';

const baseDir = path.resolve(process.cwd(), 'src/data/question-bank/programming');
const files = ['java.json', 'cpp.json', 'javascript.json', 'sql.json', 'python.json', 'other_languages.json'];

console.log('Auditing Programming Question Banks for Semantic Corruption...\n');

files.forEach(file => {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`[SKIP] File not found: ${file}`);
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const bank: SkillQuestionBank = JSON.parse(raw);

  let verifiedCount = 0;
  let quarantinedCount = 0;
  let rejectedCount = 0;
  const sampleRejections: string[] = [];

  bank.questions.forEach(q => {
    const res = validateSemanticIntegrity(q, q.programmingLanguage || bank.skillName, q.topicName || q.topic);
    if (res.isValid) {
      verifiedCount++;
    } else {
      if (res.status === 'REJECTED') rejectedCount++;
      else quarantinedCount++;

      if (sampleRejections.length < 3) {
        sampleRejections.push(`[${q.id}] (${q.topic}): ${res.reasons.join(' | ')}`);
      }
    }
  });

  console.log(`--- ${file} ---`);
  console.log(`Total: ${bank.questions.length}`);
  console.log(`Valid Verified: ${verifiedCount}`);
  console.log(`Quarantined: ${quarantinedCount}`);
  console.log(`Rejected (Corrupted): ${rejectedCount}`);
  if (sampleRejections.length > 0) {
    console.log('Sample Corruption Reasons:');
    sampleRejections.forEach(r => console.log(`  * ${r}`));
  }
  console.log('');
});
