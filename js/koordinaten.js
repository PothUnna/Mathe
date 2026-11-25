/* Koordinatensystem und lineare Funktionen.
   Wird nur auf Seiten eingebunden, die Graphen brauchen (nach script.js).
   Zahlen für Steigung und Achsenabschnitt sind Brüche { z, n } mit n > 0. */
"use strict";

/* ---------- Rechnen mit Brüchen ---------- */
function rat(z, n = 1) {
  if (n < 0) { z = -z; n = -n; }
  const t = ggt(Math.abs(z), n) || 1;
  return { z: z / t, n: n / t };
}
const ratWert = (r) => r.z / r.n;
const ratGleich = (a, b) => a.z * b.n === b.z * a.n;
const ratMinus = (r) => rat(-r.z, r.n);
const ratText = (r) => (r.z < 0 ? "−" : "") + Math.abs(r.z) + (r.n === 1 ? "" : "/" + r.n);

// "3", "-2", "1/2", "0,5" → { z, n } oder null
function ratLesen(text) {
  const t = text.trim().replace(/[−–]/g, "-").replace(/\s/g, "");
  let m;
  if ((m = /^([+-]?\d+)$/.exec(t))) return rat(Number(m[1]));
  if ((m = /^([+-]?\d+)\/(\d+)$/.exec(t))) return Number(m[2]) ? rat(Number(m[1]), Number(m[2])) : null;
  if ((m = /^([+-]?)(\d+)[.,](\d+)$/.exec(t))) {
    const z = Number(m[2] + m[3]);
    return rat(m[1] === "-" ? -z : z, 10 ** m[3].length);
  }
  return null;
}

// Zahl mit Bruchstrich und Vorzeichen
function ratBild(r) {
  const betrag = r.n === 1 ? String(Math.abs(r.z)) : bruch(Math.abs(r.z), r.n);
  return el("span", { class: "rat" }, ...(r.z < 0 ? ["−"] : []), betrag);
}

/* Term einer linearen Funktion. umgestellt: b steht vorn, z. B. f(x) = 3 − 2x */
function termBild(m, b, umgestellt = false) {
  const betragX = (r) => {
    const a = rat(Math.abs(r.z), r.n);
    return a.z === 1 && a.n === 1 ? ["x"] : [a.n === 1 ? String(a.z) : bruch(a.z, a.n), "x"];
  };
  const betrag = (r) => (r.n === 1 ? [String(Math.abs(r.z))] : [bruch(Math.abs(r.z), r.n)]);
  const teile = ["f(x) = "];
  const vorn = (r, t) => { if (r.z < 0) teile.push("−"); teile.push(...t); };
  const hinten = (r, t) => teile.push(r.z < 0 ? " − " : " + ", ...t);
  if (m.z === 0) vorn(b, betrag(b));
  else if (b.z === 0) vorn(m, betragX(m));
  else if (umgestellt) { vorn(b, betrag(b)); hinten(m, betragX(m)); }
  else { vorn(m, betragX(m)); hinten(b, betrag(b)); }
  return el("span", { class: "term" }, ...teile);
}

/* ---------- Eingaben ---------- */
// Textfeld mit normaler Tastatur, weil Zifferntastaturen oft kein Minus haben
function textFeld(name, klasse = "") {
  return el("input", { type: "text", class: klasse, autocomplete: "off", autocapitalize: "off",
    autocorrect: "off", spellcheck: "false", "aria-label": name });
}

/* Zahl mit Vorzeichen. alsBruch: Felder für Zähler und Nenner, ein Minus gehört in eines davon.
   lesen() liefert { z, n } oder null. */
function ratEingabe(name, alsBruch = false) {
  if (!alsBruch) {
    const feld = textFeld(name);
    return { element: el("span", { class: "rat-eingabe" }, feld), lesen: () => ratLesen(feld.value), setzen(r) { feld.value = ratText(r); } };
  }
  const zaehler = textFeld(`Zähler von ${name}`), nenner = textFeld(`Nenner von ${name}`);
  return {
    element: el("span", { class: "rat-eingabe" },
      el("span", { class: "bruch-eingabe" }, zaehler, el("span", { class: "strich" }), nenner)),
    lesen() {
      const z = ratLesen(zaehler.value), n = ratLesen(nenner.value);
      if (!z || !n || z.n !== 1 || n.n !== 1 || n.z === 0) return null;
      return rat(z.z, n.z);
    },
    setzen(r) { zaehler.value = String(r.z).replace("-", "−"); nenner.value = r.n; }
  };
}

