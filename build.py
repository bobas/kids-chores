#!/usr/bin/env python3
"""Bundle the static app into a single local HTML file, without dependencies."""
from pathlib import Path
root = Path(__file__).resolve().parent
html = (root/'index.html').read_text()
html = html.replace('<html lang="en">','<html lang="en" data-standalone="true">')
html = html.replace('<link rel="icon" href="icon.svg" type="image/svg+xml">','')
html = html.replace('<link rel="manifest" href="manifest.webmanifest">','')
html = html.replace('<link rel="stylesheet" href="style.css">','<style>\n'+(root/'style.css').read_text()+'\n</style>')
html = html.replace('<script src="routine.js"></script><script src="app.js"></script>','<script>\n'+(root/'routine.js').read_text()+'\n</script>\n<script>\n'+(root/'app.js').read_text()+'\n</script>')
(root/'Evening garden.html').write_text(html)
print('Built Evening garden.html')
