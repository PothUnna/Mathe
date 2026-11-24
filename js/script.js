/* Gemeinsame Funktionen: Pfadanzeige, Kacheln, Zeichnungen, Übungen. */
"use strict";

// Hauptordner der Webseite (funktioniert auch in einem Unterordner auf GitHub Pages)
const WURZEL = new URL("../", document.currentScript.src);

function seitenAdresse(ordnerliste) {
  let pfad = ordnerliste.map((o) => o + "/").join("");
  // Beim Öffnen direkt von der Festplatte muss die Datei genannt werden.
  if (location.protocol === "file:") pfad += "index.html";
  return new URL(pfad || "./", WURZEL).href;
}

// Kurzform zum Erzeugen von HTML-Elementen
function el(name, attribute = {}, ...inhalt) {
  const e = document.createElement(name);
  for (const [k, v] of Object.entries(attribute)) e.setAttribute(k, v);
  e.append(...inhalt);
  return e;
}

/* ---------- Pfadanzeige, Kacheln und Fußzeile ---------- */
(function seiteAufbauen() {
  const ordner = (document.body.dataset.pfad || "").split("/").filter(Boolean);
  let knoten = STRUKTUR;
  const stufen = [{ knoten, ordner: [] }];
  ordner.forEach((name, i) => {
    knoten = (knoten.kinder || []).find((k) => k.ordner === name);
    if (!knoten) throw new Error("Seite fehlt in struktur.js: " + ordner.join("/"));
    stufen.push({ knoten, ordner: ordner.slice(0, i + 1) });
  });

  const nav = document.getElementById("pfad");
  if (nav) {
    const liste = el("ol");
    stufen.forEach((s, i) => {
      const link = el("a", { href: seitenAdresse(s.ordner) }, s.knoten.titel);
      if (i === stufen.length - 1) link.setAttribute("aria-current", "page");
      liste.append(el("li", {}, link));
    });
    nav.append(liste);
  }

  const kacheln = document.getElementById("kacheln");
  if (kacheln) {
    for (const kind of (knoten.kinder || []).filter((k) => !k.fusszeile)) {
      kacheln.append(
        el("a", { class: "kachel", href: seitenAdresse([...ordner, kind.ordner]) },
          el("span", { class: "kachel-titel" }, kind.titel),
          el("span", { class: "kachel-text" }, kind.text || ""))
      );
    }
  }

  document.body.append(el("footer", {}, el("nav", { "aria-label": "Rechtliches" },
    ...STRUKTUR.kinder.filter((k) => k.fusszeile)
      .map((k) => el("a", { href: seitenAdresse([k.ordner]) }, k.titel)))));
})();

/* ---------- Hilfen für Aufgaben ---------- */
const zufall = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const wahl = (liste) => liste[zufall(0, liste.length - 1)];
const ggt = (a, b) => (b ? ggt(b, a % b) : a);

