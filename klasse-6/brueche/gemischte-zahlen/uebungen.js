/* Übungen zu "Unechte Brüche und gemischte Zahlen" */
"use strict";

const ZWEI_STUFEN = 3;        // nach 3 richtigen Lösungen Stufe 2
const DREI_STUFEN = [3, 6];   // nach 3 Stufe 2, nach 6 Stufe 3

const absatz = (...inhalt) => el("p", {}, ...inhalt);
const gleichung = (...inhalt) => el("div", { class: "gleichung" }, ...inhalt);

// Echter, vollständig gekürzter Bruch mit Nenner von min bis max
function grundbruch(min, max) {
  let z, n;
  do { n = zufall(min, max); z = zufall(1, n - 1); } while (ggt(z, n) !== 1);
  return { z, n };
}

/* Prüft eine gemischte Zahl gegen den unechten Bruch z/n.
   kuerzen: Der Bruchteil muss vollständig gekürzt sein. */
function gemischtPruefen(eingabe, z, n, tipp, kuerzen = false) {
  const e = eingabe.lesen();
  if (!e) return { art: "offen", text: "Trage ganze Zahlen ein." };
  if (e.n === 0) return { art: "offen", text: "Der Nenner darf nicht 0 sein." };
  if ((e.g * e.n + e.z) * n === z * e.n) {
    if (e.z >= e.n) return { art: "offen", zaehlt: true, text: "Der Wert stimmt. In einer gemischten Zahl muss der Bruch aber kleiner als 1 sein." };
    if (kuerzen && e.z > 0 && ggt(e.z, e.n) > 1) return { art: "offen", zaehlt: true, text: "Der Wert stimmt. Kürze den Bruch noch vollständig." };
    return { art: "richtig", text: "Richtig!" };
  }
  const ganze = Math.floor(z / n);
  if (e.g === ganze && e.n === n) return { art: "falsch", text: "Die Ganzen und der Nenner stimmen. Prüfe den Zähler." };
  if (e.g === ganze) return { art: "falsch", text: "Die Ganzen stimmen. Prüfe den Bruch. Der Nenner ändert sich nicht, außer du kürzt." };
  return { art: "falsch", text: tipp };
}

// Unechter Bruch oder ganze Zahl z/n als Anzeige
function alsGemischt(z, n) {
  const g = Math.floor(z / n), rest = z % n;
  return rest ? gemischt(g, rest, n) : String(g);
}

/* ---------- Bilder ---------- */
const ARTEN = [
  { name: "Kreis", anzahlen: [2, 3, 4, 5, 6, 8], zeichne: (n) => kreis(n) },
  { name: "Streifen", anzahlen: [2, 3, 4, 5, 6], zeichne: (n) => streifen(Array(n).fill(1)) },
  { name: "Rechteck", anzahlen: [4, 6, 8], zeichne: (n) => rechteck(2, n / 2) }
];
const artenFuer = (n) => ARTEN.filter((a) => a.anzahlen.includes(n));

// Zeichnet z/n mit so vielen Ganzen wie nötig
function bildFuer(art, z, n, anzahl = Math.ceil(z / n)) {
  const fig = faerben(mehrere(anzahl, () => art.zeichne(n)), z, false);
  [...fig.bild.children].forEach((b) => {
    b.setAttribute("role", "img");
    b.setAttribute("aria-label", `${art.name} mit ${n} Teilen, ${b.querySelectorAll(".gefaerbt").length} gefärbt`);
  });
  return fig;
}