/* Liest einen Term wie "-2x+3", "3 - 0,5x" oder "1/2 x". Liefert { m, b } oder null. */
function termLesen(text) {
  const t = text.toLowerCase().replace(/[−–]/g, "-").replace(/[\s*·()]/g, "")
    .replace(/^(fx|y)=/, "").replace(/\+-/g, "-").replace(/--/g, "+");
  if (!/^[+-]?[^+-]+([+-][^+-]+)*$/.test(t)) return null;
  const plus = (p, q) => rat(p.z * q.n + q.z * p.n, p.n * q.n);
  let m = rat(0), b = rat(0);
  for (const teil of t.match(/[+-]?[^+-]+/g)) {
    const mitX = /^([+-]?)([\d.,/]*)x(?:\/(\d+))?$/.exec(teil);
    if (mitX) {
      const r = ratLesen(mitX[1] + (mitX[2] || "1"));
      const durch = mitX[3] === undefined ? 1 : Number(mitX[3]);
      if (!r || durch === 0) return null;
      m = plus(m, rat(r.z, r.n * durch));
    } else {
      const r = ratLesen(teil);
      if (!r) return null;
      b = plus(b, r);
    }
  }
  return { m, b };
}

// Dezimalzahl, wenn sie abbricht, sonst Bruch
function dezimalText(r) {
  const t = String(Math.abs(ratWert(r)));
  return t.length <= 5 ? (r.z < 0 ? "−" : "") + t.replace(".", ",") : ratText(r);
}

// Rechte Seite des Terms als Text mit Dezimalzahlen, z. B. "−0,5x + 3"
function termText(m, b) {
  const betrag = dezimalText(rat(Math.abs(m.z), m.n));
  const x = m.z === 0 ? "" : (m.z < 0 ? "−" : "") + (betrag === "1" ? "" : betrag) + "x";
  if (!x) return dezimalText(b);
  return b.z === 0 ? x : `${x} ${b.z < 0 ? "−" : "+"} ${dezimalText(rat(Math.abs(b.z), b.n))}`;
}

// Eingabe für einen ganzen Term f(x) = ...
function termEingabe() {
  const feld = textFeld("Term", "term-feld");
  return {
    element: el("div", { class: "term-eingabe" }, "f(x) =", feld),
    leer: () => feld.value.trim() === "",
    lesen: () => termLesen(feld.value),
    setzen(m, b) { feld.value = termText(m, b); }
  };
}

/* ---------- Koordinatensystem ---------- */
const EINHEIT = 40;

