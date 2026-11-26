// =============================================================
// Tabblad Recepten voor EA Catering V3
// -------------------------------------------------------------
// LEERMODUS - wat gebeurt hier?
// 1. Bovenaan staan twee tabbladen: Instructievideo's en Recepten.
//    Dit bestand wisselt tussen die twee door een klasse op <body>
//    te zetten (rc-modus); recepten.css verbergt dan de video's.
// 2. De recepten zelf (ruim 1 MB) staan in recepten-data.js. Dat
//    bestand wordt pas geladen als iemand het tabblad opent, zodat
//    de videopagina even snel blijft als vroeger.
// 3. Recepten en video's verwijzen naar elkaar:
//    - bij een receptstap staat een gouden knop naar de video;
//    - in het afspeelscherm staat "Recepten met deze techniek".
//    De video speelt in hetzelfde zwarte scherm als op de videopagina
//    (openVideo uit app.js).
// 3b. Nieuwe video's koppelen zichzelf: vul in de Google Sheet (tabblad Video's)
//    de kolom "Zoekwoorden recepten" in, bijvoorbeeld "flambeer, flamberen".
//    Elk recept waarin een receptstap met zo'n woord begint of het bevat,
//    krijgt dan vanzelf een knop naar die video. Geen nieuwe versie nodig.
// 4. Directe links: ?tab=recepten, ?recept=<id> en ?techniek=<YouTube-id>.
//    Met ?embed=1 erbij werkt alles ook ingesloten in BeLADL.
// 5. De knoppen zijn drietalig (NL/FR/EN, zelfde keuze als de video's);
//    de recepten zelf zijn voorlopig alleen in het Nederlands.
// =============================================================