/* Übung 1: Ablesen. Stufe 1: als gemischte Zahl. Stufe 2: als unechter Bruch und als gemischte Zahl. */
uebung("ablesen", (stufe) => {
  const n = wahl([2, 3, 3, 4, 4, 5, 6, 8]);
  const g = zufall(1, 2), rest = zufall(1, n - 1), z = g * n + rest;
  const art = wahl(artenFuer(n));
  const unecht = bruchEingabe(), misch = gemischtEingabe();
  const tippGanze = `Ein ${art.name} ist ein Ganzes. Wie viele sind vollständig gefärbt?`;
  function pruefeUnecht() {
    return bruchPruefen(unecht, z, n, (e) => {
      if (e.n === n * (g + 1)) return `Das Ganze ist nur ein ${art.name}. Wie viele Teile hat er?`.replace("hat er", art.name === "Rechteck" ? "hat es" : "hat er");
      if (e.n === n) return "Der Nenner stimmt. Zähle alle gefärbten Teile.";
      return "Zähler: alle gefärbten Teile. Nenner: die Teile eines Ganzen.";
    });
  }
  return {
    schluessel: `${z}/${n}`,
    inhalt: [
      absatz(`Ein ${art.name} ist ein Ganzes. `, stufe === 1
        ? "Gib den gefärbten Anteil als gemischte Zahl an."
        : "Gib den gefärbten Anteil als unechten Bruch und als gemischte Zahl an."),
      bildFuer(art, z, n).bild,
      stufe === 1 ? gleichung(misch.element) : gleichung(unecht.element, "=", misch.element)
    ],
    pruefe() {
      if (stufe === 2) {
        const e = pruefeUnecht();
        if (e.art !== "richtig") return e.art === "falsch" ? { art: "falsch", text: ["Unechter Bruch: ", ...[].concat(e.text)] } : e;
      }
      const e = gemischtPruefen(misch, z, n, tippGanze);
      return stufe === 2 && e.art !== "richtig" ? { ...e, text: "Gemischte Zahl: " + e.text } : e;
    },
    loese() {
      unecht.setzen(z, n);
      misch.setzen(g, rest, n);
      return [bruch(z, n), " = ", gemischt(g, rest, n)];
    }
  };
}, ZWEI_STUFEN);

/* Übung 2: Färben. Stufe 1: gemischte Zahl gegeben. Stufe 2: unechter Bruch gegeben. */
uebung("faerben-ganze", (stufe) => {
  const n = wahl([2, 3, 3, 4, 4, 5, 6]);
  const z = zufall(1, 2) * n + zufall(1, n - 1);
  const art = wahl(artenFuer(n));
  const fig = antippbar(mehrere(3, () => art.zeichne(n)));
  return {
    schluessel: `${z}/${n}`,
    inhalt: [
      absatz(`Ein ${art.name} ist ein Ganzes. Tippe auf die Felder, bis `,
        stufe === 1 ? alsGemischt(z, n) : bruch(z, n), " gefärbt sind."),
      fig.bild
    ],
    pruefe() {
      const anzahl = fig.felder.filter((f) => f.classList.contains("gefaerbt")).length;
      if (anzahl === 0) return { art: "offen", text: "Färbe zuerst einige Felder." };
      if (anzahl === z) return { art: "richtig", text: ["Richtig! ", bruch(z, n), " = ", alsGemischt(z, n)] };
      return { art: "falsch", text: stufe === 1
        ? "Färbe zuerst die Ganzen vollständig und dann noch den Bruch."
        : `Der Nenner ${n} sagt: Ein Ganzes hat ${n} Teile. Der Zähler sagt, wie viele Teile du insgesamt brauchst.` };
    },
    loese() {
      faerben(fig, z, false);
      fig.felder.forEach((f, i) => f.setAttribute("aria-checked", String(i < z)));
      return [`Es sind ${z} Felder: `, bruch(z, n), " = ", alsGemischt(z, n)];
    }
  };
}, ZWEI_STUFEN);

