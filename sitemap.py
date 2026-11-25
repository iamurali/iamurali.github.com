"""Post-render: rewrite _site/sitemap.xml with canonical URLs and real dates.

Quarto lists pages as .../index.html with the build time as lastmod, which is
the same for every page on CI. Search engines want the canonical URL and a
lastmod that changes only when the page does, so take it from the front matter.
"""
import pathlib
import re

SITE = "https://muralik.in"
ROOT = pathlib.Path(__file__).parent
OUT = ROOT / "_site" / "sitemap.xml"


def page_date(src):
    if not src.exists():
        return None
    head = src.read_text().split("---", 2)[1] if src.read_text().startswith("---") else ""
    for key in ("date-modified", "date"):
        m = re.search(rf'^{key}:\s*"?(\d{{4}}-\d{{2}}-\d{{2}})', head, re.M)
        if m:
            return m.group(1)
    return None


def main():
    if not OUT.exists():
        return
    locs = re.findall(r"<loc>([^<]+)</loc>", OUT.read_text())
    entries = []
    for loc in locs:
        rel = loc.removeprefix(SITE + "/")
        src = ROOT / re.sub(r"\.html$", ".qmd", rel)
        entries.append([re.sub(r"index\.html$", "", loc), page_date(src)])
    latest = max((d for _, d in entries if d), default=None)
    rows = []
    for url, date in entries:
        date = date or latest  # home and about change whenever a post does
        rows.append(f"  <url>\n    <loc>{url}</loc>\n" + (f"    <lastmod>{date}</lastmod>\n" if date else "") + "  </url>")
    OUT.write_text('<?xml version="1.0" encoding="UTF-8"?>\n'
                   '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                   + "\n".join(rows) + "\n</urlset>\n")


if __name__ == "__main__":
    main()
