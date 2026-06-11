import re
from bs4 import BeautifulSoup

file_path = "c:/Users/AIO SAKA/Desktop/architax/Clay (6_11_2026 9：22：23 AM).html"

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

def analyze_section(title, elements):
    print(f"\n=================== {title} ===================")
    if not elements:
        print("No elements found.")
        return
    print(f"Found {len(elements)} elements. Detailed analysis of first 3:")
    for idx, el in enumerate(elements[:3]):
        print(f"\n[{idx}] Tag: {el.name}")
        print(f"  Classes: {el.get('class')}")
        print(f"  ID: {el.get('id')}")
        print(f"  Attrs: { {k: v for k, v in el.attrs.items() if k != 'class' and k != 'id'} }")
        
        # Look for styling in style attributes
        if el.get('style'):
            print(f"  Style: {el.get('style')}")
            
        # Get children summary
        children = [child.name for child in el.children if child.name]
        print(f"  Children: {children[:10]}")
        
        # Extract text content snippet
        text = el.get_text().strip()
        text_snippet = (text[:150] + '...') if len(text) > 150 else text
        print(f"  Text content: '{text_snippet}'")

# Analyze Navbar/Header
headers = soup.find_all('header')
analyze_section("Navbar & Headers", headers)

# Analyze Sidebar
sidebars = soup.find_all(attrs={"data-sidebar": "sidebar"})
analyze_section("Sidebars (data-sidebar=sidebar)", sidebars)

# Analyze Sidebar Menu Buttons
menu_buttons = soup.find_all(attrs={"data-sidebar": "menu-button"})
analyze_section("Sidebar Menu Buttons", menu_buttons)

# Analyze Tables
tables = soup.find_all(class_=re.compile(r'table|grid', re.I))
# Filter table elements or divs representing tables
table_divs = [t for t in tables if any(c in str(t.get('class')) for c in ['table', 'grid']) and t.name != 'body']
analyze_section("Tables & Grids", table_divs)

# Analyze Table Row
table_rows = soup.find_all(class_=re.compile(r'tr|row|thead|tbody', re.I))
# Filter rows
analyze_section("Table Row / Rows", table_rows)

# Analyze Cards
cards = soup.find_all(class_=re.compile(r'card|panel|surface', re.I))
analyze_section("Cards & Panels", cards)

# Analyze Inputs and Forms
inputs = soup.find_all(['input', 'select', 'textarea', 'label'])
analyze_section("Form Controls & Labels", inputs)

# Analyze Badges and Statuses
badges = soup.find_all(class_=re.compile(r'badge|status|pill|indicator', re.I))
analyze_section("Badges & Indicators", badges)

# Analyze Buttons
buttons = soup.find_all(['button', 'a'], class_=re.compile(r'button|btn|primary|secondary|ghost', re.I))
analyze_section("Buttons (explicit & links)", buttons)

# Analyze Overlays / Modals / Dialogs
overlays = soup.find_all(class_=re.compile(r'modal|dialog|popover|overlay|dropdown|tooltip', re.I))
analyze_section("Overlays / Modals / Popovers", overlays)
