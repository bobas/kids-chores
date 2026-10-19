#!/usr/bin/env python3
"""Sestaví aplikaci do jediného místního souboru HTML bez závislostí."""
from pathlib import Path
root = Path(__file__).resolve().parent
html = (root/'index.html').read_text(encoding='utf-8')
html = html.replace('<html lang="cs">','<html lang="cs" data-standalone="true">')
html = html.replace('<link rel="icon" href="icon.svg" type="image/svg+xml">','')
html = html.replace('<link rel="manifest" href="manifest.webmanifest">','')
html = html.replace('<link rel="stylesheet" href="style.css">','<style>\n'+(root/'style.css').read_text(encoding='utf-8')+'\n</style>')
html = html.replace('<script src="routine.js"></script><script src="app.js"></script>','<script>\n'+(root/'routine.js').read_text(encoding='utf-8')+'\n</script>\n<script>\n'+(root/'app.js').read_text(encoding='utf-8')+'\n</script>')
(root/'Evening garden.html').write_text(html,encoding='utf-8')
print('Vytvořen soubor Evening garden.html')
