#!/usr/bin/env python3
"""
Dungeon Delve build script.
Bundles index.html + styles.css + *.js into a single dungeon_delve.html
Usage: python3 build.py
"""

import os, re

BASE = os.path.dirname(os.path.abspath(__file__))

JS_FILES = ['data.js','player.js','items.js','enemies.js','combat.js','floors.js','ui.js','main.js']

def read(path):
    with open(os.path.join(BASE, path), 'r', encoding='utf-8') as f:
        return f.read()

def build():
    html = read('index.html')
    css  = read('styles.css')

    # Inline CSS
    html = re.sub(r'<link rel="stylesheet" href="[^"]*styles\.css">', f'<style>\n{css}\n</style>', html)

    # Build combined JS
    combined_js = ''.join(f'// === {f} ===\n' + read(f) + '\n' for f in JS_FILES)

    # Strip individual script tags
    bundled = re.sub(r'\s*<!-- Game scripts -->\s*(<script src="[^"]+"></script>\s*)+', '', html)
    bundled = re.sub(r'\s*<script src="[^"]+\.js"></script>', '', bundled)

    # Inject combined JS
    bundled = bundled.replace('</body>', f'<script>\n{combined_js}\n</script>\n</body>')

    out_path = os.path.join(BASE, 'dungeon_delve.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(bundled)

    size_kb = os.path.getsize(out_path) / 1024
    print(f"✓ Built dungeon_delve.html ({size_kb:.1f} KB)")

if __name__ == '__main__':
    build()
