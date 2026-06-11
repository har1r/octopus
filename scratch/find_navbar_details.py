import re

file_path = "c:/Users/AIO SAKA/Desktop/architax/Clay (6_11_2026 9：22：23 AM).html"

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Find any tag with data-sentry-component that contains "Navbar" or "StackedLayout"
matches = re.finditer(r'(<[^>]*data-sentry-component="[^"]*(?:Navbar|StackedLayout)[^"]*"[^>]*>)', html, re.I)
for m in matches:
    print(f"Match tag: {m.group(1)}")

# Find any occurrences of the "header" tag and see their classes
headers = re.findall(r'<header[^>]*class="([^"]*)"[^>]*>', html, re.I)
print("\n=== Header Classes ===")
for hc in headers:
    print(hc)

# Check elements with class containing "search"
search_inputs = re.finditer(r'(<[^>]*class="[^"]*search[^"]*"[^>]*>)', html, re.I)
print("\n=== Search-like Element Tags ===")
for s in list(search_inputs)[:5]:
    print(s.group(1))
