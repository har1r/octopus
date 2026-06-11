import re
from bs4 import BeautifulSoup

file_path = "c:/Users/AIO SAKA/Desktop/architax/Clay (6_11_2026 9：22：23 AM).html"

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

print("=== HEADINGS ANALYSIS ===")
headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
print(f"Found {len(headings)} heading tags in DOM")
for h in headings[:15]:
    print(f"  Tag: {h.name}, class: {h.get('class')}, content: '{h.get_text().strip()}'")

print("\n=== ICONOGRAPHY SYSTEM ===")
# Let's see what SVG elements exist and how their classes are defined
svgs = soup.find_all('svg')
print(f"Found {len(svgs)} SVG elements")
size_classes = set()
stroke_widths = set()
for svg in svgs:
    classes = svg.get('class')
    if classes:
        for c in classes:
            if 'size' in c or 'w-' in c or 'h-' in c:
                size_classes.add(c)
    if svg.get('stroke-width'):
        stroke_widths.add(svg.get('stroke-width'))
    elif svg.get('stroke'):
        stroke_widths.add(svg.get('stroke'))

print("SVG size classes found:", sorted(list(size_classes)))
print("SVG strokes/stroke-widths found:", sorted(list(stroke_widths)))

print("\n=== LAYOUT STRUCTURE ===")
# Find containers holding sidebar and main content
# Sidebar wrapper
sb_wrapper = soup.find(class_=re.compile("sidebar-wrapper|layout", re.I))
if sb_wrapper:
    print("Sidebar wrapper tag:", sb_wrapper.name, "classes:", sb_wrapper.get('class'))
    # Direct children of wrapper
    children = [c.name for c in sb_wrapper.children if c.name]
    print("Sidebar wrapper children:", children)

print("\n=== COMPONENT INVENTORY (DATA LABELS) ===")
# Check data-sentry-component attributes
sentry_components = set()
for el in soup.find_all(attrs={"data-sentry-component": True}):
    sentry_components.add(el.get('data-sentry-component'))
print(f"Found {len(sentry_components)} unique Sentry components:")
for sc in sorted(list(sentry_components)):
    print(f"  - {sc}")
