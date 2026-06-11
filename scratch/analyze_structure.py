import re
from bs4 import BeautifulSoup

file_path = "c:/Users/AIO SAKA/Desktop/architax/Clay (6_11_2026 9：22：23 AM).html"

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

print("=== DEEP STRUCTURE ANALYSIS ===")

# 1. Check for layout wrapper / main app shell
print("\n--- App Shell / Main Container ---")
layout_divs = soup.find_all(class_=re.compile(r'layout|shell|wrapper|app', re.I))
print(f"Found {len(layout_divs)} elements matching layout/shell/wrapper/app in classes")
for i, div in enumerate(layout_divs[:8]):
    print(f"  [{i}] Tag: {div.name}, Classes: {div.get('class')}")

# 2. Check for navigation
print("\n--- Navigation / Navbar ---")
nav_elements = soup.find_all(['nav', 'header', 'aside'])
for el in nav_elements:
    print(f"  Tag: {el.name}, ID: {el.get('id')}, Classes: {el.get('class')}")

# 3. Check for specific sections (e.g. main content, sidebar, etc.)
print("\n--- Sidebar Specifics ---")
sidebar_el = soup.find(attrs={"data-sidebar": True})
if sidebar_el:
    print("Found data-sidebar element:")
    print("  Tag:", sidebar_el.name)
    print("  Classes:", sidebar_el.get('class'))
    print("  Attributes:", sidebar_el.attrs)
else:
    # Look for sidebar class or id
    sidebar_el = soup.find(class_=re.compile("sidebar", re.I))
    if sidebar_el:
        print("Found sidebar element by class:")
        print("  Tag:", sidebar_el.name)
        print("  Classes:", sidebar_el.get('class'))

# 4. Check for Sidebar Menu items
print("\n--- Sidebar Menu Items ---")
sidebar_buttons = soup.find_all(attrs={"data-sidebar": "menu-button"})
print(f"Found {len(sidebar_buttons)} sidebar menu buttons:")
for btn in sidebar_buttons[:5]:
    print(f"  Button: {btn.name}, text: '{btn.get_text().strip()}', classes: {btn.get('class')}")

# 5. Check for Cards
print("\n--- Card Elements ---")
card_elements = soup.find_all(class_=re.compile(r'\bcard\b', re.I))
print(f"Found {len(card_elements)} card elements:")
for card in card_elements[:5]:
    print(f"  Card: {card.name}, classes: {card.get('class')}")

# 6. Check for Buttons
print("\n--- Buttons ---")
btn_elements = soup.find_all(['button', 'a'], class_=re.compile(r'\b(btn|button)\b|primary|secondary|ghost|destructive', re.I))
print(f"Found {len(btn_elements)} button-like elements:")
for btn in btn_elements[:10]:
    print(f"  Btn: {btn.name}, text: '{btn.get_text().strip()}', classes: {btn.get('class')}")

# 7. Check for Tables
print("\n--- Tables ---")
table_elements = soup.find_all('table')
print(f"Found {len(table_elements)} table elements:")
for tbl in table_elements:
    print(f"  Table ID: {tbl.get('id')}, classes: {tbl.get('class')}")
    # Inspect table rows
    rows = tbl.find_all('tr')
    print(f"    Rows: {len(rows)}")
    if rows:
        cells = rows[0].find_all(['th', 'td'])
        print(f"    First row cells: {len(cells)}")

# 8. Check for Forms & Inputs
print("\n--- Form & Inputs ---")
input_elements = soup.find_all(['input', 'select', 'textarea'])
print(f"Found {len(input_elements)} input/select/textarea elements:")
for inp in input_elements[:10]:
    print(f"  Input type: {inp.get('type')}, tag: {inp.name}, classes: {inp.get('class')}")

print("\n--- Done analysis. ---")
