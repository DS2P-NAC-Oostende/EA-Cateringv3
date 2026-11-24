# EA Catering

Instructievideo's keukentechnieken voor de Navy Academy Oostende (NAC), in de navy & goud huisstijl.

- Live: https://ds2p-nac-oostende.github.io/EA-Cateringv3/
- Oud ontwerp (bewaard, staat nog op het privé-account Ron78NL): https://ron78nl.github.io/EA-Cateringv2/

## Video's toevoegen of wijzigen

De videolijst komt uit de Google Sheet "EA Catering – videolijst" (tabbladen Video's en Categorieën).
Wat daar staat, verschijnt automatisch op de site.

Is de Sheet even niet bereikbaar, dan gebruikt de app de laatst geladen lijst op het toestel,
en anders `videos.js` in deze map als reserve.

## QR-codes voor de werkplek (voor instructeurs)

Open `https://ds2p-nac-oostende.github.io/EA-Cateringv3/qr.html` en kies categorie, formaat (stickers 12 per A4 of poster) en taal, en print.
Een scan opent in de app meteen die video (`?v=YouTube-id`) of de hele categorie (`?cat=categorie-id`).
De pagina staat niet in het menu van de site; leerlingen zien hem niet. Nieuwe video's uit de Sheet staan er vanzelf op.

Let op: een sticker blijft werken als je titel of categorie wijzigt, maar niet als je de YouTube-link van een video vervangt (print dan een nieuwe).

## Tabblad Recepten

Bovenaan staan twee tabbladen: **Instructievideo's** en **Recepten** (1082 recepten uit DGI 2024, Klein Vers 240e en Selamat Makan 1–3).
Bij receptstappen met een bekende techniek staat een gouden knop naar de video; in het afspeelscherm staat omgekeerd "Bekijk … recepten met deze techniek".
De knoppen zijn NL/FR/EN, de recepten zelf voorlopig alleen Nederlands.

**Nieuwe video koppelen aan recepten:** vul in de Sheet (tabblad Video's) kolom G "Zoekwoorden recepten" in, bijv. `flambeer, flamberen`.
Elk woord telt als heel woord; `ontschub*` telt ook langere woorden mee. De app koppelt de video dan vanzelf aan elke receptstap met dat woord,
ook in de BeLADL-versie. Uitleg staat ook op het tabblad Uitleg van de Sheet.

Directe links (ook met `&embed=1` voor BeLADL):
- `?tab=recepten` opent het tabblad Recepten
- `?recept=<id>` opent meteen één recept (knop "Link kopiëren" bij een recept)
- `?techniek=<YouTube-id>` toont alle recepten met die techniek

## Bestanden

- `index.html`, `styles.css`: de pagina en het ontwerp
- `data.js`: haalt de videolijst uit de Google Sheet en start de app
- `app.js`: tekent de videokaarten, zoeken, categorieën, taalkeuze en het afspeelscherm
- `favorieten.js`: favorieten en bekeken-vinkjes
- `recepten.js`, `recepten.css`: het tabblad Recepten (zoeken, hoofdgroepen, receptweergave, koppeling met de video's)
- `recepten-data.js`: alle recepten; wordt pas geladen als iemand het tabblad opent (gegenereerd, niet met de hand bewerken)
- `videos.js`: reservelijst als de Sheet niet bereikbaar is
- `sw.js`, `manifest.json`: installeren als app op de telefoon
- `qr.html`, `qrcode.js`: printbare QR-codes per video en categorie (qrcode.js: MIT-licentie, Kazuhiko Arase)

## BeLADL-versie (één bestand)

`python3 tools/maak_beladl.py` maakt `EA_Catering_BeLADL.html`: video's én recepten in één bestand om in BeLADL te plakken (geen pagina-in-een-pagina). De videolijst blijft live uit de Sheet komen; na andere wijzigingen het script opnieuw draaien en het bestand opnieuw plakken.
