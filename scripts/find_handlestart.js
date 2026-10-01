const fs = require('fs');
const content = fs.readFileSync('frontend/src/components/careerconnect/StudentCareerPortal.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('handleStart') || line.includes('generateFinalCertification')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
