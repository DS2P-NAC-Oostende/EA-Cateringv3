// =============================================================
// Omrekenen — EA Catering V3
// -------------------------------------------------------------
// LEERMODUS - wat gebeurt hier?
// 1. Dit bestand hangt zichzelf in de pagina: het zet een knop in de
//    kopbalk en bouwt een paneel dat eroverheen schuift. Het raakt
//    geen enkel ander bestand aan, dus het kan nooit de video's of
//    de recepten stukmaken.
// 2. Drie onderdelen: Maten (gewicht, inhoud, cups, el/tl),
//    Temperatuur (°C, °F, thermostaat, gasstand) en Porties.
// 3. Van inhoud naar gewicht kan alleen MET een ingrediënt: een cup
//    bloem weegt 125 gram, een cup honing 340 gram. Daarom staat er
//    een lijst met de dichtheid (gram per milliliter) per product.
//    Die waarden zijn richtwaarden; afwegen blijft nauwkeuriger.
// 4. Drietalig (NL/FR/EN), zelfde taalkeuze als de rest van de app
//    (localStorage "nac-lang"), en de knoppen schakelen mee.
// 5. Met ?omrekenen=1 in het adres gaat het paneel direct open.
// =============================================================

(function () {
    "use strict";

    const OPSLAG = "eac-v3-om-";          // eigen voorvoegsel: niet in de weg van de andere apps

    // ===== EENHEDEN =====
    // f = hoeveel gram (soort "gewicht") of hoeveel milliliter (soort "inhoud") er in één eenheid gaat.
    // De Nederlandse maatlepel is precies 15 en 5 ml; de Amerikaanse tablespoon en teaspoon
    // zijn iets kleiner. Beide staan er daarom apart in. Cup = 240 ml (de maat die op
    // Amerikaanse recepten en maatbekers staat).
    const EENHEDEN = {
        g:     { soort: "gewicht", f: 1 },
        kg:    { soort: "gewicht", f: 1000 },
        oz:    { soort: "gewicht", f: 28.3495 },
        lb:    { soort: "gewicht", f: 453.592 },
        ml:    { soort: "inhoud", f: 1 },
        cl:    { soort: "inhoud", f: 10 },
        dl:    { soort: "inhoud", f: 100 },
        l:     { soort: "inhoud", f: 1000 },
        el:    { soort: "inhoud", f: 15 },
        tl:    { soort: "inhoud", f: 5 },
        cup:   { soort: "inhoud", f: 240 },
        tbsp:  { soort: "inhoud", f: 14.7868 },
        tsp:   { soort: "inhoud", f: 4.9289 },
        floz:  { soort: "inhoud", f: 29.5735 },
        pint:  { soort: "inhoud", f: 473.176 },
        quart: { soort: "inhoud", f: 946.353 }
    };

    // ===== DICHTHEID: gram per milliliter =====
    // Richtwaarden voor losgeschepte, niet aangedrukte producten.
    const PRODUCTEN = [
        { g: "vloeibaar", d: 1.00, nl: "Water of bouillon", fr: "Eau ou bouillon", en: "Water or stock" },
        { g: "vloeibaar", d: 1.03, nl: "Melk", fr: "Lait", en: "Milk" },
        { g: "vloeibaar", d: 1.03, nl: "Karnemelk of yoghurt", fr: "Babeurre ou yaourt", en: "Buttermilk or yoghurt" },
        { g: "vloeibaar", d: 0.99, nl: "Room of slagroom", fr: "Crème", en: "Cream" },
        { g: "vloeibaar", d: 0.92, nl: "Olie", fr: "Huile", en: "Oil" },
        { g: "vloeibaar", d: 0.91, nl: "Gesmolten boter", fr: "Beurre fondu", en: "Melted butter" },
        { g: "vloeibaar", d: 1.01, nl: "Azijn", fr: "Vinaigre", en: "Vinegar" },
        { g: "vloeibaar", d: 0.99, nl: "Wijn", fr: "Vin", en: "Wine" },
        { g: "vloeibaar", d: 1.20, nl: "Sojasaus", fr: "Sauce soja", en: "Soy sauce" },
        { g: "vloeibaar", d: 1.30, nl: "Ketjap manis", fr: "Ketjap manis", en: "Ketjap manis" },
        { g: "vloeibaar", d: 0.98, nl: "Kokosmelk", fr: "Lait de coco", en: "Coconut milk" },
        { g: "vloeibaar", d: 1.00, nl: "Santen (kokoscrème)", fr: "Santen (crème de coco)", en: "Santen (coconut cream)" },
        { g: "vloeibaar", d: 1.42, nl: "Honing", fr: "Miel", en: "Honey" },
        { g: "vloeibaar", d: 1.33, nl: "Stroop of glucosesiroop", fr: "Sirop de glucose", en: "Syrup" },
        { g: "vloeibaar", d: 0.92, nl: "Mayonaise", fr: "Mayonnaise", en: "Mayonnaise" },
        { g: "vloeibaar", d: 1.05, nl: "Mosterd", fr: "Moutarde", en: "Mustard" },
        { g: "vloeibaar", d: 1.09, nl: "Tomatenpuree", fr: "Concentré de tomate", en: "Tomato purée" },
        { g: "vloeibaar", d: 1.05, nl: "Sambal", fr: "Sambal", en: "Sambal" },

        { g: "bloem", d: 0.52, nl: "Patentbloem of tarwebloem", fr: "Farine de blé", en: "Plain flour" },
        { g: "bloem", d: 0.52, nl: "Zelfrijzende bloem", fr: "Farine fermentante", en: "Self-raising flour" },
        { g: "bloem", d: 0.55, nl: "Volkorenmeel", fr: "Farine complète", en: "Wholemeal flour" },
        { g: "bloem", d: 0.53, nl: "Maïzena", fr: "Maïzena", en: "Cornflour" },
        { g: "bloem", d: 0.70, nl: "Griesmeel", fr: "Semoule", en: "Semolina" },
        { g: "bloem", d: 0.45, nl: "Paneermeel", fr: "Chapelure", en: "Breadcrumbs" },
        { g: "bloem", d: 0.55, nl: "Custardpoeder", fr: "Poudre à flan", en: "Custard powder" },
        { g: "bloem", d: 0.42, nl: "Cacaopoeder", fr: "Cacao en poudre", en: "Cocoa powder" },
        { g: "bloem", d: 0.40, nl: "Amandelpoeder", fr: "Poudre d'amandes", en: "Ground almonds" },

        { g: "zoet", d: 0.85, nl: "Kristalsuiker", fr: "Sucre cristallisé", en: "Granulated sugar" },
        { g: "zoet", d: 0.50, nl: "Poedersuiker", fr: "Sucre impalpable", en: "Icing sugar" },
        { g: "zoet", d: 0.90, nl: "Bruine suiker (aangedrukt)", fr: "Cassonade (tassée)", en: "Brown sugar (packed)" },
        { g: "zoet", d: 0.75, nl: "Chocolade (druppels)", fr: "Chocolat (pépites)", en: "Chocolate chips" },
        { g: "zoet", d: 0.65, nl: "Rozijnen", fr: "Raisins secs", en: "Raisins" },
        { g: "zoet", d: 0.35, nl: "Kokosrasp", fr: "Noix de coco râpée", en: "Desiccated coconut" },

        { g: "kruiden", d: 1.20, nl: "Zout (fijn)", fr: "Sel fin", en: "Fine salt" },
        { g: "kruiden", d: 0.90, nl: "Grof zeezout", fr: "Gros sel", en: "Coarse salt" },
        { g: "kruiden", d: 0.80, nl: "Bakpoeder", fr: "Levure chimique", en: "Baking powder" },
        { g: "kruiden", d: 0.65, nl: "Droge gist", fr: "Levure sèche", en: "Dried yeast" },
        { g: "kruiden", d: 0.60, nl: "Gelatinepoeder", fr: "Gélatine en poudre", en: "Powdered gelatine" },
        { g: "kruiden", d: 0.50, nl: "Kerriepoeder", fr: "Curry en poudre", en: "Curry powder" },
        { g: "kruiden", d: 0.46, nl: "Paprikapoeder", fr: "Paprika en poudre", en: "Paprika powder" },
        { g: "kruiden", d: 0.45, nl: "Gemalen peper", fr: "Poivre moulu", en: "Ground pepper" },
        { g: "kruiden", d: 0.72, nl: "Sesamzaad", fr: "Graines de sésame", en: "Sesame seeds" },

        { g: "granen", d: 0.85, nl: "Rijst (ongekookt)", fr: "Riz (cru)", en: "Rice (uncooked)" },
        { g: "granen", d: 0.72, nl: "Couscous", fr: "Couscous", en: "Couscous" },
        { g: "granen", d: 0.75, nl: "Bulgur", fr: "Boulgour", en: "Bulgur" },
        { g: "granen", d: 0.40, nl: "Havermout", fr: "Flocons d'avoine", en: "Rolled oats" },
        { g: "granen", d: 0.85, nl: "Quinoa", fr: "Quinoa", en: "Quinoa" },
        { g: "granen", d: 0.80, nl: "Parelgort", fr: "Orge perlé", en: "Pearl barley" },
        { g: "granen", d: 0.85, nl: "Linzen (droog)", fr: "Lentilles (sèches)", en: "Lentils (dry)" },
        { g: "granen", d: 0.80, nl: "Kikkererwten (droog)", fr: "Pois chiches (secs)", en: "Chickpeas (dry)" },
        { g: "granen", d: 0.85, nl: "Spliterwten", fr: "Pois cassés", en: "Split peas" },

        { g: "vast", d: 0.95, nl: "Boter of margarine", fr: "Beurre ou margarine", en: "Butter or margarine" },
        { g: "vast", d: 0.40, nl: "Geraspte kaas", fr: "Fromage râpé", en: "Grated cheese" },
        { g: "vast", d: 0.38, nl: "Parmezaan (fijn geraspt)", fr: "Parmesan (râpé fin)", en: "Parmesan (finely grated)" },
        { g: "vast", d: 0.50, nl: "Gehakte noten", fr: "Noix concassées", en: "Chopped nuts" }
    ];

    // ===== TEKSTEN PER TAAL =====
    const TEKST = {
        nl: {
            knop: "Omrekenen", titel: "Omrekenen", sluit: "Sluiten",
            tMaten: "Maten", tTemp: "Temperatuur", tPorties: "Porties",
            hoeveelheid: "Hoeveelheid", eenheid: "Eenheid", product: "Product",
            kiesProduct: "— kies een product —",
            groepen: { vloeibaar: "Vloeibaar", bloem: "Bloem en poeders", zoet: "Zoet en bakken", kruiden: "Kruiden en rijsmiddelen", granen: "Granen en droge waren", vast: "Vast" },
            eenheden: {
                g: "gram (g)", kg: "kilogram (kg)", oz: "ounce (oz)", lb: "pound (lb)",
                ml: "milliliter (ml)", cl: "centiliter (cl)", dl: "deciliter (dl)", l: "liter (l)",
                el: "eetlepel (15 ml)", tl: "theelepel (5 ml)", cup: "cup (240 ml)",
                tbsp: "tablespoon US (14,8 ml)", tsp: "teaspoon US (4,9 ml)",
                floz: "fluid ounce (29,6 ml)", pint: "pint US (473 ml)", quart: "quart US (946 ml)"
            },
            kort: { g: "gram", kg: "kilogram", oz: "ounces", ml: "milliliter", cl: "centiliter", dl: "deciliter", l: "liter", el: "eetlepels", tl: "theelepels", cup: "cups" },
            vraagProduct: "Kies een product om tussen inhoud en gewicht om te rekenen. Een cup bloem weegt 125 gram, een cup honing 340 gram.",
            vulIn: "Vul een hoeveelheid in.",
            noot: nm => `Richtwaarde voor <b>${nm}</b>. Dichtheid verschilt per merk en per manier van scheppen; voor een exacte receptuur blijft afwegen nauwkeuriger.`,
            minder: "minder dan ¼",
            celsius: "graden Celsius (°C)", fahrenheit: "graden Fahrenheit (°F)",
            temperatuur: "Temperatuur", thermostaat: "Thermostaat (BE/FR)", gasstand: "Gasstand (UK)",
            buitenBereik: "niet van toepassing",
            van: "Recept voor", naar: "Omrekenen naar", personen: "personen",
            factor: "Factor", hoeveelheidRecept: "Hoeveelheid uit het recept", wordt: "Wordt",
            portieNoot: "Vermenigvuldig elke hoeveelheid uit het recept met de factor. Let op: kruiden, zout en rijsmiddelen schalen niet altijd recht mee — smaak bij.",
            bekijk: t => `Bekijk: ${t}`
        },
        fr: {
            knop: "Convertir", titel: "Convertir", sluit: "Fermer",
            tMaten: "Mesures", tTemp: "Température", tPorties: "Portions",
            hoeveelheid: "Quantité", eenheid: "Unité", product: "Produit",
            kiesProduct: "— choisir un produit —",
            groepen: { vloeibaar: "Liquides", bloem: "Farines et poudres", zoet: "Sucré et pâtisserie", kruiden: "Épices et levures", granen: "Céréales et produits secs", vast: "Solides" },
            eenheden: {
                g: "gramme (g)", kg: "kilogramme (kg)", oz: "once (oz)", lb: "livre (lb)",
                ml: "millilitre (ml)", cl: "centilitre (cl)", dl: "décilitre (dl)", l: "litre (l)",
                el: "cuillère à soupe (15 ml)", tl: "cuillère à café (5 ml)", cup: "cup (240 ml)",
                tbsp: "tablespoon US (14,8 ml)", tsp: "teaspoon US (4,9 ml)",
                floz: "once liquide (29,6 ml)", pint: "pint US (473 ml)", quart: "quart US (946 ml)"
            },
            kort: { g: "grammes", kg: "kilogrammes", oz: "onces", ml: "millilitres", cl: "centilitres", dl: "décilitres", l: "litres", el: "cuillères à soupe", tl: "cuillères à café", cup: "cups" },
            vraagProduct: "Choisissez un produit pour convertir entre volume et poids. Une cup de farine pèse 125 g, une cup de miel 340 g.",
            vulIn: "Indiquez une quantité.",
            noot: nm => `Valeur indicative pour <b>${nm}</b>. La densité varie selon la marque et le remplissage ; pour une recette précise, la pesée reste plus fiable.`,
            minder: "moins d'¼",
            celsius: "degrés Celsius (°C)", fahrenheit: "degrés Fahrenheit (°F)",
            temperatuur: "Température", thermostaat: "Thermostat (BE/FR)", gasstand: "Gas mark (UK)",
            buitenBereik: "sans objet",
            van: "Recette pour", naar: "Convertir pour", personen: "personnes",
            factor: "Facteur", hoeveelheidRecept: "Quantité de la recette", wordt: "Devient",
            portieNoot: "Multipliez chaque quantité de la recette par le facteur. Attention : épices, sel et levures ne se multiplient pas toujours proportionnellement — goûtez.",
            bekijk: t => `Voir : ${t}`
        },
        en: {
            knop: "Convert", titel: "Convert", sluit: "Close",
            tMaten: "Measures", tTemp: "Temperature", tPorties: "Portions",
            hoeveelheid: "Amount", eenheid: "Unit", product: "Product",
            kiesProduct: "— choose a product —",
            groepen: { vloeibaar: "Liquids", bloem: "Flours and powders", zoet: "Sweet and baking", kruiden: "Spices and raising agents", granen: "Grains and dry goods", vast: "Solids" },
            eenheden: {
                g: "gram (g)", kg: "kilogram (kg)", oz: "ounce (oz)", lb: "pound (lb)",
                ml: "millilitre (ml)", cl: "centilitre (cl)", dl: "decilitre (dl)", l: "litre (l)",
                el: "tablespoon NL (15 ml)", tl: "teaspoon NL (5 ml)", cup: "cup (240 ml)",
                tbsp: "tablespoon US (14.8 ml)", tsp: "teaspoon US (4.9 ml)",
                floz: "fluid ounce (29.6 ml)", pint: "pint US (473 ml)", quart: "quart US (946 ml)"
            },
            kort: { g: "grams", kg: "kilograms", oz: "ounces", ml: "millilitres", cl: "centilitres", dl: "decilitres", l: "litres", el: "tablespoons", tl: "teaspoons", cup: "cups" },
            vraagProduct: "Choose a product to convert between volume and weight. A cup of flour weighs 125 g, a cup of honey 340 g.",
            vulIn: "Enter an amount.",
            noot: nm => `Indicative value for <b>${nm}</b>. Density varies by brand and by how the cup is filled; for exact recipe work, weighing stays more accurate.`,
            minder: "less than ¼",
            celsius: "degrees Celsius (°C)", fahrenheit: "degrees Fahrenheit (°F)",
            temperatuur: "Temperature", thermostaat: "Thermostat (BE/FR)", gasstand: "Gas mark (UK)",
            buitenBereik: "not applicable",
            van: "Recipe for", naar: "Convert for", personen: "people",
            factor: "Factor", hoeveelheidRecept: "Amount in the recipe", wordt: "Becomes",
            portieNoot: "Multiply every amount in the recipe by the factor. Note: spices, salt and raising agents do not always scale linearly — taste as you go.",
            bekijk: t => `Watch: ${t}`
        }
    };
    const taalNu = () => { let t = "nl"; try { t = localStorage.getItem("nac-lang") || "nl"; } catch (e) {} return TEKST[t] ? t : "nl"; };
    const T = () => TEKST[taalNu()];
    const naam = p => p[taalNu()] || p.nl;

    // Een kok typt "4,5" en niet "4.5". Daarom tekstvelden met een cijfertoetsenbord
    // (inputmode) en hier één plek die beide schrijfwijzen aanneemt.
    function getalUit(id) {
        const el = document.getElementById(id);
        return parseFloat(String(el ? el.value : "").replace(/\s/g, "").replace(",", "."));
    }

    const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    // ===== REKENEN EN AFRONDEN =====
    // Komma als scheidingsteken in NL en FR, punt in EN.
    function getal(n, cijfers) {
        const taal = taalNu() === "en" ? "en-GB" : (taalNu() === "fr" ? "fr-BE" : "nl-BE");
        return n.toLocaleString(taal, { minimumFractionDigits: 0, maximumFractionDigits: cijfers });
    }
    // Keukengetal: hoe groter het getal, hoe minder cijfers achter de komma nodig zijn.
    function net(n) {
        if (!isFinite(n)) return "–";
        if (n >= 100) return getal(Math.round(n), 0);
        if (n >= 10) return getal(Math.round(n * 10) / 10, 1);
        if (n >= 1) return getal(Math.round(n * 100) / 100, 2);
        return getal(Math.round(n * 1000) / 1000, 3);
    }
    // Lepels en cups lees je af in kwarten, niet in decimalen.
    const BREUK = { 0: "", 0.25: "¼", 0.5: "½", 0.75: "¾" };
    function kwart(n) {
        if (!isFinite(n)) return "–";
        if (n < 0.125) return T().minder;
        let hele = Math.floor(n + 1e-9);
        let rest = Math.round((n - hele) * 4) / 4;
        if (rest === 1) { hele += 1; rest = 0; }
        if (hele === 0) return BREUK[rest] || net(n);
        return getal(hele, 0) + (rest ? " " + BREUK[rest] : "");
    }

    // ===== PANEEL BOUWEN =====
    const kopBalk = document.querySelector(".hero-top");
    if (!kopBalk) return;                       // geen kopbalk: dan ook geen knop

    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "om-knop";
    knop.setAttribute("aria-expanded", "false");
    knop.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M4 8h13l-3-3M20 16H7l3 3"/></svg><span></span>';
    kopBalk.appendChild(knop);

    const overlay = document.createElement("div");
    overlay.className = "om-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "omTitel");
    overlay.hidden = true;
    overlay.innerHTML = `
    <div class="om-paneel">
        <div class="om-kop">
            <h2 id="omTitel"></h2>
            <button type="button" class="om-sluit" id="omSluit">
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
        </div>
        <div class="om-schakel" role="tablist">
            <button type="button" role="tab" id="omTabMaten" aria-selected="true"></button>
            <button type="button" role="tab" id="omTabTemp" aria-selected="false"></button>
            <button type="button" role="tab" id="omTabPorties" aria-selected="false"></button>
        </div>

        <div class="om-blok" id="omMaten">
            <div class="om-veldrij">
                <div class="om-smal">
                    <label class="om-label" for="omGetal" id="omLabHoev"></label>
                    <input class="om-getal" id="omGetal" type="text" inputmode="decimal" autocomplete="off" value="1">
                </div>
                <div class="om-breed">
                    <label class="om-label" for="omEenheid" id="omLabEenheid"></label>
                    <select class="om-keuze" id="omEenheid"></select>
                </div>
            </div>
            <div class="om-veldrij">
                <div class="om-breed">
                    <label class="om-label" for="omProduct" id="omLabProduct"></label>
                    <select class="om-keuze" id="omProduct"></select>
                </div>
            </div>
            <div class="om-uitkomst" id="omUitMaten"></div>
            <div class="om-noot" id="omNootMaten"></div>
            <button type="button" class="om-video" id="omVideo" hidden>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg><span></span>
            </button>
        </div>

        <div class="om-blok" id="omTemp" hidden>
            <div class="om-veldrij">
                <div class="om-smal">
                    <label class="om-label" for="omTempGetal" id="omLabTemp"></label>
                    <input class="om-getal" id="omTempGetal" type="text" inputmode="decimal" autocomplete="off" value="180">
                </div>
                <div class="om-breed">
                    <label class="om-label" for="omTempEenheid" id="omLabTempEenheid"></label>
                    <select class="om-keuze" id="omTempEenheid"></select>
                </div>
            </div>
            <div class="om-uitkomst" id="omUitTemp"></div>
        </div>

        <div class="om-blok" id="omPorties" hidden>
            <div class="om-veldrij">
                <div class="om-breed">
                    <label class="om-label" for="omVan" id="omLabVan"></label>
                    <input class="om-getal" id="omVan" type="number" inputmode="numeric" min="1" step="1" value="30">
                </div>
                <div class="om-breed">
                    <label class="om-label" for="omNaar" id="omLabNaar"></label>
                    <input class="om-getal" id="omNaar" type="number" inputmode="numeric" min="1" step="1" value="12">
                </div>
            </div>
            <div class="om-veldrij">
                <div class="om-smal">
                    <label class="om-label" for="omPortieGetal" id="omLabPortieHoev"></label>
                    <input class="om-getal" id="omPortieGetal" type="text" inputmode="decimal" autocomplete="off" placeholder="">
                </div>
                <div class="om-breed">
                    <label class="om-label" for="omPortieEenheid" id="omLabPortieEenheid"></label>
                    <select class="om-keuze" id="omPortieEenheid"></select>
                </div>
            </div>
            <div class="om-uitkomst" id="omUitPorties"></div>
            <div class="om-noot" id="omNootPorties"></div>
        </div>
    </div>`;
    document.body.appendChild(overlay);

    const $ = id => document.getElementById(id);
    const blokken = { maten: $("omMaten"), temp: $("omTemp"), porties: $("omPorties") };
    const tabs = { maten: $("omTabMaten"), temp: $("omTabTemp"), porties: $("omTabPorties") };
    let onderdeel = "maten";

    // ---------- Keuzelijsten vullen ----------
    function vulEenheden(select, kiesbaar) {
        const t = T();
        const rijen = [
            ["gewicht", ["g", "kg", "oz", "lb"]],
            ["inhoud", ["ml", "cl", "dl", "l", "el", "tl"]],
            ["amerikaans", ["cup", "tbsp", "tsp", "floz", "pint", "quart"]]
        ];
        const labels = { gewicht: taalNu() === "fr" ? "Poids" : (taalNu() === "en" ? "Weight" : "Gewicht"), inhoud: taalNu() === "fr" ? "Volume" : (taalNu() === "en" ? "Volume" : "Inhoud"), amerikaans: taalNu() === "fr" ? "Mesures américaines" : (taalNu() === "en" ? "US measures" : "Amerikaanse maten") };
        select.innerHTML = rijen.map(([groep, codes]) => {
            const opties = codes.filter(c => !kiesbaar || kiesbaar.includes(c))
                .map(c => `<option value="${c}">${esc(t.eenheden[c])}</option>`).join("");
            return opties ? `<optgroup label="${esc(labels[groep])}">${opties}</optgroup>` : "";
        }).join("");
    }
    function vulProducten() {
        const t = T(), groepen = {};
        PRODUCTEN.forEach((p, i) => { (groepen[p.g] = groepen[p.g] || []).push([i, p]); });
        $("omProduct").innerHTML = `<option value="">${esc(t.kiesProduct)}</option>` +
            Object.keys(groepen).map(g =>
                `<optgroup label="${esc(t.groepen[g])}">` +
                groepen[g].map(([i, p]) => `<option value="${i}">${esc(naam(p))}</option>`).join("") +
                `</optgroup>`).join("");
    }
    function vulTempEenheden() {
        const t = T();
        $("omTempEenheid").innerHTML = `<option value="C">${esc(t.celsius)}</option><option value="F">${esc(t.fahrenheit)}</option>`;
    }

    // ---------- Uitkomst: maten ----------
    function rekenMaten() {
        const t = T();
        const n = getalUit("omGetal");
        const code = $("omEenheid").value;
        const keuze = $("omProduct").value;
        const p = keuze === "" ? null : PRODUCTEN[Number(keuze)];
        const uit = $("omUitMaten"), noot = $("omNootMaten");

        if (!isFinite(n) || n <= 0) {
            uit.innerHTML = `<p class="om-vraag">${esc(t.vulIn)}</p>`;
            noot.innerHTML = "";
            return;
        }

        const eh = EENHEDEN[code];
        // Alles eerst naar één maat: gram OF milliliter. Met een product kunnen we
        // tussen die twee heen en weer; zonder product niet.
        let gram = null, ml = null;
        if (eh.soort === "gewicht") { gram = n * eh.f; if (p) ml = gram / p.d; }
        else { ml = n * eh.f; if (p) gram = ml * p.d; }

        const regels = [];
        const hoofd = (nm, w) => regels.push(`<div class="om-regel om-hoofd"><span class="om-regel-naam">${esc(nm)}</span><span class="om-regel-waarde">${w}</span></div>`);
        const rij = (nm, w) => regels.push(`<div class="om-regel"><span class="om-regel-naam">${esc(nm)}</span><span class="om-regel-waarde">${w}</span></div>`);

        if (gram !== null) {
            // De omrekening waar het meestal om gaat, staat bovenaan en in het goud.
            if (eh.soort === "inhoud") hoofd(t.kort.g, net(gram) + " g");
            else rij(t.kort.g, net(gram) + " g");
            if (gram >= 1000) rij(t.kort.kg, net(gram / 1000) + " kg");
            if (gram >= 5) rij(t.kort.oz, net(gram / EENHEDEN.oz.f) + " oz");   // onder 5 gram zegt een ounce niets
        }
        if (ml !== null) {
            if (eh.soort === "gewicht") hoofd(t.kort.ml, net(ml) + " ml");
            else rij(t.kort.ml, net(ml) + " ml");
            rij(t.kort.cl, net(ml / 10) + " cl");
            if (ml >= 100) rij(t.kort.dl, net(ml / 100) + " dl");
            if (ml >= 1000) rij(t.kort.l, net(ml / 1000) + " l");
            rij(t.kort.el, kwart(ml / EENHEDEN.el.f));
            rij(t.kort.tl, kwart(ml / EENHEDEN.tl.f));
            rij(t.kort.cup, kwart(ml / EENHEDEN.cup.f));
        }
        uit.innerHTML = regels.join("");
        noot.innerHTML = p ? t.noot(esc(naam(p)))
            : `<span class="om-vraag" style="display:block">${esc(t.vraagProduct)}</span>`;
        try { localStorage.setItem(OPSLAG + "eenheid", code); localStorage.setItem(OPSLAG + "product", keuze); } catch (e) {}
    }

    // ---------- Uitkomst: temperatuur ----------
    // Thermostaat (BE/FR) = °C gedeeld door 30. Gasstand is een vaste tabel.
    const GASSTAND = [[140, 1], [150, 2], [170, 3], [180, 4], [190, 5], [200, 6], [220, 7], [230, 8], [240, 9]];
    function rekenTemp() {
        const t = T();
        const n = getalUit("omTempGetal");
        const soort = $("omTempEenheid").value;
        const uit = $("omUitTemp");
        if (!isFinite(n)) { uit.innerHTML = `<p class="om-vraag">${esc(t.vulIn)}</p>`; return; }

        const c = soort === "C" ? n : (n - 32) * 5 / 9;
        const f = soort === "C" ? n * 9 / 5 + 32 : n;
        const therm = c / 30;
        // Dichtstbijzijnde gasstand, maar alleen binnen het bereik van een oven.
        let gas = t.buitenBereik;
        if (c >= 130 && c <= 250) {
            const beste = GASSTAND.reduce((a, b) => Math.abs(b[0] - c) < Math.abs(a[0] - c) ? b : a);
            gas = getal(beste[1], 0);
        }
        uit.innerHTML =
            `<div class="om-regel om-hoofd"><span class="om-regel-naam">${esc(soort === "C" ? t.fahrenheit : t.celsius)}</span>` +
            `<span class="om-regel-waarde">${net(soort === "C" ? f : c)} °${soort === "C" ? "F" : "C"}</span></div>` +
            `<div class="om-regel"><span class="om-regel-naam">${esc(t.thermostaat)}</span><span class="om-regel-waarde">${c >= 30 && c <= 300 ? getal(Math.round(therm * 2) / 2, 1) : esc(t.buitenBereik)}</span></div>` +
            `<div class="om-regel"><span class="om-regel-naam">${esc(t.gasstand)}</span><span class="om-regel-waarde">${gas}</span></div>`;
    }

    // ---------- Uitkomst: porties ----------
    function rekenPorties() {
        const t = T();
        const van = getalUit("omVan"), naarA = getalUit("omNaar");
        const uit = $("omUitPorties");
        if (!isFinite(van) || !isFinite(naarA) || van <= 0 || naarA <= 0) {
            uit.innerHTML = `<p class="om-vraag">${esc(t.vulIn)}</p>`;
            return;
        }
        const factor = naarA / van;
        let html = `<div class="om-regel om-hoofd"><span class="om-regel-naam">${esc(t.factor)}</span>` +
            `<span class="om-regel-waarde">× ${getal(Math.round(factor * 1000) / 1000, 3)}</span></div>`;

        const h = getalUit("omPortieGetal");
        if (isFinite(h) && h > 0) {
            const code = $("omPortieEenheid").value;
            const w = h * factor;
            const lepel = code === "el" || code === "tl" || code === "cup";
            html += `<div class="om-regel"><span class="om-regel-naam">${esc(t.wordt)}</span>` +
                `<span class="om-regel-waarde">${lepel ? kwart(w) + " " + esc(t.kort[code]) : net(w) + " " + esc(code)}</span></div>`;
        }
        uit.innerHTML = html;
    }

    function reken() {
        if (onderdeel === "maten") rekenMaten();
        else if (onderdeel === "temp") rekenTemp();
        else rekenPorties();
    }

    // ---------- Teksten zetten (ook na een taalwissel) ----------
    function zetTeksten() {
        const t = T();
        knop.querySelector("span").textContent = t.knop;
        knop.setAttribute("aria-label", t.knop);
        knop.title = t.knop;
        $("omTitel").textContent = t.titel;
        $("omSluit").setAttribute("aria-label", t.sluit);
        tabs.maten.textContent = t.tMaten;
        tabs.temp.textContent = t.tTemp;
        tabs.porties.textContent = t.tPorties;
        $("omLabHoev").textContent = t.hoeveelheid;
        $("omLabEenheid").textContent = t.eenheid;
        $("omLabProduct").textContent = t.product;
        $("omLabTemp").textContent = t.temperatuur;
        $("omLabTempEenheid").textContent = t.eenheid;
        $("omLabVan").textContent = t.van + " (" + t.personen + ")";
        $("omLabNaar").textContent = t.naar + " (" + t.personen + ")";
        $("omLabPortieHoev").textContent = t.hoeveelheidRecept;
        $("omLabPortieEenheid").textContent = t.eenheid;
        $("omNootPorties").textContent = t.portieNoot;

        // Keuzelijsten opnieuw vullen, maar wel op dezelfde keuze blijven staan.
        const bewaar = [$("omEenheid").value, $("omProduct").value, $("omTempEenheid").value, $("omPortieEenheid").value];
        vulEenheden($("omEenheid"));
        vulProducten();
        vulTempEenheden();
        vulEenheden($("omPortieEenheid"), ["g", "kg", "ml", "cl", "l", "el", "tl", "cup"]);
        if (bewaar[0]) $("omEenheid").value = bewaar[0];
        if (bewaar[1]) $("omProduct").value = bewaar[1];
        if (bewaar[2]) $("omTempEenheid").value = bewaar[2];
        if (bewaar[3]) $("omPortieEenheid").value = bewaar[3];
        zetVideoKnop();
        reken();
    }

    // ---------- Gouden knop naar de instructievideo over afwegen ----------
    function zoekVideo() {
        const lijst = window.videos || [];
        return lijst.find(v => /afwegen/i.test(v.titel || "")) || lijst.find(v => /afmeten/i.test(v.titel || "")) || null;
    }
    function zetVideoKnop() {
        const v = zoekVideo(), b = $("omVideo");
        if (!v || typeof window.openVideo !== "function") { b.hidden = true; return; }
        const taal = taalNu();
        const titel = ((taal !== "nl" && v[taal]) || v.titel || "").replace(/^Instructie(film)?\s+/i, "");
        b.hidden = false;
        b.querySelector("span").textContent = T().bekijk(titel);
        b.onclick = () => { sluit(); window.openVideo(v); };
    }

    // ---------- Openen en sluiten ----------
    let vorigeFocus = null;
    function open() {
        vorigeFocus = document.activeElement;
        overlay.hidden = false;
        requestAnimationFrame(() => overlay.classList.add("open"));
        knop.setAttribute("aria-expanded", "true");
        zetTeksten();
        const eerste = onderdeel === "maten" ? $("omGetal") : (onderdeel === "temp" ? $("omTempGetal") : $("omVan"));
        eerste.focus();
        eerste.select && eerste.select();
    }
    function sluit() {
        overlay.classList.remove("open");
        knop.setAttribute("aria-expanded", "false");
        setTimeout(() => { overlay.hidden = true; }, 200);
        if (vorigeFocus && vorigeFocus.focus) vorigeFocus.focus();
    }
    knop.addEventListener("click", () => (overlay.hidden ? open() : sluit()));
    $("omSluit").addEventListener("click", sluit);
    overlay.addEventListener("click", e => { if (e.target === overlay) sluit(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !overlay.hidden) sluit(); });

    // ---------- Wisselen tussen de drie onderdelen ----------
    Object.keys(tabs).forEach(k => tabs[k].addEventListener("click", () => {
        onderdeel = k;
        Object.keys(tabs).forEach(x => {
            tabs[x].setAttribute("aria-selected", x === k);
            blokken[x].hidden = x !== k;
        });
        reken();
    }));

    // ---------- Reageren op invoer ----------
    ["omGetal", "omEenheid", "omProduct", "omTempGetal", "omTempEenheid", "omVan", "omNaar", "omPortieGetal", "omPortieEenheid"]
        .forEach(id => { const el = $(id); el.addEventListener("input", reken); el.addEventListener("change", reken); });

    // ---------- Taalknoppen van de app ----------
    document.querySelectorAll(".lang-btn").forEach(b => b.addEventListener("click", () => { if (!overlay.hidden) zetTeksten(); else zetTeksten(); }));

    // ---------- Beginstand ----------
    // Eerst lezen wat er bewaard is: zetTeksten() rekent meteen en schrijft
    // de huidige keuze weg, en zou het bewaarde anders overschrijven.
    let bewaardeEenheid = null, bewaardProduct = null;
    try {
        bewaardeEenheid = localStorage.getItem(OPSLAG + "eenheid");
        bewaardProduct = localStorage.getItem(OPSLAG + "product");
    } catch (err) {}
    zetTeksten();
    // Zonder eerdere keuze beginnen we bij cups: daar gaat de vraag meestal over.
    $("omEenheid").value = (bewaardeEenheid && EENHEDEN[bewaardeEenheid]) ? bewaardeEenheid : "cup";
    if (bewaardProduct && PRODUCTEN[Number(bewaardProduct)]) $("omProduct").value = bewaardProduct;
    $("omPortieEenheid").value = "g";
    reken();

    // De videolijst komt uit de Google Sheet en is er misschien nog niet; dan later nog eens kijken.
    if (!zoekVideo()) setTimeout(zetVideoKnop, 2500);

    // Direct openen via het adres: ?omrekenen=1
    if (new URLSearchParams(location.search).get("omrekenen") === "1") open();
})();
