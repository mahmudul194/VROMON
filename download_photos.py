"""
VROMON photo downloader (Wikimedia Commons, free licenses only).
Usage:
    pip install openpyxl
    python download_photos.py VROMON_64_Districts_Dataset.xlsx [photos_per_place]
Saves to images/<division>/<destination>/ and writes credits.csv.
"""
import sys, os, re, csv, json, time, urllib.parse, urllib.request
from openpyxl import load_workbook

API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "VROMON-student-project/1.0 (educational; contact: your-email@example.com)"}
OK_LICENSES = ("cc0", "cc by", "cc-by", "public domain", "pd")
MIN_W = 1600

def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

def search(query, limit=25):
    p = {"action": "query", "format": "json", "generator": "search",
         "gsrsearch": query + " filetype:bitmap", "gsrnamespace": 6, "gsrlimit": limit,
         "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata", "iiurlwidth": 1920}
    data = json.loads(get(API + "?" + urllib.parse.urlencode(p)))
    return list(data.get("query", {}).get("pages", {}).values())

def usable(page):
    ii = (page.get("imageinfo") or [None])[0]
    if not ii or ii.get("mime") not in ("image/jpeg", "image/png"): return None
    if ii.get("width", 0) < MIN_W or ii["width"] < ii.get("height", 0): return None  # landscape only
    meta = ii.get("extmetadata", {})
    lic = meta.get("LicenseShortName", {}).get("value", "").lower()
    if not lic.startswith(OK_LICENSES): return None
    if "nc" in lic.split() or "nd" in lic.split(): return None
    author = re.sub("<[^>]+>", "", meta.get("Artist", {}).get("value", "Unknown")).strip()
    return {"title": page["title"], "url": ii.get("thumburl") or ii["url"], "license": meta["LicenseShortName"]["value"],
            "author": author, "page": ii.get("descriptionurl", "")}

def slug(s): return re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_")

def main():
    xlsx = sys.argv[1]
    per = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    wb = load_workbook(xlsx, read_only=True)
    dest = [r for r in wb["Destinations"].iter_rows(min_row=2, values_only=True) if r[0]]
    first_attr = {}
    for r in wb["Attractions"].iter_rows(min_row=2, values_only=True):
        first_attr.setdefault(r[0], []).append(r[1])
    new_file = not os.path.exists("credits.csv")
    with open("credits.csv", "a", newline="", encoding="utf-8") as cf:
        w = csv.writer(cf)
        if new_file: w.writerow(["file", "destination", "title", "author", "license", "source_page"])
        for r in dest:
            name, division = r[0], r[2]
            folder = os.path.join("images", slug(division), slug(name)); os.makedirs(folder, exist_ok=True)
            have = len([f for f in os.listdir(folder) if f.lower().endswith((".jpg", ".png"))])
            if have >= per: continue
            queries = [f"{name} Bangladesh"] + [f"{a} {name} Bangladesh" for a in first_attr.get(name, [])[:3]]
            seen, n = set(), have
            for q in queries:
                for page in search(q):
                    if n >= per: break
                    info = usable(page)
                    if not info or info["title"] in seen: continue
                    seen.add(info["title"])
                    ext = ".png" if info["url"].lower().endswith(".png") else ".jpg"
                    fn = os.path.join(folder, f"{slug(name)}_{n+1}{ext}")
                    try:
                        open(fn, "wb").write(get(info["url"]))
                    except Exception as e:
                        print("  skip", e); continue
                    w.writerow([fn, name, info["title"], info["author"], info["license"], info["page"]])
                    n += 1; time.sleep(1)
                time.sleep(1)
                if n >= per: break
            print(f"{name}: {n} photos" + ("" if n else "  <-- none found, add manually"))
    print("Done. Keep credits.csv and show photographer credit on your site where the license requires it.")

if __name__ == "__main__":
    main()