/* Übung 3: Bilder auswählen. Stufe 1: unechter Bruch. Stufe 2: gemischte Zahl. */
uebung("auswaehlen", (stufe) => {
  const n = wahl([2, 3, 4]), z = n + zufall(1, n - 1);
  const bilder = (zz, nn) => artenFuer(nn).map((art) => ({ art, z: zz, n: nn }));
  const richtige = mischen([...bilder(z, n), ...bilder(2 * z, 2 * n)]).slice(0, zufall(2, 3));
  const falsche = mischen([[z - 1, n], [z + 1, n], [z, n + 1], [z, 2 * n], [z + n, n]])
    .slice(0, 6 - richtige.length).map(([zz, nn]) => wahl(bilder(zz, nn)));
  const karte = (b, richtig) => ({ inhalt: [bildFuer(b.art, b.z, b.n).bild], richtig });
  const karten = auswahlKarten(mischen([...richtige.map((b) => karte(b, true)), ...falsche.map((b) => karte(b, false))]));
  const ziel = () => (stufe === 1 ? bruch(z, n) : alsGemischt(z, n));
  return {
    schluessel: `${z}/${n}`,
    inhalt: [absatz("Jeder Kreis, jeder Streifen und jedes Rechteck ist ein Ganzes. Wähle alle Bilder, die ", ziel(), " zeigen."), karten.element],
    pruefe() {
      const v = karten.vergleichen();
      if (v.leer) return { art: "offen", text: "Wähle mindestens ein Bild aus." };
      if (v.zuviel) return { art: "falsch", text: "Mindestens ein ausgewähltes Bild passt nicht. Wie viele Teile hat ein Ganzes? Wie viele Teile sind gefärbt?" };
      if (v.fehlt) return { art: "falsch", text: "Bisher stimmt alles, aber es fehlt noch mindestens ein Bild. Feinere Teile können denselben Anteil zeigen." };
      return { art: "richtig", text: "Richtig! Du hast alle passenden Bilder gefunden." };
    },
    loese() {
      karten.loese();
      return ["Diese Bilder zeigen ", bruch(z, n), " = ", alsGemischt(z, n), "."];
    }
  };
}, ZWEI_STUFEN);

/* Übung 4: Mit ganzen Zahlen vergleichen. Stufe 1: mit 1. Stufe 2: mit 2 oder 3. */
uebung("vergleich", (stufe) => {
  const n = zufall(3, 9), m = stufe === 1 ? 1 : zufall(2, 3);
  const loesung = wahl(["<", "=", ">"]);
  const z = m * n + { "<": -1, "=": 0, ">": 1 }[loesung] * zufall(1, 2);
  return vergleichsAufgabe({
    schluessel: `${z}/${n}`,
    frage: stufe === 1 ? "Ist der Bruch kleiner als 1, gleich 1 oder größer als 1?" : "Vergleiche mit der ganzen Zahl.",
    links: () => bruch(z, n),
    rechts: () => el("strong", { class: "zahl" }, String(m)),
    loesung,
    tipp: stufe === 1
      ? `Der Nenner ist ${n}. Wie viele Teile brauchst du für ein Ganzes? Vergleiche mit dem Zähler.`
      : `Ein Ganzes hat ${n} Teile. Wie viele Teile haben ${m} Ganze? Vergleiche mit dem Zähler.`,
    begruendung: [m === 1 ? "Ein Ganzes ist " : `${m} Ganze sind `, bruch(m * n, n), "."]
  });
}, ZWEI_STUFEN);

/* Übung 5: Unechter Bruch → gemischte Zahl.
   Stufe 1: kleine Zahlen. Stufe 2: größere Zahlen, auch ganze Zahlen. Stufe 3: zusätzlich kürzen. */
