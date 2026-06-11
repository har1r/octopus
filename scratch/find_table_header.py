from bs4 import BeautifulSoup
import re

file_path = "c:/Users/AIO SAKA/Desktop/architax/Clay (6_11_2026 9：22：23 AM).html"

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

print("=== TableHeader / TableHead ===")
th = soup.find(attrs={"data-sentry-component": "TableHeader"})
if th:
    print(th.prettify()[:1000])
else:
    th2 = soup.find(attrs={"data-sentry-component": "TableHead"})
    if th2:
        print(th2.prettify()[:1000])

print("\n=== All Table Headers ===")
headers = soup.find_all(class_=re.compile(r'th|thead|header-cell', re.I))
print(f"Found {len(headers)} table headers by class:")
for h in headers[:5]:
    print(f"  Tag: {h.name}, classes: {h.get('class')}")