/* Koordinatensystem von −max bis max. Liefert Funktionen zum Zeichnen. */
function koordinatensystem(max = 6, beschreibung = "Koordinatensystem") {
  const mitte = (max + 0.6) * EINHEIT, breite = 2 * mitte;
  const X = (x) => +(mitte + x * EINHEIT).toFixed(2);
  const Y = (y) => +(mitte - y * EINHEIT).toFixed(2);
  const bild = svg("svg", { viewBox: `0 0 ${breite} ${breite}`, class: "koordinaten", role: "img", "aria-label": beschreibung });
  for (let i = -max; i <= max; i++) {
    bild.append(
      svg("path", { class: "gitter", d: `M${X(i)} ${Y(max)} V${Y(-max)}` }),
      svg("path", { class: "gitter", d: `M${X(-max)} ${Y(i)} H${X(max)}` }));
  }
  bild.append(
    svg("path", { class: "achse", d: `M${X(-max)} ${Y(0)} H${breite - 3} m-9 -6 l9 6 l-9 6` }),
    svg("path", { class: "achse", d: `M${X(0)} ${Y(-max)} V3 m-6 9 l6 -9 l6 9` }),
    svg("text", { x: breite - 10, y: Y(0) - 12, class: "achsenname" }, "x"),
    svg("text", { x: X(0) + 16, y: 14, class: "achsenname" }, "y"));
  for (let i = -max; i <= max; i++) {
    if (i === 0) continue;
    bild.append(
      svg("text", { x: X(i), y: Y(0) + 18 }, String(i).replace("-", "−")),
      svg("text", { x: X(0) - 9, y: Y(i) + 5, class: "zahl-y" }, String(i).replace("-", "−")));
  }
  bild.append(svg("text", { x: X(0) - 9, y: Y(0) + 18, class: "zahl-y" }, "0"));
  const ebene = svg("g");
  bild.append(ebene);
  const dazu = (e) => { ebene.append(e); return e; };

  /* Gerade durch den Rand begrenzt. klasse z. B. "g1" für die Farbe */
  function gerade(m, b, klasse = "", name = "") {
    const r = max + 0.4;
    let xs = [-r, r];
    if (m !== 0) {
      const a = (-r - b) / m, c = (r - b) / m;
      xs = [Math.max(-r, Math.min(a, c)), Math.min(r, Math.max(a, c))];
    }
    const [x1, x2] = xs;
    const g = svg("g", { class: "gerade " + klasse },
      svg("path", { d: `M${X(x1)} ${Y(m * x1 + b)} L${X(x2)} ${Y(m * x2 + b)}` }));
    if (name) {
      // Beschriftung am rechten Ende, etwas neben der Geraden
      const x = x2 - 0.55, y = m * x + b;
      const l = Math.hypot(m, 1), s = m > 0 ? 1 : -1;
      const nx = (-m / l) * 0.45 * s * (m > 0 ? 1 : -1), ny = (1 / l) * 0.45;
      g.append(svg("text", { x: X(x + nx), y: Y(y + ny) + 6 }, name));
    }
    return dazu(g);
  }
  function punkt(x, y, klasse = "") {
    return dazu(svg("circle", { class: "punkt " + klasse, cx: X(x), cy: Y(y), r: 6 }));
  }
  /* Steigungsdreieck ab (x, y): dx nach rechts, dann dy nach oben oder unten.
     beschriftet: Zahlen an den Seiten */
  function dreieck(x, y, dx, dy, beschriftet = true) {
    const g = svg("g", { class: "dreieck" },
      svg("path", { d: `M${X(x)} ${Y(y)} H${X(x + dx)} V${Y(y + dy)}` }));
    if (beschriftet) {
      g.append(
        svg("text", { x: X(x + dx / 2), y: Y(y) + (dy >= 0 ? 18 : -8) }, String(dx)),
        svg("text", { x: X(x + dx) + 8, y: Y(y + dy / 2) + 6, class: "seite" }, String(dy).replace("-", "−")));
    }
    return dazu(g);
  }
  return { bild, X, Y, max, gerade, punkt, dreieck, leeren() { ebene.replaceChildren(); }, ebene };
}

/* Koordinatensystem, in dem man eine Gerade durch zwei Punkte zeichnet.
   Antippen setzt einen Gitterpunkt, vorhandene Punkte lassen sich ziehen.
   Tastatur: Pfeiltasten bewegen eine Marke, Eingabe setzt den Punkt.
   fest: vorgegebener erster Punkt [x, y], der sich nicht bewegen lässt
   punkte() liefert die gesetzten Punkte. */
