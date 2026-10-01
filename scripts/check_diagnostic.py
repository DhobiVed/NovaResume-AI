import os

target = "Conditionals, Loops & Branching"
print(f"Searching for '{target}' across project...")

matches = []
for root, dirs, files in os.walk('.'):
    if '.git' in root or 'node_modules' in root or '.venv' in root or '__pycache__' in root:
        continue
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.json', '.py')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if target in content:
                        matches.append(path)
            except Exception:
                pass

for m in matches:
    print(m)
