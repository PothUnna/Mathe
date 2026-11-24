/* Übungen zu "Anteile in Prozent" */
"use strict";

const ZWEI_STUFEN = 3;        // nach 3 richtigen Lösungen Stufe 2
const DREI_STUFEN = [3, 6];   // nach 3 Stufe 2, nach 6 Stufe 3

const absatz = (...inhalt) => el("p", {}, ...inhalt);
const gleichung = (...inhalt) => el("div", { class: "gleichung" }, ...inhalt);
const prozent = ({ z, n }) => (z * 100) / n;
const gekuerzt = ({ z, n }) => ({ z: z / ggt(z, n), n: n / ggt(z, n) });
const gleichGross = (a, b) => a.z * b.n === b.z * a.n;
const bruchVon = (b) => bruch(b.z, b.n);
const kurz = (b) => `${b.z}/${b.n}`;

// Zufälliger vollständig gekürzter Bruch mit einem Nenner aus der Liste
function bruchMitNenner(liste) {
  const n = wahl(liste);
  let z;
  do { z = zufall(1, n - 1); } while (ggt(z, n) !== 1);
  return { z, n };
}

function prozentEingabe() {
  const feld = zahlFeld("Prozentzahl");
  return {
    element: el("span", { class: "zahl-eingabe", style: "margin:0" }, feld, "%"),
    lesen: () => (/^\d+$/.test(feld.value.trim()) ? Number(feld.value.trim()) : null),
    setzen(p) { feld.value = p; }
  };
}

// Vergleicht eine Prozenteingabe mit dem Anteil a = { z, n }.
function prozentPruefen(eingabe, a, tipp) {
  const e = eingabe.lesen();
  if (e === null) return { art: "offen", text: "Trage eine ganze Zahl ein." };
  if (e === prozent(a)) return { art: "richtig", text: "Richtig!" };
  if (e === 100 - prozent(a)) return { art: "falsch", text: "Das ist der Anteil, der bis 100 % fehlt. Lies noch einmal genau, was gesucht ist." };
  if (a.n !== 100 && e === a.n) return { art: "falsch", text: "Der Nenner ist nicht die Prozentzahl. Der Bruch muss zuerst den Nenner 100 haben." };
  if (a.n !== 100 && e === a.z) return { art: "falsch", text: "Der Zähler ist erst dann die Prozentzahl, wenn der Nenner 100 ist." };
  return { art: "falsch", text: tipp };
}

function hunderterfeld() {
  const fig = figur(210, 210, Array.from({ length: 100 }, (_, i) =>
    svg("rect", { class: "feld", x: 5 + (i % 10) * 20, y: 5 + Math.floor(i / 10) * 20, width: 20, height: 20 })));
  fig.bild.classList.add("hunderter");
  return fig;
}

// Figuren mit wenigen Feldern, deren Anzahl ein Teiler von 100 ist
const FIGUREN = [
  { n: 2, zeichne: () => kreis(2) },
  { n: 4, zeichne: () => kreis(4) },
  { n: 4, zeichne: () => rechteck(2, 2) },
  { n: 5, zeichne: () => kreis(5) },
  { n: 5, zeichne: () => streifen([1, 1, 1, 1, 1]) },
  { n: 10, zeichne: () => rechteck(2, 5) },
  { n: 20, zeichne: () => rechteck(4, 5) }
];

/* Übung 1: Ablesen. Stufe 1: Hunderterfeld. Stufe 2: auch andere Figuren. */
uebung("ablesen", (stufe) => {
  let fig, n;
  if (stufe === 1 || Math.random() < 0.3) { fig = hunderterfeld(); n = 100; }
  else { const f = wahl(FIGUREN); fig = f.zeichne(); n = f.n; }
  const z = n === 100 ? zufall(1, 19) * 5 + (stufe === 1 ? 0 : zufall(-4, 4)) : zufall(1, n - 1);
  faerben(fig, z, false);
  fig.bild.setAttribute("role", "img");
  fig.bild.setAttribute("aria-label", `Figur mit ${n} gleich großen Feldern, ${z} davon gefärbt`);
  const eingabe = prozentEingabe();
  return {
    schluessel: `${z}/${n}`,
    inhalt: [absatz("Wie viel Prozent der Figur sind gefärbt?"), fig.bild, gleichung(eingabe.element)],
    pruefe: () => prozentPruefen(eingabe, { z, n }, n === 100
      ? "Das Quadrat hat 100 Felder. Jede volle Reihe hat 10 Felder."
      : "Schreibe den gefärbten Anteil als Bruch und erweitere auf den Nenner 100."),
    loese() {
      eingabe.setzen(prozent({ z, n }));
      return n === 100 ? [bruch(z, 100), ` = ${z} %`]
        : [bruch(z, n), " = ", bruch(prozent({ z, n }), 100), ` = ${prozent({ z, n })} %`];
    }
  };
}, ZWEI_STUFEN);

