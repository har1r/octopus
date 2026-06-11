from bs4 import BeautifulSoup

file_path = "c:/Users/AIO SAKA/Desktop/architax/Clay (6_11_2026 9：22：23 AM).html"

with open(file_path, 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

print("=== StackedLayout ===")
sl = soup.find(attrs={"data-sentry-component": "StackedLayout"})
if sl:
    print(sl.prettify()[:600])

print("\n=== HomepageLayoutContent ===")
hlc = soup.find(attrs={"data-sentry-component": "HomepageLayoutContent"})
if hlc:
    print(hlc.prettify()[:600])

print("\n=== HomepageFilters ===")
hf = soup.find(attrs={"data-sentry-component": "HomepageFilters"})
if hf:
    print(hf.prettify()[:600])

print("\n=== TableBody ===")
tb = soup.find(attrs={"data-sentry-component": "TableBody"})
if tb:
    print(tb.prettify()[:600])

print("\n=== FormControlBaseUI ===")
fc = soup.find(attrs={"data-sentry-component": "FormControlBaseUI"})
if fc:
    print(fc.prettify()[:600])
