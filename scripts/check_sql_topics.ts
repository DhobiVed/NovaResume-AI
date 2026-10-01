import { ALL_PROGRAMMING_LANGUAGES } from '../frontend/src/data/programmingLanguagesData';

const sql = ALL_PROGRAMMING_LANGUAGES.find(l => l.id === 'sql' || l.slug === 'sql');
if (sql) {
    console.log("SQL Modules & Topics in programmingLanguagesData.ts:");
    sql.modules.forEach(m => {
        console.log(`Module: ${m.id} (${m.title})`);
        m.topics.forEach(t => console.log(`  - ${t.id} (${t.title})`));
    });
} else {
    console.log("SQL not found in ALL_PROGRAMMING_LANGUAGES!");
}
