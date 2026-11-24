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

/* Auswahlliste (natives Auswahlfenster). optionen wie bei wahlKnoepfe. */
function wahlListe(optionen, name) {
  const liste = el("select", { class: "wahl-liste", "aria-label": name },
    el("option", { value: "" }, "?"),
    ...optionen.map((o) => el("option", { value: o.wert }, o.text)));
  return { element: liste, wert: () => liste.value || null, setzen(wert) { liste.value = wert; } };
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

/* ---------- Übung ----------
 * erzeuge(stufe) liefert eine Aufgabe:
 *   { schluessel: (freiwillig) gleicher Schlüssel = gleiche Aufgabe, kommt nicht direkt nacheinander
 *     inhalt: [Elemente oder Texte],
 *     pruefe():  { art: "richtig" | "falsch" | "offen", text },
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
    if (e.art === "richtig") { geloest++; punkte++; }
    const text = [].concat(e.text);
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
