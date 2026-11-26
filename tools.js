// =============================================================
// Tools-menu - EA Catering v3
// -------------------------------------------------------------
// LEERMODUS - waarvoor dient dit bestand?
// De kopbalk raakte vol: drie taalknoppen plus een knop voor de
// omrekentool. Daarom staat er nu één knopje met een gereedschapsicoon
// rechts in de tabbladenbalk, en klapt daaronder een lijstje open met de
// tools. De taalknoppen blijven waar ze waren.
//
// EEN TOOL TOEVOEGEN is één aanroep, vanuit het bestand van die tool:
//
//   window.TOOLS.voegToe({
//       id: "mijntool",
//       label: { nl: "Mijn tool", fr: "Mon outil", en: "My tool" },
//       icoon: '<path d="..."/>',          // binnenkant van een 24x24 svg
//       orde: 30,                          // lager = hoger in het menu (standaard 50)
//       beschikbaar: () => true,           // mag weg als hij er altijd is
//       open: () => mijnTool.open()
//   });
//
// Het menu tekent zichzelf opnieuw zodra er een tool bijkomt of de taal
// verandert, dus de volgorde waarin de bestanden laden maakt niet uit.
// =============================================================

(function () {
    "use strict";

    const taalNu = () => {
        let t = "nl";
        try { t = localStorage.getItem("nac-lang") || "nl"; } catch (e) {}
        return ["nl", "fr", "en"].indexOf(t) > -1 ? t : "nl";
    };
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    const TITEL = { nl: "Tools", fr: "Outils", en: "Tools" };
    const LEEG = {
        nl: "Nog geen tools beschikbaar.",
        fr: "Aucun outil disponible pour l'instant.",
        en: "No tools available yet."
    };

    // ---------------------------------------------------------
    // De lijst met tools
    // ---------------------------------------------------------
    const lijst = [];
    window.TOOLS = {
        lijst,
        voegToe(tool) {
            if (!tool || !tool.id || lijst.some((t) => t.id === tool.id)) return;
            lijst.push(tool);
            teken();
        },
        // Handig voor een tool die zijn eigen tellertje wil bijwerken
        herteken: teken
    };

    // ---------------------------------------------------------
    // Knop in de tabbladenbalk
    // ---------------------------------------------------------
    const balk = document.querySelector(".weergave");
    if (!balk) return;                         // geen balk: dan ook geen knop

    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "tools-knop";
    knop.id = "toolsKnop";
    knop.setAttribute("aria-haspopup", "true");
    knop.setAttribute("aria-expanded", "false");
    knop.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M14.7 6.3a4 4 0 0 1 5 5l-9.2 9.2a2.1 2.1 0 0 1-3-3z"/>' +
        '<path d="M9.5 4.5 7 3 4 6l1.5 2.5M5.5 11 3 12l1 4 3 .5"/>' +
        '</svg><span class="tools-label"></span><span class="tools-pijl" aria-hidden="true"></span>';
    balk.appendChild(knop);

    const menu = document.createElement("div");
    menu.className = "tools-menu";
    menu.id = "toolsMenu";
    menu.setAttribute("role", "menu");
    menu.hidden = true;
    menu.setAttribute("aria-labelledby", "toolsKnop");
    balk.appendChild(menu);

    // ---------------------------------------------------------
    // Tekenen
    // ---------------------------------------------------------
    function teken() {
        const taal = taalNu();
        knop.querySelector(".tools-label").textContent = TITEL[taal];
        knop.setAttribute("title", TITEL[taal]);

        const bruikbaar = lijst
            .filter((t) => typeof t.beschikbaar !== "function" || t.beschikbaar())
            .slice().sort((a, b) => (a.orde || 50) - (b.orde || 50));
        if (!bruikbaar.length) {
            menu.innerHTML = `<p class="tools-leeg">${esc(LEEG[taal])}</p>`;
            knop.hidden = true;                 // niets te kiezen: knop ook weg
            return;
        }
        knop.hidden = false;
        menu.innerHTML = bruikbaar.map((t) => {
            const merk = typeof t.merk === "function" ? t.merk() : "";
            return `<button type="button" class="tools-item" role="menuitem" data-tool="${esc(t.id)}">
                <svg viewBox="0 0 24 24" aria-hidden="true">${t.icoon || ""}</svg>
                <span>${esc((t.label && t.label[taal]) || t.id)}</span>
                ${merk ? `<span class="tools-merk">${esc(merk)}</span>` : ""}
            </button>`;
        }).join("");
    }

    // ---------------------------------------------------------
    // Open en dicht
    // ---------------------------------------------------------
    function zetOpen(open) {
        menu.hidden = !open;
        knop.setAttribute("aria-expanded", open ? "true" : "false");
        knop.classList.toggle("aan", open);
    }
    const isOpen = () => !menu.hidden;

    knop.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isOpen()) { zetOpen(false); return; }
        teken();                                // tellertjes bij het openen verversen
        zetOpen(true);
    });

    menu.addEventListener("click", (e) => {
        const b = e.target.closest("[data-tool]");
        if (!b) return;
        zetOpen(false);
        const tool = lijst.find((t) => t.id === b.dataset.tool);
        if (tool && typeof tool.open === "function") tool.open();
    });

    // Buiten het menu tikken, of Escape: dicht.
    document.addEventListener("click", (e) => {
        if (isOpen() && !menu.contains(e.target) && e.target !== knop) zetOpen(false);
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen()) zetOpen(false); });

    // Taal gewisseld: labels opnieuw zetten.
    document.querySelectorAll(".lang-btn").forEach((b) =>
        b.addEventListener("click", () => setTimeout(teken, 0)));

    // ---------------------------------------------------------
    // De bestellijst is ook een tool. Die zit in de app zelf (een eigen
    // scherm), dus we vragen recepten.js om dat scherm te openen.
    // ---------------------------------------------------------
    window.TOOLS.voegToe({
        id: "bestellijst",
        orde: 20,
        label: { nl: "Bestellijst", fr: "Liste de commande", en: "Order list" },
        icoon: '<path d="M5 4h14l-1.2 13.2A2 2 0 0 1 15.8 19H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8h6M9 12h6"/>',
        beschikbaar: () => !!window.BESTELLIJST_ZICHTBAAR && typeof window.EAC_OPEN_TAB === "function",
        merk: () => {
            const n = window.BESTELLIJST && window.BESTELLIJST.aantal ? window.BESTELLIJST.aantal() : 0;
            return n ? String(n) : "";
        },
        open: () => window.EAC_OPEN_TAB("bestellijst")
    });

    teken();
})();