uebung("ingemischt", (stufe) => {
  let z, n;
  if (stufe === 1) {
    const b = grundbruch(2, 5);
    n = b.n; z = zufall(1, 3) * n + b.z;
  } else if (stufe === 2) {
    const b = grundbruch(3, 10);
    n = b.n; z = zufall(2, 6) * n + (Math.random() < 0.25 ? 0 : b.z);
  } else {
    const b = grundbruch(2, 5), k = zufall(2, 4);
    n = b.n * k; z = (zufall(1, 4) * b.n + b.z) * k;
  }
  const g = Math.floor(z / n), rest = z % n, t = rest ? ggt(rest, n) : 1;
  const eingabe = gemischtEingabe();
  return {
    schluessel: `${z}/${n}`,
    inhalt: [
      absatz("Schreibe als gemischte Zahl.", stufe === 2 ? " Ist es eine ganze Zahl, lass den Bruch leer." : stufe === 3 ? " Kürze den Bruch vollständig." : ""),
      gleichung(bruch(z, n), "=", eingabe.element)
    ],
    pruefe: () => gemischtPruefen(eingabe, z, n, `Wie oft passt ${n} in ${z}? Das sind die Ganzen. Der Rest ist der Zähler.`, stufe === 3),
    loese() {
      if (rest) eingabe.setzen(g, rest / t, n / t); else eingabe.setzen(g, "", "");
      return [`${z} : ${n} = ${g}${rest ? ` Rest ${rest}` : ""}, also `, bruch(z, n), " = ", alsGemischt(z, n),
        ...(stufe === 3 ? [" = ", gemischt(g, rest / t, n / t)] : [])];
    }
  };
}, DREI_STUFEN);

/* Übung 6: Gemischte Zahl → unechter Bruch. Stufe 1: kleine Zahlen. Stufe 2: größere Zahlen.
   Stufe 3: Lücke in der gemischten Zahl. */
uebung("inunecht", (stufe) => {
  const b = grundbruch(stufe === 1 ? 2 : 3, stufe === 1 ? 5 : 10);
  const n = b.n, g = stufe === 1 ? zufall(1, 3) : zufall(2, 6), z = g * n + b.z;
  const unecht = bruchEingabe();
  const misch = gemischtEingabe(Math.random() < 0.5 ? { z: b.z, n } : { g, n });
  return {
    schluessel: `${z}/${n}`,
    inhalt: stufe < 3
      ? [absatz("Schreibe als unechten Bruch."), gleichung(gemischt(g, b.z, n), "=", unecht.element)]
      : [absatz("Ergänze die fehlende Zahl."), gleichung(misch.element, "=", bruch(z, n))],
    pruefe() {
      if (stufe === 3) return lueckePruefen();
      return bruchPruefen(unecht, z, n, (e) => {
        if (e.n === n && e.z === g + b.z) return "Du hast die Ganzen nur addiert. Wie viele Teile hat ein Ganzes?";
        if (e.n === n && e.z === g * b.z) return "Du hast die Ganzen mit dem Zähler multipliziert. Rechne Ganze · Nenner + Zähler.";
        if (e.n === n && e.z === g * n) return "Das sind nur die Ganzen. Der Bruch kommt noch dazu.";
        if (e.n === n) return "Der Nenner stimmt. Rechne beim Zähler: Ganze · Nenner + Zähler.";
        return "Der Nenner bleibt gleich. Rechne beim Zähler: Ganze · Nenner + Zähler.";
      });
    },
    loese() {
      unecht.setzen(z, n);
      misch.setzen(g, b.z, n);
      return [`${g} · ${n} + ${b.z} = ${z}, also `, gemischt(g, b.z, n), " = ", bruch(z, n)];
    }
  };
  function lueckePruefen() {
    if ([...misch.element.querySelectorAll("input")].some((f) => !/^\d+$/.test(f.value.trim()))) {
      return { art: "offen", text: "Trage eine ganze Zahl ein." };
    }
    return gemischtPruefen(misch, z, n, `Wie oft passt ${n} in ${z}? Das sind die Ganzen. Der Rest ist der Zähler.`);
  }
}, DREI_STUFEN);

/* Übung 7: Alltag. Stufe 1: in eine gemischte Zahl umwandeln.
   Stufe 2: auch gerecht teilen, Zeiten und umgekehrt. */
