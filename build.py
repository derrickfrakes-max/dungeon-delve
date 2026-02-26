#!/usr/bin/env python3
"""
Dungeon Delve build script.
Bundles index.html + css/styles.css + js/*.js into a single dungeon_delve.html
Usage: python3 build.py
"""

import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))

JS_FILES = [
    'js/data.js',
    'js/player.js',
    'js/items.js',
    'js/enemies.js',
    'js/combat.js',
    'js/floors.js',
    'js/ui.js',
    'js/main.js',
]

def read(path):
    with open(os.path.join(BASE, path), 'r', encoding='utf-8') as f:
        return f.read()

def build():
    html = read('index.html')

    # Replace <link rel="stylesheet" href="css/styles.css"> with inline <style>
    css = read('css/styles.css')
    html = html.replace(
        '<link rel="stylesheet" href="css/styles.css">',
        f'<style>\n{css}\n</style>'
    )

    # Build combined JS
    js_parts = []
    for js_file in JS_FILES:
        js_parts.append(f'// === {js_file} ===\n')
        js_parts.append(read(js_file))
        js_parts.append('\n')
    combined_js = ''.join(js_parts)

    # Replace all individual <script src="js/..."> tags with one inline <script>
    # Remove all the individual script tags
    script_block = re.sub(
        r'\s*<!-- Game scripts -->\s*(<script src="js/[^"]+"></script>\s*)+',
        '',
        html
    )

    # Insert combined script before </body>
    bundled = script_block.replace(
        '</body>',
        f'<script>\n{combined_js}\n</script>\n</body>'
    )

    out_path = os.path.join(BASE, 'dungeon_delve.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(bundled)

    size_kb = os.path.getsize(out_path) / 1024
    print(f"✓ Built dungeon_delve.html ({size_kb:.1f} KB)")
    print(f"  CSS: {len(css.splitlines())} lines")
    for js_file in JS_FILES:
        content = read(js_file)
        print(f"  {js_file}: {len(content.splitlines())} lines")

if __name__ == '__main__':
    build()