/* Übung 2: Färben. Stufe 1: 5 oder 10 Felder. Stufe 2: auch 2, 4 und 20 Felder. */
uebung("faerben-prozent", (stufe) => {
  const f = wahl(FIGUREN.filter((x) => stufe === 2 || x.n === 5 || x.n === 10));
  const fig = antippbar(f.zeichne());
  fig.bild.classList.add("gross");
  const n = f.n, z = zufall(1, n - 1), p = prozent({ z, n });
  return {
    schluessel: `${z}/${n}`,
    inhalt: [absatz("Tippe auf die Felder, bis ", el("strong", {}, `${p} %`), " der Figur gefärbt sind."), fig.bild],
    pruefe() {
      const anzahl = fig.felder.filter((x) => x.classList.contains("gefaerbt")).length;
      if (anzahl === 0) return { art: "offen", text: "Färbe zuerst einige Felder." };
      if (anzahl === z) return { art: "richtig", text: "Richtig!" };
      return { art: "falsch", text: `Die ganze Figur sind 100 %. Sie hat ${n} Felder. Wie viel Prozent ist ein Feld?` };
    },
    loese() {
      faerben(fig, z, false);
      fig.felder.forEach((x, i) => x.setAttribute("aria-checked", String(i < z)));
      return [`Ein Feld sind ${100 / n} %. Gefärbt ${z === 1 ? "ist" : "sind"} ${z} von ${n} Feldern: `, bruch(z, n), ` = ${p} %`];
    }
  };
}, ZWEI_STUFEN);

/* Übung 3: Bruch in Prozent. Stufe 1: Nenner 100, 10 und bekannte Brüche.
   Stufe 2: alle Nenner, die sich auf 100 erweitern lassen. Stufe 3: erst kürzen. */
uebung("inprozent", (stufe) => {
  let a;
  if (stufe === 1) a = wahl([() => ({ z: zufall(1, 99), n: 100 }), () => ({ z: zufall(1, 9), n: 10 }), () => bruchMitNenner([2, 4, 5])])();
  else if (stufe === 2) a = bruchMitNenner([4, 5, 20, 20, 25, 25, 50, 50]);
  else {
    const b = bruchMitNenner([2, 4, 4, 5, 5, 10]);
    const k = wahl([3, 6, 7, 9]);
    a = { z: b.z * k, n: b.n * k };
  }
  const p = prozent(a);
  const eingabe = prozentEingabe();
  return {
    schluessel: kurz(a),
    inhalt: [absatz("Schreibe in Prozent."), gleichung(bruchVon(a), "=", eingabe.element)],
    pruefe: () => prozentPruefen(eingabe, a, a.n === 100 ? "Prozent bedeutet Hundertstel."
      : stufe === 3 ? "Kürze den Bruch zuerst. Erweitere ihn dann auf den Nenner 100."
        : `Überlege: ${a.n} mal welche Zahl ergibt 100?`),
    loese() {
      eingabe.setzen(p);
      const schritte = [bruchVon(a)];
      if (stufe === 3) schritte.push(" = ", bruchVon(gekuerzt(a)));
      if (a.n !== 100) schritte.push(" = ", bruch(p, 100));
      return [...schritte, ` = ${p} %`];
    }
  };
}, DREI_STUFEN);

/* Übung 4: Prozent in Bruch. Stufe 1: Nenner 100. Stufe 2: bekannte Prozente vollständig kürzen.
   Stufe 3: beliebige kürzbare Prozente. */
