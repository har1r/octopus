with open("c:/Users/AIO SAKA/Desktop/architax/scratch/css_variables.txt", "r", encoding="utf-8") as f:
    vars_text = f.read()

import re
matches = re.findall(r'.*sidebar.*', vars_text, re.I)
print("=== Sidebar Variables in css_variables.txt ===")
for m in matches:
    print(m)

# Let's search in the html file for style blocks that define sidebar-width
with open("c:/Users/AIO SAKA/Desktop/architax/Clay (6_11_2026 9：22：23 AM).html", "r", encoding="utf-8") as f:
    html = f.read()

# Let's search for sidebar width variables using regex
sb_vars = re.findall(r'(--sidebar-[\w-]+)\s*:\s*([^;}\n]+)', html)
print("\n=== Sidebar width variables in HTML ===")
for k, v in sb_vars:
    print(f"{k}: {v}")
