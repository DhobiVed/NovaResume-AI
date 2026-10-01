// Let's test canonicalKey and normalizeCanonicalTopic
function canonicalKey(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

console.log('canonicalKey of Conditionals, Loops & Branching:', canonicalKey('Conditionals, Loops & Branching'));
console.log('canonicalKey of If-Else & Switch Statements:', canonicalKey('If-Else & Switch Statements'));
console.log('canonicalKey of conditions:', canonicalKey('conditions'));
console.log('canonicalKey of loops:', canonicalKey('loops'));
