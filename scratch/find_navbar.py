import re

file_path = "c:/Users/AIO SAKA/Desktop/architax/Clay (6_11_2026 9：22：23 AM).html"

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Search for the Navbar component in HTML comments or tags
# Sentry component annotations can guide us: data-sentry-component="Navbar" or data-sentry-component="StackedLayoutNavbar"
for match in re.finditer(r'<[^>]*data-sentry-component="Navbar"[^>]*>', html):
    print(f"Match for Navbar tag: {match.group(0)}")

# Let's print the block containing StackedLayoutNavbar or Navbar to see height and class details
for match in re.finditer(r'<[^>]*data-sentry-component="StackedLayoutNavbar"[^>]*>', html):
    print(f"Match for StackedLayoutNavbar tag: {match.group(0)}")

# Find height of nav bar in variables
for match in re.finditer(r'--height-nav\s*:\s*([^;}\n]+)', html):
    print(f"Match for --height-nav: {match.group(0)}")

# Let's search for the search input in the navbar or content header
# data-sentry-component="SearchInputWithUrlSync" or similar
for match in re.finditer(r'<[^>]*data-sentry-component="SearchInputWithUrlSync"[^>]*>', html):
    print(f"Match for SearchInput tag: {match.group(0)}")
