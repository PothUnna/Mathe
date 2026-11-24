/* Übungen zu "Brüche vergleichen" */
"use strict";

const ZWEI_STUFEN = 3;        // nach 3 richtigen Lösungen Stufe 2
const DREI_STUFEN = [3, 6];   // nach 3 Stufe 2, nach 6 Stufe 3

const absatz = (...inhalt) => el("p", {}, ...inhalt);
const kgv = (a, b) => (a * b) / ggt(a, b);
const zeichenZwischen = (a, b) => {
  const d = a.z * b.n - b.z * a.n;
  return d < 0 ? "<" : d > 0 ? ">" : "=";
};
const bruchVon = (b) => bruch(b.z, b.n);
const kurz = (b) => `${b.z}/${b.n}`;
const zufallsBruch = (n) => ({ z: zufall(1, n - 1), n });

/* ---------- Paare von Brüchen ---------- */

// gleicher Nenner oder gleicher Zähler
function paarEinfach(min, max) {
  if (Math.random() < 0.5) {
    const n = zufall(Math.max(min, 3), max);
    const [a, b] = mischen(Array.from({ length: n - 1 }, (_, i) => i + 1));
    return [{ z: a, n }, { z: b, n }];
  }
  const [n1, n2] = mischen(Array.from({ length: max - min + 1 }, (_, i) => i + min));
  const z = zufall(1, Math.min(n1, n2) - 1);
  return [{ z, n: n1 }, { z, n: n2 }];
}

// ein Nenner ist ein Vielfaches des anderen, manchmal sind die Brüche gleich groß
function paarVielfaches() {
  const a = zufallsBruch(zufall(2, 6));
  const k = zufall(2, a.n <= 4 ? 4 : 3);
  const b = Math.random() < 0.25 ? { z: a.z * k, n: a.n * k } : zufallsBruch(a.n * k);
  return mischen([a, b]);
}

// kein Nenner ist ein Vielfaches des anderen
const NENNERPAARE = [[2, 3], [2, 5], [3, 4], [3, 5], [4, 5], [3, 8], [4, 6], [5, 6], [6, 8], [6, 9], [4, 10], [6, 10], [4, 9], [5, 8]];
// Hier ist das Produkt der Nenner nicht der kleinste gemeinsame Nenner.
const NENNERPAARE_MIT_TEILER = NENNERPAARE.filter(([a, b]) => ggt(a, b) > 1);
const paarBeliebig = (liste = NENNERPAARE) => mischen(wahl(liste)).map(zufallsBruch);

/* ---------- Ein Vergleich mit der Walze ---------- */
function paarVergleich(frage, [a, b], tipp, begruendung) {
  return vergleichsAufgabe({
    schluessel: [a, b].map(kurz).sort().join(),
    frage, tipp, begruendung,
    links: () => bruchVon(a), rechts: () => bruchVon(b), loesung: zeichenZwischen(a, b)
  });
}

// Tipp und Begründung passend zum Paar
function erklaerung([a, b]) {
  if (a.n === b.n) {
    return { tipp: "Beide Nenner sind gleich. Vergleiche die Zähler.",
      begruendung: [`Die Nenner sind gleich. Der größere Zähler ist ${Math.max(a.z, b.z)}.`] };
  }
  if (a.z === b.z) {
    return { tipp: "Beide Zähler sind gleich. Überlege, bei welchem Bruch die Teile größer sind.",
      begruendung: [`Die Zähler sind gleich. Beim kleineren Nenner ${Math.min(a.n, b.n)} sind die Teile größer.`] };
  }
  const nenner = kgv(a.n, b.n);
  const begruendung = ["Gleichnamig: "];
  [a, b].forEach((x, i) => {
    if (i) begruendung.push(" und ");
    begruendung.push(bruchVon(x));
    if (x.n !== nenner) begruendung.push(" = ", bruch((x.z * nenner) / x.n, nenner));
  });
  begruendung.push(".");
  const einer = [a, b].find((x) => x.n === nenner) && [a, b].find((x) => x.n !== nenner);
  return {
    tipp: einer ? ["Erweitere ", bruchVon(einer), ` auf den Nenner ${nenner}.`] : `Erweitere beide Brüche auf den Nenner ${nenner}.`,
    begruendung
  };
}

