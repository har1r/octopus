import re

file_path = "c:/Users/AIO SAKA/Desktop/architax/Clay (6_11_2026 9：22：23 AM).html"

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Let's search style tags and print variables containing "sidebar"
style_blocks = re.findall(r'<style[^>]*>(.*?)</style>', html, re.DOTALL)
print(f"Found {len(style_blocks)} style blocks.")

for i, block in enumerate(style_blocks):
    # Search for --sidebar in the style block
    matches = re.findall(r'(--sidebar-[\w-]+)\s*:\s*([^;}\n]+)', block)
    if matches:
        print(f"\nStyle block {i} matches:")
        for k, v in matches:
            print(f"  {k}: {v}")

# Let's look for any occurrences of sidebar-width in CSS text
for match in re.finditer(r'--sidebar-width\s*:\s*([^;}\n]+)', html):
    print(f"Match for --sidebar-width: {match.group(0)}")

# Let's check if there are inline styles or class bindings setting sidebar width
# e.g., style="--sidebar-width: ..." or similar
inline_styles = re.findall(r'style="[^"]*--sidebar-width[^"]*"', html)
print(f"Inline styles with sidebar-width: {inline_styles}")