function mischen(liste) {
  const l = [...liste];
  for (let i = l.length - 1; i > 0; i--) {
    const j = zufall(0, i);
    [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
}

function bruch(z, n) {
  return el("span", { class: "bruch", role: "img", "aria-label": `${z} durch ${n}` },
    el("span", {}, String(z)), el("span", {}, String(n)));
}

function zahlFeld(name) {
  return el("input", {
    type: "text", inputmode: "numeric", maxlength: "4", autocomplete: "off", "aria-label": name
  });
}

/* Eingabefeld für einen Bruch. lesen() liefert {z, n} oder null.
   fest: vorgegebene Werte, z. B. { n: 20 } für einen festen Nenner */
function bruchEingabe(fest = {}) {
  const teil = (name, wert) => {
    if (wert !== undefined) {
      return { element: el("span", { class: "fest" }, String(wert)), lesen: () => String(wert), setzen() {} };
    }
    const feld = zahlFeld(name);
    return { element: feld, lesen: () => feld.value.trim(), setzen(w) { feld.value = w; } };
  };
  const zaehler = teil("Zähler", fest.z);
  const nenner = teil("Nenner", fest.n);
  return {
    element: el("div", { class: "bruch-eingabe" },
      zaehler.element, el("span", { class: "strich" }), nenner.element),
    lesen() {
      const z = zaehler.lesen(), n = nenner.lesen();
      return /^\d+$/.test(z) && /^\d+$/.test(n) ? { z: Number(z), n: Number(n) } : null;
    },
    setzen(z, n) { zaehler.setzen(z); nenner.setzen(n); }
  };
}

/* Knöpfe, von denen genau einer gewählt ist. optionen: [{ wert, text, name }]
   name ist die Vorlesehilfe. wert() liefert null, solange nichts gewählt ist. */
function wahlKnoepfe(optionen) {
  let gewaehlt = null;
  const knoepfe = optionen.map((o) => {
    const knopf = el("button", { type: "button", "aria-pressed": "false", "aria-label": o.name || o.text }, o.text);
    knopf.addEventListener("click", () => setzen(o.wert));
    return knopf;
  });
  function setzen(wert) {
    gewaehlt = wert;
    knoepfe.forEach((k, i) => k.setAttribute("aria-pressed", String(optionen[i].wert === wert)));
  }
  return { element: el("div", { class: "art", role: "group" }, ...knoepfe), wert: () => gewaehlt, setzen };
}

function gemischt(g, z, n) {
  return el("span", { class: "gemischt" }, String(g), bruch(z, n));
}

/* Eingabefeld für eine gemischte Zahl. fest: vorgegebene Werte wie bei bruchEingabe, dazu g.
   Bleibt der Bruch leer, gilt er als 0. lesen() liefert {g, z, n} oder null. */
function gemischtEingabe(fest = {}) {
  const ganze = fest.g === undefined ? zahlFeld("Ganze") : el("span", { class: "fest" }, String(fest.g));
  const b = bruchEingabe(fest);
  const zahl = (t) => (/^\d+$/.test(t) ? Number(t) : null);
  return {
    element: el("div", { class: "gemischt-eingabe" }, ganze, b.element),
    lesen() {
      const g = fest.g === undefined ? (ganze.value.trim() === "" ? 0 : zahl(ganze.value.trim())) : fest.g;
      const felder = [...b.element.querySelectorAll("input")];
      const leer = felder.length === 2 && felder.every((f) => f.value.trim() === "");
      if (g === null || (leer && g === 0)) return null;
      const e = leer ? { z: 0, n: 1 } : b.lesen();
      return e && { g, ...e };
    },
    setzen(g, z, n) {
      if (fest.g === undefined) ganze.value = g;
      b.setzen(z, n);
    }
  };
}

/* Karten in einer Reihe, die man an die richtige Stelle zieht.
   Ohne Ziehen: zwei Karten nacheinander antippen, dann tauschen sie die Plätze.
   folge() liefert die Nummern der Karten von links nach rechts. */
function ziehKarten(inhalte) {
  const karten = inhalte.map((inhalt) => el("button", { type: "button", "aria-pressed": "false" }, inhalt));
  const reihe = el("div", { class: "zieh-reihe" }, ...karten);
  let ordnung = [...karten];
  let gewaehlt = null;   // angetippte Karte
  let zug = null;        // laufendes Ziehen
  let gezogen = false;   // unterscheidet Ziehen und Antippen

  function anordnen(neu) {
    ordnung = neu;
    reihe.append(...ordnung);
  }
  function waehlen(karte) {
    gewaehlt = karte;
    karten.forEach((k) => k.setAttribute("aria-pressed", String(k === karte)));
  }
  function antippen(karte) {
    if (gewaehlt === null) return waehlen(karte);
    if (gewaehlt !== karte) {
      const neu = [...ordnung];
      const a = neu.indexOf(gewaehlt), b = neu.indexOf(karte);
      [neu[a], neu[b]] = [neu[b], neu[a]];
      anordnen(neu);
      karte.focus({ preventScroll: true });
    }
    waehlen(null);
  }
  function verschoben(von, nach) {
    const neu = [...ordnung];
    neu.splice(nach, 0, neu.splice(von, 1)[0]);
    return neu;
  }
  function beenden(uebernehmen) {
    if (!zug) return;
    const { karte, von, nach } = zug;
    zug = null;
    karte.classList.remove("gezogen");
    reihe.classList.remove("zieht");
    karten.forEach((k) => { k.style.transform = ""; });
    if (uebernehmen && von !== nach) anordnen(verschoben(von, nach));
  }

  karten.forEach((karte) => {
    karte.addEventListener("pointerdown", (ev) => {
      if (zug || ev.button !== 0) return;
      gezogen = false;
      const links = ordnung.map((k) => k.getBoundingClientRect().left);
      const von = ordnung.indexOf(karte);
      zug = { karte, id: ev.pointerId, x: ev.clientX, von, nach: von, schritt: links[1] - links[0] };
      try { karte.setPointerCapture(ev.pointerId); } catch (e) { /* Ziehen geht auch ohne */ }
    });
    karte.addEventListener("pointermove", (ev) => {
      if (!zug || zug.id !== ev.pointerId) return;
      const dx = ev.clientX - zug.x;
      if (!gezogen && Math.abs(dx) < 8) return;
      if (!gezogen) {
        gezogen = true;
        waehlen(null);
        karte.classList.add("gezogen");
        reihe.classList.add("zieht");
      }
      const letzter = ordnung.length - 1;
      const weg = Math.max(-zug.von * zug.schritt, Math.min((letzter - zug.von) * zug.schritt, dx));
      zug.nach = zug.von + Math.round(weg / zug.schritt);
      karte.style.transform = `translateX(${weg}px)`;
      ordnung.forEach((k, i) => {
        if (k === karte) return;
        let d = 0;
        if (i > zug.von && i <= zug.nach) d = -zug.schritt;
        if (i < zug.von && i >= zug.nach) d = zug.schritt;
        k.style.transform = d ? `translateX(${d}px)` : "";
      });
    });
    karte.addEventListener("pointerup", (ev) => {
      if (!zug || zug.id !== ev.pointerId) return;
      beenden(true);
      if (!gezogen) antippen(karte);
    });
    karte.addEventListener("pointercancel", (ev) => { if (zug && zug.id === ev.pointerId) beenden(false); });
    // Nur für die Tastatur (detail ist dann 0). Finger und Maus erledigt pointerup.
    karte.addEventListener("click", (ev) => { if (ev.detail === 0) antippen(karte); });
  });
  // Pfeil unter den Karten, die Wörter "kleinste" und "größte" stehen im CSS
  const pfeil = svg("svg", { viewBox: "0 0 100 16", preserveAspectRatio: "none", "aria-hidden": "true" },
    svg("path", { d: "M0 8 H99 M96 3 L99 8 L96 13", fill: "none", stroke: "currentColor", "stroke-width": 2, "vector-effect": "non-scaling-stroke" }));
  return {
    element: el("div", {}, reihe, el("div", { class: "zieh-richtung" }, pfeil)),
    folge: () => ordnung.map((k) => karten.indexOf(k)),
    setzen(nummern) { waehlen(null); anordnen(nummern.map((i) => karten[i])); }
  };
}

/* Walze zum Drehen. optionen wie bei wahlKnoepfe. Zu Beginn steht "?" in der Mitte.
   Wischen oder Ziehen dreht, Antippen dreht um eins weiter (im oberen Teil zurück),
   Pfeiltasten gehen auch. wert() liefert null, solange nichts gewählt ist. */
function walze(optionen, name) {
  const HOEHE = 52, RAND = 30;          // Höhe eines Zeichens, sichtbarer Rand der Nachbarn
  const anzahl = optionen.length;
  const band = el("div", { class: "walze-band", "aria-hidden": "true" });
  const zellen = [-2, -1, 0, 1, 2].map(() => el("span"));
  band.append(...zellen);
  const element = el("div", { class: "walze", role: "spinbutton", tabindex: "0", "aria-label": name }, band);

  let offen = true;                     // noch nichts gewählt
  let versatz = 1;
  let lage = 0, ziel = 0;               // gezeigte und angestrebte Stelle, endlos in beide Richtungen
  let zug = null, laeuft = false;

  const option = (k, v) => optionen[(((k - v) % anzahl) + anzahl) % anzahl];
  function zeichen(k) {
    if (!offen) return option(k, versatz);
    return k === 0 ? null : option(k, k > 0 ? 1 : 0);
  }
  function malen() {
    const mitte = Math.round(lage);
    zellen.forEach((zelle, i) => {
      const o = zeichen(mitte - 2 + i);
      zelle.textContent = o ? o.text : "?";
    });
    band.style.transform = `translateY(${RAND - 2 * HOEHE - (lage - mitte) * HOEHE}px)`;
  }
  function bild() {
    if (zug) { laeuft = false; return; }
    lage += (ziel - lage) * 0.28;
    if (Math.abs(ziel - lage) < 0.01) lage = ziel;
    malen();
    if (lage === ziel) laeuft = false; else requestAnimationFrame(bild);
  }
  function drehen(neu) {
    if (offen && neu !== 0) { versatz = neu > 0 ? 1 : 0; offen = false; }
    ziel = neu;
    const o = zeichen(ziel);
    element.setAttribute("aria-valuetext", o ? o.name || o.text : "noch nichts gewählt");
    if (o) element.setAttribute("aria-valuenow", String(optionen.indexOf(o) + 1));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { lage = ziel; malen(); return; }
    if (!laeuft) { laeuft = true; requestAnimationFrame(bild); }
  }
  const gesperrt = () => { const f = element.closest("fieldset"); return f && f.disabled; };

  element.addEventListener("pointerdown", (ev) => {
    if (zug || ev.button !== 0 || gesperrt()) return;
    zug = { id: ev.pointerId, y: ev.clientY, start: lage, bewegt: false };
    try { element.setPointerCapture(ev.pointerId); } catch (e) { /* geht auch ohne */ }
  });
  element.addEventListener("pointermove", (ev) => {
    if (!zug || zug.id !== ev.pointerId) return;
    const dy = ev.clientY - zug.y;
    if (!zug.bewegt && Math.abs(dy) < 6) return;
    zug.bewegt = true;
    lage = zug.start - dy / HOEHE;
    malen();
  });
  function loslassen(ev, abbruch) {
    if (!zug || zug.id !== ev.pointerId) return;
    const { bewegt, start } = zug;
    zug = null;
    laeuft = false;
    if (abbruch) drehen(ziel);
    else if (bewegt) drehen(Math.round(lage + Math.sign(lage - start) * 0.2));   // kurzes Wischen genügt
    else {
      const oben = ev.clientY - element.getBoundingClientRect().top < RAND;
      drehen(ziel + (oben ? -1 : 1));
    }
  }
  element.addEventListener("pointerup", (ev) => loslassen(ev, false));
  element.addEventListener("pointercancel", (ev) => loslassen(ev, true));
  element.addEventListener("keydown", (ev) => {
    const schritt = { ArrowDown: 1, ArrowUp: -1, " ": 1 }[ev.key];
    if (!schritt || gesperrt()) return;
    ev.preventDefault();
    drehen(ziel + schritt);
  });

  malen();
  element.setAttribute("aria-valuetext", "noch nichts gewählt");
  return {
    element,
    wert() { const o = zeichen(ziel); return o ? o.wert : null; },
    setzen(wert) {
      offen = false;
      for (const k of [ziel, ziel + 1, ziel - 1]) if (zeichen(k).wert === wert) { drehen(k); return; }
    }
  };
}

const ZEICHEN = [
  { wert: "<", text: "<", name: "kleiner als" },
  { wert: "=", text: "=", name: "gleich" },
  { wert: ">", text: ">", name: "größer als" }
];

/* Fertige Aufgabe: zwei Zahlen mit der Walze vergleichen.
   Damit sich Raten nicht lohnt, zählt nur der erste Versuch.
   links und rechts: Funktionen, die die Anzeige der Zahl liefern
   tipp und begruendung: Text oder Liste aus Texten und Elementen */
function vergleichsAufgabe({ schluessel, frage, links, rechts, loesung, tipp, begruendung }) {
  const feld = walze(ZEICHEN, "Zeichen zwischen den Zahlen");
  return {
    schluessel,
    nurErsterVersuch: true,
    inhalt: [
      el("p", {}, frage, " Für die nächste Stufe zählt nur der erste Versuch."),
      el("div", { class: "vergleich-gross" }, links(), feld.element, rechts())
    ],
    pruefe() {
      if (feld.wert() === null) return { art: "offen", text: "Drehe die Walze auf ein Zeichen." };
      if (feld.wert() !== loesung) return { art: "falsch", text: tipp };
      return { art: "richtig", text: ["Richtig! ", links(), ` ${loesung} `, rechts()] };
    },
    loese() {
      feld.setzen(loesung);
      return [].concat(begruendung, " Also: ", links(), ` ${loesung} `, rechts());
    }
  };
}

/* Auswahlkarten zum Antippen. karten: [{ inhalt: [...], richtig: true/false }]
   vergleichen() liefert { leer, zuviel, fehlt }. */
function auswahlKarten(karten, klasse = "") {
  const knoepfe = karten.map((k) => {
    const knopf = el("button", { type: "button", "aria-pressed": "false" }, ...k.inhalt);
    knopf.addEventListener("click", () => {
      knopf.setAttribute("aria-pressed", String(knopf.getAttribute("aria-pressed") !== "true"));
    });
    return knopf;
  });
  const an = (i) => knoepfe[i].getAttribute("aria-pressed") === "true";
  return {
    element: el("div", { class: "auswahl " + klasse }, ...knoepfe),
    vergleichen: () => ({
      leer: !karten.some((_, i) => an(i)),
      zuviel: karten.some((k, i) => an(i) && !k.richtig),
      fehlt: karten.some((k, i) => !an(i) && k.richtig)
    }),
    loese() { karten.forEach((k, i) => knoepfe[i].setAttribute("aria-pressed", String(k.richtig))); }
  };
}

/* Vergleicht eine Brucheingabe mit z/n. fehlerTipp(eingabe) darf einen Text liefern. */
function bruchPruefen(eingabe, z, n, fehlerTipp) {
  const e = eingabe.lesen();
  if (!e) return { art: "offen", text: "Trage bei Zähler und Nenner jeweils eine ganze Zahl ein." };
  if (e.n === 0) return { art: "offen", text: "Der Nenner darf nicht 0 sein." };
  if (e.z * n === e.n * z) {
    return {
      art: "richtig",
      text: e.n === n ? "Richtig!" : ["Richtig! Dein Bruch ist gleich groß wie ", bruch(z, n), "."]
    };
  }
  if (e.z === n && e.n === z) {
    return { art: "falsch", text: "Du hast Zähler und Nenner vertauscht. Das Ganze gehört nach unten." };
  }
  return { art: "falsch", text: fehlerTipp(e) };
}

/* ---------- Zeichnungen (SVG) ---------- */
function svg(name, attribute = {}, ...inhalt) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attribute)) e.setAttribute(k, v);
  e.append(...inhalt);
  return e;
}