/* Übung 1: Bild. Stufe 1: gleicher Zähler oder Nenner. Stufe 2: beliebig. */
uebung("bild", (stufe) => {
  let paar;
  if (stufe === 1) paar = paarEinfach(2, 6);
  else {
    paar = Math.random() < 0.25
      ? mischen(wahl([[[1, 2], [2, 4]], [[1, 2], [3, 6]], [[1, 3], [2, 6]], [[2, 3], [4, 6]], [[2, 4], [3, 6]]]))
        .map(([z, n]) => ({ z, n }))
      : mischen([2, 3, 4, 5, 6]).slice(0, 2).map(zufallsBruch);
  }
  const eingaben = paar.map(() => bruchEingabe());
  const wahlFeld = walze(ZEICHEN, "Zeichen zwischen den Brüchen");
  const loesung = zeichenZwischen(...paar);
  return {
    schluessel: paar.map(kurz).join(),
    inhalt: [
      absatz("Gib beide Anteile als Bruch an. Drehe die Walze auf das richtige Zeichen."),
      el("div", { class: "bild-vergleich" },
        ...paar.map((b) => {
          const fig = faerben(streifen(Array(b.n).fill(1)), b.z, false);
          fig.bild.setAttribute("role", "img");
          fig.bild.setAttribute("aria-label", `Streifen mit ${b.n} Feldern, ${b.z} gefärbt`);
          return fig.bild;
        }),
        eingaben[0].element, wahlFeld.element, eingaben[1].element)
    ],
    pruefe() {
      const ergebnisse = paar.map((b, i) => bruchPruefen(eingaben[i], b.z, b.n, () =>
        `Prüfe den ${i ? "rechten" : "linken"} Bruch: Zähle alle Felder und die gefärbten Felder.`));
      const fehler = ergebnisse.find((e) => e.art === "offen") || ergebnisse.find((e) => e.art === "falsch");
      if (fehler) return fehler;
      if (wahlFeld.wert() === null) return { art: "offen", text: "Wähle noch das Zeichen zwischen den Brüchen aus." };
      if (wahlFeld.wert() !== loesung) return { art: "falsch", text: "Beide Brüche stimmen. Vergleiche, wie weit die Streifen gefärbt sind." };
      return { art: "richtig", text: "Richtig!" };
    },
    loese() {
      paar.forEach((b, i) => eingaben[i].setzen(b.z, b.n));
      wahlFeld.setzen(loesung);
      return [bruchVon(paar[0]), ` ${loesung} `, bruchVon(paar[1])];
    }
  };
}, ZWEI_STUFEN);

/* Übung 2: Zeichen einsetzen. Stufe 1: gleicher Zähler oder Nenner.
   Stufe 2: ein Nenner ist Vielfaches des anderen. Stufe 3: beliebig. */
uebung("zeichen", (stufe) => {
  const paar = [() => paarEinfach(2, 10), paarVielfaches, () => paarBeliebig()][stufe - 1]();
  const { tipp, begruendung } = erklaerung(paar);
  return paarVergleich("Drehe die Walze auf das richtige Zeichen.", paar, tipp, begruendung);
}, DREI_STUFEN);

/* Übung 3: Gleichnamig machen. Stufe 1: Nenner gegeben. Stufe 2: Nenner selbst finden.
   Stufe 3: kleinster gemeinsamer Nenner. */
