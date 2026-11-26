// =============================================================
// Omrekentool - EA Catering v3
// -------------------------------------------------------------
// LEERMODUS - wat doet dit bestand?
// Een eenvoudige maatomrekenaar: je typt een hoeveelheid en kiest een
// eenheid, en je ziet meteen wat dat in alle andere maten is. Plus een
// tabblad voor oventemperatuur.
//
// Hij rekent ALLEEN maten naar maten om. Er is geen ingrediëntenlijst:
// gewicht en inhoud kunnen alleen in elkaar worden omgerekend op basis
// van water (1 ml = 1 g), en dat staat er duidelijk bij. Bloem, olie en
// suiker wijken daarvan af; die weeg je af.
//
// De knop zit niet meer in de kopbalk. De tool meldt zich aan bij het
// tools-menu (tools.js) en wordt daar geopend.
// =============================================================

(function () {
    "use strict";

    const OPSLAG = "eac-v3-om-";          // eigen voorvoegsel: niet in de weg van de andere apps

    // ===== EENHEDEN =====
    // f = hoeveel gram (soort "gewicht") of hoeveel milliliter (soort "inhoud")
    // er in één eenheid gaat. De Nederlandse maatlepel is precies 15 en 5 ml;
    // de Amerikaanse tablespoon en teaspoon zijn iets kleiner, dus die staan er
    // apart in. Cup = 240 ml, de maat die op Amerikaanse maatbekers staat.
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

    // ===== TEKSTEN PER TAAL =====
    const TEKST = {
        nl: {
            knop: "Omrekenen", titel: "Omrekenen", sluit: "Sluiten",
            tMaten: "Maten", tTemp: "Temperatuur",
            hoeveelheid: "Hoeveelheid", eenheid: "Eenheid",
            soortGewicht: "Gewicht", soortInhoud: "Inhoud", soortUS: "Amerikaanse maten",
            eenheden: {
                g: "gram (g)", kg: "kilogram (kg)", oz: "ounce (oz)", lb: "pound (lb)",
                ml: "milliliter (ml)", cl: "centiliter (cl)", dl: "deciliter (dl)", l: "liter (l)",
                el: "eetlepel (15 ml)", tl: "theelepel (5 ml)", cup: "cup (240 ml)",
                tbsp: "tablespoon US (14,8 ml)", tsp: "teaspoon US (4,9 ml)",
                floz: "fluid ounce (29,6 ml)", pint: "pint US (473 ml)", quart: "quart US (946 ml)"
            },
            kort: { g: "gram", kg: "kilogram", oz: "ounces", lb: "pounds", ml: "milliliter", cl: "centiliter",
                    dl: "deciliter", l: "liter", el: "eetlepels", tl: "theelepels", cup: "cups" },
            kopWater: "Als water (1 ml = 1 g)",
            waterNoot: "Water weegt 1 gram per milliliter. Bloem, olie, suiker en honing wijken daarvan af — die weeg je af in plaats van af te meten.",
            vulIn: "Vul een hoeveelheid in.",
            minder: "minder dan ¼",
            celsius: "graden Celsius (°C)", fahrenheit: "graden Fahrenheit (°F)",
            temperatuur: "Temperatuur", thermostaat: "Thermostaat (BE/FR)", gasstand: "Gasstand (UK)",
            buitenBereik: "niet van toepassing"
        },
        fr: {
            knop: "Convertir", titel: "Convertir", sluit: "Fermer",
            tMaten: "Mesures", tTemp: "Température",
            hoeveelheid: "Quantité", eenheid: "Unité",
            soortGewicht: "Poids", soortInhoud: "Volume", soortUS: "Mesures américaines",
            eenheden: {
                g: "gramme (g)", kg: "kilogramme (kg)", oz: "once (oz)", lb: "livre (lb)",
                ml: "millilitre (ml)", cl: "centilitre (cl)", dl: "décilitre (dl)", l: "litre (l)",
                el: "cuillère à soupe (15 ml)", tl: "cuillère à café (5 ml)", cup: "cup (240 ml)",
                tbsp: "tablespoon US (14,8 ml)", tsp: "teaspoon US (4,9 ml)",
                floz: "once liquide (29,6 ml)", pint: "pint US (473 ml)", quart: "quart US (946 ml)"
            },
            kort: { g: "grammes", kg: "kilogrammes", oz: "onces", lb: "livres", ml: "millilitres", cl: "centilitres",
                    dl: "décilitres", l: "litres", el: "cuillères à soupe", tl: "cuillères à café", cup: "cups" },
            kopWater: "Comme de l'eau (1 ml = 1 g)",
            waterNoot: "L'eau pèse 1 gramme par millilitre. La farine, l'huile, le sucre et le miel s'en écartent — pesez-les plutôt que de les mesurer.",
            vulIn: "Indiquez une quantité.",
            minder: "moins d'¼",
            celsius: "degrés Celsius (°C)", fahrenheit: "degrés Fahrenheit (°F)",
            temperatuur: "Température", thermostaat: "Thermostat (BE/FR)", gasstand: "Gas mark (UK)",
            buitenBereik: "sans objet"
        },
        en: {
            knop: "Convert", titel: "Convert", sluit: "Close",
            tMaten: "Measures", tTemp: "Temperature",
            hoeveelheid: "Amount", eenheid: "Unit",
            soortGewicht: "Weight", soortInhoud: "Volume", soortUS: "US measures",
            eenheden: {
                g: "gram (g)", kg: "kilogram (kg)", oz: "ounce (oz)", lb: "pound (lb)",
                ml: "millilitre (ml)", cl: "centilitre (cl)", dl: "decilitre (dl)", l: "litre (l)",
                el: "tablespoon NL (15 ml)", tl: "teaspoon NL (5 ml)", cup: "cup (240 ml)",
                tbsp: "tablespoon US (14.8 ml)", tsp: "teaspoon US (4.9 ml)",
                floz: "fluid ounce (29.6 ml)", pint: "pint US (473 ml)", quart: "quart US (946 ml)"
            },
            kort: { g: "grams", kg: "kilograms", oz: "ounces", lb: "pounds", ml: "millilitres", cl: "centilitres",
                    dl: "decilitres", l: "litres", el: "tablespoons", tl: "teaspoons", cup: "cups" },
            kopWater: "As water (1 ml = 1 g)",
            waterNoot: "Water weighs 1 gram per millilitre. Flour, oil, sugar and honey differ — weigh those rather than measuring them.",
            vulIn: "Enter an amount.",
            minder: "less than ¼",
            celsius: "degrees Celsius (°C)", fahrenheit: "degrees Fahrenheit (°F)",
            temperatuur: "Temperature", thermostaat: "Thermostat (BE/FR)", gasstand: "Gas mark (UK)",
            buitenBereik: "not applicable"
        }
    };
    const taalNu = () => { let t = "nl"; try { t = localStorage.getItem("nac-lang") || "nl"; } catch (e) {} return TEKST[t] ? t : "nl"; };
    const T = () => TEKST[taalNu()];

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    // Een kok typt "4,5" en niet "4.5". Eén plek die beide aanneemt.
    function getalUit(id) {
        const el = document.getElementById(id);
        return parseFloat(String(el ? el.value : "").replace(/\s/g, "").replace(",", "."));
    }

    // ===== REKENEN EN AFRONDEN =====
    function getal(n, cijfers) {
        const taal = taalNu() === "en" ? "en-GB" : (taalNu() === "fr" ? "fr-BE" : "nl-BE");
        return n.toLocaleString(taal, { minimumFractionDigits: 0, maximumFractionDigits: cijfers });
    }
    // Keukengetal: hoe groter het getal, hoe minder cijfers achter de komma nodig.
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
    const overlay = document.createElement("div");
    overlay.className = "om-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "omTitel");
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
            <div class="om-uitkomst" id="omUitMaten"></div>
            <div class="om-noot" id="omNootMaten"></div>
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
    </div>`;
    document.body.appendChild(overlay);

    const $ = (id) => document.getElementById(id);
    const blokken = { maten: $("omMaten"), temp: $("omTemp") };
    const tabs = { maten: $("omTabMaten"), temp: $("omTabTemp") };
    let onderdeel = "maten";

    // ---------- Keuzelijsten vullen ----------
    function vulEenheden() {
        const t = T();
        const rijen = [
            [t.soortGewicht, ["g", "kg", "oz", "lb"]],
            [t.soortInhoud, ["ml", "cl", "dl", "l", "el", "tl"]],
            [t.soortUS, ["cup", "tbsp", "tsp", "floz", "pint", "quart"]]
        ];
        $("omEenheid").innerHTML = rijen.map(([label, codes]) =>
            `<optgroup label="${esc(label)}">` +
            codes.map((c) => `<option value="${c}">${esc(t.eenheden[c])}</option>`).join("") +
            `</optgroup>`).join("");
    }
    function vulTempEenheden() {
        const t = T();
        $("omTempEenheid").innerHTML =
            `<option value="C">${esc(t.celsius)}</option><option value="F">${esc(t.fahrenheit)}</option>`;
    }

    // ---------- Uitkomst: maten ----------
    function rekenMaten() {
        const t = T();
        const n = getalUit("omGetal");
        const code = $("omEenheid").value;
        const uit = $("omUitMaten"), noot = $("omNootMaten");

        if (!isFinite(n) || n <= 0) {
            uit.innerHTML = `<p class="om-vraag">${esc(t.vulIn)}</p>`;
            noot.innerHTML = "";
            return;
        }

        const eh = EENHEDEN[code];
        const regels = [];
        const rij = (nm, w, klasse) =>
            regels.push(`<div class="om-regel${klasse ? " " + klasse : ""}">` +
                        `<span class="om-regel-naam">${esc(nm)}</span>` +
                        `<span class="om-regel-waarde">${w}</span></div>`);

        if (eh.soort === "gewicht") {
            const gram = n * eh.f;
            // Eigen soort eerst: dat klopt altijd, ongeacht wat je omrekent.
            if (code !== "g") rij(t.kort.g, net(gram) + " g", "om-hoofd");
            if (code !== "kg" && gram >= 100) rij(t.kort.kg, net(gram / 1000) + " kg");
            if (code !== "oz" && gram >= 5) rij(t.kort.oz, net(gram / EENHEDEN.oz.f) + " oz");
            if (code !== "lb" && gram >= 100) rij(t.kort.lb, net(gram / EENHEDEN.lb.f) + " lb");
            // Daarna, duidelijk apart: inhoud op basis van water.
            regels.push(`<div class="om-tussenkop">${esc(t.kopWater)}</div>`);
            rij(t.kort.ml, net(gram) + " ml");
            rij(t.kort.cl, net(gram / 10) + " cl");
            if (gram >= 1000) rij(t.kort.l, net(gram / 1000) + " l");
            rij(t.kort.el, kwart(gram / EENHEDEN.el.f));
            rij(t.kort.cup, kwart(gram / EENHEDEN.cup.f));
        } else {
            const ml = n * eh.f;
            if (code !== "ml") rij(t.kort.ml, net(ml) + " ml", "om-hoofd");
            if (code !== "cl") rij(t.kort.cl, net(ml / 10) + " cl");
            if (code !== "dl" && ml >= 50) rij(t.kort.dl, net(ml / 100) + " dl");
            if (code !== "l" && ml >= 250) rij(t.kort.l, net(ml / 1000) + " l");
            if (code !== "el") rij(t.kort.el, kwart(ml / EENHEDEN.el.f));
            if (code !== "tl") rij(t.kort.tl, kwart(ml / EENHEDEN.tl.f));
            if (code !== "cup") rij(t.kort.cup, kwart(ml / EENHEDEN.cup.f));
            regels.push(`<div class="om-tussenkop">${esc(t.kopWater)}</div>`);
            rij(t.kort.g, net(ml) + " g");
            if (ml >= 100) rij(t.kort.kg, net(ml / 1000) + " kg");
        }

        uit.innerHTML = regels.join("");
        noot.innerHTML = esc(t.waterNoot);
        try { localStorage.setItem(OPSLAG + "eenheid", code); } catch (e) {}
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
        let gas = t.buitenBereik;
        if (c >= 130 && c <= 250) {
            const beste = GASSTAND.reduce((a, b) => Math.abs(b[0] - c) < Math.abs(a[0] - c) ? b : a);
            gas = getal(beste[1], 0);
        }
        uit.innerHTML =
            `<div class="om-regel om-hoofd"><span class="om-regel-naam">${esc(soort === "C" ? t.fahrenheit : t.celsius)}</span>` +
            `<span class="om-regel-waarde">${net(soort === "C" ? f : c)} °${soort === "C" ? "F" : "C"}</span></div>` +
            `<div class="om-regel"><span class="om-regel-naam">${esc(t.thermostaat)}</span>` +
            `<span class="om-regel-waarde">${c >= 30 && c <= 300 ? getal(Math.round(therm * 2) / 2, 1) : esc(t.buitenBereik)}</span></div>` +
            `<div class="om-regel"><span class="om-regel-naam">${esc(t.gasstand)}</span>` +
            `<span class="om-regel-waarde">${gas}</span></div>`;
    }

    function reken() {
        if (onderdeel === "maten") rekenMaten(); else rekenTemp();
    }

    // ---------- Teksten zetten (ook na een taalwissel) ----------
    function zetTeksten() {
        const t = T();
        $("omTitel").textContent = t.titel;
        $("omSluit").setAttribute("aria-label", t.sluit);
        $("omSluit").setAttribute("title", t.sluit);
        tabs.maten.textContent = t.tMaten;
        tabs.temp.textContent = t.tTemp;
        $("omLabHoev").textContent = t.hoeveelheid;
        $("omLabEenheid").textContent = t.eenheid;
        $("omLabTemp").textContent = t.temperatuur;
        $("omLabTempEenheid").textContent = t.eenheid;
        const eenheid = $("omEenheid").value, tempEenheid = $("omTempEenheid").value;
        vulEenheden(); vulTempEenheden();
        if (eenheid) $("omEenheid").value = eenheid;
        if (tempEenheid) $("omTempEenheid").value = tempEenheid;
        reken();
    }

    // ---------- Openen en sluiten ----------
    let open = false;
    function openPaneel() {
        open = true;
        overlay.hidden = false;
        document.body.classList.add("om-open");
        requestAnimationFrame(() => overlay.classList.add("open"));
        zetTeksten();
        setTimeout(() => $("omGetal").focus({ preventScroll: true }), 150);
    }
    function sluit() {
        open = false;
        overlay.classList.remove("open");
        document.body.classList.remove("om-open");
        setTimeout(() => { if (!open) overlay.hidden = true; }, 220);
    }
    overlay.hidden = true;
    $("omSluit").addEventListener("click", sluit);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) sluit(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && open) sluit(); });

    // ---------- Wisselen tussen de twee onderdelen ----------
    Object.keys(tabs).forEach((k) => tabs[k].addEventListener("click", () => {
        onderdeel = k;
        Object.keys(blokken).forEach((b) => {
            blokken[b].hidden = b !== k;
            tabs[b].setAttribute("aria-selected", b === k ? "true" : "false");
        });
        reken();
    }));

    // ---------- Reageren op invoer ----------
    ["omGetal", "omEenheid", "omTempGetal", "omTempEenheid"].forEach((id) => {
        $(id).addEventListener("input", reken);
        $(id).addEventListener("change", reken);
    });

    // ---------- Taalknoppen van de app ----------
    document.querySelectorAll(".lang-btn").forEach((b) =>
        b.addEventListener("click", () => setTimeout(() => { if (open) zetTeksten(); }, 0)));

    // ---------- Beginstand ----------
    vulEenheden(); vulTempEenheden();
    try {
        const bewaard = localStorage.getItem(OPSLAG + "eenheid");
        if (bewaard && EENHEDEN[bewaard]) $("omEenheid").value = bewaard;
    } catch (e) {}

    // ---------- Aanmelden bij het tools-menu ----------
    window.OMREKENEN = { open: openPaneel };
    if (window.TOOLS && typeof window.TOOLS.voegToe === "function") {
        window.TOOLS.voegToe({
            id: "omrekenen",
            orde: 10,
            label: { nl: "Omrekentool", fr: "Convertisseur", en: "Converter" },
            icoon: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
            open: openPaneel
        });
    }
})();
