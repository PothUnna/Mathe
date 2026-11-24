/* Übungen zu "Brüche auf dem Zahlenstrahl" */
"use strict";

const ZWEI_STUFEN = 3;        // nach 3 richtigen Lösungen Stufe 2
const DREI_STUFEN = [3, 6];   // nach 3 Stufe 2, nach 6 Stufe 3

const absatz = (...inhalt) => el("p", {}, ...inhalt);
const gleichung = (...inhalt) => el("div", { class: "gleichung" }, ...inhalt);
const kgv = (a, b) => (a * b) / ggt(a, b);
const bruchVon = (b) => bruch(b.z, b.n);
const kurz = (b) => `${b.z}/${b.n}`;

// Echter, vollständig gekürzter Bruch mit Nenner von min bis max
function grundbruch(min, max) {
  let z, n;
  do { n = zufall(min, max); z = zufall(1, n - 1); } while (ggt(z, n) !== 1);
  return { z, n };
}

// z/n als gemischte Zahl, falls größer als 1
function alsGemischt({ z, n }) {
  const g = Math.floor(z / n), rest = z % n;
  if (!rest) return el("strong", {}, String(g));
  return g ? gemischt(g, rest, n) : bruch(z, n);
}

// Strahl bis 2 oder 3, höchstens 16 Abschnitte, damit die Striche gut antippbar bleiben
function strahlUeberEins() {
  const n = wahl([2, 3, 4, 5, 6, 8]);
  const max = n <= 5 ? zufall(2, 3) : 2;
  let z;
  do { z = zufall(n + 1, max * n - 1); } while (z % n === 0);
  return { z, n, max };
}

/* Übung 1: Ablesen. Stufe 1: zwischen 0 und 1. Stufe 2: über 1 hinaus als Bruch.
   Stufe 3: über 1 hinaus als gemischte Zahl. */
uebung("ablesen", (stufe) => {
  const n1 = zufall(2, 10);
  const { z, n, max } = stufe === 1 ? { z: zufall(1, n1 - 1), n: n1, max: 1 } : strahlUeberEins();
  const g = Math.floor(z / n), rest = z % n;
  const strahl = zahlenstrahl({ max, n, pfeile: [{ stelle: z }] });
  const eingabe = bruchEingabe(), misch = gemischtEingabe();
  function pruefeGemischt() {
    const e = misch.lesen();
    if (!e) return { art: "offen", text: "Trage ganze Zahlen ein." };
    if (e.n === 0) return { art: "offen", text: "Der Nenner darf nicht 0 sein." };
    if ((e.g * e.n + e.z) * n === z * e.n) {
      return e.z < e.n ? { art: "richtig", text: "Richtig!" }
        : { art: "offen", zaehlt: true, text: "Die Stelle stimmt. In einer gemischten Zahl muss der Bruch aber kleiner als 1 sein." };
    }
    if (e.g !== g) return { art: "falsch", text: "Welche ganze Zahl liegt direkt links vom Pfeil?" };
    return { art: "falsch", text: `Die Ganzen stimmen. Wie viele Abschnitte sind es von der ${g} bis zum Pfeil?` };
  }
  return {
    schluessel: `${z}/${n}`,
    inhalt: [
      absatz(stufe === 3 ? "Auf welche Zahl zeigt der Pfeil? Gib eine gemischte Zahl an." : "Auf welchen Bruch zeigt der Pfeil?"),
      strahl.bild, gleichung(stufe === 3 ? misch.element : eingabe.element)
    ],
    pruefe: () => (stufe === 3 ? pruefeGemischt() : bruchPruefen(eingabe, z, n, (e) => {
      if (max > 1 && e.n === max * n) return "Der Strahl reicht nicht nur bis 1. Zähle nur die Abschnitte zwischen 0 und 1.";
      if (e.n === n + 1 || e.n === n - 1) return "Zähle die Abschnitte zwischen 0 und 1, nicht die Striche.";
      if (e.n === n && e.z === z + 1) return "Beginne bei 0 und zähle die Abschnitte, nicht die Striche.";
      if (e.n === n) return "Der Nenner stimmt. Zähle die Abschnitte von 0 bis zum Pfeil.";
      return "Nenner: Abschnitte zwischen 0 und 1. Zähler: Abschnitte von 0 bis zum Pfeil.";
    })),
    loese() {
      eingabe.setzen(z, n);
      misch.setzen(g, rest, n);
      return [bruch(z, n), ...(g ? [" = ", gemischt(g, rest, n)] : [])];
    }
  };
}, DREI_STUFEN);