uebung("gleichnamig", (stufe) => {
  const paar = paarBeliebig(stufe === 3 ? NENNERPAARE_MIT_TEILER : NENNERPAARE);
  const nenner = kgv(paar[0].n, paar[1].n);
  const ziel = paar.map((b) => ({ z: (b.z * nenner) / b.n, n: nenner }));
  const eingaben = paar.map(() => bruchEingabe(stufe === 1 ? { n: nenner } : {}));
  const feld = walze(ZEICHEN, "Zeichen zwischen den Brüchen");
  const loesung = zeichenZwischen(...paar);
  const frage = [
    [`Erweitere beide Brüche auf den Nenner ${nenner} und setze das Zeichen ein.`],
    ["Mache die Brüche gleichnamig und setze das Zeichen ein."],
    ["Mache die Brüche gleichnamig. Verwende den ", el("strong", {}, "kleinsten"), " gemeinsamen Nenner. Setze dann das Zeichen ein."]
  ][stufe - 1];
  return {
    schluessel: paar.map(kurz).join(),
    inhalt: [
      absatz(...frage),
      el("div", { class: "zeilen" },
        ...paar.map((b, i) => el("div", { class: "vergleichszeile" }, bruchVon(b), "=", eingaben[i].element)),
        el("div", { class: "vergleich-gross" }, bruchVon(paar[0]), feld.element, bruchVon(paar[1])))
    ],
    pruefe() {
      const e = eingaben.map((x) => x.lesen());
      if (e.some((x) => !x)) return { art: "offen", text: "Fülle alle Felder mit ganzen Zahlen aus." };
      if (e.some((x) => x.n === 0)) return { art: "offen", text: "Der Nenner darf nicht 0 sein." };
      for (const i of [0, 1]) {
        if (e[i].z * paar[i].n !== paar[i].z * e[i].n) {
          return { art: "falsch", text: ["Prüfe die Umformung von ", bruchVon(paar[i]), ". Multipliziere Zähler und Nenner mit derselben Zahl."] };
        }
      }
      if (e[0].n !== e[1].n) return { art: "falsch", text: "Die beiden Nenner sind noch verschieden." };
      // Gemeinsamer Nenner muss durch Erweitern beider Brüche entstehen.
      if (e[0].n % nenner !== 0) {
        return { art: "offen", zaehlt: true, text: "Das ist gleich groß. Hier sollst du aber beide Brüche erweitern und nicht kürzen." };
      }
      if (stufe === 3 && e[0].n !== nenner) return { art: "offen", zaehlt: true, text: "Die Brüche sind gleichnamig. Es gibt aber einen kleineren gemeinsamen Nenner." };
      if (feld.wert() === null) return { art: "offen", text: "Setze noch das Zeichen ein." };
      if (feld.wert() !== loesung) return { art: "falsch", text: "Die Brüche sind gleichnamig. Vergleiche jetzt die Zähler." };
      return { art: "richtig", text: "Richtig!" };
    },
    loese() {
      ziel.forEach((b, i) => eingaben[i].setzen(b.z, b.n));
      feld.setzen(loesung);
      return [bruchVon(ziel[0]), ` ${loesung} `, bruchVon(ziel[1]), ", also ", bruchVon(paar[0]), ` ${loesung} `, bruchVon(paar[1])];
    }
  };
}, DREI_STUFEN);

/* Übung 4: Ein Halbes. Stufe 1: mit 1/2 vergleichen. Stufe 2: ein Bruch liegt unter, einer über 1/2. */
uebung("haelfte", (stufe) => {
  const art = (b) => zeichenZwischen(b, { z: 1, n: 2 });
  const nahe = () => {
    const n = zufall(5, stufe === 1 ? 20 : 12);
    const z = Math.floor(n / 2) + zufall(-1, 2);
    return { z, n };
  };
  const mitArt = (a) => { let b; do { b = nahe(); } while (art(b) !== a); return b; };
  // z. B. 3,5 für die Hälfte von 7
  const haelfte = (n) => String(n / 2).replace(".", ",");
  const grund = (b) => [`Die Hälfte von ${b.n} ist ${haelfte(b.n)}, also: `, bruchVon(b), ` ${art(b)} `, bruch(1, 2), "."];
  if (stufe === 1) {
    const b = mitArt(wahl(["<", "=", ">"]));
    return paarVergleich("Vergleiche mit einem Halben.", [b, { z: 1, n: 2 }],
      `Was ist die Hälfte von ${b.n}? Ist der Zähler ${b.z} kleiner, gleich groß oder größer?`, grund(b));
  }
  const paar = mischen([mitArt("<"), mitArt(">")]);
  return paarVergleich("Vergleiche. Überlege, welcher Bruch kleiner und welcher größer als ein Halbes ist.", paar,
    `Vergleiche jeden Zähler mit der Hälfte seines Nenners. Was ist die Hälfte von ${paar[0].n} und von ${paar[1].n}?`,
    [...grund(paar[0]), " ", ...grund(paar[1])]);
}, ZWEI_STUFEN);

