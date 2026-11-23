// =============================================================
// Productnamen - EA Catering v3 bestellijst
// -------------------------------------------------------------
// LEERMODUS - waarvoor dient dit bestand?
// In de kookboeken heet hetzelfde product niet overal hetzelfde.
// "Peper en zout" en "Zout en peper" is hetzelfde, "Djahé" en
// "Gemberpoeder" ook, en "Knoflook, fijngehakt" is gewoon knoflook.
// Zonder hulp maakt de bestellijst daar losse regels van.
//
// De app werkt in drie stappen:
//   1. Hij maakt van elke naam een WOORDENSET: haakjes, cijfers, maten
//      en bewerkingen gaan eruit, en de volgorde doet er niet toe.
//      Daardoor vallen "Peper en zout", "Zout en peper", "Peper en zout
//      naar smaak" en "Peper en evt. zout" vanzelf samen.
//   2. SYNONIEMEN: namen die hetzelfde product zijn maar andere woorden
//      gebruiken, met de naam die op de bestellijst moet komen.
//   3. APART: namen die juist NOOIT samengeteld mogen worden, ook al
//      lijken ze op elkaar. Verse gember is geen gemberpoeder.
//
// Vuistregel bij het aanvullen van de lijsten hieronder: haal alleen
// weg wat zegt wat je in de KEUKEN met iets doet. Alles wat zegt WELK
// product je moet BESTELLEN blijft staan - dus rode tegenover groene
// lombok, dikke tegenover dunne santen, verse tegenover gedroogde
// kruiden, en sambal oelek tegenover sambal badjak.
//
// Alles in kleine letters en zonder accenten; de app doet dat ook
// voordat hij vergelijkt.
// =============================================================

// ---------- 1a. Bewerkingen: wat ermee gedaan is ----------
// Gevonden door alle 2045 ingredientnamen in de boeken na te lopen.
window.BEWERKINGEN = [
    "fijngehakt", "fijngehakte", "fijn gehakt", "grof gehakt", "gehakt", "gehakte",
    "fijngesneden", "fijn gesneden", "gesneden", "fijngesnipperd", "gesnipperd", "gesnipperde",
    "uitgeperst", "uitgeperste", "geperst", "geperste", "geraspt", "geraspte",
    "gemalen", "gekneusd", "gekneusde", "gestampt", "fijngestampt", "fijngestampte",
    "gepeld", "gepelde", "ongepelde", "ontpit", "ontpitte", "ontveld", "ontvelde",
    "gezeefd", "gewassen", "schoongemaakt", "geweekt", "geweekte",
    "gekookt", "gekookte", "hardgekookt", "hardgekookte", "geblancheerd", "geblancheerde",
    "losgeklopt", "losgeroerd", "geklutst", "gepofte", "gepoft",
    "blokjes", "stukken", "stukjes", "plakjes", "plakken", "reepjes", "ringen", "schijfjes",
    "snippers", "partjes", "vieren", "halve",
    "naar smaak", "voor garnering", "voor de garnering", "voor het braden", "voor erbij"
];

// ---------- 1b. Maten en hoeveelheidswoorden ----------
window.MAATWOORDEN = [
    "grote", "kleine", "middelgrote", "flinke", "hele",
    "stukje", "blaadje", "blaadjes", "takje", "takjes",
    "teentje", "teentjes", "teen", "tenen", "spriet", "sprieten",
    "kopje", "kopjes", "snufje", "mespunt", "bakje", "bosje",
    "cm", "gram", "kilogram", "liter", "ml", "dl",
    "theelepel", "theelepels", "eetlepel", "eetlepels",
    "walnootgrootte", "grootte", "knikker", "formaat", "st", "stuks", "stuk",
    "druppel", "druppels", "scheut", "scheutje", "handvol", "snuf", "paar", "enkele"
];

// ---------- 1c. Kleine woorden die niets toevoegen ----------
window.VULWOORDEN = [
    "en", "de", "het", "een", "met", "van", "voor", "in", "op", "of",
    "evt", "naar", "smaak", "ca", "ongeveer", "tot", "ter", "als", "uit", "wat", "circa"
];