function zeichenFlaeche({ max = 6, fest = null } = {}) {
  const k = koordinatensystem(max, "Koordinatensystem zum Zeichnen. Pfeiltasten bewegen die Marke, Eingabe setzt einen Punkt.");
  const { bild, X, Y } = k;
  bild.classList.add("zeichnen");
  bild.setAttribute("role", "application");
  bild.setAttribute("tabindex", "0");
  let punkte = fest ? [fest] : [];
  let zug = null, gezogen = false, marke = null;

  const gesperrt = () => { const f = bild.closest("fieldset"); return f && f.disabled; };
  function gitter(ev) {
    const r = bild.getBoundingClientRect();
    const s = (2 * (max + 0.6)) / r.width;
    const runden = (v) => Math.max(-max, Math.min(max, Math.round(v))) + 0;
    return [runden((ev.clientX - r.left) * s - max - 0.6), runden(max + 0.6 - (ev.clientY - r.top) * s)];
  }
  const gleich = (p, q) => p[0] === q[0] && p[1] === q[1];

  // Griffe bleiben bestehen, damit das Ziehen nicht abbricht.
  const griffe = [0, 1].map((i) => {
    const kreisInnen = svg("circle", { class: "punkt", r: 7 });
    const flaeche = svg("circle", { class: "griff", r: 24 });
    const g = svg("g", { class: "griff-gruppe" }, kreisInnen, flaeche);
    flaeche.addEventListener("touchstart", (ev) => ev.preventDefault(), { passive: false });
    flaeche.addEventListener("pointerdown", (ev) => {
      if (zug || gesperrt() || ev.button !== 0) return;
      gezogen = false;
      if (fest && i === 0) return;
      zug = { i, id: ev.pointerId };
      try { flaeche.setPointerCapture(ev.pointerId); } catch (e) { /* geht auch ohne */ }
    });
    flaeche.addEventListener("pointermove", (ev) => {
      if (!zug || zug.id !== ev.pointerId) return;
      const p = gitter(ev);
      if (gleich(p, punkte[zug.i]) || punkte.some((q) => gleich(p, q))) return;
      gezogen = true;
      punkte[zug.i] = p;
      malen();
    });
    const ende = (ev) => {
      if (!zug || zug.id !== ev.pointerId) return;
      zug = null;
      // Bei Berührung gibt es keinen Klick, also hier behandeln.
      if (!gezogen && ev.type === "pointerup" && ev.pointerType !== "mouse") setzenBei(gitter(ev));
      if (ev.pointerType !== "mouse") gezogen = false;
    };
    flaeche.addEventListener("pointerup", ende);
    flaeche.addEventListener("pointercancel", ende);
    return { g, kreisInnen, flaeche };
  });

  function malen() {
    k.leeren();
    if (punkte.length === 2) {
      const [[x1, y1], [x2, y2]] = punkte;
      if (x1 === x2) k.ebene.append(svg("g", { class: "gerade g1" }, svg("path", { d: `M${X(x1)} ${Y(max + 0.4)} V${Y(-max - 0.4)}` })));
      else { const m = (y2 - y1) / (x2 - x1); k.gerade(m, y1 - m * x1, "g1"); }
    }
    griffe.forEach((g, i) => {
      g.g.style.display = punkte[i] ? "" : "none";
      if (!punkte[i]) return;
      for (const c of [g.kreisInnen, g.flaeche]) {
        c.setAttribute("cx", X(punkte[i][0]));
        c.setAttribute("cy", Y(punkte[i][1]));
      }
      g.g.classList.toggle("fest", Boolean(fest) && i === 0);
    });
    if (marke) k.ebene.append(svg("circle", { class: "marke", cx: X(marke[0]), cy: Y(marke[1]), r: 11 }));
  }
  function setzenBei(p) {
    if (punkte.some((q) => gleich(p, q))) return;
    if (punkte.length < 2) punkte = [...punkte, p];
    else {
      const abstand = (q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
      const i = fest || abstand(punkte[1]) <= abstand(punkte[0]) ? 1 : 0;
      punkte[i] = p;
    }
    malen();
  }
  bild.addEventListener("click", (ev) => {
    if (gesperrt()) return;
    if (gezogen) { gezogen = false; return; }
    marke = null;
    setzenBei(gitter(ev));
  });
  bild.addEventListener("keydown", (ev) => {
    const r = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[ev.key];
    if (gesperrt() || (!r && ev.key !== "Enter" && ev.key !== " ")) return;
    ev.preventDefault();
    if (r) {
      const von = marke || [0, 0];
      marke = [0, 1].map((i) => Math.max(-max, Math.min(max, von[i] + r[i])));
      malen();
    } else if (marke) setzenBei(marke);
  });
  bild.append(...griffe.map((g) => g.g));
  malen();
  return {
    bild,
    punkte: () => punkte,
    setzen(neu) { marke = null; punkte = neu; malen(); },
    dreieck: (...a) => k.dreieck(...a)
  };
}

/* ---------- Graphen in Erklärungen ----------
   <div class="graph" data-m="1/2" data-b="1"></div>
   data-dreieck="x,dx"  zeichnet ein Steigungsdreieck ab der Stelle x
   data-punkt="x,y"     zeichnet einen Punkt
   data-ohne-gerade     nur Punkt und Dreieck
   data-max="4"         kleinerer Ausschnitt */
document.querySelectorAll(".graph[data-m]").forEach((ort) => {
  const m = ratLesen(ort.dataset.m), b = ratLesen(ort.dataset.b);
  const k = koordinatensystem(Number(ort.dataset.max || 5),
    `Graph mit Steigung ${ratText(m)} und y-Achsenabschnitt ${ratText(b)}`);
  if (ort.dataset.dreieck) {
    const [x, dx] = ort.dataset.dreieck.split(",").map(Number);
    k.dreieck(x, ratWert(m) * x + ratWert(b), dx, ratWert(m) * dx);
  }
  if (!("ohneGerade" in ort.dataset)) k.gerade(ratWert(m), ratWert(b), "g1");
  if (ort.dataset.punkt) k.punkt(...ort.dataset.punkt.split(",").map(Number));
  ort.append(k.bild);
});