function figur(breite, hoehe, felder) {
  const bild = svg("svg", { viewBox: `0 0 ${breite} ${hoehe}`, class: "figur" }, ...felder);
  return { bild, felder };
}

function kreis(n) {
  const punkt = (i) => {
    const w = (2 * Math.PI * i) / n - Math.PI / 2;
    return `${(100 + 95 * Math.cos(w)).toFixed(2)} ${(100 + 95 * Math.sin(w)).toFixed(2)}`;
  };
  return figur(200, 200, Array.from({ length: n }, (_, i) =>
    svg("path", { class: "feld", d: `M100 100 L${punkt(i)} A95 95 0 0 1 ${punkt(i + 1)} Z` })));
}

function rechteck(zeilen, spalten) {
  const b = 290 / spalten, h = 170 / zeilen, felder = [];
  for (let y = 0; y < zeilen; y++) {
    for (let x = 0; x < spalten; x++) {
      felder.push(svg("rect", { class: "feld", x: 5 + x * b, y: 5 + y * h, width: b, height: h }));
    }
  }
  return figur(300, 180, felder);
}

// Streifen mit frei wählbaren Breiten, z. B. [1, 1, 1] oder ungleich [2, 1, 1]
function streifen(breiten) {
  const summe = breiten.reduce((a, b) => a + b, 0);
  let x = 5;
  return figur(300, 100, breiten.map((teil) => {
    const b = (290 * teil) / summe;
    const r = svg("rect", { class: "feld", x, y: 5, width: b, height: 90 });
    x += b;
    return r;
  }));
}