(function () {
    const DATA = "recepten-data.js?v=1";
    const PER_KEER = 24;

    // Hoeveel recepten bij elke video horen (gegenereerd samen met recepten-data.js),
    // zodat het afspeelscherm dat kan tonen zonder alle recepten te laden.
    const AANTAL_PER_VIDEO = {"jMmrwCJZpAY":61,"m0cK_Pge9wk":2,"xDr0W8D6jh0":46,"pC1JnpVI1so":36,"plouGsTZHtU":47,"Ei6WB6FSFMk":15,"BoRaJGuFCWY":36,"Z__WFwikmSg":4,"0QoFjfehnes":18,"gGnlI2E5txU":7,"YlsdetvnrUY":9,"C3C1W4pzi5Q":12,"JeKBqVAt0cA":14,"OTUE7Q4Mdxo":3,"-RRZmj3fFmA":9,"Rv_Yq7ka_lU":24,"Rk_B5yyO0Mw":5,"A9fCmhR9BFk":41,"ABYB6CxNeVo":5,"xmc2JEyu6LM":31,"qwHLqZHukIo":15,"q9zlcYsxeuU":4,"-pBfw_YwzLo":11,"M3ThiVgcfj4":29,"hi6CqhmMddQ":19,"x7nfcie2KW0":19,"gKrq70jGDEQ":7,"_ILm2zaaYYc":18,"Ldb7AaovObI":62,"U69i22cV-Ns":9,"stCqu0-vqB4":19,"5xnvjpNWbAI":10,"Axz_LhRS3pk":8,"6PDbjrgW5aI":29,"hKBAmmxugFU":39,"rFt79XOHlPQ":7,"OrcQfrNCZ4Q":6,"qYlIKLi2IwQ":9,"GFBYaEPDNTs":2,"mFJ6VlAvxB4":30,"95pwbgIikZk":10,"ulr4q5Shu4s":2,"ugkUzNX4qkM":5,"lUBiJRLJy_Q":3,"C9CLgA3OFZU":1,"GjyeDdybnro":20,"KD_NEiQ8Lj4":3,"9HVRGojIZEU":8,"cElw7C_k-5Q":6,"HSwqa7HK2js":3,"aLfP0g9VvQA":8,"VISP2VEdlMs":2,"Jw1CXHBeEKQ":6,"dckCb_fxdGY":3,"uXwLpGXUskI":1,"73_3mXUXf2E":1,"7oKXZ2TeQXI":9,"AZHcylydIks":4,"fxvBGpmQMt4":5};

    // ===== TEKSTEN PER TAAL =====
    const TEKST = {
        nl: {
            tabVideos: "Instructievideo's", tabRecepten: "Recepten", tabBestellijst: "Bestellijst",
            opBestellijst: "Op de bestellijst", staatErop: n => `Staat erop (${n}\u00d7)`, bestellijstTitel: "NAC Performance Support | EA Catering \u2013 Bestellijst", titel: "NAC Performance Support | EA Catering – Recepten",
            sub: "Navy Academy Oostende | DGI 2024, Klein Vers 240e en Selamat Makan deel 1–3",
            kop: "Zoek een recept",
            intro: "Typ een recept of ingrediënt, of kies hieronder een hoofdgroep. Bij een gouden afspeelknop hoort een instructievideo.",
            zoek: "Bijvoorbeeld erwtensoep, kip of santen", wis: "Wissen",
            beschikbaar: (n, v) => `${n} recepten, waarvan ${v} met instructievideo`,
            laden: "Recepten laden…", laadFout: "De recepten konden niet geladen worden. Controleer de verbinding en probeer opnieuw.", opnieuw: "Opnieuw proberen",
            groepen: ["Alle recepten", "Voorgerechten", "Hoofdgerechten", "Sauzen", "Desserts", "Ontbijt & Snacks", "Blauwe Hap"],
            recepten: n => n === 1 ? "1 recept" : `${n} recepten`, alles: "Alles",
            boeken: "Bronboeken", allesAan: "Alles aan", allesUit: "Alles uit", alleBoeken: "alle boeken aan", boekenAan: (a, b) => `${a} van ${b} aan`,
            zoekres: "Zoekresultaten", meer: "Meer recepten tonen",
            geen: "Geen recepten gevonden", geenUitleg: "Probeer een ander zoekwoord of zet meer bronboeken aan.",
            metTechniek: "Recepten met de techniek", wisFilter: "Filter wissen",
            terug: "← Terug naar de lijst", naarGroepen: "← Alle hoofdgroepen", naarStart: "← Naar alle recepten", zoekIn: g => `Zoek in ${g}`, receptuur: "Receptuur", volgensBron: "volgens bronrecept", tijd: "Tijd", bron: "Bron", pagina: "pagina",
            videos: "Instructievideo's bij dit recept", videoUitleg: "De video's tonen de techniek, niet dit specifieke recept.", stap: "stap",
            ingredienten: "Ingrediënten", ingredient: "Ingrediënt", hoeveelheid: "Hoeveelheid", bereiding: "Bereidingswijze",
            gezond: "Gezondere variant (volgens bron)", tip: "Tip", aandacht: "Aandachtspunt",
            print: "Recept afdrukken", deel: "Link kopiëren", gekopieerd: "Link gekopieerd",
            vanVideo: n => `Bekijk ${n} recept${n === 1 ? "" : "en"} met deze techniek`, vanVideoOnbekend: "Bekijk recepten met deze techniek", nlNoot: ""
        },
        fr: {
            tabVideos: "Vidéos d'instruction", tabRecepten: "Recettes", tabBestellijst: "Liste de commande",
            opBestellijst: "Sur la liste de commande", staatErop: n => `Sur la liste (${n}\u00d7)`, bestellijstTitel: "NAC Performance Support | EA Catering \u2013 Liste de commande", titel: "NAC Performance Support | EA Catering – Recettes",
            sub: "Navy Academy Oostende | DGI 2024, Klein Vers 240e et Selamat Makan 1–3",
            kop: "Rechercher une recette",
            intro: "Tapez une recette ou un ingrédient, ou choisissez un groupe ci-dessous. Un bouton doré renvoie à une vidéo d'instruction. Les recettes sont en néerlandais.",
            zoek: "Par exemple soupe aux pois, poulet ou santen", wis: "Effacer",
            beschikbaar: (n, v) => `${n} recettes, dont ${v} avec vidéo d'instruction`,
            laden: "Chargement des recettes…", laadFout: "Impossible de charger les recettes. Vérifiez la connexion et réessayez.", opnieuw: "Réessayer",
            groepen: ["Toutes les recettes", "Entrées", "Plats principaux", "Sauces", "Desserts", "Petit-déjeuner & snacks", "Blauwe Hap"],
            recepten: n => n === 1 ? "1 recette" : `${n} recettes`, alles: "Tout",
            boeken: "Livres sources", allesAan: "Tout activer", allesUit: "Tout désactiver", alleBoeken: "tous les livres activés", boekenAan: (a, b) => `${a} sur ${b} activés`,
            zoekres: "Résultats", meer: "Afficher plus de recettes",
            geen: "Aucune recette trouvée", geenUitleg: "Essayez un autre mot ou activez plus de livres sources.",
            metTechniek: "Recettes avec la technique", wisFilter: "Effacer le filtre",
            terug: "← Retour à la liste", naarGroepen: "← Tous les groupes", naarStart: "← Toutes les recettes", zoekIn: g => `Rechercher dans ${g}`, receptuur: "Portions", volgensBron: "selon la recette source", tijd: "Temps", bron: "Source", pagina: "page",
            videos: "Vidéos d'instruction pour cette recette", videoUitleg: "Les vidéos montrent la technique, pas cette recette précise.", stap: "étape",
            ingredienten: "Ingrédients", ingredient: "Ingrédient", hoeveelheid: "Quantité", bereiding: "Préparation",
            gezond: "Variante plus saine (selon la source)", tip: "Astuce", aandacht: "Point d'attention",
            print: "Imprimer la recette", deel: "Copier le lien", gekopieerd: "Lien copié",
            vanVideo: n => `Voir ${n} recette${n === 1 ? "" : "s"} avec cette technique`, vanVideoOnbekend: "Voir les recettes avec cette technique", nlNoot: "Texte de la recette en néerlandais."
        },
        en: {
            tabVideos: "Instruction videos", tabRecepten: "Recipes", tabBestellijst: "Order list",
            opBestellijst: "Add to order list", staatErop: n => `On the list (${n}\u00d7)`, bestellijstTitel: "NAC Performance Support | EA Catering \u2013 Order list", titel: "NAC Performance Support | EA Catering – Recipes",
            sub: "Navy Academy Oostende | DGI 2024, Klein Vers 240e and Selamat Makan 1–3",
            kop: "Find a recipe",
            intro: "Type a recipe or ingredient, or choose a group below. A gold play button links to an instruction video. The recipes are in Dutch.",
            zoek: "For example erwtensoep, kip or santen", wis: "Clear",
            beschikbaar: (n, v) => `${n} recipes, ${v} with an instruction video`,
            laden: "Loading recipes…", laadFout: "The recipes could not be loaded. Check the connection and try again.", opnieuw: "Try again",
            groepen: ["All recipes", "Starters", "Main courses", "Sauces", "Desserts", "Breakfast & snacks", "Blauwe Hap"],
            recepten: n => n === 1 ? "1 recipe" : `${n} recipes`, alles: "All",
            boeken: "Source books", allesAan: "All on", allesUit: "All off", alleBoeken: "all books on", boekenAan: (a, b) => `${a} of ${b} on`,
            zoekres: "Search results", meer: "Show more recipes",
            geen: "No recipes found", geenUitleg: "Try another word or switch on more source books.",
            metTechniek: "Recipes using", wisFilter: "Clear filter",
            terug: "← Back to the list", naarGroepen: "← All groups", naarStart: "← All recipes", zoekIn: g => `Search in ${g}`, receptuur: "Yield", volgensBron: "as in source recipe", tijd: "Time", bron: "Source", pagina: "page",
            videos: "Instruction videos for this recipe", videoUitleg: "The videos show the technique, not this specific recipe.", stap: "step",
            ingredienten: "Ingredients", ingredient: "Ingredient", hoeveelheid: "Quantity", bereiding: "Method",
            gezond: "Healthier option (from source)", tip: "Tip", aandacht: "Note",
            print: "Print recipe", deel: "Copy link", gekopieerd: "Link copied",
            vanVideo: n => `See ${n} recipe${n === 1 ? "" : "s"} using this technique`, vanVideoOnbekend: "See recipes using this technique", nlNoot: "Recipe text in Dutch."
        }
    };
    const taalNu = () => { let t = "nl"; try { t = localStorage.getItem("nac-lang") || "nl"; } catch (e) {} return TEKST[t] ? t : "nl"; };
    const T = () => TEKST[taalNu()];

    // Hoofdgroepen (naam in de data = Nederlands) en hun pictogram
    const GROEPEN = [
        ["Alle recepten", '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M9 8h6M9 12h4"/>'],
        ["Voorgerechten", '<path d="M3 11h18a9 8 0 0 1-18 0z"/><path d="M8 4c0 1.5 1 1.5 1 3M12 4c0 1.5 1 1.5 1 3M16 4c0 1.5 1 1.5 1 3"/>'],
        ["Hoofdgerechten", '<path d="M3 18h18M5 18a7 7 0 0 1 14 0M12 11V8.5M10.5 8.5h3"/>'],
        ["Sauzen", '<path d="M4 9h12v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM16 11h5M7 4c0 1.2 1 1.2 1 2.4M11 4c0 1.2 1 1.2 1 2.4"/>'],
        ["Desserts", '<path d="M6 13h12l-1.5 7h-9zM6 13a3 3 0 0 1 1-5.5 5 5 0 0 1 10 0A3 3 0 0 1 18 13M12 3v1.5"/>'],
        ["Ontbijt & Snacks", '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/>'],
        ["Blauwe Hap", '<path d="M3 12h18a9 8 0 0 1-18 0zM7 12a5 4 0 0 1 10 0M14 3l4.5 5.5M17.5 2.5l3.5 5"/>']
    ];
    const groepNaam = naam => T().groepen[GROEPEN.findIndex(g => g[0] === naam)] || naam;

    const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const plat = s => String(s).toLocaleLowerCase("nl").normalize("NFD").replace(/[̀-ͯ]/g, "");
    const isKop = s => /^Bereidingswijze \d/.test(s);

    // ---------- Toestand ----------
    let recepten = null, boeken = [], aan = new Set();
    let groep = null, cat = null, techniek = null, limiet = PER_KEER, actief = null, laadBezig = null;

    const view = document.getElementById("receptenView");
    const tabVideos = document.getElementById("tabVideos");
    const tabRecepten = document.getElementById("tabRecepten");
    // De bestellijst heeft geen eigen tabknop meer: hij zit in het
    // tools-menu (tools.js). Het SCHERM bestaat nog wel, en dat openen we
    // hieronder via openTab. Of hij beschikbaar is bepaalt de schakelaar
    // VRIJGEGEVEN in bestellijst.js.
    const blBeschikbaar = !!window.BESTELLIJST_ZICHTBAAR;
    const blView = document.getElementById("bestellijstView");

    // ---------- Video's: titel in de gekozen taal, uit de live videolijst ----------
    function videoVan(id) {
        const v = (window.videos || []).find(x => x.id === id);
        if (v) return v;
        const titel = (window.RECEPTEN_VIDEOTITELS || {})[id] || "Video";
        return { id, titel, categorie: "" };
    }
    function videoTitel(id) {
        const v = videoVan(id), t = taalNu();
        let titel = (t !== "nl" && v[t]) || v.titel || "";
        return titel.replace(/^Instructie(film)?\s+/i, "").replace(/^./, c => c.toUpperCase());
    }
    function speel(id) { if (typeof openVideo === "function") openVideo(videoVan(id)); }

    // ---------- Opbouw van het tabblad (één keer) ----------
    function bouwSkelet() {
        view.innerHTML = `
        <section class="hero" id="rcHero">
            <div class="hero-body">
                <p class="hero-sub" data-rc="sub"></p>
                <h2 data-rc="kop"></h2>
                <p class="hero-intro" data-rc="intro"></p>
                <div class="rc-zoekrij">
                    <div class="zoek">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-3.6-3.6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                        <input id="rcZoek" type="search" autocomplete="off">
                    </div>
                    <button class="rc-wis" id="rcWis" type="button" data-rc="wis"></button>
                </div>
                <p class="aantal" id="rcAantal" aria-live="polite"></p>
            </div>
        </section>
        <div class="container">
            <div id="rcKeuze">
                <div class="rc-tegels" id="rcTegels"></div>
                <div class="rc-filter" id="rcFilter" hidden></div>
                <div class="rc-paneel rc-groepkop" id="rcSub" hidden>
                    <button type="button" class="rc-terug" id="rcNaarGroepen"></button>
                    <h2 class="rc-groeptitel" id="rcSubTitel"></h2>
                    <div class="rc-chips" id="rcSubcats"></div>
                </div>
                <details class="rc-paneel" id="rcBoekPaneel">
                    <summary><span data-rc="boeken" style="margin:0;color:inherit;font-size:1rem;font-weight:600"></span><span id="rcBoekStatus"></span></summary>
                    <div class="rc-boeken" id="rcBoeken"></div>
                    <div class="rc-boek-acties"><button class="rc-klein" id="rcAan" type="button" data-rc="allesAan"></button><button class="rc-klein" id="rcUit" type="button" data-rc="allesUit"></button></div>
                </details>
            </div>
            <section class="rc-resultaten" id="rcResultaten" hidden>
                <div class="rc-balk"><h2 id="rcResKop"></h2><span id="rcResAantal" aria-live="polite"></span></div>
                <div class="rc-kaarten" id="rcLijst"></div>
                <button class="rc-meer" id="rcMeer" type="button" hidden data-rc="meer"></button>
            </section>
            <div class="rc-melding" id="rcMelding" hidden></div>
            <article class="rc-recept" id="rcRecept" hidden></article>
        </div>`;

        const $ = id => document.getElementById(id);
        $("rcZoek").addEventListener("input", () => { limiet = PER_KEER; $("rcRecept").hidden = true; actief = null; tekenAlles(); });
        $("rcWis").onclick = () => { $("rcZoek").value = ""; groep = cat = techniek = null; limiet = PER_KEER; $("rcRecept").hidden = true; actief = null; tekenAlles(); zetAdres(); $("rcZoek").focus(); };
        // Tegel = eigen pagina met de recepten van die hoofdgroep (op de gsm logischer dan
        // de lijst onderaan). De terugknop van de telefoon brengt je weer bij de tegels.
        $("rcTegels").onclick = e => {
            const b = e.target.closest(".rc-tegel"); if (!b) return;
            groep = b.dataset.groep; cat = null; limiet = PER_KEER;
            $("rcRecept").hidden = true; actief = null; tekenAlles();
            stapIn("groep");
            naarBoven();
        };
        $("rcNaarGroepen").onclick = () => terugStap("groep");
        $("rcSubcats").onclick = e => { const b = e.target.closest(".rc-chip"); if (!b) return; cat = b.dataset.cat || null; limiet = PER_KEER; $("rcRecept").hidden = true; tekenAlles(); };
        $("rcFilter").onclick = e => { if (e.target.closest("button")) { techniek = null; limiet = PER_KEER; tekenAlles(); zetAdres(); } };
        $("rcBoeken").onchange = e => { const b = e.target.dataset.boek; if (e.target.checked) aan.add(b); else aan.delete(b); limiet = PER_KEER; tekenAlles(); };
        $("rcAan").onclick = () => { aan = new Set(boeken); tekenAlles(); };
        $("rcUit").onclick = () => { aan.clear(); tekenAlles(); };
        $("rcMeer").onclick = () => { limiet += PER_KEER; tekenResultaten(); };
        $("rcLijst").onclick = e => { const k = e.target.closest(".rc-kaart"); if (k) { scrollLijst = window.scrollY; toonRecept(k.dataset.id); } };
        $("rcRecept").onclick = e => {
            const v = e.target.closest("[data-video]"); if (v) return speel(v.dataset.video);
            if (e.target.closest("#rcTerug")) return terugStap("recept");
            if (e.target.closest("#rcPrint")) return window.print();
            if (e.target.closest("#rcOpLijst")) {        // recept op de bestellijst zetten
                window.BESTELLIJST.voegToe(actief);
                return;
            }
            const d = e.target.closest("#rcDeel");
            if (d) {
                const url = new URL(window.EAC_DEEL_BASIS || location.href); url.search = ""; url.searchParams.set("recept", actief);
                const klaar = () => { d.textContent = T().gekopieerd; setTimeout(() => { d.textContent = T().deel; }, 1800); };
                if (navigator.clipboard) navigator.clipboard.writeText(url.href).then(klaar, () => prompt("", url.href));
                else prompt("", url.href);
            }
        };
    }

    // ---------- Teksten van het tabblad in de gekozen taal ----------
    function zetTeksten() {
        document.querySelectorAll("[data-rc]").forEach(el => { const t = T()[el.dataset.rc]; if (typeof t === "string") el.textContent = t; });
        const z = document.getElementById("rcZoek");
        if (z) { z.placeholder = groep && groep !== "Alle recepten" ? T().zoekIn(groepNaam(groep)) : T().zoek; z.setAttribute("aria-label", z.placeholder); }
        if (document.body.classList.contains("rc-modus")) document.title = T().titel;
    }

    // ---------- Filteren ----------
    function gefilterd(negeerGroep) {
        const z = document.getElementById("rcZoek");
        const woorden = plat(z ? z.value : "").split(/\s+/).filter(Boolean);
        return recepten.filter(r => aan.has(r.book)
            && (!techniek || (r.videos || []).some(v => v[0] === techniek))
            && (negeerGroep || !groep || groep === "Alle recepten" || r.group === groep)
            && (negeerGroep || !cat || r.category === cat)
            && woorden.every(w => r._zoek.includes(w)))
            .sort((a, b) => a.name.localeCompare(b.name, "nl"));
    }
    const heeftKeuze = () => document.getElementById("rcZoek").value.trim() !== "" || groep !== null || techniek !== null;

    function tekenTegels() {
        const basis = gefilterd(true);
        document.getElementById("rcTegels").innerHTML = GROEPEN.map(([naam, icoon]) => {
            const n = naam === "Alle recepten" ? basis.length : basis.filter(r => r.group === naam).length;
            return `<button type="button" class="rc-tegel${groep === naam ? " active" : ""}" data-groep="${esc(naam)}" aria-pressed="${groep === naam}">
                <svg viewBox="0 0 24 24" aria-hidden="true">${icoon}</svg>
                <span class="rc-tegel-naam">${esc(groepNaam(naam))}</span><span class="rc-tegel-aantal">${T().recepten(n)}</span></button>`;
        }).join("");
        document.getElementById("rcAantal").textContent =
            T().beschikbaar(recepten.filter(r => aan.has(r.book)).length, recepten.filter(r => aan.has(r.book) && r.videos).length);
        const f = document.getElementById("rcFilter");
        f.hidden = !techniek;
        if (techniek) f.innerHTML = `<span>${esc(T().metTechniek)} <b>${esc(videoTitel(techniek))}</b></span><button type="button">${esc(T().wisFilter)}</button>`;
    }

    function tekenSub() {
        const paneel = document.getElementById("rcSub");
        if (!groep) { paneel.hidden = true; return; }
        document.getElementById("rcNaarGroepen").textContent = T().naarGroepen;
        document.getElementById("rcSubTitel").textContent = groepNaam(groep);
        paneel.hidden = false;
        if (groep === "Alle recepten") { document.getElementById("rcSubcats").innerHTML = ""; return; }
        const basis = gefilterd(true).filter(r => r.group === groep);
        const tel = {};
        basis.forEach(r => { tel[r.category] = (tel[r.category] || 0) + 1; });
        if (cat && !tel[cat]) tel[cat] = 0;
        const cats = Object.keys(tel).sort((a, b) => a.localeCompare(b, "nl"));
        document.getElementById("rcSubcats").innerHTML =
            `<button type="button" class="rc-chip${cat === null ? " active" : ""}" data-cat="">${esc(T().alles)}<small>${basis.length}</small></button>` +
            cats.map(c => `<button type="button" class="rc-chip${cat === c ? " active" : ""}" data-cat="${esc(c)}">${esc(c)}<small>${tel[c]}</small></button>`).join("");
        paneel.hidden = false;
    }

    function tekenBoeken() {
        document.getElementById("rcBoeken").innerHTML = boeken.map(b =>
            `<label class="rc-boek"><input type="checkbox" data-boek="${esc(b)}"${aan.has(b) ? " checked" : ""}><span><b>${esc(b)}</b><i>${T().recepten(recepten.filter(r => r.book === b).length)}</i></span></label>`).join("");
        document.getElementById("rcBoekStatus").textContent = aan.size === boeken.length ? T().alleBoeken : T().boekenAan(aan.size, boeken.length);
    }

    function tekenResultaten() {
        const res = document.getElementById("rcResultaten"), melding = document.getElementById("rcMelding");
        if (!document.getElementById("rcRecept").hidden) { res.hidden = true; melding.hidden = true; return; }
        if (!heeftKeuze()) { res.hidden = true; melding.hidden = true; return; }
        const rijen = gefilterd(false);
        melding.hidden = rijen.length > 0; res.hidden = rijen.length === 0;
        if (!rijen.length) { melding.innerHTML = `<b>${esc(T().geen)}</b>${esc(T().geenUitleg)}`; return; }
        const z = document.getElementById("rcZoek").value.trim();
        document.getElementById("rcResKop").textContent = cat || (groep && groep !== "Alle recepten" ? groepNaam(groep)
            : techniek ? videoTitel(techniek) : z ? T().zoekres : groepNaam("Alle recepten"));
        document.getElementById("rcResAantal").textContent = T().recepten(rijen.length);
        document.getElementById("rcLijst").innerHTML = rijen.slice(0, limiet).map(r => `<button type="button" class="rc-kaart" data-id="${esc(r.id)}">
            <span class="rc-kaart-cat">${esc(r.category)}</span><h3>${esc(r.name)}</h3>
            <span class="rc-kaart-bron"><span>${esc(r.book.replace("Receptenboek ", ""))} · p. ${r.page}</span>${r.videos ? `<span class="rc-kaart-video">▶ ${r.videos.length}</span>` : ""}</span></button>`).join("");
        document.getElementById("rcMeer").hidden = rijen.length <= limiet;
    }

    function tekenAlles() { zetStand(); tekenTegels(); tekenSub(); tekenBoeken(); tekenResultaten(); zetTeksten(); }

    // ---------- Pagina's binnen het tabblad: startscherm, hoofdgroep, recept ----------
    // LEERMODUS: met history.pushState krijgt elke stap een eigen plek in de
    // geschiedenis. De terugknop van de telefoon (of browser) gaat dan stap voor
    // stap terug: recept -> lijst -> tegels, in plaats van de app te verlaten.
    function zetStand() {
        view.classList.toggle("rc-groep-open", groep !== null);
        view.classList.toggle("rc-recept-open", !document.getElementById("rcRecept").hidden);
    }
    function naarBoven() { window.scrollTo({ top: 0, behavior: "smooth" }); }
    function stapIn(soort) {
        try { history.pushState({ rc: soort }, "", location.href); } catch (e) {}
    }
    // Terug met de knop op de pagina: via de geschiedenis als die stap erin staat,
    // anders (bijv. na een directe link) gewoon zelf terugzetten.
    function terugStap(soort) {
        if (history.state && history.state.rc === soort) history.back();
        else if (soort === "recept") sluitRecept();
        else sluitGroep();
    }
    function sluitGroep() {
        groep = cat = null; limiet = PER_KEER;
        document.getElementById("rcRecept").hidden = true; actief = null;
        tekenAlles(); naarBoven();
    }
    window.addEventListener("popstate", e => {
        if (tab !== "recepten" || !recepten) return;
        const st = e.state && e.state.rc;
        if (actief && st !== "recept") sluitRecept();
        if (groep && !st) sluitGroep();
    });

    // ---------- Eén recept ----------
    const stapNummer = (r, i) => r.steps.slice(0, i + 1).filter(s => !isKop(s)).length || 1;

    // opnieuw = alleen opnieuw tekenen (taalwissel), geen nieuwe geschiedenisstap
    function toonRecept(id, zonderScroll, opnieuw) {
        const r = recepten.find(x => x.id === id); if (!r) return;
        actief = id;
        const perStap = {};
        (r.videos || []).forEach(([v, s]) => { (perStap[s] = perStap[s] || []).push(v); });
        const knop = (v, klasse, extra) => `<button type="button" class="${klasse}" data-video="${esc(v)}">${esc(videoTitel(v))}${extra || ""}</button>`;
        const stappen = r.steps.map((s, i) => `<li${isKop(s) ? ' class="rc-tussenkop"' : ""}>${esc(s)}${perStap[i] ? "<br>" + perStap[i].map(v => knop(v, "rc-stapvideo")).join("") : ""}</li>`).join("");
        const feiten = [`<span class="rc-feit"><b>${esc(T().receptuur)}:</b> ${esc(r.servings === "Volgens bronrecept" ? T().volgensBron : r.servings)}</span>`];
        if (r.time && r.time !== "Niet vermeld") feiten.push(`<span class="rc-feit"><b>${esc(T().tijd)}:</b> ${esc(r.time)}</span>`);
        feiten.push(`<span class="rc-feit"><b>${esc(T().bron)}:</b> ${esc(r.book)}, ${esc(T().pagina)} ${r.page}</span>`);
        const logo = document.querySelector(".merk-logo");
        const el = document.getElementById("rcRecept");
        el.innerHTML = `
            <div class="rc-print-kop"><img src="${logo ? logo.src : ""}" alt=""><span>Navy Academy Oostende | EA Catering – Recepten</span></div>
            <button type="button" class="rc-terug" id="rcTerug">${esc(heeftKeuze() ? T().terug : T().naarStart)}</button>
            <div class="rc-recept-kop">
                <p class="rc-recept-cat">${r.group === r.category ? esc(groepNaam(r.group)) : esc(groepNaam(r.group)) + " · " + esc(r.category)}</p>
                <h2>${esc(r.name)}</h2>
                <div class="rc-feiten">${feiten.join("")}</div>
                ${T().nlNoot ? `<p style="margin-top:.6rem;font-size:.85rem;color:var(--tekst-zacht)">${esc(T().nlNoot)}</p>` : ""}
            </div>
            ${r.videos ? `<div class="rc-videoblok"><p class="rc-paneel-kop">${esc(T().videos)}</p><div class="rc-chips">${r.videos.map(([v, s]) => knop(v, "rc-vknop", `<small>${esc(T().stap)} ${stapNummer(r, s)}</small>`)).join("")}</div><p>${esc(T().videoUitleg)}</p></div>` : ""}
            <div class="rc-kolommen">
                <section><h3>${esc(T().ingredienten)}</h3>
                    <table><thead><tr><th>${esc(T().ingredient)}</th><th>${esc(T().hoeveelheid)}</th></tr></thead>
                    <tbody>${r.ingredients.map(i => `<tr><td>${esc(i[0])}</td><td>${esc(i[1])}${i[2] ? " " + esc(i[2]) : ""}</td></tr>`).join("")}</tbody></table>
                    ${r.alt ? `<div class="rc-kader rc-groen"><b>${esc(T().gezond)}</b><ul>${r.alt.map(a => `<li>${esc(a)}</li>`).join("")}</ul></div>` : ""}
                </section>
                <section><h3>${esc(T().bereiding)}</h3>
                    <ol class="rc-stappen">${stappen}</ol>
                    ${r.tips ? `<div class="rc-kader"><b>${esc(T().tip)}</b>${r.tips.map(t => esc(t.charAt(0).toUpperCase() + t.slice(1))).join("<br>")}</div>` : ""}
                    <div class="rc-kader"><b>${esc(T().aandacht)}</b>${esc(r.note)}</div>
                    <div class="rc-acties"><button type="button" class="rc-knop" id="rcPrint">${esc(T().print)}</button><button type="button" class="rc-knop rc-licht" id="rcDeel">${esc(T().deel)}</button>${blBeschikbaar ? `<button type="button" class="rc-knop bl-opknop" id="rcOpLijst">${esc(T().opBestellijst)}</button>` : ""}</div>
                </section>
            </div>`;
        const wasDicht = el.hidden;
        el.hidden = false;
        document.getElementById("rcResultaten").hidden = true;
        document.getElementById("rcMelding").hidden = true;
        zetStand();
        zetOpLijstKnop();
        if (wasDicht && !opnieuw) stapIn("recept");
        if (!zonderScroll || !opnieuw) window.scrollTo(0, 0);
    }

    let scrollLijst = 0;
    function sluitRecept() {
        document.getElementById("rcRecept").hidden = true; actief = null;
        zetStand(); tekenResultaten();
        window.scrollTo(0, scrollLijst);   // terug naar dezelfde plek in de lijst
    }

    // ---------- Data laden (pas bij eerste gebruik) ----------
    function bereidVoor() {
        recepten = window.RECEPTEN;
        recepten.forEach(r => { r._zoek = plat([r.name, r.category, r.group, r.book, ...r.ingredients.map(i => i[0])].join(" ")); });
        boeken = [...new Set(recepten.map(r => r.book))];
        aan = new Set(boeken);
        koppelZoekwoorden();
    }

    // ---------- Koppeling via de kolom "Zoekwoorden recepten" in de Sheet ----------
    // LEERMODUS: per video maken we van de woorden een zoekpatroon.
    // - Elk woord telt als heel woord: "fileer" vindt "fileer de vis", niet "gefileerd".
    // - Zet je er een * achter, dan telt ook alles wat ermee begint: "ontschub*" vindt
    //   "ontschubben" en "ontschubde".
    // - Meerdere woorden achter elkaar mag ook: "maak de vis schoon".
    // Hoofdletters en accenten maken niet uit. Scheid de woorden met komma's.
    function koppelZoekwoorden() {
        if (!recepten) return;
        const metWoorden = (window.videos || []).filter(v => v.woorden);
        metWoorden.forEach(v => {
            const woorden = v.woorden.split(/[,;]/).map(w => plat(w.trim())).filter(w => w.replace("*", "").length >= 3);
            if (!woorden.length) return;
            const stuk = w => {
                const begin = w.endsWith("*");
                const kaal = w.replace(/\*+$/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
                return kaal + (begin ? "" : "(?![a-z])");
            };
            const patroon = new RegExp("(^|[^a-z])(" + woorden.map(stuk).join("|") + ")");
            recepten.forEach(r => {
                if ((r.videos || []).some(x => x[0] === v.id)) return;
                const i = r.steps.findIndex(st => patroon.test(plat(st)));
                if (i < 0) return;
                r.videos = (r.videos || []).concat([[v.id, i]]).sort((a, b) => a[1] - b[1]).slice(0, 6);
            });
        });
    }
    // Aantal recepten bij een video; null = nog niet bekend (recepten nog niet geladen)
    function aantalVoor(id) {
        if (!recepten && window.RECEPTEN) bereidVoor();   // BeLADL-bestand: data is er al
        if (recepten) return recepten.filter(r => (r.videos || []).some(x => x[0] === id)).length;
        const v = (window.videos || []).find(x => x.id === id);
        if (v && v.woorden) return null;
        return AANTAL_PER_VIDEO[id] || 0;
    }
    function zetVanVideo(id) {
        const n = aantalVoor(id);
        vanVideo.hidden = n === 0 || tab === "recepten";
        vanVideo.textContent = n === null ? T().vanVideoOnbekend : n ? T().vanVideo(n) : "";
    }
    function laadData() {
        if (recepten) return Promise.resolve();
        if (laadBezig) return laadBezig;
        if (window.RECEPTEN) { bereidVoor(); return Promise.resolve(); }   // BeLADL-bestand: data zit er al in
        const melding = document.getElementById("rcMelding");
        melding.hidden = false; melding.innerHTML = `<b>${esc(T().laden)}</b>`;
        laadBezig = new Promise((ok, fout) => {
            const s = document.createElement("script");
            s.src = DATA; s.onload = ok; s.onerror = () => { s.remove(); fout(); };
            document.body.appendChild(s);
        }).then(() => {
            bereidVoor();
            melding.hidden = true;
        }).catch(() => {
            laadBezig = null;
            melding.innerHTML = `<b>${esc(T().geen)}</b>${esc(T().laadFout)} <button type="button" class="rc-klein" id="rcOpnieuw">${esc(T().opnieuw)}</button>`;
            document.getElementById("rcOpnieuw").onclick = () => openTab("recepten");
            throw new Error("laden mislukt");
        });
        return laadBezig;
    }

    // ---------- Tabbladen wisselen ----------
    let tab = "videos";
    function zetAdres() {
        try {
            const p = new URLSearchParams(location.search);
            ["tab", "recept", "techniek", "v", "cat"].forEach(k => p.delete(k));
            if (tab === "recepten") {
                p.set("tab", "recepten");
                if (techniek) p.set("techniek", techniek);
            } else if (tab === "bestellijst") {
                p.set("tab", "bestellijst");
            }
            const q = p.toString();
            history.replaceState(history.state, "", location.pathname + (q ? "?" + q : ""));
        } catch (e) {}
    }

    function openTab(naam, opties) {
        if (naam === "bestellijst" && !blBeschikbaar) naam = "videos";      // niet vrijgegeven
        tab = (naam === "recepten" || naam === "bestellijst") ? naam : "videos";
        const rc = tab === "recepten";
        const bl = tab === "bestellijst";
        document.body.classList.toggle("rc-modus", rc);
        document.body.classList.toggle("bl-modus", bl);
        view.hidden = !rc;
        if (blView) blView.hidden = !bl;
        tabVideos.setAttribute("aria-selected", tab === "videos");
        tabRecepten.setAttribute("aria-selected", rc);

        if (bl) {
            // De bestellijst gebruikt dezelfde receptendata als het tabblad
            // Recepten; laadData() haalt die maar \u00e9\u00e9n keer op.
            // Het receptenscherm moet wel bestaan: laadData zet zijn
            // laadmelding daarin. Zonder dit crasht de app als iemand de
            // bestellijst opent zonder eerst bij de recepten te zijn geweest.
            if (!view.firstChild) bouwSkelet();
            document.title = T().bestellijstTitel;
            return laadData().then(() => {
                window.BESTELLIJST.open(blView);
                zetAdres();
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
            }).catch(() => {
                blView.innerHTML = '<div class="bl-wrap"><div class="bl-kaart">' +
                    '<p class="bl-leeg">De recepten konden niet geladen worden. ' +
                    'Controleer de verbinding en probeer het opnieuw.</p></div></div>';
            });
        }
        if (!rc) {
            document.title = (typeof L === "function" && L().titel) || document.title;
            zetAdres();
            return Promise.resolve();
        }
        if (!view.firstChild) bouwSkelet();
        zetTeksten();
        return laadData().then(() => {
            opties = opties || {};
            if (opties.techniek !== undefined) { techniek = opties.techniek; groep = cat = null; document.getElementById("rcZoek").value = ""; document.getElementById("rcRecept").hidden = true; actief = null; limiet = PER_KEER; }
            tekenAlles();
            if (opties.recept) toonRecept(opties.recept, !opties.naarRecept);
            zetAdres();
            if (opties.scroll) window.scrollTo({ top: 0, behavior: "smooth" });
        }).catch(() => {});
    }

    tabVideos.addEventListener("click", () => openTab("videos"));
    tabRecepten.addEventListener("click", () => openTab("recepten"));
    if (blBeschikbaar && window.BESTELLIJST) {
        // Verandert de lijst, dan de knop onder het recept bijwerken en het
        // tools-menu laten hertekenen (daar staat het tellertje nu).
        window.BESTELLIJST.bijWijziging = function () {
            zetOpLijstKnop();
            if (window.TOOLS && typeof window.TOOLS.herteken === "function") window.TOOLS.herteken();
        };
        window.BESTELLIJST.bijWijziging();
    }

    // Het tools-menu opent het bestellijstscherm hiermee.
    window.EAC_OPEN_TAB = openTab;

    // Knop onder een recept: tekst en teller laten kloppen
    function zetOpLijstKnop() {
        const knop = document.getElementById("rcOpLijst");
        if (!knop || !actief || !window.BESTELLIJST) return;
        const n = window.BESTELLIJST.aantalVoor(actief);
        knop.textContent = n ? T().staatErop(n) : T().opBestellijst;
        if (n) knop.dataset.aantal = n; else delete knop.dataset.aantal;
        knop.classList.toggle("rc-licht", n > 0);
    }

    // ---------- Afspeelscherm: link naar recepten met deze techniek ----------
    const modalInner = document.querySelector(".video-modal-inner");
    const vanVideo = document.createElement("button");
    vanVideo.type = "button"; vanVideo.className = "rc-vanvideo"; vanVideo.hidden = true;
    if (modalInner) modalInner.appendChild(vanVideo);
    let laatsteVideo = null;
    vanVideo.addEventListener("click", () => {
        if (typeof sluitVideo === "function") sluitVideo();
        openTab("recepten", { techniek: laatsteVideo, scroll: true });
    });
    // openVideo uit app.js aanvullen: eerst gewoon afspelen, daarna de link zetten.
    if (typeof window.openVideo === "function") {
        const origineel = window.openVideo;
        window.openVideo = function (video) {
            origineel(video);
            laatsteVideo = video && video.id;
            zetVanVideo(laatsteVideo);   // in het receptenscherm zelf is de link overbodig
        };
    }

    // ---------- Taal: meeschakelen met de NL/FR/EN-knoppen ----------
    function vertaalTabs() {
        document.querySelectorAll(".weergave [data-rc]").forEach(el => { el.textContent = T()[el.dataset.rc]; });
        document.querySelector(".weergave").setAttribute("aria-label",
            T().tabVideos + " / " + T().tabRecepten);
        zetOpLijstKnop();
    }
    document.querySelectorAll(".lang-btn").forEach(b => b.addEventListener("click", () => {
        vertaalTabs();
        if (tab === "recepten") {
            document.title = T().titel;
            if (recepten) { tekenAlles(); if (actief) toonRecept(actief, true, true); } else zetTeksten();
        }
    }));
    vertaalTabs();

    // ---------- Directe links ----------
    const p = new URLSearchParams(location.search);
    const recept = p.get("recept"), tech = p.get("techniek");
    if (p.get("tab") === "bestellijst" && blBeschikbaar) openTab("bestellijst");
    else if (p.get("tab") === "recepten" || recept || tech) openTab("recepten", { recept: recept || undefined, techniek: tech || undefined, naarRecept: true });
    // ?v=... (QR-code): app.js opende de video al vóór dit bestand; zet de receptenlink alsnog.
    const vid = p.get("v");
    if (vid && document.getElementById("videoModal").classList.contains("open")) {
        laatsteVideo = vid;
        zetVanVideo(vid);
    }
})();