/* Übung 2: Eintragen. Stufe 1: zwischen 0 und 1. Stufe 2: über 1 hinaus.
   Stufe 3: Die Einteilung ist feiner als der Nenner. */
uebung("eintragen", (stufe) => {
  let z, n, max, k = 1, zeige;
  if (stufe === 1) {
    n = zufall(3, 10); z = zufall(1, n - 1); max = 1;
  } else if (stufe === 2) {
    ({ z, n, max } = strahlUeberEins());
  } else {
    const b = grundbruch(2, 5);
    n = b.n;
    k = n <= 3 ? zufall(2, 3) : 2;
    max = n * k * 2 <= 16 ? 2 : 1;
    z = b.z + (max === 2 ? zufall(0, 1) * n : 0);
  }
  zeige = Math.random() < 0.5 ? bruch(z, n) : alsGemischt({ z, n });
  const strahl = zahlenstrahl({ max, n: n * k, antippbar: true });
  const ziel = z * k;
  return {
    schluessel: `${z}/${n}`,
    inhalt: [absatz("Tippe auf die Stelle, an der ", zeige, " liegt."), strahl.bild],
    pruefe() {
      const w = strahl.wert();
      if (w === null) return { art: "offen", text: "Tippe zuerst auf einen Strich." };
      if (w === ziel) return { art: "richtig", text: "Richtig!" };
      if (k > 1 && w === z) return { art: "falsch", text: `Zwischen 0 und 1 sind ${n * k} Abschnitte, nicht ${n}. Erweitere den Bruch auf den Nenner ${n * k}.` };
      if (w === ziel - 1) return { art: "falsch", text: "Fast! Beginne bei 0 und zähle die Abschnitte, nicht die Striche." };
      return { art: "falsch", text: k > 1
        ? `Zwischen 0 und 1 sind ${n * k} Abschnitte. Erweitere den Bruch auf den Nenner ${n * k}.`
        : "Der Zähler eines Bruchs gibt an, wie viele Abschnitte du von 0 aus gehst." };
    },
    loese() {
      strahl.setzen(ziel);
      return [bruch(z, n), ...(k > 1 ? [" = ", bruch(ziel, n * k)] : []), `: Das sind ${ziel} ${ziel === 1 ? "Abschnitt" : "Abschnitte"} von 0 aus.`];
    }
  };
}, DREI_STUFEN);

