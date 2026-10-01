import re

with open('frontend/src/data/programmingLanguagesData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find("name: 'Java'")
if pos == -1:
    pos = text.find('name: "Java"')
print("Pos of Java:", pos)
if pos != -1:
    print(text[pos:pos+2000])