uebung("inbruch", (stufe) => {
  let p;
  if (stufe === 1) p = zufall(1, 99);
  else if (stufe === 2) p = wahl([10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90]);
  else do { p = zufall(2, 98); } while (ggt(p, 100) === 1 || p % 10 === 0 || p % 25 === 0);
  const a = { z: p, n: 100 };
  const ziel = stufe === 1 ? a : gekuerzt(a);
  const eingabe = bruchEingabe(stufe === 1 ? { n: 100 } : {});
  return {
    schluessel: p,
    inhalt: [
      absatz(stufe === 1 ? "Schreibe als Bruch." : "Schreibe als Bruch und kürze vollständig."),
      gleichung(el("strong", {}, `${p} %`), "=", eingabe.element)
    ],
    pruefe() {
      const e = eingabe.lesen();
      if (!e) return { art: "offen", text: "Fülle alle Felder mit ganzen Zahlen aus." };
      if (e.n === 0) return { art: "offen", text: "Der Nenner darf nicht 0 sein." };
      if (e.z === ziel.z && e.n === ziel.n) return { art: "richtig", text: "Richtig!" };
      if (gleichGross(e, a)) return { art: "offen", zaehlt: true, text: "Der Anteil stimmt. Kürze den Bruch noch vollständig." };
      if (e.z === 1 && e.n === p) return { art: "falsch", text: "Die Prozentzahl ist nicht der Nenner. Prozent bedeutet Hundertstel." };
      return { art: "falsch", text: stufe === 1 ? "Prozent bedeutet Hundertstel." : "Schreibe die Prozentzahl zuerst als Bruch mit dem Nenner 100. Kürze dann." };
    },
    loese() {
      eingabe.setzen(ziel.z, ziel.n);
      return [`${p} % = `, bruch(p, 100), ...(stufe === 1 ? [] : [" = ", bruchVon(ziel)])];
    }
  };
}, DREI_STUFEN);

/* Übung 5: Gleiche Anteile. Stufe 1: Ausgangswert in Prozent. Stufe 2: Ausgangswert als ungekürzter Bruch. */
uebung("gleich", (stufe) => {
  const b = bruchMitNenner([2, 4, 4, 5, 5, 10, 10, 20]);
  const p = prozent(b);
  const mal = (k) => ({ z: b.z * k, n: b.n * k });
  const start = stufe === 1 ? null : mal(3);
  const richtigeBrueche = mischen([b, mal(2), mal(4), { z: p, n: 100 }])
    .filter((x, i, l) => l.findIndex((y) => kurz(y) === kurz(x)) === i);
  const karten = richtigeBrueche.slice(0, stufe === 1 ? zufall(2, 3) : zufall(1, 2)).map(bruchVon);
  if (stufe === 2) karten.push(el("strong", {}, `${p} %`));
  // Falsche Karten: typische Verwechslungen
  const falscheBrueche = [
    { z: 1, n: p }, { z: p, n: 10 }, { z: b.z + 1, n: b.n }, { z: b.z, n: b.n + 1 }, { z: b.n - b.z, n: b.n },
    { z: b.z, n: 100 }, { z: b.z * 2, n: b.n * 3 }, { z: b.z, n: b.n * 2 }, { z: b.z + 2, n: b.n + 2 }
  ].filter((x) => x.z < x.n && !gleichGross(x, b));
  const falscheProzente = [b.n, b.z, 100 - p, p + 5, p - 5, b.z * 10].filter((q) => q > 0 && q < 100 && q !== p);
  const texte = new Set();
  const falsche = [];
  const nimm = (text, inhalt) => { if (!texte.has(text)) { texte.add(text); falsche.push(inhalt); } };
  if (stufe === 2) mischen(falscheProzente).slice(0, 2).forEach((q) => nimm(`${q}%`, el("strong", {}, `${q} %`)));
  for (const x of mischen(falscheBrueche)) {
    if (falsche.length < 6 - karten.length) nimm(kurz(x), bruchVon(x));
  }
  const auswahl = auswahlKarten(mischen([
    ...karten.map((k) => ({ inhalt: [k], richtig: true })),
    ...falsche.map((k) => ({ inhalt: [k], richtig: false }))
  ]), "brueche");
  return {
    schluessel: kurz(b),
    inhalt: [
      absatz("Wähle alle Karten, die den gleichen Anteil zeigen wie ", start ? bruchVon(start) : el("strong", {}, `${p} %`), "."),
      auswahl.element
    ],
    pruefe() {
      const v = auswahl.vergleichen();
      if (v.leer) return { art: "offen", text: "Wähle mindestens eine Karte aus." };
      if (v.zuviel) return { art: "falsch", text: "Mindestens eine ausgewählte Karte passt nicht. Schreibe alles in Prozent oder kürze vollständig." };
      if (v.fehlt) return { art: "falsch", text: "Bisher stimmt alles, aber es fehlt noch mindestens eine Karte." };
      return { art: "richtig", text: "Richtig! Du hast alle gefunden." };
    },
    loese() {
      auswahl.loese();
      return ["Alle markierten Karten zeigen den Anteil ", bruchVon(b), ` = ${p} %.`];
    }
  };
}, ZWEI_STUFEN);

