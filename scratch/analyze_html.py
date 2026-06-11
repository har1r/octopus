import re
from bs4 import BeautifulSoup

file_path = "c:/Users/AIO SAKA/Desktop/architax/Clay (6_11_2026 9：22：23 AM).html"

print("Reading file...")
with open(file_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

print(f"File size: {len(html_content)} characters")

# Parse HTML using BeautifulSoup
print("Parsing HTML...")
soup = BeautifulSoup(html_content, 'html.parser')

# Let's see some basic structure
print("HTML Title:", soup.title.string if soup.title else "No Title")

# Find all style tags
style_tags = soup.find_all('style')
print(f"Found {len(style_tags)} <style> tags")

# Extract CSS variables
css_vars = {}
for i, style in enumerate(style_tags):
    css_text = style.string if style.string else ""
    # Look for variable definitions like --name: value;
    matches = re.findall(r'(--[\w-]+)\s*:\s*([^;}\n]+)', css_text)
    for name, value in matches:
        css_vars[name.strip()] = value.strip()

print(f"Found {len(css_vars)} CSS variables:")
for k, v in sorted(css_vars.items())[:50]:
    print(f"  {k}: {v}")

# Save CSS variables to a text file for inspection
with open("c:/Users/AIO SAKA/Desktop/architax/scratch/css_variables.txt", "w", encoding="utf-8") as f:
    for k, v in sorted(css_vars.items()):
        f.write(f"{k}: {v}\n")

# Let's inspect typical Tailwind or Tailwind-like config or UI components
# Let's look for elements like sidebar, navbar, buttons, cards
body = soup.body
if body:
    print("Body classes:", body.get('class'))
    
    # Check for some elements
    navs = soup.find_all(['nav', 'header'])
    print(f"Found {len(navs)} nav/header elements")
    for nav in navs[:5]:
        print(f"  Nav tag: {nav.name}, class: {nav.get('class')}, id: {nav.get('id')}")
        
    sidebars = soup.find_all(attrs={"class": re.compile("sidebar|aside", re.I)})
    print(f"Found {len(sidebars)} sidebar-like elements by class")
    for sb in sidebars[:5]:
        print(f"  Sidebar tag: {sb.name}, class: {sb.get('class')}, id: {sb.get('id')}")

    # Let's print unique class names to see if they use tailwind or custom classes
    classes = set()
    for el in soup.find_all(class_=True):
        for c in el['class']:
            classes.add(c)
    print(f"Found {len(classes)} unique class names. Examples:")
    print(list(sorted(classes))[:100])
    
    with open("c:/Users/AIO SAKA/Desktop/architax/scratch/unique_classes.txt", "w", encoding="utf-8") as f:
        for c in sorted(classes):
            f.write(f"{c}\n")

print("Done basic analysis.")
