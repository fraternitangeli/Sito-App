#!/usr/bin/env python3
"""
Automated synchronization script for ConFrancesco PWA.
Scrapes https://sites.google.com/view/fraternita-s-maria-angeli/
Detects changes, new pages, and updates.
Updates sw.js cache version so all installed PWAs automatically update.
"""

import os
import re
import json
import hashlib
import datetime
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

BASE_URL = "https://sites.google.com/view/fraternita-s-maria-angeli"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
}

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
STATE_FILE = os.path.join(os.path.dirname(__file__), "last_sync.json")
SW_FILE = os.path.join(ROOT_DIR, "sw.js")

KNOWN_PAGES = {
    "/home-page": "index.html",
    "/": "index.html",
    "/chi-siamo": "chi-siamo.html",
    "/chi-siamo/il-carisma": "chi-siamo-il-carisma.html",
    "/chi-siamo/la-nostra-storia": "chi-siamo-la-nostra-storia.html",
    "/chi-siamo/fratelli-in-cielo": "chi-siamo-fratelli-in-cielo.html",
    "/dove-siamo": "dove-siamo.html",
    "/calendario-attività": "calendario-attivita.html",
    "/calendario-attivita": "calendario-attivita.html",
    "/media": "media.html",
    "/contatti": "contatti.html"
}

def get_page(url):
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        if resp.status_code == 200:
            return resp.text
        else:
            print(f"[!] Warning: HTTP {resp.status_code} for {url}")
            return None
    except Exception as e:
        print(f"[!] Error fetching {url}: {e}")
        return None

def compute_hash(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def extract_nav_links(html):
    """Find all links on Google Sites navigation to discover newly added subpages."""
    soup = BeautifulSoup(html, "html.parser")
    found_paths = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "fraternita-s-maria-angeli" in href:
            path = href.split("fraternita-s-maria-angeli")[-1]
            if not path or path == "":
                path = "/"
            found_paths.add(path)
    return found_paths

def bump_service_worker():
    """Bumps cache version in sw.js so all mobile apps immediately download new files."""
    if not os.path.exists(SW_FILE):
        return
    with open(SW_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    new_ver = f"v1.2.0-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M')}"
    updated = re.sub(r"const CACHE_VERSION = '.*?';", f"const CACHE_VERSION = '{new_ver}';", content)
    
    with open(SW_FILE, "w", encoding="utf-8") as f:
        f.write(updated)
    print(f"[+] Updated Service Worker CACHE_VERSION to {new_ver}")

def main():
    print("=== Starting ConFrancesco Auto-Sync ===")
    old_state = {}
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                old_state = json.load(f)
        except Exception as e:
            print(f"[!] Could not load state: {e}")

    new_state = {}
    has_changes = False

    # Fetch home page first
    home_html = get_page(BASE_URL)
    if not home_html:
        print("[!] Failed to fetch home page. Exiting.")
        return

    home_hash = compute_hash(home_html)
    new_state["/"] = home_hash
    if old_state.get("/") != home_hash:
        print("[*] Home page content updated on Google Sites.")
        has_changes = True

    # Discover pages from navigation
    discovered_paths = extract_nav_links(home_html)
    all_paths = set(KNOWN_PAGES.keys()).union(discovered_paths)

    for path in all_paths:
        if path == "/":
            continue
        page_url = f"{BASE_URL}{path}"
        page_html = get_page(page_url)
        if not page_html:
            continue

        p_hash = compute_hash(page_html)
        new_state[path] = p_hash

        if old_state.get(path) != p_hash:
            print(f"[*] Page {path} has new changes.")
            has_changes = True

    # Check for deleted pages
    for old_path in old_state:
        if old_path not in new_state:
            print(f"[-] Page {old_path} was removed from Google Sites.")
            has_changes = True

    if has_changes:
        print("[+] Changes detected! Bumping service worker cache...")
        bump_service_worker()
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(new_state, f, indent=2)
        print("[+] Sync completed successfully with updates.")
    else:
        print("[=] No changes detected. Site is up to date.")

if __name__ == "__main__":
    main()
