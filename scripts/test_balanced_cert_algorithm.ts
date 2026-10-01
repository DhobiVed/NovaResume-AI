import fs from 'fs';
import path from 'path';

interface BankQuestion {
  id: string;
  languageId?: string;
  programmingLanguage?: string;
  skillId?: string;
  skillName?: string;
  topicId?: string;
  topic?: string;
  topicName?: string;
  subtopic?: string | null;
  difficulty?: string;
  questionType?: string;
  practicalType?: string;
  question: string;
  codeSnippet?: string | null;
  options: string[];
  correctIndex: number;
  explanation?: string;
  status?: string;
  verified?: boolean;
  primaryConcept?: string;
  duplicateGroupId?: string;
}

function canonicalKey(val?: string | null): string {
  if (!val) return '';
  return val.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isPractical(q: BankQuestion): boolean {
  if (q.questionType === 'code_output' || q.questionType === 'debugging') return true;
  if (q.practicalType && ['output_tracing', 'debugging', 'scenario', 'edge_cases'].includes(q.practicalType)) {
    if (q.codeSnippet && q.codeSnippet.trim().length > 15) return true;
  }
  if (q.codeSnippet && q.codeSnippet.trim().length > 20) return true;
  return false;
}

function computeFingerprint(q: BankQuestion): string {
  const normQ = (q.question || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const normCode = (q.codeSnippet || '').toLowerCase().replace(/\s+/g, '').replace(/(?:class|function|def|fn)[0-9_]+/g, '');
  return `${normQ}::${normCode}`;
}

export function selectBalanced50Cert(
  languageId: string,
  rawQuestions: BankQuestion[],
  previouslyUsedIds?: Set<string>
): { questions: BankQuestion[]; stats: any } {
  const targetLangKey = canonicalKey(languageId);
  const prevUsed = previouslyUsedIds || new Set<string>();

  // 1. Strict Language Filtering & Cross-Language Rejection
  const filtered = rawQuestions.filter(q => {
    const isVer = q.verified === true || q.status === 'VERIFIED';
    if (!isVer) return false;

    const qLang = canonicalKey(q.languageId || q.programmingLanguage || q.skillId);
    if (qLang !== targetLangKey) return false;

    const snip = q.codeSnippet || '';
    if (targetLangKey !== 'java' && targetLangKey !== 'jvm') {
      if (snip.includes('System.out') || snip.includes('public class Loop_') || snip.includes('public static void main')) {
        return false;
      }
    }
    if (['sql', 'dbms', 'plsql', 'tsql'].includes(targetLangKey)) {
      if (/for\s*\(\s*int\s+/i.test(snip) || /int\s+sum\s*=/i.test(snip) || /while\s*\(\s*[a-z0-9_]+\s*<=\s*[0-9]+\s*\)/i.test(snip)) {
        return false;
      }
    }
    return true;
  });

  // 2. Deduplicate candidate pool
  const seenIds = new Set<string>();
  const seenFp = new Set<string>();
  const seenDg = new Set<string>();
  const cleanPool: BankQuestion[] = [];

  for (const q of filtered) {
    const fp = computeFingerprint(q);
    const dg = q.duplicateGroupId && q.duplicateGroupId.trim();
    if (seenIds.has(q.id) || seenFp.has(fp) || (dg && seenDg.has(dg))) continue;
    seenIds.add(q.id);
    seenFp.add(fp);
    if (dg) seenDg.add(dg);
    cleanPool.push(q);
  }

  // 3. Build Topic & Concept Inventory
  const topicMap = new Map<string, BankQuestion[]>();
  for (const q of cleanPool) {
    const t = q.topicId || q.topic || 'general';
    if (!topicMap.has(t)) topicMap.set(t, []);
    topicMap.get(t)!.push(q);
  }

  const availableTopics = Array.from(topicMap.keys());
  const numTopics = availableTopics.length;
  // Dynamic ceiling per topic: if 20 topics, max ~3-4 per topic
  const maxPerTopic = Math.max(3, Math.ceil(50 / Math.max(1, numTopics)) + 1);

  // 4. State tracking for selection
  const targetDiffs: { [d: string]: number } = { Easy: 10, Medium: 15, Hard: 15, Industry: 10 };
  const picked: BankQuestion[] = [];
  const pickedIds = new Set<string>();
  const pickedFps = new Set<string>();
  const pickedDg = new Set<string>();
  const topicUsage: { [topic: string]: number } = {};
  const conceptUsage: { [concept: string]: number } = {};

  const canAdd = (q: BankQuestion, enforceTopicCap = true): boolean => {
    if (pickedIds.has(q.id)) return false;
    const fp = computeFingerprint(q);
    if (pickedFps.has(fp)) return false;
    if (q.duplicateGroupId && pickedDg.has(q.duplicateGroupId)) return false;
    const t = q.topicId || q.topic || 'general';
    if (enforceTopicCap && (topicUsage[t] || 0) >= maxPerTopic) return false;
    return true;
  };

  const addQuestion = (q: BankQuestion) => {
    picked.push(q);
    pickedIds.add(q.id);
    pickedFps.add(computeFingerprint(q));
    if (q.duplicateGroupId) pickedDg.add(q.duplicateGroupId);
    const t = q.topicId || q.topic || 'general';
    topicUsage[t] = (topicUsage[t] || 0) + 1;
    const c = q.primaryConcept || t;
    conceptUsage[c] = (conceptUsage[c] || 0) + 1;
  };

  const getDiffCount = (d: string) => picked.filter(q => (q.difficulty || '').toLowerCase() === d.toLowerCase()).length;
  const getPracticalCount = () => picked.filter(q => isPractical(q)).length;
  const getTheoryCount = () => picked.length - getPracticalCount();

  // Helper to get remaining candidates for a topic
  const getTopicCandidates = (topic: string, diff?: string, practicalOnly?: boolean, enforceTopicCap = true): BankQuestion[] => {
    const list = topicMap.get(topic) || [];
    return list.filter(q => {
      if (!canAdd(q, enforceTopicCap)) return false;
      if (diff && (q.difficulty || '').toLowerCase() !== diff.toLowerCase()) return false;
      if (practicalOnly !== undefined && isPractical(q) !== practicalOnly) return false;
      return true;
    });
  };

  // PASS 1: Broad Coverage - Select 1 question from every available topic
  const shuffledTopics = [...availableTopics].sort(() => Math.random() - 0.5);

  for (const topic of shuffledTopics) {
    if (picked.length >= 50) break;
    const neededDiffs = Object.keys(targetDiffs).filter(d => getDiffCount(d) < targetDiffs[d]);
    if (neededDiffs.length === 0) break;

    // Prefer practical, unused by student
    let cands = getTopicCandidates(topic, undefined, true).filter(q => !prevUsed.has(q.id));
    if (cands.length === 0) cands = getTopicCandidates(topic, undefined, true);
    if (cands.length === 0 && getTheoryCount() < 5) {
      cands = getTopicCandidates(topic, undefined, false);
    }

    if (cands.length > 0) {
      const matched = cands.find(q => neededDiffs.some(d => d.toLowerCase() === (q.difficulty || '').toLowerCase()));
      const chosen = matched || cands[0];
      if (canAdd(chosen)) {
        addQuestion(chosen);
      }
    }
  }

  // PASS 2: Balanced Topic & Concept Round-Robin
  let topicIdx = 0;
  let iterations = 0;
  while (picked.length < 50 && iterations < 500) {
    iterations++;
    // Order topics by lowest current usage first to prevent clustering, with randomized tie-breaking
    const topicsByUsage = [...availableTopics].sort(() => Math.random() - 0.5).sort((a, b) => (topicUsage[a] || 0) - (topicUsage[b] || 0));
    const topic = topicsByUsage[topicIdx % topicsByUsage.length];
    topicIdx++;

    if ((topicUsage[topic] || 0) >= maxPerTopic) continue;

    const neededDiffs = Object.keys(targetDiffs).filter(d => getDiffCount(d) < targetDiffs[d]);
    if (neededDiffs.length === 0) break;

    const preferPractical = getPracticalCount() < 45;
    let cands: BankQuestion[] = [];

    for (const d of neededDiffs) {
      if (preferPractical) {
        cands = getTopicCandidates(topic, d, true);
      }
      if (cands.length === 0 && getTheoryCount() < 5) {
        cands = getTopicCandidates(topic, d, false);
      }
      if (cands.length > 0) break;
    }

    if (cands.length === 0) {
      for (const d of neededDiffs) {
        cands = getTopicCandidates(topic, d);
        if (cands.length > 0) break;
      }
    }

    if (cands.length > 0) {
      const unusedConcept = cands.find(q => !conceptUsage[q.primaryConcept || '']);
      const unusedPrev = cands.find(q => !prevUsed.has(q.id));
      const chosen = unusedConcept || unusedPrev || cands[0];
      if (canAdd(chosen)) {
        addQuestion(chosen);
      }
    }
  }

  // PASS 3: Difficulty Balancing - Fill exact difficulty slots (10 Easy, 15 Med, 15 Hard, 10 Industry)
  for (const [diff, req] of Object.entries(targetDiffs)) {
    while (getDiffCount(diff) < req && picked.length < 50) {
      const preferPrac = getPracticalCount() < 45;
      // Sort topics by lowest usage, shuffling ties to distribute evenly
      const sortedTopics = [...availableTopics].sort(() => Math.random() - 0.5).sort((a, b) => (topicUsage[a] || 0) - (topicUsage[b] || 0));
      let found: BankQuestion | null = null;

      for (let extra = 0; extra <= 15 && !found; extra++) {
        const currentCap = maxPerTopic + extra;
        for (const t of sortedTopics) {
          if ((topicUsage[t] || 0) >= currentCap) continue;
          const cands = getTopicCandidates(t, diff, preferPrac ? true : undefined, false);
          if (cands.length > 0) {
            found = cands.find(q => !prevUsed.has(q.id)) || cands[0];
            break;
          }
        }
        if (!found && preferPrac) {
          for (const t of sortedTopics) {
            if ((topicUsage[t] || 0) >= currentCap) continue;
            const cands = getTopicCandidates(t, diff, undefined, false);
            if (cands.length > 0) {
              found = cands.find(q => !prevUsed.has(q.id)) || cands[0];
              break;
            }
          }
        }
      }

      if (found && canAdd(found, false)) {
        addQuestion(found);
      } else {
        break;
      }
    }
  }

  // PASS 4: Theory/Practical Ratio Tuning (>= 45 Practical, <= 5 Theory)
  let practicalCount = getPracticalCount();
  if (practicalCount < 45 && picked.length === 50) {
    const sparePractical = cleanPool.filter(q =>
      isPractical(q) &&
      !pickedIds.has(q.id) &&
      !pickedFps.has(computeFingerprint(q)) &&
      (!q.duplicateGroupId || !pickedDg.has(q.duplicateGroupId))
    );

    let spIdx = 0;
    for (let i = picked.length - 1; i >= 0 && practicalCount < 45 && spIdx < sparePractical.length; i--) {
      if (!isPractical(picked[i])) {
        const targetD = (picked[i].difficulty || '').toLowerCase();
        // Look for matching difficulty first
        const matchedSpareIdx = sparePractical.findIndex((q, idx) =>
          idx >= spIdx && (q.difficulty || '').toLowerCase() === targetD && !pickedIds.has(q.id)
        );
        const chosenIdx = matchedSpareIdx !== -1 ? matchedSpareIdx : spIdx;
        const matchedSpare = sparePractical[chosenIdx];

        if (matchedSpare && !pickedIds.has(matchedSpare.id)) {
          // Remove old
          pickedIds.delete(picked[i].id);
          pickedFps.delete(computeFingerprint(picked[i]));
          // Replace with practical
          picked[i] = matchedSpare;
          pickedIds.add(matchedSpare.id);
          pickedFps.add(computeFingerprint(matchedSpare));
          if (matchedSpare.duplicateGroupId) pickedDg.add(matchedSpare.duplicateGroupId);
          practicalCount++;
          spIdx = chosenIdx + 1;
        }
      }
    }
  }

  // PASS 5: If fewer than 50, fill from any remaining cleanPool
  if (picked.length < 50) {
    for (const q of cleanPool) {
      if (picked.length >= 50) break;
      if (canAdd(q, false)) {
        addQuestion(q);
      }
    }
  }

  // Hard Integrity Validation
  const finalIds = new Set<string>();
  const finalFps = new Set<string>();
  for (const q of picked) {
    const qL = canonicalKey(q.languageId || q.programmingLanguage || q.skillId);
    if (qL !== targetLangKey) {
      throw new Error(`Integrity violation: question ${q.id} has language ${qL}, expected ${targetLangKey}`);
    }
    if (finalIds.has(q.id)) {
      throw new Error(`Duplicate ID violation: ${q.id}`);
    }
    const fp = computeFingerprint(q);
    if (finalFps.has(fp)) {
      throw new Error(`Duplicate content fingerprint violation: ${q.id} - ${q.question}`);
    }
    finalIds.add(q.id);
    finalFps.add(fp);
  }

  const finalDiffs: { [k: string]: number } = {};
  const finalTopics: { [k: string]: number } = {};
  const finalConcepts: { [k: string]: number } = {};
  for (const q of picked) {
    finalDiffs[q.difficulty || ''] = (finalDiffs[q.difficulty || ''] || 0) + 1;
    finalTopics[q.topicId || 'general'] = (finalTopics[q.topicId || 'general'] || 0) + 1;
    finalConcepts[q.primaryConcept || 'general'] = (finalConcepts[q.primaryConcept || 'general'] || 0) + 1;
  }

  return {
    questions: picked,
    stats: {
      total: picked.length,
      practical: getPracticalCount(),
      theory: getTheoryCount(),
      difficulties: finalDiffs,
      distinctTopics: Object.keys(finalTopics).length,
      topics: finalTopics,
      distinctConcepts: Object.keys(finalConcepts).length,
      duplicates: picked.length - finalIds.size
    }
  };
}

// Test on sample languages
const catalog = JSON.parse(fs.readFileSync('frontend/public/data/mcqs_100000/dataset_catalog_100000.json', 'utf8'));
for (const lang of ['javascript', 'python', 'java', 'sql', 'cpp', 'assembly']) {
  const item = catalog.languages.find((l: any) => l.languageId === lang);
  const data = JSON.parse(fs.readFileSync('frontend/public/data/mcqs_100000/' + item.fileName, 'utf8'));
  const res = selectBalanced50Cert(lang, data);
  console.log(`=== ${lang.toUpperCase()} RESULT ===`);
  console.log(`Total: ${res.stats.total} | Practical: ${res.stats.practical} | Theory: ${res.stats.theory}`);
  console.log(`Difficulties:`, res.stats.difficulties);
  console.log(`Distinct Topics: ${res.stats.distinctTopics} | Max in single topic: ${Math.max(...Object.values(res.stats.topics) as number[])}`);
  console.log(`Topic Distribution:`, res.stats.topics);
  console.log(`Distinct Concepts: ${res.stats.distinctConcepts}`);
  console.log(`Duplicates: ${res.stats.duplicates}`);
  console.log(`--------------------------------------------------\n`);
}
