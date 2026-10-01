import * as fs from 'fs';
import * as path from 'path';
import { validateSemanticIntegrity } from '../../services/aiQuestionIntelligence/semanticValidator';
import type { SkillQuestionBank } from '../../types/careerConnect';

const baseDir = path.resolve(process.cwd(), 'src/data/question-bank/programming');
const targetFiles = ['python.json', 'other_languages.json'];

console.log('Filtering out any remaining corrupt/mismatched questions from secondary banks...\n');

targetFiles.forEach(file => {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) return;

  const raw = fs.readFileSync(filePath, 'utf8');
  const bank: SkillQuestionBank = JSON.parse(raw);

  const initialCount = bank.questions.length;
  const verifiedQuestions = bank.questions.filter(q => {
    const res = validateSemanticIntegrity(q, q.programmingLanguage || bank.skillName, q.topicName || q.topic);
    return res.isValid;
  });

  const removedCount = initialCount - verifiedQuestions.length;
  bank.questions = verifiedQuestions;
  bank.totalQuestions = verifiedQuestions.length;

  fs.writeFileSync(filePath, JSON.stringify(bank, null, 2), 'utf8');
  console.log(`[OK] ${file}: retained ${verifiedQuestions.length} strictly verified questions (filtered out ${removedCount} corrupt/mismatched questions).`);
});