/* Übung 3: Zuordnen. Stufe 1: gleicher Nenner. Stufe 2: verschiedene Nenner. */
uebung("zuordnen", (stufe) => {
  const buchstaben = ["A", "B", "C"];
  let n, max, brueche;
  if (stufe === 1) {
    ({ n, max } = wahl([{ n: 4, max: 2 }, { n: 5, max: 2 }, { n: 6, max: 2 }, { n: 8, max: 1 }, { n: 10, max: 1 }]));
    brueche = mischen(Array.from({ length: max * n - 1 }, (_, i) => i + 1).filter((z) => z % n)).slice(0, 3).map((z) => ({ z, n }));
  } else {
    n = wahl([6, 8, 10, 12]);
    max = 1;
    const teiler = [2, 3, 4, 5, 6].filter((t) => n % t === 0 && t < n);
    const alle = teiler.flatMap((t) => Array.from({ length: t - 1 }, (_, i) => ({ z: i + 1, n: t })))
      .filter((b) => ggt(b.z, b.n) === 1);
    brueche = mischen(alle).slice(0, 3);
  }
  const stelle = (b) => (b.z * n) / b.n;
  const vonLinks = [...brueche].sort((a, b) => stelle(a) - stelle(b));
  const loesung = (b) => buchstaben[vonLinks.indexOf(b)];
  const felder = brueche.map(() => wahlKnoepfe(buchstaben.map((t) => ({ wert: t, text: t }))));
  const zeige = (b) => (stufe === 1 && b.z > b.n && b.z % 2 ? alsGemischt(b) : bruchVon(b));
  const strahl = zahlenstrahl({ max, n, pfeile: vonLinks.map((b, i) => ({ stelle: stelle(b), text: buchstaben[i] })) });
  return {
    schluessel: brueche.map(kurz).join(),
    inhalt: [absatz("Welcher Pfeil gehört zu welcher Zahl?"), strahl.bild,
      el("div", { class: "zeilen" }, ...brueche.map((b, i) =>
        el("div", { class: "vergleichszeile" }, zeige(b), felder[i].element)))],
    pruefe() {
      if (felder.some((f) => f.wert() === null)) return { art: "offen", text: "Wähle in jeder Zeile einen Buchstaben." };
      const anzahl = felder.filter((f, i) => f.wert() === loesung(brueche[i])).length;
      if (anzahl === 3) return { art: "richtig", text: "Richtig!" };
      return { art: "falsch", text: `${anzahl} von 3 Zeilen ${anzahl === 1 ? "stimmt" : "stimmen"}. ` + (stufe === 1
        ? "Zähle die Abschnitte von 0 aus."
        : `Zwischen 0 und 1 sind ${n} Abschnitte. Erweitere auf den Nenner ${n}.`) };
    },
    loese() {
      felder.forEach((f, i) => f.setzen(loesung(brueche[i])));
      return vonLinks.flatMap((b, i) => [`${i ? ", " : ""}${buchstaben[i]}: `, bruchVon(b)]);
    }
  };
}, ZWEI_STUFEN);

/* Übung 4: Zwischen welchen ganzen Zahlen? Stufe 1: kleine Zahlen. Stufe 2: größere Zahlen. */
uebung("zwischen", (stufe) => {
  const n = stufe === 1 ? zufall(2, 5) : zufall(3, 9);
  const g = stufe === 1 ? zufall(0, 3) : zufall(2, 7);
  const z = g * n + zufall(1, n - 1);
  const links = zahlFeld("linke Zahl"), rechts = zahlFeld("rechte Zahl");
  return {
    schluessel: `${z}/${n}`,
    inhalt: [absatz("Zwischen welchen benachbarten ganzen Zahlen liegt der Bruch?"),
      el("div", { class: "zwischen" }, bruch(z, n), "liegt zwischen", links, "und", rechts)],
    pruefe() {
      const w = [links, rechts].map((f) => f.value.trim());
      if (w.some((t) => !/^\d+$/.test(t))) return { art: "offen", text: "Trage zwei ganze Zahlen ein." };
      const [a, b] = w.map(Number);
      if (a === g && b === g + 1) return { art: "richtig", text: ["Richtig! ", bruch(z, n), ...(g ? [" = ", alsGemischt({ z, n })] : [])] };
      if (a === g + 1 && b === g) return { art: "offen", zaehlt: true, text: "Die Zahlen stimmen. Trage die kleinere links ein." };
      if (a <= g && b >= g + 1) return { art: "falsch", text: "Der Bruch liegt dazwischen, die Zahlen sind aber nicht benachbart." };
      return { art: "falsch", text: `Wie oft passt ${n} in ${z}? Oder: Wandle in eine gemischte Zahl um.` };
    },
    loese() {
      links.value = g;
      rechts.value = g + 1;
      return [bruch(z, n), ...(g ? [" = ", alsGemischt({ z, n })] : []), ` liegt zwischen ${g} und ${g + 1}.`];
    }
  };
}, ZWEI_STUFEN);

