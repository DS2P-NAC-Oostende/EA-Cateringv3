"""Maakt EA_Catering_BeLADL.html: de hele site (video's + recepten) in één bestand.

LEERMODUS - waarom?
In BeLADL kun je één HTML-bestand plakken. Met een iframe naar de website krijg je
een pagina-in-een-pagina (dubbel scrollen). Dit script plakt alle onderdelen
(css, javascript, logo, recepten) aan elkaar tot één bestand dat BeLADL zelf toont.

- De videolijst komt nog steeds live uit de Google Sheet; lukt dat niet, dan de
  ingebouwde reservelijst (videos.js).
- Na wijzigingen aan de site: dit script opnieuw draaien en het nieuwe bestand
  opnieuw in BeLADL plakken. (Updates gaan hier NIET vanzelf, anders dan op GitHub.)

Gebruik:  python3 tools/maak_beladl.py logo.png   (logo: klein NAC-logo, bijv. 220 px)
"""
import base64, pathlib, re, sys

MAP = pathlib.Path(__file__).resolve().parent.parent
lees = lambda n: (MAP / n).read_text(encoding="utf-8")
logo_bestand = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else MAP / "nac-logo.png"
LOGO = "data:image/png;base64," + base64.b64encode(logo_bestand.read_bytes()).decode()
veilig = lambda js: js.replace("</script", "<\\/script")

html = lees("index.html")
# Altijd de compacte, ingesloten weergave
html = html.replace('<html lang="nl">', '<html lang="nl" class="embed">', 1)
# Stijlen inline
html = re.sub(r'<link rel="stylesheet" href="styles\.css[^"]*">', lambda m: "<style>\n" + lees("styles.css") + "\n</style>", html)
html = re.sub(r'<link rel="stylesheet" href="recepten\.css[^"]*">', lambda m: "<style>\n" + lees("recepten.css") + "\n</style>", html)
# Geen installeerbare app in BeLADL
html = re.sub(r'\s*<link rel="(manifest|apple-touch-icon|icon)"[^>]*>', "", html)
html = re.sub(r'\s*<meta name="apple-mobile-web-app-[^>]*>', "", html)
html = html.replace('src="nac-logo.png"', f'src="{LOGO}"')
# Service worker eruit
html = re.sub(r'<script>\s*if \("serviceWorker" in navigator\).*?</script>', "", html, flags=re.S)

# Scripts die data.js normaal via src laadt, komen inline als tekst klaar te staan
bronnen = {"app.js": lees("app.js"), "favorieten.js": lees("favorieten.js"), "recepten.js": lees("recepten.js"), "videos.js": lees("videos.js")}
klaar = "".join(f'<script type="text/plain" data-bron="{n}">{veilig(t)}</script>\n' for n, t in bronnen.items())
data = lees("data.js").replace(
    "s.src = src; s.onload = ok; s.onerror = fout;",
    "const inline = document.querySelector('script[data-bron=\"' + src.split('?')[0] + '\"]');\n"
    "            if (inline) { s.textContent = inline.textContent; document.body.appendChild(s); ok(); return; }\n"
    "            s.src = src; s.onload = ok; s.onerror = fout;")
assert "data-bron" in data, "data.js is veranderd: pas maak_beladl.py aan"
extra = ('<script>window.EAC_DEEL_BASIS = "https://ron78nl.github.io/EA-Cateringv3/";</script>\n'
         f'<script>\n{veilig(lees("recepten-data.js"))}\n</script>\n' + klaar)
html = re.sub(r'<script src="data\.js[^"]*"></script>', lambda m: extra + f"<script>\n{veilig(data)}\n</script>", html)
assert "<script src=\"data.js" not in html and "href=\"styles.css" not in html

uit = MAP / "EA_Catering_BeLADL.html"
if len(sys.argv) > 2: uit = pathlib.Path(sys.argv[2])
uit.write_text(html, encoding="utf-8")
print(f"{uit} ({uit.stat().st_size / 1e6:.2f} MB)")
