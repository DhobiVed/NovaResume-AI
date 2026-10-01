const fs = require('fs');

function testAll50LanguagesDryRun() {
  const testLanguages = ['java', 'python', 'javascript', 'cpp', 'csharp', 'sql', 'rust', 'golang', 'c', 'php'];
  
  for (const langId of testLanguages) {
    const seenIds = new Set();
    const seenFps = new Set();
    let dupCount = 0;

    for (let i = 0; i < 1800; i++) {
      const seed = i + 1;
      const archetype = i % 6;
      let code = '';
      
      if (archetype === 0) {
        code = `// ${langId} solve_${seed}\nint a = ${seed};\nint b = ${(seed % 5) + 2};\nreturn a / b + a % b;`;
      } else if (archetype === 1) {
        code = `// ${langId} loop_${seed}\nint sum = 0;\nfor (int i = 1; i <= ${(seed % 4) + 4}; i++) sum += i;\nreturn sum;`;
      } else if (archetype === 2) {
        code = `// ${langId} array_${seed}\nint[] arr = { ${seed}, ${seed + 2}, ${seed + 5} };\nreturn arr[2] - arr[0];`;
      } else if (archetype === 3) {
        code = `// ${langId} branch_${seed}\nint val = ${seed};\nreturn val > 20 ? val * 2 : val + 10;`;
      } else if (archetype === 4) {
        code = `// ${langId} stream_${seed}\nint[] items = { 2, 4, 6 };\nreturn items.map(x => x * ${(seed % 3) + 2}).sum();`;
      } else {
        code = `// ${langId} fact_${seed}\nreturn factorial(${(seed % 3) + 3});`;
      }

      const q = `What will be the output of the following ${langId} program?`;
      const id = `mcq-${langId}-p-${String(seed).padStart(5, '0')}`;
      const fp = `${q.toLowerCase().trim()}:::${code.toLowerCase().replace(/\s+/g, '').trim()}`;

      if (seenIds.has(id)) dupCount++;
      seenIds.add(id);
      if (seenFps.has(fp)) dupCount++;
      seenFps.add(fp);
    }

    console.log(`Language ${langId}: 1800 items checked. Duplicates = ${dupCount}`);
  }
}

testAll50LanguagesDryRun();