// ---------- 1d. Productgroepen in het Frans en Engels ----------
// De groepsnamen hierboven in GROEPEN zijn Nederlands; dit zijn de
// vertalingen voor de kopjes op de bestellijst. Voeg je zelf een groep
// toe, zet hem dan ook hier neer, anders blijft hij Nederlands.
window.GROEPNAMEN = {
    "Toko / Aziatisch":              { fr: "\u00c9picerie asiatique", en: "Asian groceries" },
    "Vis & zeevruchten":             { fr: "Poisson & fruits de mer",  en: "Fish & seafood" },
    "Vlees & gevogelte":             { fr: "Viande & volaille",        en: "Meat & poultry" },
    "Zuivel & eieren":               { fr: "Produits laitiers & \u0153ufs", en: "Dairy & eggs" },
    "Groenten & fruit":              { fr: "L\u00e9gumes & fruits",        en: "Vegetables & fruit" },
    "Droge waren, kruiden & oli\u00ebn": { fr: "\u00c9picerie s\u00e8che, \u00e9pices & huiles", en: "Dry goods, spices & oils" },
    "Overig":                        { fr: "Divers",                   en: "Other" }
};

// ---------- 2. Synoniemen: echt hetzelfde product ----------
// naam      = wat er op de bestellijst komt te staan
// varianten = schrijfwijzen zoals ze in de boeken staan (volgorde maakt niet uit)
// letop     = waarschuwing voor jezelf, verschijnt niet in de app
window.SYNONIEMEN = [
    // --- Indonesische en Nederlandse namen voor dezelfde specerij ---
    // Deze vertalingen staan in de boeken zelf, tussen haakjes achter de naam.
    { naam: "Djahé (gemberpoeder)", varianten: ["djahe", "gemberpoeder", "gember gemalen", "djahe poeder"],
      letop: "Verse gember en gemberwortel staan bewust apart." },
    { naam: "Ketoembar (korianderpoeder)", varianten: ["ketoembar", "ketumbar", "korianderpoeder", "koriander", "korianderzaad"],
      letop: "Verse koriander en korianderblaadjes staan apart." },
    { naam: "Djinten (komijnpoeder)", varianten: ["djinten", "djintan", "komijn", "komijnpoeder", "komijnzaad", "komijnzaadjes"],
      letop: "" },
    { naam: "Koenjit (kurkumapoeder)", varianten: ["koenjit", "kunjit", "kurkuma", "kurkumapoeder", "geelwortel"],
      letop: "Koenjitwortel (vers) staat apart." },
    { naam: "Sereh (citroengras)", varianten: ["sereh", "citroengras"],
      letop: "Serehpoeder staat apart." },
    { naam: "Santen (kokosmelk)", varianten: ["santen", "kokosmelk"],
      letop: "Dikke en dunne santen blijven aparte regels, net als geraspte kokos." },
    { naam: "Laos (galangal)", varianten: ["laos", "galangal", "galanga", "laospoeder"],
      letop: "Laoswortel (vers) staat apart." },
    { naam: "Trassi (garnalenpasta)", varianten: ["trassi", "terasi", "garnalenpasta"],
      letop: "Trassiwater en sambal trassi staan apart." },
    { naam: "Kentjoer", varianten: ["kentjoer", "kencur"], letop: "" },
    { naam: "Asem (tamarinde)", varianten: ["asem", "tamarinde", "tamarindepasta", "tamarindeballetje"], letop: "" },
    { naam: "Kemirie", varianten: ["kemirie", "kemiries", "kemirienoten", "kemirienoot", "kemiri"], letop: "" },
    { naam: "Salamblad", varianten: ["salam", "salamblad", "salamblaadje", "salamblaadjes", "salambladeren"], letop: "" },
    { naam: "Ve-tsin", varianten: ["ve-tsin", "vetsin", "ve tsin", "tsin ve"], letop: "" },
    { naam: "Mirin (zoete rijstwijn)", varianten: ["mirin", "rijstwijn zoete"], letop: "" },
    { naam: "Taugé", varianten: ["tauge", "taugeh", "taogeh", "taoge", "sojascheuten"], letop: "" },

    // --- Dezelfde producten, andere woorden ---
    { naam: "Knoflook", varianten: ["knoflook", "knoflookpulp", "knoflooktenen", "knoflookteentjes", "bawang putih"],
      letop: "Knoflookpoeder staat apart: dat is een ander product." },
    { naam: "Peper en zout", varianten: ["peper zout", "peper zoutnaar", "zoutnaar peper"],
      letop: "Vangt ook 'Zout en peper' en 'Peper en evt. zout'. Losse peper en los zout blijven aparte regels, want vaak staat er maar een van beide in een recept." },
    { naam: "Ketjap manis", varianten: ["ketjap manis", "ketjap", "ketjap zoete"],
      letop: "Ketjap asin (zout) is een ander product en staat apart." },
    { naam: "Maïzena", varianten: ["maizena", "maiszetmeel"], letop: "" },
    { naam: "Bouillonblokjes", varianten: ["bouillonblokje", "bouillonblokjes", "bouillontablet", "bouillontabletten"],
      letop: "Bouillonpoeder staat apart. Let ook op de soort: kip, rund, groente." },
    { naam: "Citroensap", varianten: ["citroensap", "sap citroen", "citroensap vers"], letop: "" },
    { naam: "Paneermeel", varianten: ["paneermeel", "paneermix", "broodkruim"], letop: "" },
    // Bij deze kruiden maakt "vers" geen verschil voor de bestelling; bij
    // koriander wel, dus die staat hier NIET bij (zie Ketoembar en APART).
    { naam: "Peterselie", varianten: ["peterselie", "peterselie verse", "peterselie vers", "krulpeterselie"], letop: "" },
    { naam: "Bieslook", varianten: ["bieslook", "bieslook verse", "bieslook vers"], letop: "" },
    { naam: "Kervel", varianten: ["kervel", "kervel verse", "kervel vers"], letop: "" },
    { naam: "Slagroom", varianten: ["slagroom", "room klop", "kloproom"], letop: "" },
    { naam: "Gehakt half-om-half", varianten: ["gehakt half-om-half", "gehakt half om half", "gehakt hoh", "half-om-halfgehakt"],
      letop: "Rundergehakt en varkensgehakt apart laten staan." }
];