/* Übung 6: Vergleichen. Stufe 1: bekannte Brüche. Stufe 2: weitere Nenner. */
uebung("vergleich", (stufe) => {
  const b = bruchMitNenner(stufe === 1 ? [2, 4, 4, 5, 5, 10, 10] : [5, 20, 20, 25, 25, 50]);
  const p = prozent(b);
  // gleich, knapp daneben oder typischer Fehler (Nenner als Prozentzahl)
  let q;
  do { q = wahl([p, p + wahl([-5, -2, 2, 5]), b.n]); } while (q < 1 || q > 99);
  const seiten = [
    { wert: p, bild: () => bruchVon(b) },
    { wert: q, bild: () => el("strong", { class: "prozent" }, `${q} %`) }
  ];
  const [links, rechts] = Math.random() < 0.5 ? seiten : seiten.reverse();
  return vergleichsAufgabe({
    schluessel: kurz(b),
    frage: "Drehe die Walze auf das richtige Zeichen.",
    links: links.bild,
    rechts: rechts.bild,
    loesung: links.wert < rechts.wert ? "<" : links.wert > rechts.wert ? ">" : "=",
    tipp: ["Schreibe ", bruchVon(b), ` in Prozent. Überlege: ${b.n} mal welche Zahl ergibt 100?`],
    begruendung: [bruchVon(b), " = ", bruch(p, 100), ` = ${p} %.`]
  });
}, ZWEI_STUFEN);

/* Übung 7: Alltag. Stufe 1: direkt erweitern. Stufe 2: auch mit Zwischenschritt. */
const ERWEITERN = "Schreibe den Anteil als Bruch und erweitere auf den Nenner 100.";
const TEXT_DIREKT = [
  () => {
    const n = wahl([20, 25]), z = zufall(3, n - 3);
    return { z, n, tipp: ERWEITERN, text: `In einer Klasse sind ${n} Kinder. ${z} davon spielen ein Instrument. Wie viel Prozent der Kinder sind das?` };
  },
  () => {
    const n = wahl([10, 20, 50]), z = zufall(2, n - 2);
    return { z, n, tipp: ERWEITERN, text: `Beim Basketball treffen ${z} von ${n} Würfen. Wie viel Prozent der Würfe treffen?` };
  },
  () => {
    const n = wahl([50, 100]), z = zufall(5, n - 5);
    return { z, n, tipp: ERWEITERN, text: `Bei einer Umfrage antworten ${z} von ${n} Personen mit „Ja“. Wie viel Prozent sind das?` };
  }
];
const TEXT_SCHRITT = [
  () => {
    const p = zufall(5, 95);
    return { z: 100 - p, n: 100, tipp: "Ein voller Akku hat 100 %.", text: `Ein Akku ist zu ${p} % geladen. Wie viel Prozent fehlen noch, bis er voll ist?` };
  },
  () => {
    const a = zufall(3, 9) * 5, b = zufall(3, 8) * 5;
    return { z: 100 - a - b, n: 100, tipp: "Alle Kinder zusammen sind 100 %. Ziehe die beiden bekannten Anteile ab.",
      text: `${a} % der Kinder kommen mit dem Bus, ${b} % mit dem Fahrrad und der Rest zu Fuß. Wie viel Prozent kommen zu Fuß?` };
  },
  () => {
    const n = wahl([20, 25]), z = zufall(3, n - 3);
    return { z, n, tipp: "Überlege zuerst, wie viele Kugeln es insgesamt sind.", text: `In einer Schachtel liegen ${z} rote und ${n - z} blaue Kugeln. Wie viel Prozent der Kugeln sind rot?` };
  },
  () => {
    const b = bruchMitNenner([4, 5, 10]), k = wahl([3, 6, 7]);
    return { z: b.z * k, n: b.n * k, tipp: "Schreibe den Anteil als Bruch. Kürze zuerst und erweitere dann auf den Nenner 100.",
      text: `Von ${b.n * k} Losen ${b.z * k === 1 ? "gewinnt" : "gewinnen"} ${b.z * k}. Wie viel Prozent der Lose gewinnen?` };
  }
];

uebung("alltag", (stufe) => {
  const vorlage = wahl(stufe === 1 ? TEXT_DIREKT : [...TEXT_DIREKT, ...TEXT_SCHRITT]);
  const { z, n, text, tipp } = vorlage();
  const p = prozent({ z, n });
  const eingabe = prozentEingabe();
  return {
    schluessel: vorlage,
    inhalt: [absatz(text), gleichung(eingabe.element)],
    pruefe: () => prozentPruefen(eingabe, { z, n }, tipp),
    loese() {
      eingabe.setzen(p);
      if (n === 100) return `Es sind ${p} %.`;
      const g = gekuerzt({ z, n });
      return [bruch(z, n), ...(100 % n ? [" = ", bruchVon(g)] : []), " = ", bruch(p, 100), ` = ${p} %`];
    }
  };
}, ZWEI_STUFEN);