/* Übung 5: Ordnen. Stufe 1: gleicher Zähler oder Nenner. Stufe 2: verwandte Nenner. Stufe 3: vier Brüche. */
function bruecheZumOrdnen(stufe) {
  if (stufe === 1) {
    if (Math.random() < 0.5) {
      const n = zufall(5, 12);
      return mischen(Array.from({ length: n - 1 }, (_, i) => ({ z: i + 1, n }))).slice(0, 3);
    }
    const z = zufall(1, 4);
    return mischen([5, 6, 7, 8, 9, 10]).slice(0, 3).map((n) => ({ z, n }));
  }
  const familie = wahl(stufe === 2
    ? [[2, 4, 8], [3, 6, 12], [2, 5, 10], [4, 8, 16]]
    : [[2, 3, 4, 6, 12], [2, 4, 5, 10, 20], [3, 5, 6, 10, 15]]);
  for (;;) {
    const liste = mischen(familie).slice(0, stufe === 2 ? 3 : 4).map(zufallsBruch);
    if (new Set(liste.map((b) => Math.round((b.z / b.n) * 1e6))).size === liste.length) return liste;
  }
}

uebung("ordnen", (stufe) => {
  let brueche = bruecheZumOrdnen(stufe);
  const sortiert = [...brueche].sort((a, b) => a.z * b.n - b.z * a.n);
  // Die Aufgabe darf nicht schon gelöst sein.
  while (brueche.every((b, i) => b === sortiert[i])) brueche = mischen(brueche);
  const karten = ziehKarten(brueche.map(bruchVon));
  const nummern = sortiert.map((b) => brueche.indexOf(b));
  return {
    schluessel: brueche.map(kurz).sort().join(),
    inhalt: [
      absatz("Ziehe die Karten in die richtige Reihenfolge. Der ", el("strong", {}, "kleinste"), " Bruch kommt nach links. Du kannst auch zwei Karten nacheinander antippen, um sie zu tauschen."),
      karten.element
    ],
    pruefe() {
      const folge = karten.folge();
      if (folge.every((k, i) => k === nummern[i])) return { art: "richtig", text: "Richtig!" };
      if (folge.every((k, i) => k === nummern[nummern.length - 1 - i])) {
        return { art: "falsch", text: "Das ist genau umgekehrt. Der kleinste Bruch liegt links." };
      }
      return { art: "falsch", text: stufe === 1
        ? "Haben die Brüche den gleichen Nenner oder den gleichen Zähler? Überlege, was das bedeutet."
        : "Erweitere alle Brüche auf denselben Nenner." };
    },
    loese() {
      karten.setzen(nummern);
      return sortiert.flatMap((b, i) => [i ? " < " : "", bruchVon(b)]);
    }
  };
}, DREI_STUFEN);

/* Übung 6: Lücke. Mehrere Lösungen sind möglich.
   Stufe 1: gleicher Nenner oder gleicher Zähler. Stufe 2: verschiedene Nenner, Zähler gesucht. */
uebung("luecke", (stufe) => {
  const zeichen = wahl(["<", ">"]);
  let a, fest, beispiel;
  if (stufe === 1 && Math.random() < 0.5) {
    a = zufallsBruch(zufall(4, 9));                       // ?/n  und  z/n
    fest = { n: a.n };
    beispiel = { z: zeichen === "<" ? a.z - 1 : a.z + 1, n: a.n };
  } else if (stufe === 1) {
    const n = zufall(4, 9);                               // z/?  und  z/n
    a = { z: zufall(2, n - 2), n };
    fest = { z: a.z };
    beispiel = { z: a.z, n: zeichen === "<" ? n + 1 : n - 1 };
  } else {
    a = zufallsBruch(zufall(3, 6));                       // ?/(n·k)  und  z/n
    const k = zufall(2, 3);
    fest = { n: a.n * k };
    beispiel = { z: a.z * k + (zeichen === "<" ? -1 : 1), n: fest.n };
  }
  const eingabe = bruchEingabe(fest);
  return {
    schluessel: kurz(a),
    inhalt: [
      absatz("Finde eine Zahl, sodass die Aussage stimmt. Es gibt mehrere Möglichkeiten."),
      el("div", { class: "vergleichszeile" }, eingabe.element, zeichen, bruchVon(a))
    ],
    pruefe() {
      const e = eingabe.lesen();
      if (!e) return { art: "offen", text: "Trage eine ganze Zahl ein." };
      if (e.n === 0) return { art: "offen", text: "Der Nenner darf nicht 0 sein." };
      const ist = zeichenZwischen(e, a);
      if (ist === zeichen) return { art: "richtig", text: ["Richtig! ", bruchVon(e), ` ${zeichen} `, bruchVon(a)] };
      if (ist === "=") return { art: "falsch", text: "Jetzt sind beide Brüche gleich groß." };
      if (fest.z) return { art: "falsch", text: "Denke daran: Je größer der Nenner, desto kleiner sind die Teile." };
      return { art: "falsch", text: stufe === 1 ? "Vergleiche die beiden Zähler." : `Erweitere den rechten Bruch auf den Nenner ${fest.n}.` };
    },
    loese() {
      eingabe.setzen(beispiel.z, beispiel.n);
      return ["Eine mögliche Lösung: ", bruchVon(beispiel), ` ${zeichen} `, bruchVon(a)];
    }
  };
}, ZWEI_STUFEN);

