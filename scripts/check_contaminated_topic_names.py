import sqlite3
from collections import defaultdict

conn = sqlite3.connect('backend/novaresume.db')
c = conn.cursor()

rows = c.execute("SELECT topic_name, topic_id, count(1) FROM question_bank_items GROUP BY topic_name, topic_id").fetchall()

by_name = defaultdict(dict)
for tname, tid, cnt in rows:
    by_name[tname][tid] = cnt

print(f"Total distinct topic_name in DB: {len(by_name)}")
contaminated = {k: v for k, v in by_name.items() if len(v) > 1}
print(f"Topic names with multiple topic_ids: {len(contaminated)}")
for k, v in sorted(contaminated.items(), key=lambda x: -sum(x[1].values()))[:25]:
    print(f"'{k}': total={sum(v.values())} -> {v}")
