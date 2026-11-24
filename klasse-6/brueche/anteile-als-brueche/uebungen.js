/* Übungen zu "Anteile als Brüche darstellen" */
"use strict";

const absatz = (...inhalt) => el("p", {}, ...inhalt);

// Ab so vielen richtigen Lösungen beginnt Stufe 2.
const AUFSTIEG = 3;

// Gut lesbare Figuren: für jede Art die erlaubten Anzahlen an Teilen
const FIGUREN = [
  { anzahlen: [2, 3, 4, 5, 6, 8], zeichne: (n) => kreis(n) },
  { anzahlen: [2, 3, 4, 5, 6], zeichne: (n) => streifen(Array(n).fill(1)) },
  { anzahlen: [4, 6, 8, 10], zeichne: (n) => rechteck(2, n / 2) },
  { anzahlen: [9, 12], zeichne: (n) => rechteck(3, n / 3) }
];

// Mögliche Nenner. Die 2 steht nur einmal in der Liste und kommt daher seltener vor.
const NENNER = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 12, 12];

const zufallsFigur = (n) => wahl(FIGUREN.filter((f) => f.anzahlen.includes(n))).zeichne(n);

function beschriften(fig, text) {
  fig.bild.setAttribute("role", "img");
  fig.bild.setAttribute("aria-label", text);
}

/* Übung 1: Bruch ablesen */
uebung("ablesen", (stufe) => {
  const n = wahl(NENNER), z = zufall(1, n - 1);
  const fig = faerben(zufallsFigur(n), z, stufe === 2 && Math.random() < 0.5);
  beschriften(fig, `Figur mit ${n} gleich großen Feldern, ${z} davon gefärbt`);
  const eingabe = bruchEingabe();
  return {
    schluessel: `${z}/${n}`,
    inhalt: [absatz("Welcher Anteil der Figur ist gefärbt?"), fig.bild, eingabe.element],
    pruefe: () => bruchPruefen(eingabe, z, n, (e) => {
      if (e.z === z && e.n === n - z) return "Der Nenner gibt an, wie viele Teile es insgesamt sind. Zähle auch die gefärbten Teile mit.";
      if (e.z === n - z && e.n === n) return "Du hast die weißen Teile gezählt. Gesucht ist der gefärbte Anteil.";
      if (e.n === n) return "Der Nenner stimmt. Zähle die gefärbten Teile noch einmal.";
      if (e.z === z) return "Der Zähler stimmt. Zähle alle Teile noch einmal.";
      return "Zähle zuerst alle Teile (Nenner), dann die gefärbten Teile (Zähler).";
    }),
    loese() {
      eingabe.setzen(z, n);
      return [`${z} von ${n} ${z === 1 ? "Teilen ist" : "Teilen sind"} gefärbt: `, bruch(z, n)];
    }
  };
}, AUFSTIEG);

/* Übung 2: Anteil färben. In Stufe 2 hat die Figur zur Hälfte doppelt so viele Felder
   wie der Nenner angibt (Rechteck mit 2 Reihen, jede Spalte ist eine Gruppe). */
uebung("faerben", (stufe) => {
  const faktor = stufe === 2 ? wahl([1, 2]) : 1;
  const n = faktor === 1 ? wahl(NENNER) : wahl([3, 4, 5]);
  const moegliche = Array.from({ length: n - 1 }, (_, i) => i + 1)
    .filter((z) => faktor === 1 || ggt(z, n) === 1);
  const z = wahl(moegliche);
  const felder = n * faktor, gesucht = z * faktor;
  const fig = antippbar(faktor === 1 ? zufallsFigur(n) : rechteck(2, n));
  fig.bild.classList.add("gross");
  return {
    schluessel: `${z}/${n}`,
    inhalt: [absatz("Tippe auf die Felder, bis ", bruch(z, n), " der Figur gefärbt ist."), fig.bild],
    pruefe() {
      const anzahl = fig.felder.filter((f) => f.classList.contains("gefaerbt")).length;
      if (anzahl === 0) return { art: "offen", text: "Färbe zuerst einige Felder." };
      if (anzahl === gesucht) return { art: "richtig", text: "Richtig!" };
      if (faktor > 1) {
        return { art: "falsch", text: `Die Figur hat ${felder} Felder. Teile sie in ${n} gleich große Gruppen. Wie viele Felder hat eine Gruppe?` };
      }
      return { art: "falsch", text: anzahl > gesucht
        ? "Das sind zu viele Felder. Achte auf den Zähler."
        : "Das sind zu wenige Felder. Achte auf den Zähler." };
    },
    loese() {
      fig.felder.forEach((f, i) => {
        // Bei doppelter Felderzahl ganze Spalten färben
        const an = faktor === 1 ? i < gesucht : i % n < z;
        f.classList.toggle("gefaerbt", an);
        f.setAttribute("aria-checked", String(an));
      });
      return [gesucht === 1
        ? `Es muss 1 von ${felder} Feldern gefärbt sein.`
        : `Es müssen ${gesucht} von ${felder} Feldern gefärbt sein.`];
    }
  };
}, AUFSTIEG);