/* Übung 7: Alltag. Stufe 1: Brüche gegeben. Stufe 2: Anteile aus Anzahlen bestimmen. */
const NAMEN = ["Mia", "Ben", "Lina", "Emre", "Sofia", "Jonas"];
const ALLTAG = [
  (p, a, b) => [`${p[0]} und ${p[1]} lesen das gleiche Buch. ${p[0]} hat `, bruchVon(a), ` gelesen, ${p[1]} `, bruchVon(b), ". Wer hat mehr gelesen?"],
  (p, a, b) => [`${p[0]} und ${p[1]} laufen die gleiche Strecke. ${p[0]} hat `, bruchVon(a), ` geschafft, ${p[1]} `, bruchVon(b), ". Wer ist weiter gekommen?"],
  (p, a, b) => [`${p[0]} und ${p[1]} haben gleich große Pizzen. ${p[0]} hat `, bruchVon(a), ` gegessen, ${p[1]} `, bruchVon(b), ". Wer hat mehr gegessen?"]
];
const ALLTAG_ANZAHL = [
  (p, a, b) => [`Beim Basketball trifft ${p[0]} ${a.z} von ${a.n} Würfen, ${p[1]} trifft ${b.z} von ${b.n} Würfen. Wer hat den größeren Anteil getroffen?`],
  (p, a, b) => [`Bei zwei verschieden langen Quizrunden hat ${p[0]} ${a.z} von ${a.n} Fragen richtig, ${p[1]} ${b.z} von ${b.n} Fragen. Wer hat den größeren Anteil richtig?`]
];

uebung("alltag", (stufe) => {
  const vorlage = wahl(stufe === 1 ? ALLTAG : [...ALLTAG, ...ALLTAG_ANZAHL]);
  let paar;
  if (ALLTAG.includes(vorlage)) paar = wahl([paarVielfaches, () => paarBeliebig()])();
  else if (Math.random() < 0.25) {
    const [z, n] = wahl([[3, 5], [3, 4], [2, 3], [4, 5]]); // gleicher Anteil, verschiedene Anzahlen
    paar = mischen([2, 3, 4]).slice(0, 2).map((k) => ({ z: z * k, n: n * k }));
  } else {
    paar = mischen(wahl([[10, 15], [10, 20], [12, 15], [8, 12], [15, 20], [12, 20]]))
      .map((n) => ({ z: zufall(Math.ceil(n / 2), n - 2), n }));
  }
  const personen = mischen(NAMEN).slice(0, 2);
  const feld = wahlKnoepfe([
    { wert: ">", text: personen[0] }, { wert: "<", text: personen[1] }, { wert: "=", text: "beide gleich" }
  ]);
  const loesung = zeichenZwischen(...paar);
  const nenner = kgv(paar[0].n, paar[1].n);
  return {
    schluessel: vorlage,
    inhalt: [absatz(...vorlage(personen, ...paar)), el("div", { class: "zeilen" }, feld.element)],
    pruefe() {
      if (feld.wert() === null) return { art: "offen", text: "Wähle eine Antwort aus." };
      if (feld.wert() === loesung) return { art: "richtig", text: ["Richtig! ", bruchVon(paar[0]), ` ${loesung} `, bruchVon(paar[1])] };
      return { art: "falsch", text: ALLTAG.includes(vorlage)
        ? "Mache die beiden Brüche gleichnamig."
        : "Schreibe beide Anteile als Bruch und mache sie gleichnamig." };
    },
    loese() {
      feld.setzen(loesung);
      return [...paar.flatMap((b, i) => [i ? " und " : "", bruchVon(b), " = ", bruch((b.z * nenner) / b.n, nenner)]),
        ", also ", bruchVon(paar[0]), ` ${loesung} `, bruchVon(paar[1])];
    }
  };
}, ZWEI_STUFEN);