function faerben(fig, anzahl, zufaellig) {
  const felder = zufaellig ? mischen(fig.felder) : fig.felder;
  felder.forEach((f, i) => f.classList.toggle("gefaerbt", i < anzahl));
  return fig;
}

// Mehrere gleiche Figuren nebeneinander, z. B. mehrere Ganze für unechte Brüche
function mehrere(anzahl, zeichne) {
  const teile = Array.from({ length: anzahl }, zeichne);
  return {
    bild: el("div", { class: "ganze" }, ...teile.map((t) => t.bild)),
    felder: teile.flatMap((t) => t.felder)
  };
}

// Macht aus einer Figur antippbare Felder.
function antippbar(fig) {
  fig.felder.forEach((f, i) => {
    f.classList.add("antippbar");
    f.setAttribute("role", "checkbox");
    f.setAttribute("tabindex", "0");
    f.setAttribute("aria-label", `Feld ${i + 1}`);
    f.setAttribute("aria-checked", "false");
    const umschalten = () => {
      if (f.closest("fieldset").disabled) return;
      f.setAttribute("aria-checked", String(f.classList.toggle("gefaerbt")));
    };
    f.addEventListener("click", umschalten);
    f.addEventListener("keydown", (ev) => {
      if (ev.key === " " || ev.key === "Enter") { ev.preventDefault(); umschalten(); }
    });
  });
  return fig;
}

