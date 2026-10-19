#!/usr/bin/env python3
"""Zpřístupní pouze soubory aplikace. Bez závislostí, nahrávání dat a přístupu k internetu."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import socket

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--port', type=int, default=8080)
parser.add_argument('--host', default='0.0.0.0', help='Adresa 127.0.0.1 povolí přístup pouze z tohoto počítače.')
args = parser.parse_args()
root = Path(__file__).resolve().parent
allowed = {'Evening garden.html','index.html','style.css','app.js','routine.js','icon.svg','sw.js','manifest.webmanifest'}
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        from urllib.parse import urlparse, unquote
        name = unquote(urlparse(self.path).path).lstrip('/') or 'index.html'
        if name not in allowed:
            self.send_error(404)
            return
        super().do_GET()
    def do_HEAD(self):
        from urllib.parse import urlparse, unquote
        name = unquote(urlparse(self.path).path).lstrip('/') or 'index.html'
        if name not in allowed:
            self.send_error(404)
            return
        super().do_HEAD()
    def end_headers(self):
        self.send_header('Cache-Control','no-cache')
        super().end_headers()
handler = partial(Handler, directory=str(root))
with ThreadingHTTPServer((args.host,args.port),handler) as server:
    print(f'Večerní plán je připraven: http://localhost:{args.port}', flush=True)
    if args.host == '0.0.0.0':
        try:
            addresses = sorted({item[4][0] for item in socket.getaddrinfo(socket.gethostname(),None,socket.AF_INET) if not item[4][0].startswith('127.')})
        except socket.gaierror:
            addresses = []
        for address in addresses:
            print(f'Tablet ve stejné síti Wi-Fi: http://{address}:{args.port}', flush=True)
        print('Pokud se adresa Wi-Fi nezobrazí, použijte místní IP adresu tohoto počítače.', flush=True)
    print('Server ukončíte stiskem Ctrl+C.', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
