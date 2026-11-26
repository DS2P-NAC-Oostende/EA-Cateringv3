// =============================================================
// Bestellijstgenerator - EA Catering v3  (TESTVERSIE)
// -------------------------------------------------------------
// LEERMODUS - wat doet dit bestand?
//  1. Je kiest recepten uit recepten-data.js en zegt hoe vaak je ze maakt.
//  2. Per recept worden alle hoeveelheden met dat aantal vermenigvuldigd.
//  3. Dezelfde ingredienten uit verschillende recepten worden bij elkaar
//     opgeteld, maar ALLEEN als naam en eenheid precies gelijk zijn.
//     Zo kan er nooit per ongeluk "paprika rood" bij "paprika groen"
//     geteld worden.
//  4. Gram en kilogram worden samen geteld (alles eerst naar gram),
//     milliliter, deciliter en liter ook (alles eerst naar milliliter).
//  5. Wat niet af te wegen is ("naar smaak", leeg) komt in een aparte
//     lijst, zodat je het niet vergeet.
// =============================================================

(function () {
    "use strict";

    // =========================================================
    // DE SCHAKELAAR
    // ---------------------------------------------------------
    // false = het tabblad Bestellijst is er wel, maar niemand ziet het.
    //         Jij bereikt het dan met  ...?bestellijst=1  achter het adres.
    // true  = het tabblad staat gewoon in de kopbalk, voor iedereen.
    // Verander alleen dit ene woord als je hem vrijgeeft.
    const VRIJGEGEVEN = true;
    // =========================================================
    window.BESTELLIJST_ZICHTBAAR = VRIJGEGEVEN ||
        new URLSearchParams(location.search).has("bestellijst") ||
        !!window.BL_LOSSE_PAGINA;

    // =========================================================
    // TEKSTEN PER TAAL
    // ---------------------------------------------------------
    // Zelfde opzet als recepten.js: de taal staat in localStorage onder
    // "nac-lang" en wordt gezet door de NL/FR/EN-knoppen in de kopbalk.
    // De namen van recepten en ingredienten komen uit de kookboeken en
    // blijven Nederlands; daar hoort de regel "bronTaal" bij.
    // =========================================================
    const TEKST = {
        nl: {
            uitlegKop: "Zo werkt het.",
            uitleg: "Kies hieronder de recepten die je gaat maken en vul per recept in hoe vaak je het maakt. De app telt alle ingredi\u00ebnten bij elkaar op tot \u00e9\u00e9n bestellijst.",
            uitlegPorties: "Staat er bij een recept <b>30 porties</b>, dan is <b>1&times; = 30 porties</b>, 2&times; = 60 porties, enzovoort. Vul dus niet het aantal personen in, maar het aantal keer.",
            uitlegBron: "Staat er <b>volgens bronrecept</b>, dan vermeldt het kookboek geen aantal porties. 1&times; is dan \u00e9\u00e9n bereiding zoals die in het boek staat.",
            bronTaal: "",
            stap1: "Recepten kiezen",
            stap1Hint: "Zoek op naam of kies eerst een hoofdgroep. Tik op een recept om het toe te voegen. Je kunt ook bij een recept zelf op <b>Op de bestellijst</b> tikken.",
            zoek: "Zoek een recept, bijvoorbeeld eiersalade of nasi",
            zoekLabel: "Recept zoeken", hoofdgroep: "Hoofdgroep", alleGroepen: "Alle hoofdgroepen",
            resultaten: "Zoekresultaten", geenRecept: "Geen recept gevonden.",
            meerTreffers: (n) => `Nog ${n} andere treffers \u2014 zoek wat preciezer.`,
            stap2: "Gekozen recepten", nietsGekozen: "Nog niets gekozen.", vulIn: "Vul in hoe vaak je elk recept maakt.",
            kolRecept: "Recept", kolHoeVaak: "Hoe vaak", kolLevertOp: "Levert op", verwijderen: "Verwijderen",
            hoeVaakLabel: (naam) => `Hoe vaak maak je ${naam}`, verwijderLabel: (naam) => `${naam} verwijderen`,
            porties: (n) => `${n} porties`, keerMaal: (a, b) => `${a} \u00d7 ${b}`,
            bereidingen: (n) => `${n} bereiding${n > 1 ? "en" : ""}`, geenPorties: "aantal porties niet in het boek",
            basisPorties: (n) => `1\u00d7 = ${n} porties`, basisBron: "1\u00d7 = \u00e9\u00e9n bereiding volgens het bronrecept",
            stap3: "Bestellijst", afdrukken: "Afdrukken (A4)", excel: "Excel-bestand (CSV)",
            sortering: (x) => "Sortering: " + x, perGroep: "per productgroep", alfabetisch: "alfabetisch",
            wissen: "Lijst wissen", wisVraag: "De hele lijst wissen?",
            optieSamen: "Verschillende namen voor hetzelfde product samentellen (Djah\u00e9 = gemberpoeder)",
            optieHerkomst: "Bij elk artikel tonen uit welk recept het komt",
            eigenNaam: "Zelf een artikel erbij, bijvoorbeeld aluminiumfolie", eigenAantal: "Hoeveel",
            eigenToe: "Toevoegen", eigenLabel: "Naam van het artikel", aantalLabel: "Hoeveelheid", eenheidLabel: "Eenheid",
            kiesEerst: "Kies eerst een of meer recepten.", nietGeladen: "De receptenlijst kon niet geladen worden.",
            telling: (n) => `${n} af te wegen artikel${n === 1 ? "" : "en"}`, tellingVrij: (n) => ` \u00b7 ${n} naar smaak`,
            naarSmaak: "naar smaak", ookGeteld: "ook geteld als:", uitRecept: "uit:", zelfToegevoegd: "zelf toegevoegd",
            alleArtikelen: "Alle artikelen", groepVrij: "Naar smaak / geen hoeveelheid vermeld",
            stuks: "stuks", stuk: "stuk", geenEenheid: "geen",
            vanLijst: "Van de lijst halen (heb ik al)", vanLijstLabel: (naam) => `${naam} van de lijst halen`,
            geschrapt: (n) => `${n} artikel${n === 1 ? "" : "en"} door jou van de lijst gehaald.`, weerTonen: "Weer tonen",
            letOpKop: "Even zelf nakijken.",
            letOp: "Deze regels zijn bewust niet samengeteld. Namen die op elkaar lijken kunnen andere producten zijn (vers tegenover poeder), en hetzelfde product in twee eenheden telt de app nooit bij elkaar op:",
            letOpSlot: "Hoort het toch bij elkaar? Zet de namen dan samen in producten.js, bij SYNONIEMEN.",
            letOpMeer: (n) => `\u2026 en nog ${n} andere.`,
            tweeEenheden: (naam, a, b) => `${naam}: staat er twee keer op, in ${a} en in ${b}`,
            meerProducten: (naam) => `${naam}: lijkt meerdere producten op \u00e9\u00e9n regel, met \u00e9\u00e9n hoeveelheid`,
            printKop: "Bestellijst keuken", opgemaakt: (d) => `Opgemaakt op ${d} \u00b7 `,
            csvKolommen: ["Productgroep", "Ingredient", "Hoeveelheid", "Eenheid", "Ook geteld als", "Uit recept(en)"],
            csvRecepten: ["Gekozen recepten", "Hoe vaak", "Levert op"], volgensBron: "volgens bronrecept", blz: "blz.",
            bestandsnaam: "bestellijst", datumTaal: "nl-BE",
            receptgroepen: { "Voorgerechten": "Voorgerechten", "Hoofdgerechten": "Hoofdgerechten", "Sauzen": "Sauzen", "Desserts": "Desserts", "Ontbijt & Snacks": "Ontbijt & Snacks", "Blauwe Hap": "Blauwe Hap" }
        },
        fr: {
            uitlegKop: "Comment \u00e7a marche.",
            uitleg: "Choisissez ci-dessous les recettes que vous allez pr\u00e9parer et indiquez combien de fois pour chacune. L'application additionne tous les ingr\u00e9dients en une seule liste de commande.",
            uitlegPorties: "Si une recette indique <b>30 portions</b>, alors <b>1&times; = 30 portions</b>, 2&times; = 60 portions, et ainsi de suite. N'indiquez donc pas le nombre de personnes, mais le nombre de fois.",
            uitlegBron: "Si elle indique <b>selon la recette d'origine</b>, le livre ne mentionne pas de nombre de portions. 1&times; correspond alors \u00e0 une pr\u00e9paration telle qu'elle figure dans le livre.",
            bronTaal: "Les noms des recettes et des ingr\u00e9dients sont en n\u00e9erlandais.",
            stap1: "Choisir les recettes",
            stap1Hint: "Cherchez par nom ou choisissez d'abord un groupe principal. Touchez une recette pour l'ajouter. Vous pouvez aussi toucher <b>Sur la liste de commande</b> dans la recette m\u00eame.",
            zoek: "Chercher une recette, par exemple eiersalade ou nasi",
            zoekLabel: "Chercher une recette", hoofdgroep: "Groupe principal", alleGroepen: "Tous les groupes",
            resultaten: "R\u00e9sultats", geenRecept: "Aucune recette trouv\u00e9e.",
            meerTreffers: (n) => `Encore ${n} autres r\u00e9sultats \u2014 affinez votre recherche.`,
            stap2: "Recettes choisies", nietsGekozen: "Rien de choisi pour l'instant.", vulIn: "Indiquez combien de fois vous pr\u00e9parez chaque recette.",
            kolRecept: "Recette", kolHoeVaak: "Combien de fois", kolLevertOp: "Donne", verwijderen: "Supprimer",
            hoeVaakLabel: (naam) => `Combien de fois pr\u00e9parez-vous ${naam}`, verwijderLabel: (naam) => `Supprimer ${naam}`,
            porties: (n) => `${n} portions`, keerMaal: (a, b) => `${a} \u00d7 ${b}`,
            bereidingen: (n) => `${n} pr\u00e9paration${n > 1 ? "s" : ""}`, geenPorties: "nombre de portions absent du livre",
            basisPorties: (n) => `1\u00d7 = ${n} portions`, basisBron: "1\u00d7 = une pr\u00e9paration selon la recette d'origine",
            stap3: "Liste de commande", afdrukken: "Imprimer (A4)", excel: "Fichier Excel (CSV)",
            sortering: (x) => "Tri : " + x, perGroep: "par groupe de produits", alfabetisch: "alphab\u00e9tique",
            wissen: "Effacer la liste", wisVraag: "Effacer toute la liste ?",
            optieSamen: "Additionner les noms diff\u00e9rents d'un m\u00eame produit (Djah\u00e9 = gingembre en poudre)",
            optieHerkomst: "Indiquer pour chaque article de quelle recette il provient",
            eigenNaam: "Ajouter un article vous-m\u00eame, par exemple du papier aluminium", eigenAantal: "Combien",
            eigenToe: "Ajouter", eigenLabel: "Nom de l'article", aantalLabel: "Quantit\u00e9", eenheidLabel: "Unit\u00e9",
            kiesEerst: "Choisissez d'abord une ou plusieurs recettes.", nietGeladen: "La liste des recettes n'a pas pu \u00eatre charg\u00e9e.",
            telling: (n) => `${n} article${n === 1 ? "" : "s"} \u00e0 peser`, tellingVrij: (n) => ` \u00b7 ${n} selon le go\u00fbt`,
            naarSmaak: "selon le go\u00fbt", ookGeteld: "compt\u00e9 aussi comme :", uitRecept: "de :", zelfToegevoegd: "ajout\u00e9 par vous",
            alleArtikelen: "Tous les articles", groepVrij: "Selon le go\u00fbt / quantit\u00e9 non indiqu\u00e9e",
            stuks: "pi\u00e8ces", stuk: "pi\u00e8ce", geenEenheid: "aucune",
            vanLijst: "Retirer de la liste (d\u00e9j\u00e0 en stock)", vanLijstLabel: (naam) => `Retirer ${naam} de la liste`,
            geschrapt: (n) => `${n} article${n === 1 ? "" : "s"} retir\u00e9${n === 1 ? "" : "s"} par vous.`, weerTonen: "Afficher \u00e0 nouveau",
            letOpKop: "\u00c0 v\u00e9rifier vous-m\u00eame.",
            letOp: "Ces lignes n'ont volontairement pas \u00e9t\u00e9 additionn\u00e9es. Des noms qui se ressemblent peuvent \u00eatre d'autres produits (frais contre en poudre), et un m\u00eame produit indiqu\u00e9 en deux unit\u00e9s n'est jamais additionn\u00e9 :",
            letOpSlot: "Cela va quand m\u00eame ensemble ? Regroupez alors les noms dans producten.js, sous SYNONIEMEN.",
            letOpMeer: (n) => `\u2026 et ${n} autres.`,
            tweeEenheden: (naam, a, b) => `${naam} : figure deux fois, en ${a} et en ${b}`,
            meerProducten: (naam) => `${naam} : semble contenir plusieurs produits sur une ligne, avec une seule quantit\u00e9`,
            printKop: "Liste de commande cuisine", opgemaakt: (d) => `\u00c9tablie le ${d} \u00b7 `,
            csvKolommen: ["Groupe de produits", "Ingredient", "Quantite", "Unite", "Compte aussi comme", "De la (des) recette(s)"],
            csvRecepten: ["Recettes choisies", "Combien de fois", "Donne"], volgensBron: "selon la recette d'origine", blz: "p.",
            bestandsnaam: "liste-de-commande", datumTaal: "fr-BE",
            receptgroepen: { "Voorgerechten": "Entr\u00e9es", "Hoofdgerechten": "Plats principaux", "Sauzen": "Sauces", "Desserts": "Desserts", "Ontbijt & Snacks": "Petit-d\u00e9jeuner & snacks", "Blauwe Hap": "Blauwe Hap" }
        },
        en: {
            uitlegKop: "How this works.",
            uitleg: "Choose the recipes you are going to cook and enter how many times you make each one. The app adds up all the ingredients into a single order list.",
            uitlegPorties: "If a recipe says <b>30 portions</b>, then <b>1&times; = 30 portions</b>, 2&times; = 60 portions, and so on. So do not enter the number of people, but the number of times.",
            uitlegBron: "If it says <b>as in the source recipe</b>, the cookbook gives no number of portions. 1&times; is then one preparation as printed in the book.",
            bronTaal: "Recipe and ingredient names are in Dutch.",
            stap1: "Choose recipes",
            stap1Hint: "Search by name or pick a main group first. Tap a recipe to add it. You can also tap <b>Add to order list</b> on the recipe itself.",
            zoek: "Search a recipe, for example eiersalade or nasi",
            zoekLabel: "Search recipe", hoofdgroep: "Main group", alleGroepen: "All main groups",
            resultaten: "Search results", geenRecept: "No recipe found.",
            meerTreffers: (n) => `${n} more matches \u2014 narrow your search.`,
            stap2: "Chosen recipes", nietsGekozen: "Nothing chosen yet.", vulIn: "Enter how many times you make each recipe.",
            kolRecept: "Recipe", kolHoeVaak: "How often", kolLevertOp: "Yields", verwijderen: "Remove",
            hoeVaakLabel: (naam) => `How many times do you make ${naam}`, verwijderLabel: (naam) => `Remove ${naam}`,
            porties: (n) => `${n} portions`, keerMaal: (a, b) => `${a} \u00d7 ${b}`,
            bereidingen: (n) => `${n} batch${n > 1 ? "es" : ""}`, geenPorties: "portion count not in the book",
            basisPorties: (n) => `1\u00d7 = ${n} portions`, basisBron: "1\u00d7 = one batch as in the source recipe",
            stap3: "Order list", afdrukken: "Print (A4)", excel: "Excel file (CSV)",
            sortering: (x) => "Sorting: " + x, perGroep: "by product group", alfabetisch: "alphabetical",
            wissen: "Clear list", wisVraag: "Clear the whole list?",
            optieSamen: "Add up different names for the same product (Djah\u00e9 = ground ginger)",
            optieHerkomst: "Show for each item which recipe it comes from",
            eigenNaam: "Add an item yourself, for example aluminium foil", eigenAantal: "How much",
            eigenToe: "Add", eigenLabel: "Item name", aantalLabel: "Quantity", eenheidLabel: "Unit",
            kiesEerst: "Choose one or more recipes first.", nietGeladen: "The recipe list could not be loaded.",
            telling: (n) => `${n} item${n === 1 ? "" : "s"} to weigh out`, tellingVrij: (n) => ` \u00b7 ${n} to taste`,
            naarSmaak: "to taste", ookGeteld: "also counted as:", uitRecept: "from:", zelfToegevoegd: "added by you",
            alleArtikelen: "All items", groepVrij: "To taste / no quantity given",
            stuks: "pcs", stuk: "pc", geenEenheid: "none",
            vanLijst: "Take off the list (already in stock)", vanLijstLabel: (naam) => `Take ${naam} off the list`,
            geschrapt: (n) => `${n} item${n === 1 ? "" : "s"} taken off the list by you.`, weerTonen: "Show again",
            letOpKop: "Check these yourself.",
            letOp: "These lines were deliberately not added up. Names that look alike can be different products (fresh versus ground), and the same product given in two units is never added together:",
            letOpSlot: "Do they belong together after all? Then put the names together in producten.js, under SYNONIEMEN.",
            letOpMeer: (n) => `\u2026 and ${n} more.`,
            tweeEenheden: (naam, a, b) => `${naam}: appears twice, in ${a} and in ${b}`,
            meerProducten: (naam) => `${naam}: looks like several products on one line, with a single quantity`,
            printKop: "Kitchen order list", opgemaakt: (d) => `Drawn up on ${d} \u00b7 `,
            csvKolommen: ["Product group", "Ingredient", "Quantity", "Unit", "Also counted as", "From recipe(s)"],
            csvRecepten: ["Chosen recipes", "How often", "Yields"], volgensBron: "as in the source recipe", blz: "p.",
            bestandsnaam: "order-list", datumTaal: "en-GB",
            receptgroepen: { "Voorgerechten": "Starters", "Hoofdgerechten": "Main courses", "Sauzen": "Sauces", "Desserts": "Desserts", "Ontbijt & Snacks": "Breakfast & snacks", "Blauwe Hap": "Blauwe Hap" }
        }
    };
    const taalNu = () => { let t = "nl"; try { t = localStorage.getItem("nac-lang") || "nl"; } catch (e) {} return TEKST[t] ? t : "nl"; };
    const T = () => TEKST[taalNu()];
    // Naam van een receptgroep in de gekozen taal (zelfde lijst als recepten.js)
    const receptGroep = (g) => (T().receptgroepen || {})[g] || g;
    // Naam van een productgroep in de gekozen taal (vertalingen in producten.js)
    const groepNaam = (g) => {
        const v = (window.GROEPNAMEN || {})[g];
        return v && v[taalNu()] ? v[taalNu()] : g;
    };

    // Eigen opslagsleutel: alle apps op dit adres delen een opslag.
    const SLEUTEL = "eac-v3-bestellijst";

    // ---------------------------------------------------------
    // 1. Hoeveelheid uit het boek omzetten naar een getal
    // ---------------------------------------------------------
    const BREUKEN = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": 0.125 };

    function naarGetal(ruw) {
        let s = String(ruw == null ? "" : ruw).trim();
        if (!s) return null;                                  // geen hoeveelheid vermeld
        if (/naar\s*smaak|p\.?m\.?$/i.test(s)) return null;   // "naar smaak"

        // Breuktekens: "1 1/2", "1/2", "1/2" alleen of achter een geheel getal
        let breuk = 0;
        s = s.replace(/[¼½¾⅓⅔⅛]/g, (t) => { breuk += BREUKEN[t]; return " "; }).trim();
        if (!s && breuk) return breuk;

        // Bereik uit het boek ("2-3", "1000-1200"): neem het hoogste, dan kom je niet tekort
        const b = s.match(/^(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)$/);
        if (b) return parseFloat(b[2].replace(",", ".")) + breuk;

        // Gewone breuk ("1/2"); "15/15" betekent twee maten naast elkaar: neem de eerste
        const g = s.match(/^(\d+)\s*\/\s*(\d+)$/);
        if (g) { const a = +g[1], c = +g[2]; return (c && a < c ? a / c : a) + breuk; }

        const n = parseFloat(s.replace(",", "."));
        if (!isFinite(n)) return breuk || null;
        return n + breuk;
    }

    // ---------------------------------------------------------
    // 2. Eenheden: alles naar een rekeneenheid, en weer netjes terug
    // ---------------------------------------------------------
    const MATEN = {
        gram: ["g", 1], g: ["g", 1], gr: ["g", 1], kilogram: ["g", 1000], kilo: ["g", 1000], kg: ["g", 1000],
        milliliter: ["ml", 1], ml: ["ml", 1], centiliter: ["ml", 10], cl: ["ml", 10],
        deciliter: ["ml", 100], dl: ["ml", 100], liter: ["ml", 1000], l: ["ml", 1000]
    };

    // Enkelvoud en meervoud onder een noemer, zodat ze samen tellen.
    const TELWOORDEN = {
        "": "stuks", stuk: "stuks", stuks: "stuks", stuks_: "stuks",
        teentje: "teentjes", teentjes: "teentjes",
        blaadje: "blaadjes", blaadjes: "blaadjes",
        eetlepel: "eetlepels", eetlepels: "eetlepels", el: "eetlepels",
        theelepel: "theelepels", theelepels: "theelepels", tl: "theelepels",
        spriet: "sprieten", sprieten: "sprieten",
        stengel: "stengels", stengels: "stengels",
        takje: "takjes", takjes: "takjes",
        plak: "plakken", plakken: "plakken", plakje: "plakjes", plakjes: "plakjes",
        schijf: "schijven", schijven: "schijven", schijfje: "schijfjes", schijfjes: "schijfjes",
        stukje: "stukjes", stukjes: "stukjes",
        blikje: "blikjes", blikjes: "blikjes", blik: "blikken", blikken: "blikken",
        blok: "blokken", blokken: "blokken",
        bos: "bossen", bossen: "bossen", bosje: "bosjes", bosjes: "bosjes",
        mespunt: "mespunten", mespunten: "mespunten",
        snuf: "snuffen", snuifje: "snuifjes",
        zakje: "zakjes", zakjes: "zakjes", pot: "potten", potje: "potjes"
    };

    function maat(ruwe) {
        const e = String(ruwe == null ? "" : ruwe).trim().toLowerCase();
        if (MATEN[e]) return { soort: MATEN[e][0], factor: MATEN[e][1] };          // weegt of meet
        return { soort: TELWOORDEN[e] || e, factor: 1 };                            // telt
    }

    // Getal netjes schrijven, met komma zoals in Nederlands
    function cijfer(n, decimalen) {
        const afgerond = Math.round(n * Math.pow(10, decimalen)) / Math.pow(10, decimalen);
        return afgerond.toFixed(decimalen).replace(/[.,]?0+$/, "").replace(".", ",") || "0";
    }

    // Van rekeneenheid naar wat je opschrijft: 1590 g -> "1,59 kg"
    function schrijf(totaal, soort) {
        if (soort === "g") return totaal >= 1000 ? { h: cijfer(totaal / 1000, 2), e: "kg" } : { h: cijfer(totaal, 1), e: "g" };
        if (soort === "ml") return totaal >= 1000 ? { h: cijfer(totaal / 1000, 2), e: "l" } : { h: cijfer(totaal, 0), e: "ml" };
        if ((soort || "stuks") === "stuks") return { h: cijfer(totaal, 2), e: totaal === 1 ? T().stuk : T().stuks };
        return { h: cijfer(totaal, 2), e: soort };
    }

    // ---------------------------------------------------------
    // 3. Productgroepen - alleen om de lijst handig te sorteren
    // ---------------------------------------------------------
    // Woordstammen per groep. Een stam telt alleen mee als een WOORD ermee
    // begint, zie PATRONEN hieronder. Daardoor valt "bouillonpoeder" niet
    // onder "ui" en "bloemsuiker" niet onder "bloemkool". De groep is enkel
    // een sorteerhulp; controleer bij twijfel zelf even.
    const GROEPEN = [
        ["Toko / Aziatisch", ["sambal", "ketjap", "santen", "kokosmelk", "kokosnoot", "trassi", "petis", "laos", "djahe", "ketoembar", "ketumbar", "kemirie", "kemiries", "sereh", "djinten", "kunjit", "koenjit", "kencur", "kentjoer", "asem", "lombok", "tahoe", "tahu", "tempe", "kroepoek", "bami", "mihoen", "kleefrijst", "gula", "serundeng", "pandan", "salam", "citroengras", "nasi", "atjar", "taugeh", "taoge", "oestersaus", "sojasaus", "mie", "ebi", "boemboe", "roedjak", "ketimoen"]],
        ["Vis & zeevruchten", ["vis", "makreel", "zalm", "tonijn", "kabeljauw", "schol", "haring", "garnaal", "garnalen", "mossel", "ansjovis", "sardine", "scampi", "krab", "forel", "pangasius", "tilapia", "surimi", "zeewolf"]],
        ["Vlees & gevogelte", ["kip", "hoen", "haan", "kalkoen", "eend", "varken", "rund", "gehakt", "ham", "spek", "bacon", "worst", "lam", "biefstuk", "schnitzel", "rib", "lever", "poulet", "sate", "karbonade", "shoarma", "gyros", "burger", "vlees", "speklap", "chipolata", "merguez", "knakworst", "frikandel", "bitterbal", "kroket"]],
        ["Zuivel & eieren", ["melk", "boter", "margarine", "kaas", "room", "slagroom", "yoghurt", "kwark", "ei", "eieren", "eigeel", "eiwit", "mozzarella", "parmezaan", "feta", "creme", "mascarpone", "vla", "pudding"]],
        ["Groenten & fruit", ["ui", "uien", "sjalot", "knoflook", "wortel", "prei", "paprika", "tomaat", "tomaten", "komkommer", "sla", "appel", "peer", "peren", "banaan", "banan", "ananas", "citroen", "limoen", "sinaasappel", "mandarijn", "aardappel", "kool", "bloemkool", "spitskool", "spinazie", "boon", "bonen", "erwt", "courgette", "aubergine", "champignon", "paddenstoel", "peterselie", "bieslook", "selder", "koolrabi", "bleekselderij", "venkel", "pompoen", "rabarber", "aardbei", "framboos", "bosbes", "perzik", "abrikoos", "pruim", "kers", "mango", "meloen", "druif", "druiven", "dadel", "radijs", "biet", "witloof", "andijve", "broccoli", "asperge", "artisjok", "olijf", "olijven", "mais", "schorseneren", "pastinaak", "knolselder", "rucola", "veldsalade", "waterkers", "dille", "basilicum", "tijm", "rozemarijn", "salie", "munt", "oregano", "laurier", "kervel", "gember", "rozijn", "vrucht", "vruchten", "fruit"]],
        ["Droge waren, kruiden & oliën", ["bloem", "meel", "rijst", "pasta", "spaghetti", "macaroni", "noedel", "couscous", "bulgur", "quinoa", "linze", "griesmeel", "maizena", "zetmeel", "suiker", "zout", "peper", "bouillon", "fond", "azijn", "olie", "mosterd", "kerrie", "curry", "nootmuskaat", "kaneel", "kruidnagel", "kardemom", "komijn", "koriander", "chilipoeder", "cayenne", "gelatine", "chocolade", "cacao", "noot", "noten", "amandel", "walnoot", "hazelnoot", "pinda", "kokos", "honing", "stroop", "siroop", "jam", "confituur", "ketchup", "mayonaise", "gist", "bakpoeder", "vanille", "custard", "paneermeel", "brood", "beschuit", "koek", "speculaas", "wijn", "bier", "rum", "cognac", "likeur", "water", "thee", "koffie", "sap", "pesto", "pickles", "piccalilly", "augurk", "kappertjes", "specerij", "kruiden", "zonnebloemolie", "olijfolie", "arachideolie", "slaolie", "frituurolie", "tortilla", "wrap", "puntje", "puntjes", "pistolet", "baguette", "tabasco", "worcester", "balsamico"]],
    ];

    const zonderAccent = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

    // Per groep een zoekpatroon. \b = begin van een woord.
    const ontsnap = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const PATRONEN = GROEPEN.map(([groep, stammen]) =>
        [groep, new RegExp("\\b(?:" + stammen.map(ontsnap).join("|") + ")", "i")]);

    function productgroep(naam) {
        const n = zonderAccent(naam);
        for (const [groep, patroon] of PATRONEN) if (patroon.test(n)) return groep;
        return "Overig";
    }
    const GROEPORDE = GROEPEN.map((g) => g[0]).concat(["Overig"]);

    // ---------------------------------------------------------
    // 3b. Productnamen opschonen en synoniemen samenvoegen
    //     (de tabellen staan in producten.js)
    // ---------------------------------------------------------
    const SYNONIEMEN = window.SYNONIEMEN || [];
    const APART = new Set((window.APART || []).map(zonderAccent));

    // Alle woorden die niets zeggen over WELK product je moet bestellen.
    const WEG = new Set([].concat(window.BEWERKINGEN || [], window.MAATWOORDEN || [], window.VULWOORDEN || [])
        .map(zonderAccent).filter((w) => w.indexOf(" ") === -1));
    // Uitdrukkingen van meer dan een woord ("naar smaak") gaan er in hun geheel uit.
    const WEG_LANG = [].concat(window.BEWERKINGEN || [], window.MAATWOORDEN || [], window.VULWOORDEN || [])
        .map(zonderAccent).filter((w) => w.indexOf(" ") > -1);

    // ---------------------------------------------------------
    // Van een naam naar een WOORDENSET
    // ---------------------------------------------------------
    // "Peper en zout naar smaak" en "Zout en peper" worden allebei
    // "peper zout": haakjes, cijfers, maten en bewerkingen eruit, de rest
    // op alfabetische volgorde. Zo maakt de volgorde van de woorden niet
    // meer uit en vallen schrijfwijzen vanzelf samen.
    function schoonNaam(naam) {
        let x = zonderAccent(naam)
            .replace(/\([^)]*\)/g, " ")          // (gember), (ca. 30 ml)
            .replace(/\d+(?![+%])/g, " ");        // losse cijfers; "48+" blijft staan
        WEG_LANG.forEach((w) => { x = x.split(w).join(" "); });
        const w = x.split(/[^a-z0-9+%]+/).filter((d) => d.length > 1 && !WEG.has(d));
        return [...new Set(w)].sort().join(" ");
    }

    // variant -> naam zoals hij op de lijst moet komen (zelfde bewerking)
    const NAAR_NAAM = new Map();
    SYNONIEMEN.forEach((g) => g.varianten.forEach((v) => {
        const sl = schoonNaam(v);
        if (sl) NAAR_NAAM.set(sl, g.naam);
    }));

    // Enkelvoud/meervoud alleen samenvoegen als BEIDE vormen in deze lijst
    // voorkomen. "Ui" en "Uien" dus wel; een los meervoud blijft zoals het is.
    function enkelvoud(basis, woordenInLijst) {
        if (APART.has(basis)) return basis;
        const uit = basis.split(" ").map((woord) => {
            for (const achtervoegsel of ["en", "s", "n"]) {
                if (woord.length > achtervoegsel.length + 2 && woord.endsWith(achtervoegsel)) {
                    const korter = woord.slice(0, -achtervoegsel.length);
                    if (woordenInLijst.has(korter)) return korter;
                }
            }
            return woord;
        });
        const nieuw = [...new Set(uit)].sort().join(" ");
        return APART.has(nieuw) ? basis : nieuw;
    }

    // ---------------------------------------------------------
    // 4. Recepten klaarzetten
    // ---------------------------------------------------------
    // De receptendata (1,15 MB) wordt pas geladen als iemand de bestellijst
    // of het tabblad Recepten opent. Daarom staan deze twee hier nog leeg.
    let ALLE = [];
    let PER_ID = {};
    function koppelData() {
        ALLE = (window.RECEPTEN || []).slice();
        PER_ID = Object.fromEntries(ALLE.map((r) => [r.id, r]));
        keuze = keuze.filter((k) => PER_ID[k.id]);     // weggevallen recept ook van de lijst
    }

    // Hoeveel porties levert 1x op? Staat het niet in het boek, dan null.
    function portiesPerKeer(recept) {
        const m = String(recept.servings || "").match(/(\d+)\s*personen/i);
        return m ? parseInt(m[1], 10) : null;
    }
    function basisTekst(recept) {
        const p = portiesPerKeer(recept);
        return p ? T().basisPorties(p) : T().basisBron;
    }

    // ---------------------------------------------------------
    // 5. Keuze bewaren op het toestel
    // ---------------------------------------------------------
    let keuze = [];          // [{ id, keer }]
    let perGroep = true;     // sortering van de lijst
    let toonHerkomst = false; // "uit: recept" bij elke regel tonen
    let samenvoegen = true;   // verschillende namen voor hetzelfde product optellen
    let geschrapt = [];       // producten die je zelf van de lijst hebt gehaald (al in voorraad)
    let handmatig = [];       // producten die je zelf hebt toegevoegd

    function bewaar() {
        try { localStorage.setItem(SLEUTEL, JSON.stringify({ keuze, perGroep, toonHerkomst, samenvoegen, geschrapt, handmatig })); } catch (e) {}
    }
    function herstel() {
        try {
            const o = JSON.parse(localStorage.getItem(SLEUTEL));
            if (o && Array.isArray(o.keuze)) keuze = o.keuze.filter((k) => k && k.id);
            if (o && typeof o.perGroep === "boolean") perGroep = o.perGroep;
            if (o && typeof o.toonHerkomst === "boolean") toonHerkomst = o.toonHerkomst;
            if (o && typeof o.samenvoegen === "boolean") samenvoegen = o.samenvoegen;
            if (o && Array.isArray(o.geschrapt)) geschrapt = o.geschrapt;
            if (o && Array.isArray(o.handmatig)) handmatig = o.handmatig;
        } catch (e) {}
    }

    // ---------------------------------------------------------
    // 6. De bestellijst samenstellen
    // ---------------------------------------------------------
    function bouwLijst() {
        const ruw = [];      // alle losse regels uit de gekozen recepten
        const vrij = new Map();

        keuze.forEach(({ id, keer }) => {
            const r = PER_ID[id];
            if (!r) return;
            const maal = Number(keer) > 0 ? Number(keer) : 1;
            (r.ingredients || []).forEach((rij) => {
                const naam = String(rij[0] || "").trim();
                if (!naam) return;
                const aantal = naarGetal(rij[1]);
                const m = maat(rij[2]);

                if (aantal == null) {                                   // niet af te wegen
                    const sl = samenvoegen ? (NAAR_NAAM.get(schoonNaam(naam)) || schoonNaam(naam)) : zonderAccent(naam);
                    if (!vrij.has(sl)) vrij.set(sl, { naam, uit: new Set(), namen: new Set() });
                    vrij.get(sl).uit.add(r.name);
                    vrij.get(sl).namen.add(naam);
                    return;
                }
                const schoon = schoonNaam(naam);
                ruw.push({
                    naam, stam: schoon,
                    basis: samenvoegen ? (NAAR_NAAM.has(schoon) ? "@" + NAAR_NAAM.get(schoon) : schoon) : zonderAccent(naam),
                    soort: m.soort,
                    hoeveelheid: aantal * m.factor * maal,
                    uit: r.name
                });
            });
        });

        // Enkelvoud/meervoud pas nu, want daarvoor moet je de hele lijst kennen
        const woordenInLijst = new Set();
        ruw.forEach((x) => { if (x.basis[0] !== "@") x.basis.split(" ").forEach((w) => woordenInLijst.add(w)); });
        if (samenvoegen) ruw.forEach((x) => { if (x.basis[0] !== "@") x.basis = enkelvoud(x.basis, woordenInLijst); });

        // Optellen: zelfde product EN zelfde soort eenheid
        const samen = new Map();
        ruw.forEach((x) => {
            const sleutel = x.basis + "|" + x.soort;
            if (!samen.has(sleutel)) samen.set(sleutel, { basis: x.basis, soort: x.soort, totaal: 0, uit: new Set(), namen: new Map(), stammen: new Set() });
            const regel = samen.get(sleutel);
            regel.totaal += x.hoeveelheid;
            regel.uit.add(x.uit);
            regel.namen.set(x.naam, (regel.namen.get(x.naam) || 0) + 1);
            regel.stammen.add(x.stam);
        });

        let regels = [...samen.values()].map((regel) => {
            const gesorteerd = [...regel.namen.entries()].sort((a, b) => b[1] - a[1]).map((e) => e[0]);
            const naam = regel.basis[0] === "@" ? regel.basis.slice(1) : gesorteerd[0];
            const t = schrijf(regel.totaal, regel.soort);
            return {
                groep: productgroep(naam), naam, basis: regel.basis.replace(/^@/, ""), stammen: [...regel.stammen],
                hoeveelheid: t.h, eenheid: t.e,
                ook: gesorteerd.filter((n) => !zonderAccent(naam).includes(zonderAccent(n))),
                uit: [...regel.uit], vrij: false
            };
        });

        let vrije = [...vrij.values()].map((v) => {
            const namen = [...v.namen];
            const naam = NAAR_NAAM.get(schoonNaam(v.naam)) || namen[0];
            return { groep: productgroep(naam), naam, basis: schoonNaam(naam), stammen: [schoonNaam(naam)], hoeveelheid: "", eenheid: "",
                     ook: namen.filter((n) => !zonderAccent(naam).includes(zonderAccent(n))), uit: [...v.uit], vrij: true };
        });

        // Zelf toegevoegde producten erbij, zelf geschrapte eruit.
        handmatig.forEach((h, i) => regels.push({
            groep: productgroep(h.naam), naam: h.naam, basis: "eigen-" + i, stammen: [],
            hoeveelheid: h.hoeveelheid, eenheid: h.eenheid, ook: [], uit: [T().zelfToegevoegd],
            vrij: !h.hoeveelheid, eigen: true
        }));
        const weg = new Set(geschrapt);
        const verborgen = regels.filter((r) => weg.has(r.basis)).length +
                          vrije.filter((r) => weg.has(r.basis)).length;
        regels = regels.filter((r) => !weg.has(r.basis));
        vrije = vrije.filter((r) => !weg.has(r.basis));

        // Wat je zelf even moet nakijken:
        //  a) namen die op elkaar lijken maar apart zijn gebleven;
        //  b) hetzelfde product dat in twee eenheden is opgegeven.
        const alles = regels.concat(vrije);
        const opletten = [];
        const gezien = new Set();
        function meld(tekst, kenmerk) {
            const sl = kenmerk || tekst;
            if (gezien.has(sl)) return;
            gezien.add(sl);
            opletten.push(tekst);
        }
        const woordenVan = (r) => [...new Set((r.stammen || []).join(" ").split(" ").filter(Boolean))];

        // c) In de boeken staan soms twee producten op een regel, met maar
        //    een hoeveelheid erbij ("Zout, peper en nootmuskaat"). Dat kan de
        //    app niet uit elkaar halen, dus wijzen we het alleen aan.
        const losseProducten = new Set(alles.map((r) => r.basis).filter((b) => b && b.indexOf(" ") === -1));
        const gecombineerd = new Set();
        alles.forEach((r) => {
            if (!r.basis || r.basis.indexOf(" ") === -1) return;
            const raak = r.basis.split(" ").filter((w) => losseProducten.has(w));
            if (raak.length >= 2) {
                gecombineerd.add(r.basis);
                meld(T().meerProducten(r.naam));
            }
        });

        for (let i = 0; i < alles.length; i++) {
            for (let j = i + 1; j < alles.length; j++) {
                const A = alles[i], B = alles[j];
                if (A.naam === B.naam) {
                    if (!A.vrij && !B.vrij && A.eenheid !== B.eenheid)
                        meld(T().tweeEenheden(A.naam, A.eenheid, B.eenheid));
                    continue;
                }
                // Is de een een onderdeel van een gecombineerde regel van de ander?
                // Dan is dat al gemeld; niet nog eens.
                const deelVan = (x, y) => gecombineerd.has(y.basis) && y.basis.split(" ").indexOf(x.basis) > -1;
                if (deelVan(A, B) || deelVan(B, A)) continue;

                // Per WOORD vergelijken, niet op losse letters: anders lijkt
                // "gezouten spek" op "zout" en dat slaat nergens op.
                let raak = false;
                woordenVan(A).forEach((a) => woordenVan(B).forEach((b) => {
                    if (a === b) { if (a.length >= 5 || losseProducten.has(a)) raak = true; return; }
                    const kort = a.length < b.length ? a : b, lang = a.length < b.length ? b : a;
                    if (kort.length >= 5 && lang.startsWith(kort)) raak = true;   // gember / gemberwortel
                    let n = 0; while (n < a.length && n < b.length && a[n] === b[n]) n++;
                    if (n >= 7) raak = true;                                      // citroensap / citroenschil
                }));
                if (raak) meld(`${A.naam} \u2194 ${B.naam}`, [A.naam, B.naam].sort().join("|"));
            }
        }

        return { regels, vrije, opletten, verborgen };
    }

    // ---------------------------------------------------------
    // 7. Tekenen
    // ---------------------------------------------------------
    const $ = (id) => document.getElementById(id);
    const veilig = (s) => String(s).replace(/[&<>"]/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[t]));

    function vulGroepen() {
        const groepen = [...new Set(ALLE.map((r) => r.group).filter(Boolean))].sort();
        const tel = (g) => ALLE.filter((r) => r.group === g).length;
        $("blGroep").innerHTML = `<option value="">${veilig(T().alleGroepen)}</option>` +
            groepen.map((g) => `<option value="${veilig(g)}">${veilig(receptGroep(g))} (${tel(g)})</option>`).join("");
        // Zodat er bij het openen meteen iets te kiezen valt
        $("blChips").innerHTML = groepen.map((g) =>
            `<button type="button" class="bl-chip" data-groep="${veilig(g)}">${veilig(receptGroep(g))} <small>${tel(g)}</small></button>`).join("");
    }

    function merkChip() {
        const g = $("blGroep").value;
        [...$("blChips").children].forEach((c) => c.classList.toggle("aan", c.dataset.groep === g));
    }

    function tekenResultaten() {
        const zoek = zonderAccent($("blZoek").value.trim());
        const groep = $("blGroep").value;
        const ul = $("blResultaten");

        if (!zoek && !groep) { ul.innerHTML = ""; return; }
        let treffers = ALLE.filter((r) => {
            if (groep && r.group !== groep) return false;
            if (!zoek) return true;
            return zonderAccent(r.name).includes(zoek) || zonderAccent(r.category || "").includes(zoek);
        });
        const totaal = treffers.length;
        treffers = treffers.slice(0, 60);

        if (!totaal) { ul.innerHTML = `<li class="bl-geen">${veilig(T().geenRecept)}</li>`; return; }
        ul.innerHTML = treffers.map((r) => `<li><button type="button" class="bl-res" data-id="${veilig(r.id)}">
            <span class="plus" aria-hidden="true">+</span>
            <span class="wat"><span class="naam">${veilig(r.name)}</span>
            <span class="bron">${veilig(receptGroep(r.group || ""))}${r.book ? " · " + veilig(r.book) : ""}${r.page ? ", " + veilig(T().blz) + " " + veilig(r.page) : ""} · ${veilig(basisTekst(r))}</span></span>
            </button></li>`).join("") +
            (totaal > treffers.length ? `<li class="bl-geen">${veilig(T().meerTreffers(totaal - treffers.length))}</li>` : "");
    }

    function tekenGekozen() {
        const doel = $("blGekozen");
        const hint = $("blGekozenHint");
        if (!keuze.length) {
            doel.innerHTML = "";
            hint.textContent = T().nietsGekozen;
            return;
        }
        hint.textContent = T().vulIn;
        doel.innerHTML = `<table class="bl-tabel"><thead><tr>
            <th>${veilig(T().kolRecept)}</th><th>${veilig(T().kolHoeVaak)}</th><th>${veilig(T().kolLevertOp)}</th><th aria-label="${veilig(T().verwijderen)}"></th>
            </tr></thead><tbody>` + keuze.map(({ id, keer }) => {
            const r = PER_ID[id];
            const p = portiesPerKeer(r);
            const maal = Number(keer) > 0 ? Number(keer) : 1;
            return `<tr>
                <td><span class="r-naam">${veilig(r.name)}</span>
                    <span class="r-bron">${veilig(receptGroep(r.group || ""))}${r.book ? " · " + veilig(r.book) : ""} · ${veilig(basisTekst(r))}</span></td>
                <td><input type="number" min="1" step="1" value="${maal}" data-keer="${veilig(id)}" aria-label="${veilig(T().hoeVaakLabel(r.name))}"> &times;</td>
                <td class="bl-porties">${p
                    ? `<b>${veilig(T().porties(maal * p))}</b><small>${veilig(T().keerMaal(maal, p))}</small>`
                    : `<b>${veilig(T().bereidingen(maal))}</b><small>${veilig(T().geenPorties)}</small>`}</td>
                <td><button type="button" class="bl-weg" data-weg="${veilig(id)}" aria-label="${veilig(T().verwijderLabel(r.name))}">&times;</button></td>
            </tr>`;
        }).join("") + "</tbody></table>";
    }

    function tekenLijst() {
        const doel = $("blLijst");
        const knopPrint = $("blPrint"), knopCsv = $("blCsv");
        $("blSorteer").textContent = T().sortering(perGroep ? T().perGroep : T().alfabetisch);
        $("blHerkomst").checked = toonHerkomst;
        $("blSamenvoegen").checked = samenvoegen;

        if (!keuze.length) {
            doel.innerHTML = `<p class="bl-leeg">${veilig(T().kiesEerst)}</p>`;
            $("blTelling").textContent = "";
            knopPrint.hidden = knopCsv.hidden = true;
            return;
        }
        const { regels, vrije, opletten, verborgen } = bouwLijst();
        knopPrint.hidden = knopCsv.hidden = !(regels.length || vrije.length);
        $("blTelling").textContent = T().telling(regels.length) + (vrije.length ? T().tellingVrij(vrije.length) : "");

        const regelHtml = (r) => `<li class="bl-regel${r.eigen ? " eigen" : ""}"><span class="bl-vak" aria-hidden="true"></span>
            <span class="ing">${veilig(r.naam)}${r.eigen ? `<small class="ook">${veilig(T().zelfToegevoegd)}</small>` : ""}${r.ook && r.ook.length ? `<small class="ook">${veilig(T().ookGeteld)} ${veilig(r.ook.join(", "))}</small>` : ""}<small class="${toonHerkomst ? "" : "verborgen"}">${veilig(T().uitRecept)} ${veilig(r.uit.join(", "))}</small></span>
            <span class="hoev${r.vrij ? " vrij" : ""}">${r.vrij ? veilig(T().naarSmaak) : veilig(r.hoeveelheid + (r.eenheid ? " " + r.eenheid : ""))}</span>
            <button type="button" class="bl-schrap bl-niet-printen" data-schrap="${veilig(r.basis)}" aria-label="${veilig(T().vanLijstLabel(r.naam))}" title="${veilig(T().vanLijst)}">&times;</button></li>`;

        let html = '<div class="bl-lijst-kolommen">';
        if (perGroep) {
            GROEPORDE.forEach((g) => {
                const inGroep = regels.filter((r) => r.groep === g).sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
                if (!inGroep.length) return;
                html += `<div class="bl-groep"><h3>${veilig(groepNaam(g))}</h3><ul class="bl-regels">${inGroep.map(regelHtml).join("")}</ul></div>`;
            });
        } else {
            const op = regels.slice().sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
            html += `<div class="bl-groep"><h3>${veilig(T().alleArtikelen)}</h3><ul class="bl-regels">${op.map(regelHtml).join("")}</ul></div>`;
        }
        if (vrije.length) {
            const op = vrije.slice().sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
            html += `<div class="bl-groep"><h3>${veilig(T().groepVrij)}</h3><ul class="bl-regels">${op.map(regelHtml).join("")}</ul></div>`;
        }
        html += "</div>";
        if (opletten.length) {
            const paren = opletten.slice(0, 15);
            html += `<div class="bl-oppassen bl-niet-printen"><b>${veilig(T().letOpKop)}</b> ${veilig(T().letOp)}
                <ul>${paren.map((p) => `<li>${veilig(p)}</li>`).join("")}</ul>
                ${opletten.length > paren.length ? `<p>${veilig(T().letOpMeer(opletten.length - paren.length))}</p>` : ""}
                ${veilig(T().letOpSlot)}</div>`;
        }
        if (verborgen) {
            html += `<p class="bl-verborgen bl-niet-printen">${veilig(T().geschrapt(verborgen))}
                <button type="button" class="bl-tekstknop" id="blToonWeer">${veilig(T().weerTonen)}</button></p>`;
        }
        doel.innerHTML = html;

        // Kop voor het afdrukken
        const nu = new Date();
        const datum = nu.toLocaleDateString(T().datumTaal, { day: "2-digit", month: "long", year: "numeric" });
        $("blAfdrukInfo").textContent = T().opgemaakt(datum) + keuze.map(({ id, keer }) => {
            const r = PER_ID[id], p = portiesPerKeer(r), maal = Number(keer) > 0 ? Number(keer) : 1;
            return `${r.name} ${maal}×${p ? " (" + T().porties(maal * p) + ")" : ""}`;
        }).join(" · ");
    }

    function tekenAlles() {
        if (skeletKlaar) { tekenGekozen(); tekenLijst(); }
        bewaar();
        if (typeof window.BESTELLIJST.bijWijziging === "function") window.BESTELLIJST.bijWijziging();
    }

    // ---------------------------------------------------------
    // 8. Excel-bestand (CSV) maken
    // ---------------------------------------------------------
    function csv() {
        const { regels, vrije } = bouwLijst();
        const rij = (velden) => velden.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";");
        const uit = [rij(T().csvKolommen)];
        const alles = (perGroep
            ? GROEPORDE.flatMap((g) => regels.filter((r) => r.groep === g).sort((a, b) => a.naam.localeCompare(b.naam, "nl")))
            : regels.slice().sort((a, b) => a.naam.localeCompare(b.naam, "nl"))
        ).concat(vrije.slice().sort((a, b) => a.naam.localeCompare(b.naam, "nl")));
        alles.forEach((r) => uit.push(rij([groepNaam(r.groep), r.naam, r.vrij ? T().naarSmaak : r.hoeveelheid, r.vrij ? "" : (r.eenheid || T().stuks), (r.ook || []).join(", "), r.uit.join(", ")])));

        uit.push("");
        uit.push(rij(T().csvRecepten.concat(["", "", ""])));
        keuze.forEach(({ id, keer }) => {
            const r = PER_ID[id], p = portiesPerKeer(r), maal = Number(keer) > 0 ? Number(keer) : 1;
            uit.push(rij([r.name, maal + "×", p ? T().porties(maal * p) : T().volgensBron, r.book || "", r.page ? T().blz + " " + r.page : "", ""]));
        });

        // ﻿ zodat Excel de accenten goed leest; puntkomma's omdat Excel hier met komma's rekent
        const blob = new Blob(["﻿" + uit.join("\r\n")], { type: "text/csv;charset=utf-8" });
        const a = document.createElement("a");
        const d = new Date();
        a.href = URL.createObjectURL(blob);
        a.download = `${T().bestandsnaam}-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.csv`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }

    // ---------------------------------------------------------
    // 9. Het scherm opbouwen en de knoppen aansluiten
    // ---------------------------------------------------------
    let skeletKlaar = false;

    function bouwSkelet(doel) {
        const t = T();
        doel.innerHTML = `
        <div class="bl-wrap">
            <div class="bl-afdrukkop">
                <h1>${t.printKop}</h1>
                <p id="blAfdrukInfo"></p>
            </div>

            <section class="bl-kaart bl-niet-printen">
                <div class="bl-let">
                    <b>${t.uitlegKop}</b> ${t.uitleg}
                    <ul>
                        <li>${t.uitlegPorties}</li>
                        <li>${t.uitlegBron}</li>
                        ${t.bronTaal ? `<li>${t.bronTaal}</li>` : ""}
                    </ul>
                </div>

                <h2><span class="nr">1</span>${t.stap1}</h2>
                <p class="bl-hint">${t.stap1Hint}</p>
                <div class="bl-zoekrij">
                    <input id="blZoek" type="search" placeholder="${t.zoek}" autocomplete="off" aria-label="${t.zoekLabel}">
                    <select id="blGroep" aria-label="${t.hoofdgroep}"></select>
                </div>
                <div class="bl-chips" id="blChips"></div>
                <ul id="blResultaten" aria-label="${t.resultaten}"></ul>
            </section>

            <section class="bl-kaart bl-niet-printen">
                <h2><span class="nr">2</span>${t.stap2}</h2>
                <p class="bl-hint" id="blGekozenHint">${t.nietsGekozen}</p>
                <div id="blGekozen"></div>
            </section>

            <section class="bl-kaart">
                <div class="bl-kop-lijst">
                    <h2><span class="nr bl-niet-printen">3</span>${t.stap3}</h2>
                    <p class="bl-telling" id="blTelling"></p>
                </div>
                <div class="bl-knoppen">
                    <button type="button" class="bl-btn" id="blPrint" hidden>
                        <svg viewBox="0 0 24 24"><path d="M7 8V4h10v4M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="6" rx="1"/></svg>
                        ${t.afdrukken}
                    </button>
                    <button type="button" class="bl-btn" id="blCsv" hidden>
                        <svg viewBox="0 0 24 24"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 19h16"/></svg>
                        ${t.excel}
                    </button>
                    <button type="button" class="bl-btn zacht" id="blSorteer"></button>
                    <button type="button" class="bl-btn zacht" id="blWis">${t.wissen}</button>
                </div>
                <label class="bl-optie bl-niet-printen"><input type="checkbox" id="blSamenvoegen" checked> ${t.optieSamen}</label>
                <label class="bl-optie bl-niet-printen"><input type="checkbox" id="blHerkomst"> ${t.optieHerkomst}</label>
                <div class="bl-eigen bl-niet-printen">
                    <input id="blEigenNaam" type="text" placeholder="${t.eigenNaam}" aria-label="${t.eigenLabel}">
                    <input id="blEigenAantal" type="text" inputmode="decimal" placeholder="${t.eigenAantal}" aria-label="${t.aantalLabel}">
                    <select id="blEigenEenheid" aria-label="${t.eenheidLabel}">
                        <option value="stuks">${t.stuks}</option><option value="g">g</option><option value="kg">kg</option>
                        <option value="ml">ml</option><option value="l">l</option><option value="">${t.geenEenheid}</option>
                    </select>
                    <button type="button" class="bl-btn zacht" id="blEigenToe">${t.eigenToe}</button>
                </div>
                <div id="blLijst"><p class="bl-leeg">${veilig(t.kiesEerst)}</p></div>
            </section>
        </div>`;
        koppelKnoppen();
        skeletKlaar = true;
    }

    function voegToe(id, keer) {
        if (!PER_ID[id]) return;
        const bestaat = keuze.find((k) => k.id === id);
        if (bestaat) bestaat.keer = Number(bestaat.keer || 1) + (keer || 1);
        else keuze.push({ id, keer: keer || 1 });
        tekenAlles();
    }

    // Alleen het getal "levert op" bijwerken, zodat het invoerveld de focus houdt
    function tekenPorties(veld, k) {
        const cel = veld.closest("tr") && veld.closest("tr").querySelector(".bl-porties");
        if (!cel) return;
        const r = PER_ID[k.id], p = portiesPerKeer(r), maal = k.keer;
        cel.innerHTML = p ? `<b>${veilig(T().porties(maal * p))}</b><small>${veilig(T().keerMaal(maal, p))}</small>`
            : `<b>${veilig(T().bereidingen(maal))}</b><small>${veilig(T().geenPorties)}</small>`;
    }

    function koppelKnoppen() {
        $("blZoek").addEventListener("input", tekenResultaten);
        $("blGroep").addEventListener("change", () => { merkChip(); tekenResultaten(); });
        $("blChips").addEventListener("click", (e) => {
            const c = e.target.closest("[data-groep]");
            if (!c) return;
            const g = $("blGroep");
            g.value = g.value === c.dataset.groep ? "" : c.dataset.groep;   // nog eens tikken = weer uit
            merkChip(); tekenResultaten();
        });
        $("blResultaten").addEventListener("click", (e) => {
            const b = e.target.closest("[data-id]");
            if (b) voegToe(b.dataset.id);
        });
        $("blGekozen").addEventListener("click", (e) => {
            const w = e.target.closest("[data-weg]");
            if (w) { keuze = keuze.filter((k) => k.id !== w.dataset.weg); tekenAlles(); }
        });
        $("blGekozen").addEventListener("input", (e) => {
            const v = e.target.closest("[data-keer]");
            if (!v) return;
            const k = keuze.find((x) => x.id === v.dataset.keer);
            if (k) { k.keer = Math.max(1, Math.round(Number(v.value) || 1)); tekenLijst(); bewaar(); tekenPorties(v, k);
                     if (typeof window.BESTELLIJST.bijWijziging === "function") window.BESTELLIJST.bijWijziging(); }
        });
        $("blPrint").addEventListener("click", () => window.print());
        $("blCsv").addEventListener("click", csv);
        $("blSorteer").addEventListener("click", () => { perGroep = !perGroep; tekenLijst(); bewaar(); });
        $("blHerkomst").addEventListener("change", (e) => { toonHerkomst = e.target.checked; tekenLijst(); bewaar(); });
        $("blSamenvoegen").addEventListener("change", (e) => { samenvoegen = e.target.checked; tekenLijst(); bewaar(); });
        // Een product van de lijst halen (heb ik al in voorraad) en terughalen
        $("blLijst").addEventListener("click", (e) => {
            const sch = e.target.closest("[data-schrap]");
            if (sch) {
                const b = sch.dataset.schrap;
                if (b.indexOf("eigen-") === 0) handmatig.splice(Number(b.slice(6)), 1);
                else if (geschrapt.indexOf(b) === -1) geschrapt.push(b);
                tekenLijst(); bewaar(); return;
            }
            if (e.target.closest("#blToonWeer")) { geschrapt = []; tekenLijst(); bewaar(); }
        });

        // Zelf een artikel toevoegen
        function eigenToe() {
            const naam = $("blEigenNaam").value.trim();
            if (!naam) { $("blEigenNaam").focus(); return; }
            handmatig.push({
                naam,
                hoeveelheid: $("blEigenAantal").value.trim().replace(".", ","),
                eenheid: $("blEigenEenheid").value
            });
            $("blEigenNaam").value = ""; $("blEigenAantal").value = "";
            tekenLijst(); bewaar(); $("blEigenNaam").focus();
        }
        $("blEigenToe").addEventListener("click", eigenToe);
        $("blEigenNaam").addEventListener("keydown", (e) => { if (e.key === "Enter") eigenToe(); });
        $("blEigenAantal").addEventListener("keydown", (e) => { if (e.key === "Enter") eigenToe(); });

        $("blWis").addEventListener("click", () => {
            if (keuze.length && !confirm(T().wisVraag)) return;
            keuze = []; geschrapt = []; handmatig = []; tekenAlles();
        });
    }

    // ---------------------------------------------------------
    // Taal wisselen: het scherm staat vol tekst, dus opnieuw opbouwen.
    // De knoppen worden daarbij vanzelf weer aangesloten.
    // ---------------------------------------------------------
    function hertaal() {
        if (!skeletKlaar) return;
        const doel = document.getElementById("bestellijstView");
        if (!doel) return;
        bouwSkelet(doel);
        if (ALLE.length) vulGroepen();
        tekenAlles();
    }
    // setTimeout: app.js bewaart de nieuwe taal in dezelfde klik, dus wij
    // wachten tot die klaar is voordat we opnieuw tekenen.
    document.querySelectorAll(".lang-btn").forEach((b) =>
        b.addEventListener("click", () => setTimeout(hertaal, 0)));

    // ---------------------------------------------------------
    // 10. Naar buiten toe
    // ---------------------------------------------------------
    herstel();                       // keuze meteen terug, ook zonder receptendata

    window.BESTELLIJST = {
        // Scherm opbouwen en tonen. De receptendata moet al geladen zijn.
        open: function (doel) {
            doel = doel || document.getElementById("bestellijstView");
            if (!doel) return;
            koppelData();
            if (!skeletKlaar) bouwSkelet(doel);
            if (!ALLE.length) {
                $("blLijst").innerHTML = `<p class="bl-leeg">${veilig(T().nietGeladen)}</p>`;
                return;
            }
            vulGroepen();
            tekenAlles();
        },
        // Vanaf een recept toevoegen (de knop onder het recept)
        voegToe: function (id, keer) { koppelData(); voegToe(id, keer); },
        // Hoe vaak staat dit recept op de lijst? 0 = er niet op
        aantalVoor: function (id) { const k = keuze.find((x) => x.id === id); return k ? Number(k.keer) || 1 : 0; },
        // Hoeveel recepten staan er in totaal op? (voor het tellertje op de tabknop)
        aantal: function () { return keuze.length; },
        // De app mag hier een functie in zetten die bij elke wijziging draait
        bijWijziging: null
    };

    // Losse testpagina bestellijst.html: meteen opbouwen.
    if (window.BL_LOSSE_PAGINA) window.BESTELLIJST.open();
})();