const TEXT_DIREKT = [
  () => {
    const n = wahl([4, 6, 8]), z = n * zufall(1, 3) + zufall(1, n - 1);
    return { z, n, einheit: "Pizzen", text: `Jede Pizza ist in ${n} gleich große Stücke geschnitten. Es sind noch ${z} Stücke da. Wie viele Pizzen sind das?`, tipp: `${n} Stücke sind eine ganze Pizza.` };
  },
  () => {
    const n = wahl([3, 4, 5]), z = n * zufall(1, 3) + zufall(1, n - 1);
    return { z, n, einheit: "Liter", text: [`In ein Glas passt `, bruch(1, n), ` Liter. Es werden ${z} Gläser gefüllt. Wie viele Liter sind das?`], tipp: `${n} Gläser sind ein Liter.` };
  },
  () => {
    const n = wahl([2, 3, 4, 5]), z = n * zufall(1, 4) + zufall(1, n - 1);
    return { z, n, einheit: "km", text: ["Eine Laufrunde ist ", bruch(1, n), ` km lang. Es werden ${z} Runden gelaufen. Wie viele Kilometer sind das?`], tipp: `${n} Runden sind ein Kilometer.` };
  }
];
const TEXT_SCHRITT = [
  () => {
    const n = zufall(3, 6), z = n * zufall(1, 2) + zufall(1, n - 1);
    return { z, n, einheit: "Pizzen", text: `${z} Pizzen werden gerecht auf ${n} Kinder verteilt. Wie viel bekommt jedes Kind?`, tipp: `Rechne ${z} : ${n}. Jedes Kind bekommt zuerst ganze Pizzen, der Rest wird aufgeteilt.` };
  },
  () => {
    const z = 60 * zufall(1, 2) + wahl([10, 15, 20, 30, 40, 45, 50]);
    return { z, n: 60, einheit: "Stunden", text: `Ein Film dauert ${z} Minuten. Wie viele Stunden sind das?`, tipp: "Eine Stunde hat 60 Minuten. Wie viele Minuten bleiben nach den ganzen Stunden übrig?" };
  },
  () => {
    const n = wahl([3, 4, 5]), g = zufall(1, 3), r = zufall(1, n - 1);
    return { z: g * n + r, n, anzahl: true, einheit: "Gläser", text: ["In einer Kanne sind ", gemischt(g, r, n), " Liter Saft. In ein Glas passt ", bruch(1, n), " Liter. Wie viele Gläser kann man füllen?"], tipp: `Ein Liter sind ${n} Gläser.` };
  }
];

uebung("alltag", (stufe) => {
  const vorlage = wahl(stufe === 1 ? TEXT_DIREKT : [...TEXT_DIREKT, ...TEXT_SCHRITT]);
  const { z, n, text, tipp, einheit, anzahl } = vorlage();
  const g = Math.floor(z / n), rest = z % n, t = ggt(rest, n);
  const feld = zahlFeld("Anzahl");
  const eingabe = gemischtEingabe();
  return {
    schluessel: vorlage,
    inhalt: [absatz(...[].concat(text), anzahl ? "" : " Gib das Ergebnis als gemischte Zahl an."),
      anzahl ? el("div", { class: "zahl-eingabe" }, feld, einheit) : gleichung(eingabe.element, einheit)],
    pruefe() {
      if (!anzahl) return gemischtPruefen(eingabe, z, n, tipp);
      const w = feld.value.trim();
      if (!/^\d+$/.test(w)) return { art: "offen", text: "Trage eine ganze Zahl ein." };
      return Number(w) === z ? { art: "richtig", text: "Richtig!" } : { art: "falsch", text: tipp };
    },
    loese() {
      feld.value = z;
      eingabe.setzen(g, rest / t, n / t);
      if (anzahl) return [gemischt(g, rest, n), " = ", bruch(z, n), `, also ${z} Gläser.`];
      return [bruch(z, n), " = ", gemischt(g, rest, n), ...(t > 1 ? [" = ", gemischt(g, rest / t, n / t)] : [])];
    }
  };
}, ZWEI_STUFEN);