/* Zahlenstrahl von 0 bis max, jede Einheit in n Abschnitte geteilt.
   Stellen werden in Abschnitten ab 0 gezählt.
   pfeile: [{ stelle, text }]   antippbar: Ein Strich kann gewählt werden.
   wert() liefert die gewählte Stelle oder null. */
function zahlenstrahl({ max, n, pfeile = [], antippbar = false }) {
  const anzahl = max * n, schritt = 620 / anzahl;
  const x = (i) => 30 + i * schritt;
  const pfeil = (i, text, klasse) => svg("g", { class: "pfeil " + klasse },
    svg("path", { d: `M${x(i)} 24 V54 M${x(i) - 6} 45 L${x(i)} 56 L${x(i) + 6} 45` }),
    svg("text", { x: x(i), y: 18 }, text));
  const bild = svg("svg", { viewBox: "0 0 700 115", role: antippbar ? "radiogroup" : "img",
    "aria-label": `Zahlenstrahl von 0 bis ${max}, jede Einheit in ${n} Abschnitte geteilt` });
  bild.append(svg("path", { class: "achse", d: "M20 70 H686 M676 64 L688 70 L676 76" }));
  for (let i = 0; i <= anzahl; i++) {
    const ganz = i % n === 0;
    bild.append(svg("path", { class: ganz ? "strich-ganz" : "strich-teil", d: `M${x(i)} ${ganz ? 56 : 61} V${ganz ? 84 : 79}` }));
    if (ganz) bild.append(svg("text", { x: x(i), y: 108 }, String(i / n)));
  }
  pfeile.forEach((p) => bild.append(pfeil(p.stelle, p.text || "", "")));

  let gewaehlt = null, marke = null;
  const flaechen = [];
  function setzen(i) {
    gewaehlt = i;
    if (marke) marke.remove();
    marke = pfeil(i, "", "gewaehlt");
    bild.insertBefore(marke, flaechen[0]);
    flaechen.forEach((f, k) => f.setAttribute("aria-checked", String(k === i)));
  }
  if (antippbar) {
    for (let i = 0; i <= anzahl; i++) {
      const f = svg("rect", { class: "treffer", x: x(i) - schritt / 2, y: 5, width: schritt, height: 105,
        role: "radio", tabindex: "0", "aria-checked": "false", "aria-label": `Strich ${i} nach 0` });
      const tippen = () => { if (!f.closest("fieldset").disabled) setzen(i); };
      f.addEventListener("click", tippen);
      f.addEventListener("keydown", (ev) => {
        if (ev.key === " " || ev.key === "Enter") { ev.preventDefault(); tippen(); }
      });
      flaechen.push(f);
      bild.append(f);
    }
  }
  return { bild: el("div", { class: "strahl" }, bild), wert: () => gewaehlt, setzen };
}

