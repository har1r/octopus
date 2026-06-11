import re
from bs4 import BeautifulSoup

file_path = "c:/Users/AIO SAKA/Desktop/architax/Clay (6_11_2026 9：22：23 AM).html"

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

print("=== SearchInputWithUrlSync BS4 Analysis ===")
search_el = soup.find(attrs={"data-sentry-component": "SearchInputWithUrlSync"})
if search_el:
    print(search_el.prettify()[:1000])
else:
    print("SearchInputWithUrlSync not found via BS4!")

print("\n=== TableCell BS4 Analysis ===")
cell_el = soup.find(attrs={"data-sentry-component": "TableCell"})
if cell_el:
    print(cell_el.prettify()[:1000])
else:
    print("TableCell not found via BS4!")

print("\n=== WorkspaceTopbarPlanWidget BS4 Analysis ===")
plan_widget = soup.find(attrs={"data-sentry-component": "WorkspaceTopbarPlanWidget"})
if plan_widget:
    print(plan_widget.prettify()[:1000])
else:
    print("WorkspaceTopbarPlanWidget not found via BS4!")
