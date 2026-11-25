VROMON photo pack
1. Install Python 3 and run:  pip install openpyxl
2. Edit download_photos.py: put your email in the User-Agent line (Wikimedia asks for it).
3. Run:  python download_photos.py VROMON_64_Districts_Dataset.xlsx 3
   (3 = photos per destination; the script is safe to re-run, it skips finished folders)
4. Photos go to images/<division>/<destination>/ . credits.csv lists author, license and source page.
5. Places where no photo is found are printed; add those manually (see below).

Other free sources for the gaps: Unsplash, Pexels, Pixabay (check each photo's license), or your own photos.
CC BY / CC BY-SA photos require showing the photographer's name (a small "Photo credits" page is enough).
CC BY-SA also needs the same license for modified copies. Prefer CC0/public domain if unsure.