/* Übung 5: Einteilung. Stufe 1: ein Bruch. Stufe 2: zwei Brüche. */
uebung("einteilung", (stufe) => {
  const [n1, n2] = stufe === 1 ? wahl([[2, 2], [3, 3], [4, 4], [5, 5]])
    : wahl([[2, 3], [2, 5], [3, 4], [4, 6], [2, 4], [3, 6], [2, 6]]);
  const brueche = (stufe === 1 ? [n1] : [n1, n2]).map((n) => {
    let z;
    do { z = zufall(1, n - 1); } while (ggt(z, n) !== 1);
    return { z, n };
  });
  const passend = kgv(n1, n2);
  const alle = Array.from({ length: 23 }, (_, i) => i + 2);
  const richtige = mischen(alle.filter((t) => t % passend === 0)).slice(0, 2);
  // Falsche Anzahlen: gern solche, die nur zu einem der beiden Brüche passen
  const falsch = mischen(alle.filter((t) => t % passend));
  const halb = falsch.filter((t) => t % n1 === 0 || t % n2 === 0).slice(0, 2);
  const falsche = [...halb, ...falsch.filter((t) => !halb.includes(t))].slice(0, 6 - richtige.length);
  const karten = auswahlKarten(mischen([...richtige, ...falsche]).map((t) =>
    ({ inhalt: [String(t)], richtig: t % passend === 0 })), "brueche");
  return {
    schluessel: brueche.map(kurz).join(),
    inhalt: [
      absatz("Du möchtest ", ...brueche.flatMap((b, i) => [i ? " und " : "", bruchVon(b)]),
        " genau auf einem Strich eintragen. Wie viele gleich lange Abschnitte zwischen 0 und 1 passen? Wähle alle passenden Zahlen."),
      karten.element
    ],
    pruefe() {
      const v = karten.vergleichen();
      if (v.leer) return { art: "offen", text: "Wähle mindestens eine Zahl aus." };
      if (v.zuviel) return { art: "falsch", text: stufe === 1
        ? `Mindestens eine Zahl passt nicht. Sie muss durch ${n1} teilbar sein.`
        : `Mindestens eine Zahl passt nicht. Sie muss durch ${n1} und durch ${n2} teilbar sein.` };
      if (v.fehlt) return { art: "falsch", text: "Bisher stimmt alles, aber es fehlt noch mindestens eine Zahl." };
      return { art: "richtig", text: "Richtig!" };
    },
    loese() {
      karten.loese();
      return stufe === 1 ? `Passend sind alle Zahlen, die durch ${n1} teilbar sind.`
        : `Passend sind alle Zahlen, die durch ${n1} und durch ${n2} teilbar sind.`;
    }
  };
}, ZWEI_STUFEN);

/* Übung 6: Gleiche Stelle. Stufe 1: zwischen 0 und 1. Stufe 2: zwischen 1 und 2, auch gemischte Zahlen. */
uebung("gleich", (stufe) => {
  const b = grundbruch(2, 5);
  if (stufe === 2) b.z += b.n;
  const max = stufe;
  const strahl = zahlenstrahl({ max, n: b.n, pfeile: [{ stelle: b.z }] });
  const g = Math.floor(b.z / b.n), rest = b.z % b.n;
  const mal = (k) => ({ z: b.z * k, n: b.n * k });
  let richtige = mischen([1, 2, 3, 4].map(mal)).slice(0, stufe === 1 ? zufall(2, 3) : zufall(1, 2)).map(bruchVon);
  if (stufe === 2) richtige.push(wahl([gemischt(g, rest, b.n), gemischt(g, rest * 2, b.n * 2)]));
  const bruchFalsch = [
    { z: b.z, n: b.n * max + (max === 1 ? 1 : 0) }, { z: b.z + 1, n: b.n + 1 }, { z: b.z * 2, n: b.n * 3 },
    { z: b.z * 2 + 1, n: b.n * 2 }, { z: b.z + 2, n: b.n + 2 }, { z: b.z * 3 - 1, n: b.n * 3 }, { z: b.z, n: b.n + 2 }
  ].filter((x) => x.z * b.n !== b.z * x.n && x.z !== x.n);
  const falsche = [];
  if (stufe === 2) {
    const m = wahl([{ z: rest, n: b.n * 2 }, { z: rest, n: b.n + 1 }]);
    falsche.push(gemischt(g, m.z, m.n));
  }
  const gesehen = new Set();
  for (const x of mischen(bruchFalsch)) {
    if (falsche.length + richtige.length < 6 && !gesehen.has(kurz(x))) { gesehen.add(kurz(x)); falsche.push(bruchVon(x)); }
  }
  const karten = auswahlKarten(mischen([
    ...richtige.map((k) => ({ inhalt: [k], richtig: true })),
    ...falsche.map((k) => ({ inhalt: [k], richtig: false }))
  ]), "brueche");
  return {
    schluessel: kurz(b),
    inhalt: [absatz("Wähle alle Zahlen, die an der Stelle des Pfeils liegen."), strahl.bild, karten.element],
    pruefe() {
      const v = karten.vergleichen();
      if (v.leer) return { art: "offen", text: "Wähle mindestens eine Zahl aus." };
      if (v.zuviel) return { art: "falsch", text: "Mindestens eine ausgewählte Zahl passt nicht. Lies zuerst den Pfeil ab und vergleiche dann durch Kürzen oder Erweitern." };
      if (v.fehlt) return { art: "falsch", text: "Bisher stimmt alles, aber es fehlt noch mindestens eine Zahl." };
      return { art: "richtig", text: "Richtig! Du hast alle gefunden." };
    },
    loese() {
      karten.loese();
      return ["Der Pfeil zeigt auf ", bruchVon(b), ...(g ? [" = ", alsGemischt(b)] : []), "."];
    }
  };
}, ZWEI_STUFEN);