/* ---------- Übung ----------
 * erzeuge(stufe) liefert eine Aufgabe:
 *   { schluessel: (freiwillig) gleicher Schlüssel = gleiche Aufgabe, kommt nicht direkt nacheinander
 *     inhalt: [Elemente oder Texte],
 *     pruefe():  { art: "richtig" | "falsch" | "offen", text },
 *     nurErsterVersuch: (freiwillig) true, wenn nur der erste Versuch als gelöst zählt
 *     loese():   trägt die Lösung ein und liefert einen Text }
 * text ist ein Text oder eine Liste aus Texten und Elementen.
 * Bei "falsch" zählt die Antwort als Fehlversuch, bei "offen" nur mit zaehlt: true.
 * aufstieg: Ab so vielen richtigen Lösungen gilt die nächste Stufe.
 *   3 bedeutet zwei Stufen, [3, 6] drei Stufen usw. Ohne Angabe gibt es keine Stufen.
 *   Ab drei Stufen erscheint ein Stufenwähler.
 */
function uebung(id, erzeuge, aufstieg = []) {
  const grenzen = [].concat(aufstieg);
  const ort = document.getElementById(id);
  const inhalt = el("fieldset");
  const meldung = el("div", { class: "meldung", "aria-live": "polite" });
  const pruefen = el("button", { type: "submit", class: "knopf haupt" }, "Prüfen");
  const loesung = el("button", { type: "button", class: "knopf" }, "Lösung zeigen");
  const neu = el("button", { type: "button", class: "knopf" }, "Neue Aufgabe");
  const stand = el("span", { class: "stand" });
  const form = el("form", { novalidate: "" }, inhalt, meldung,
    el("div", { class: "knoepfe" }, pruefen, loesung, neu, stand));
  // punkte bestimmt die Stufe, geloest ist die angezeigte Anzahl
  let aufgabe, versuche, geloest = 0, punkte = 0;

  const stufe = () => 1 + grenzen.filter((g) => punkte >= g).length;
  const waehler = grenzen.length < 2 ? [] : [0, ...grenzen].map((start, i) => {
    const knopf = el("button", { type: "button" }, `Stufe ${i + 1}`);
    knopf.addEventListener("click", () => { punkte = start; starten(); });
    return knopf;
  });
  function standZeigen() {
    stand.textContent = (grenzen.length === 1 ? `Stufe ${stufe()} · ` : "") + `Richtig gelöst: ${geloest}`;
    waehler.forEach((k, i) => k.setAttribute("aria-pressed", String(i + 1 === stufe())));
  }

  function melden(art, text) {
    const symbol = { richtig: "✓ ", falsch: "✗ ", offen: "! ", loesung: "→ " }[art];
    meldung.className = "meldung " + art;
    meldung.replaceChildren(el("span", { "aria-hidden": "true" }, symbol),
      ...(Array.isArray(text) ? text : [text]));
  }
  function beenden() {
    inhalt.disabled = true;
    pruefen.hidden = loesung.hidden = true;
    neu.classList.add("haupt");
    neu.focus({ preventScroll: true });
  }
  function starten() {
    const letzter = aufgabe && aufgabe.schluessel;
    for (let i = 0; i < 50; i++) {
      aufgabe = erzeuge(stufe());
      if (aufgabe.schluessel === undefined || aufgabe.schluessel !== letzter) break;
    }
    versuche = 0;
    inhalt.disabled = false;
    inhalt.replaceChildren(...aufgabe.inhalt);
    meldung.className = "meldung";
    meldung.replaceChildren();
    pruefen.hidden = false;
    loesung.hidden = true;
    neu.classList.remove("haupt");
    standZeigen();
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    if (inhalt.disabled) return;
    const e = aufgabe.pruefe();
    const vorher = stufe();
    const zaehlt = !(aufgabe.nurErsterVersuch && versuche > 0);
    if (e.art === "richtig" && zaehlt) { geloest++; punkte++; }
    const text = [].concat(e.text);
    if (e.art === "richtig" && !zaehlt) text.push(" Gezählt wird hier nur der erste Versuch.");
    if (stufe() > vorher) text.push(` Weiter mit Stufe ${stufe()}: Ab jetzt wird es etwas schwieriger.`);
    melden(e.art, text);
    if (e.art === "richtig") {
      standZeigen();
      beenden();
    } else if (e.art === "falsch" || e.zaehlt) {
      versuche++;
      loesung.hidden = versuche < 2;
    }
  });
  loesung.addEventListener("click", () => { melden("loesung", aufgabe.loese()); beenden(); });
  neu.addEventListener("click", starten);

  if (waehler.length) {
    ort.append(el("div", { class: "stufen", role: "group", "aria-label": "Stufe wählen" }, ...waehler));
  }
  ort.append(form);
  starten();
}