/* Übung 3: Alle Bilder auswählen, die einen Stammbruch zeigen */
uebung("auswaehlen", (stufe) => {
  const n = wahl([2, 3, 4]);
  const verstreut = stufe === 2;
  const gleich = (k) => Array(k).fill(1);
  const richtige = mischen([
    () => faerben(kreis(n), 1),
    () => faerben(streifen(gleich(n)), 1),
    () => faerben(kreis(2 * n), 2),
    () => faerben(rechteck(2, n), 2, verstreut)
  ]).slice(0, zufall(2, 3)).map((f) => ({ fig: f(), richtig: true }));
  // Ein Bild mit ungleichen Teilen ist immer dabei.
  const ungleich = () => faerben(streifen([n === 2 ? 2.5 : 2, ...gleich(n - 1)]), 1);
  const falsche = [ungleich, ...mischen([
    () => faerben(kreis(n + 1), 1),
    () => faerben(streifen(gleich(n + 1)), 1), // ein gefärbt, n weiß
    () => faerben(rechteck(2, n), 3, verstreut),
    () => faerben(kreis(2 * n), 1)
  ])].slice(0, 6 - richtige.length).map((f) => ({ fig: f(), richtig: false }));

  const karten = mischen([...richtige, ...falsche]);
  karten.forEach((k, i) => {
    beschriften(k.fig, `Bild ${i + 1}: ${k.fig.felder.length} Felder, ${
      k.fig.felder.filter((f) => f.classList.contains("gefaerbt")).length} gefärbt`);
    k.knopf = el("button", { type: "button", "aria-pressed": "false" }, k.fig.bild);
    k.knopf.addEventListener("click", () => {
      k.knopf.setAttribute("aria-pressed", String(k.knopf.getAttribute("aria-pressed") !== "true"));
    });
  });
  const gewaehlt = (k) => k.knopf.getAttribute("aria-pressed") === "true";
  return {
    schluessel: n,
    inhalt: [
      absatz("Wähle alle Bilder, bei denen ", bruch(1, n), " gefärbt ist."),
      el("div", { class: "auswahl" }, ...karten.map((k) => k.knopf))
    ],
    pruefe() {
      if (!karten.some(gewaehlt)) return { art: "offen", text: "Wähle mindestens ein Bild aus." };
      const zuviel = karten.some((k) => gewaehlt(k) && !k.richtig);
      const fehlt = karten.some((k) => !gewaehlt(k) && k.richtig);
      if (!zuviel && !fehlt) return { art: "richtig", text: "Richtig! Du hast alle passenden Bilder gefunden." };
      if (zuviel) return { art: "falsch", text: "Mindestens ein ausgewähltes Bild passt nicht. Sind alle Teile gleich groß? Stimmt die Anzahl?" };
      return { art: "falsch", text: "Bisher stimmt alles, aber es fehlt noch mindestens ein Bild." };
    },
    loese() {
      karten.forEach((k) => k.knopf.setAttribute("aria-pressed", String(k.richtig)));
      return ["Diese Bilder zeigen ", bruch(1, n), ". Zähle bei jedem Bild nach."];
    }
  };
}, AUFSTIEG);

/* Übung 4: Textaufgaben. Jede liefert Text, Zähler, Nenner und einen Tipp.
   Stufe 1: Zähler und Nenner stehen im Text. Stufe 2: auch Aufgaben mit Zwischenschritt. */
const TEXT_DIREKT = [
  () => {
    const n = wahl([20, 24, 25, 30]), z = zufall(3, n - 5);
    return { z, n, text: `In einer Klasse sind ${n} Kinder. ${z} davon kommen mit dem Fahrrad zur Schule. Welcher Anteil der Kinder kommt mit dem Fahrrad?`,
      tipp: "Das Ganze sind alle Kinder der Klasse. Diese Zahl gehört in den Nenner." };
  },
  () => {
    const n = wahl([8, 10, 12]), z = zufall(2, n - 2);
    return { z, n, text: `Ein Wanderweg ist ${n} km lang. Eine Gruppe ist schon ${z} km gelaufen. Welchen Anteil des Weges hat sie geschafft?`,
      tipp: "Das Ganze ist der gesamte Weg." };
  }
];

const TEXT_SCHRITT = [
  () => {
    const n = wahl([6, 8, 10, 12]), weg = zufall(2, n - 2);
    return { z: n - weg, n, text: `Eine Pizza ist in ${n} gleich große Stücke geschnitten. ${weg} Stücke werden gegessen. Welcher Anteil der Pizza bleibt übrig?`,
      tipp: "Überlege zuerst, wie viele Stücke übrig bleiben." };
  },
  () => {
    const n = zufall(5, 12), z = zufall(2, n - 2), b = n - z;
    return { z, n, text: `In einer Schachtel liegen ${z} rote und ${b} blaue Kugeln. Welcher Anteil der Kugeln ist rot?`,
      tipp: "Überlege zuerst, wie viele Kugeln es insgesamt sind." };
  },
  () => {
    const z = wahl([5, 10, 15, 20, 25, 30, 40, 45]);
    return { z, n: 60, text: `Eine Pause dauert ${z} Minuten. Welcher Anteil einer Stunde ist das?`,
      tipp: "Das Ganze ist eine Stunde. Wie viele Minuten sind das?" };
  }
];

uebung("alltag", (stufe) => {
  const vorlage = wahl(stufe === 1 ? TEXT_DIREKT : [...TEXT_DIREKT, ...TEXT_SCHRITT]);
  const { z, n, text, tipp } = vorlage();
  const eingabe = bruchEingabe();
  return {
    schluessel: vorlage,
    inhalt: [absatz(text), eingabe.element],
    pruefe: () => bruchPruefen(eingabe, z, n, () => tipp),
    loese() {
      eingabe.setzen(z, n);
      return ["Der Anteil ist ", bruch(z, n), "."];
    }
  };
}, AUFSTIEG);