// ---------- 3. Apart houden, wat er ook gebeurt ----------
// Deze namen worden nooit met een andere naam samengeteld, ook niet
// door de enkelvoud/meervoud-regel. Vers is nu eenmaal geen poeder.
window.APART = [
    // vers tegenover poeder of gedroogd
    "gember", "gemberwortel", "gembersiroop", "bakgember",
    "serehpoeder", "knoflookpoeder", "uienpoeder", "selderiepoeder",
    "verse koriander", "korianderblaadjes", "koenjitwortel", "laoswortel",
    // kokos in zijn verschillende vormen
    "kokos", "kokosrasp", "kokosmeel", "kokosnoot", "kokosmelk light",
    "dikke santen", "dunne santen",
    // sambals en ketjaps: verschillende potten
    "sambal", "sambal badjak", "sambal trassi", "sambal manis", "sambal rawit",
    "ketjap asin", "trassiwater",
    // losse peper en los zout: niet in "peper en zout" laten vallen
    "peper", "zout", "pepers", "zwarte peper", "witte peper", "grof zout",
    // suikers zijn geen van alle inwisselbaar
    "suiker", "javaanse suiker", "bruine basterdsuiker", "witte basterdsuiker",
    "bloemsuiker", "poedersuiker", "kristalsuiker", "vanillesuiker",
    // bloem tegenover bloemsuiker, en de rijstsoorten
    "bloem", "zelfrijzend bakmeel", "rijst", "kleefrijst", "zilvervliesrijst",
    // melk- en roomsoorten
    "melk", "halfvolle melk", "volle melk", "room", "zure room", "creme fraiche",
    "margarine", "vloeibare margarine", "boter", "roomboter"
];
