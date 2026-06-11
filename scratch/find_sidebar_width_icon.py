import re

file_path = "c:/Users/AIO SAKA/Desktop/architax/Clay (6_11_2026 9：22：23 AM).html"

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

for match in re.finditer(r'--sidebar-width-icon\s*:\s*([^;}\n]+)', html):
    print(f"Match for --sidebar-width-icon: {match.group(0)}")
