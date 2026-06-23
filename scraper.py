import urllib.request
import urllib.error
import re
import os
import sys
from html.parser import HTMLParser
from urllib.parse import urlparse, urljoin, urlunparse, parse_qs, urlencode

PAGES = {
    "home":     "https://www.asad.co.za/",
    "services": "https://www.asad.co.za/bespoke-steelwork-custom-glazed-steelwork-contruction-and-home-renovations-pergolas-and-decking",
    "bidwell":  "https://www.asad.co.za/bidwell-pod-living-solutions-building-contractors",
    "gallery":  "https://www.asad.co.za/gallery-bespoke-steelwork",
    "projects": "https://www.asad.co.za/projects-asad-projects-blog-renovations-custom-glazed-steelwork-construction",
    "contact":  "https://www.asad.co.za/contact-luxury-renovations",
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE_DIR, "images")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


class ImgSrcParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.img_srcs = []

    def handle_starttag(self, tag, attrs):
        if tag == "img":
            for name, val in attrs:
                if name in ("src", "data-src") and val:
                    self.img_srcs.append(val)


def fetch_html(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def make_hires_url(url):
    """Replace CDN transform params with highest-res version."""
    parsed = urlparse(url)
    # For zyrosite CDN, the transform params are in the path after the filename
    # e.g. .../filename.jpg/transform/w_100,h_100/filename.jpg
    # OR query string with w=, h=, fit= etc.
    # Replace query string params
    new_params = "format=auto,w=1920,fit=crop"
    # Some Zyrosite URLs embed transforms in path segments like:
    # assets.zyrosite.com/xxx/filename.jpg?quality=80&w=300
    # We strip all query params and append our own
    clean = parsed._replace(query="")
    clean_url = urlunparse(clean)
    # Append transform as query
    return clean_url + "?format=auto&w=1920&fit=crop"


def slug_from_url(url):
    """Extract filename slug from URL."""
    parsed = urlparse(url)
    path = parsed.path
    slug = path.split("/")[-1]
    # Remove query from slug if embedded
    slug = slug.split("?")[0]
    if not slug:
        slug = "image"
    return slug.lower()


def folder_for_page(page_key, seen_slugs):
    """Determine folder. If a slug was already seen in another page, use 'shared'."""
    return page_key


def ensure_dirs():
    for key in list(PAGES.keys()) + ["shared"]:
        os.makedirs(os.path.join(IMAGES_DIR, key), exist_ok=True)


def download_image(url, dest_path):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
        with open(dest_path, "wb") as f:
            f.write(data)
        return True
    except Exception as e:
        print(f"  FAILED: {url}\n    {e}")
        return False


def main():
    ensure_dirs()

    # slug -> (page_key, dest_path)
    slug_map = {}
    # page_key -> list of (orig_url, hires_url, slug)
    page_images = {}

    print("=" * 60)
    print("Phase 1: Scraping pages for image URLs")
    print("=" * 60)

    for page_key, page_url in PAGES.items():
        print(f"\n[{page_key}] Fetching {page_url} ...")
        try:
            html = fetch_html(page_url)
        except Exception as e:
            print(f"  ERROR fetching page: {e}")
            page_images[page_key] = []
            continue

        parser = ImgSrcParser()
        parser.feed(html)

        # Also catch background-image URLs in style attributes / inline styles
        bg_urls = re.findall(r'url\(["\']?(https?://[^"\')\s]+)["\']?\)', html)

        all_srcs = parser.img_srcs + bg_urls
        zyro_srcs = [s for s in all_srcs if "zyrosite.com" in s or "assets.zyrosite" in s]
        # Deduplicate preserving order
        seen = set()
        unique = []
        for s in zyro_srcs:
            if s not in seen:
                seen.add(s)
                unique.append(s)

        print(f"  Found {len(unique)} zyrosite image URL(s)")
        page_images[page_key] = unique

    print("\n" + "=" * 60)
    print("Phase 2: Resolving filenames and detecting shared images")
    print("=" * 60)

    # Build slug -> pages mapping
    slug_to_pages = {}
    for page_key, urls in page_images.items():
        for url in urls:
            slug = slug_from_url(url)
            slug_to_pages.setdefault(slug, []).append(page_key)

    print("\n" + "=" * 60)
    print("Phase 3: Downloading images")
    print("=" * 60)

    total_found = sum(len(v) for v in page_images.values())
    total_downloaded = 0
    total_failed = 0
    downloaded_slugs = set()

    for page_key, urls in page_images.items():
        print(f"\n[{page_key}]")
        for url in urls:
            slug = slug_from_url(url)

            # Determine folder
            pages_with_slug = slug_to_pages.get(slug, [page_key])
            if len(pages_with_slug) > 1:
                folder = "shared"
            else:
                folder = page_key

            dest_path = os.path.join(IMAGES_DIR, folder, slug)

            # Skip if already downloaded (shared image)
            if slug in downloaded_slugs:
                print(f"  SKIP (already downloaded): {slug}")
                continue

            hires_url = make_hires_url(url)
            print(f"  Downloading: {slug}")
            print(f"    from: {hires_url}")

            if download_image(hires_url, dest_path):
                downloaded_slugs.add(slug)
                total_downloaded += 1
                print(f"    -> saved to images/{folder}/{slug}")
            else:
                # Try original URL as fallback
                print(f"    Retrying with original URL...")
                if download_image(url, dest_path):
                    downloaded_slugs.add(slug)
                    total_downloaded += 1
                    print(f"    -> saved (fallback) to images/{folder}/{slug}")
                else:
                    total_failed += 1

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total image URLs found : {total_found}")
    print(f"Unique slugs           : {len(slug_to_pages)}")
    print(f"Successfully downloaded: {total_downloaded}")
    print(f"Failed                 : {total_failed}")
    print()

    # List what we have
    print("Downloaded files by folder:")
    for folder in list(PAGES.keys()) + ["shared"]:
        folder_path = os.path.join(IMAGES_DIR, folder)
        files = os.listdir(folder_path)
        if files:
            print(f"  images/{folder}/  ({len(files)} files)")
            for f in sorted(files):
                print(f"    {f}")


if __name__ == "__main__":
    main()
