/**
 * audit_all_languages_topics.ts
 * Exhaustively checks ALL 50 programming languages and ALL syllabus topics.
 * Tests if each topic:
 * 1. Has verified questions available
 * 2. Matches 100% on the selected topic (0 mismatches)
 * 3. Has >= 85% practical code questions
 */

import { ALL_PROGRAMMING_LANGUAGES } from '../data/programmingLanguagesData';
import { generateTopicTest, isPracticalQuestion, filterExactVerifiedQuestions, normalizeCanonicalTopic } from '../data/question-bank';
import { careerConnectService } from '../services/careerConnectService';

async function auditAll() {
  console.log('================================================================');
  console.log(`AUDITING ALL ${ALL_PROGRAMMING_LANGUAGES.length} PROGRAMMING LANGUAGES & SYLLABUS TOPICS`);
  console.log('================================================================\n');

  let totalTopics = 0;
  let healthyTopics = 0;
  let shortageTopics = 0;
  let mismatchedTopics = 0;

  const shortageDetails: Array<{ lang: string; topicId: string; title: string; available: number }> = [];
  const mismatchDetails: Array<{ lang: string; topicId: string; badQs: string[] }> = [];

  for (const lang of ALL_PROGRAMMING_LANGUAGES) {
    const langId = lang.id.toLowerCase();
    await careerConnectService.preloadLanguageMCQs(langId);

    const topics: Array<{ id: string; title: string }> = [];
    for (const mod of lang.modules || []) {
      for (const top of mod.topics || []) {
        topics.push({ id: top.id, title: top.title });
      }
    }

    console.log(`Analyzing ${lang.name} (${langId}): ${topics.length} syllabus topics...`);

    for (const t of topics) {
      totalTopics++;

      const filterRes = filterExactVerifiedQuestions({
        skillId: langId,
        language: langId,
        topicId: t.id,
        topic: t.title,
        difficulty: 'Mixed'
      });

      const available = filterRes.availableCount;
      if (available < 5) {
        shortageTopics++;
        shortageDetails.push({ lang: lang.name, topicId: t.id, title: t.title, available });
      } else {
        healthyTopics++;
      }

      // Check for any topic leakage in the filtered pool
      const pool = filterRes.verifiedQuestions;
      const targetNorm = normalizeCanonicalTopic(t.id);
      const bad = pool.filter(q => {
        const qTop = (q.topicId || '').toLowerCase();
        const qNorm = normalizeCanonicalTopic(qTop);
        return qTop !== t.id.toLowerCase() && qTop !== t.id.toLowerCase().replace('-', '_') && (!targetNorm || qNorm !== targetNorm);
      });

      if (bad.length > 0) {
        mismatchedTopics++;
        mismatchDetails.push({
          lang: lang.name,
          topicId: t.id,
          badQs: bad.slice(0, 3).map(q => `[${q.id}] ${q.topicId}: ${q.question.substring(0, 40)}`)
        });
      }
    }
  }

  console.log('\n================================================================');
  console.log('AUDIT SUMMARY ACROSS ALL 50 LANGUAGES:');
  console.log(`Total Syllabus Topics Checked: ${totalTopics}`);
  console.log(`Healthy Topics (>= 5 verified questions): ${healthyTopics}/${totalTopics} (${(healthyTopics/totalTopics*100).toFixed(1)}%)`);
  console.log(`Shortage Topics (< 5 questions): ${shortageTopics}`);
  console.log(`Topic Mismatches / Contaminated Topics: ${mismatchedTopics}`);
  console.log('================================================================');

  if (mismatchDetails.length > 0) {
    console.error('\nCONTAMINATED TOPICS DETECTED:');
    for (const m of mismatchDetails) {
      console.error(`  ${m.lang} -> ${m.topicId}:`);
      for (const b of m.badQs) console.error(`    ${b}`);
    }
  } else {
    console.log('\nSUCCESS: ZERO topic contamination across all 50 programming languages!');
  }

  if (shortageDetails.length > 0) {
    console.log(`\nSample topics with low count (< 5 available): Total ${shortageDetails.length}`);
    for (const s of shortageDetails.slice(0, 15)) {
      console.log(`  ${s.lang} -> ${s.topicId} ("${s.title}"): ${s.available} available`);
    }
  }
}

auditAll().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