/* Übung 7: Ordnen. Stufe 1: gleicher Nenner. Stufe 2: verschiedene Nenner. */
uebung("ordnen", (stufe) => {
  let brueche;
  if (stufe === 1) {
    const n = zufall(3, 6);
    brueche = mischen(Array.from({ length: 3 * n - 1 }, (_, i) => i + 1)).slice(0, 4).map((z) => ({ z, n }));
  } else {
    const familie = wahl([[2, 3, 4, 6], [2, 4, 5, 10], [2, 3, 6, 12]]);
    do {
      brueche = familie.map((n) => ({ z: zufall(1, 2 * n - 1), n }));
    } while (new Set(brueche.map((b) => Math.round((b.z / b.n) * 1e6))).size < 4 || brueche.some((b) => b.z === b.n));
    brueche = mischen(brueche);
  }
  const sortiert = [...brueche].sort((a, b) => a.z * b.n - b.z * a.n);
  // Die Aufgabe darf nicht schon gelöst sein.
  while (brueche.every((b, i) => b === sortiert[i])) brueche = mischen(brueche);
  // Zahlen über 1 abwechselnd als gemischte Zahl und als unechter Bruch
  let wechsel = Math.random() < 0.5;
  const anzeigen = brueche.map((b) => (b.z > b.n && (wechsel = !wechsel) ? alsGemischt(b) : bruchVon(b)));
  const karten = ziehKarten(anzeigen);
  const nummern = sortiert.map((b) => brueche.indexOf(b));
  return {
    schluessel: brueche.map(kurz).sort().join(),
    inhalt: [
      absatz("Ziehe die Karten in die richtige Reihenfolge. Die ", el("strong", {}, "kleinste"), " Zahl kommt nach links. Du kannst auch zwei Karten nacheinander antippen, um sie zu tauschen."),
      karten.element
    ],
    pruefe() {
      const folge = karten.folge();
      if (folge.every((k, i) => k === nummern[i])) return { art: "richtig", text: "Richtig!" };
      if (folge.every((k, i) => k === nummern[3 - i])) return { art: "falsch", text: "Das ist genau umgekehrt. Die kleinste Zahl liegt links." };
      return { art: "falsch", text: "Überlege zuerst: Welche Zahlen sind kleiner als 1, welche größer? " + (stufe === 1
        ? "Schreibe dann alle als Bruch." : "Mache sie dann gleichnamig.") };
    },
    loese() {
      karten.setzen(nummern);
      return sortiert.flatMap((b, i) => [i ? " < " : "", bruchVon(b)]);
    }
  };
}, ZWEI_STUFEN);
