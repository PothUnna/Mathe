/* Übungen zu "Brüche erweitern und kürzen" */
"use strict";

const ZWEI_STUFEN = 3;        // nach 3 richtigen Lösungen Stufe 2
const DREI_STUFEN = [3, 6];   // nach 3 Stufe 2, nach 6 Stufe 3

const absatz = (...inhalt) => el("p", {}, ...inhalt);
const gleichung = (...inhalt) => el("div", { class: "gleichung" }, ...inhalt);

// Zufälliger vollständig gekürzter Bruch zwischen 0 und 1 mit Nenner von min bis max
function grundbruch(min, max) {
  let z, n;
  do { n = zufall(min, max); z = zufall(1, n - 1); } while (ggt(z, n) !== 1);
  return { z, n };
}

/* Prüft, ob genau z/n eingegeben wurde.
   von: Ausgangsbruch, um typische Fehler zu erkennen. tipp: allgemeiner Hinweis */
function genauPruefen(eingabe, z, n, von, tipp) {
  const e = eingabe.lesen();
  if (!e) return { art: "offen", text: "Fülle alle Felder mit ganzen Zahlen aus." };
  if (e.n === 0) return { art: "offen", text: "Der Nenner darf nicht 0 sein." };
  if (e.z === z && e.n === n) return { art: "richtig", text: "Richtig!" };
  if (e.z === von.z && e.n === von.n) return { art: "offen", zaehlt: true, text: "Das ist noch der Ausgangsbruch. " + tipp };
  if (e.z * n === e.n * z) return { art: "offen", zaehlt: true, text: "Dein Bruch ist gleich groß, aber nicht der gesuchte. " + tipp };
  if (e.z - von.z === e.n - von.n) {
    return { art: "falsch", text: "Du hast vermutlich addiert oder subtrahiert. Beim Erweitern wird multipliziert, beim Kürzen dividiert." };
  }
  if (e.z === von.z || e.n === von.n) return { art: "falsch", text: "Verändere Zähler und Nenner mit derselben Zahl, nicht nur einen von beiden." };
  if (e.n === n) return { art: "falsch", text: "Der Nenner stimmt. Prüfe den Zähler." };
  if (e.z === z) return { art: "falsch", text: "Der Zähler stimmt. Prüfe den Nenner." };
  return { art: "falsch", text: tipp };
}

/* Übung 1: Bild. Der linke oder der rechte Bruch fehlt.
   Stufe 1: links grobe, rechts feine Einteilung. Stufe 2: auch umgekehrt. */
uebung("bild", (stufe) => {
  const { z, n } = grundbruch(2, 6);
  const k = zufall(2, n <= 4 ? 4 : 3);
  const kuerzen = stufe === 2 && Math.random() < 0.5;
  const linksFehlt = Math.random() < 0.5;
  const zeichne = (reihen) => {
    const fig = rechteck(reihen, n);
    fig.felder.forEach((f, i) => f.classList.toggle("gefaerbt", i % n < z));
    fig.bild.setAttribute("role", "img");
    fig.bild.setAttribute("aria-label", `Rechteck mit ${n * reihen} Feldern, ${z * reihen} gefärbt`);
    return fig.bild;
  };
  const grob = { z, n, reihen: 1 }, fein = { z: z * k, n: n * k, reihen: k };
  const [links, rechts] = kuerzen ? [fein, grob] : [grob, fein];
  const [gesucht, gegeben] = linksFehlt ? [links, rechts] : [rechts, links];
  const eingabe = bruchEingabe();
  const spalte = (seite) => el("div", { class: "bild-bruch" }, zeichne(seite.reihen),
    seite === gesucht ? eingabe.element : bruch(seite.z, seite.n));
  return {
    schluessel: `${z}/${n}`,
    inhalt: [
      absatz("In beiden Rechtecken ist der gleiche Anteil gefärbt. Gib den fehlenden Bruch an."),
      el("div", { class: "vergleich" }, spalte(links), spalte(rechts))
    ],
    pruefe: () => genauPruefen(eingabe, gesucht.z, gesucht.n, gegeben,
      `Zähle im ${linksFehlt ? "linken" : "rechten"} Bild alle Felder und die gefärbten Felder.`),
    loese() {
      eingabe.setzen(gesucht.z, gesucht.n);
      return [bruch(links.z, links.n), " = ", bruch(rechts.z, rechts.n),
        kuerzen ? ` (von links nach rechts mit ${k} gekürzt)` : ` (von links nach rechts mit ${k} erweitert)`];
    }
  };
}, ZWEI_STUFEN);

/* Übung 2: Erweitern. Stufe 1: Zahl gegeben. Stufe 2: Nenner gegeben. Stufe 3: Lücke an beliebiger Stelle. */
uebung("erweitern", (stufe) => {
  const { z, n } = grundbruch(2, stufe === 1 ? 8 : 10);
  const k = zufall(2, stufe === 1 ? 5 : 9);
  const neu = { z: z * k, n: n * k };
  let eingabe, inhalt, ziel = neu, von = { z, n }, tipp;
  if (stufe === 1) {
    eingabe = bruchEingabe();
    inhalt = [absatz("Erweitere mit ", el("strong", {}, String(k)), "."), gleichung(bruch(z, n), "=", eingabe.element)];
    tipp = `Multipliziere Zähler und Nenner mit ${k}.`;
  } else if (stufe === 2) {
    eingabe = bruchEingabe({ n: neu.n });
    inhalt = [absatz("Erweitere auf den Nenner ", el("strong", {}, String(neu.n)), "."), gleichung(bruch(z, n), "=", eingabe.element)];
    tipp = `Überlege: ${n} mal welche Zahl ergibt ${neu.n}?`;
  } else {
    const links = Math.random() < 0.5;
    if (links) [ziel, von] = [von, neu];
    eingabe = bruchEingabe(Math.random() < 0.5 ? { z: ziel.z } : { n: ziel.n });
    inhalt = [absatz("Ergänze die fehlende Zahl."),
      links ? gleichung(eingabe.element, "=", bruch(neu.z, neu.n)) : gleichung(bruch(z, n), "=", eingabe.element)];
    tipp = "Vergleiche die beiden Zähler oder die beiden Nenner: Mit welcher Zahl wurde erweitert?";
  }
  return {
    schluessel: `${z}/${n}`,
    inhalt,
    pruefe: () => genauPruefen(eingabe, ziel.z, ziel.n, von, tipp),
    loese() {
      eingabe.setzen(ziel.z, ziel.n);
      return ["Erweitert mit ", String(k), ": ", bruch(z, n), " = ", bruch(`${z} · ${k}`, `${n} · ${k}`), " = ", bruch(neu.z, neu.n)];
    }
  };
}, DREI_STUFEN);

/* Übung 3: Kürzen. Stufe 1: Zahl gegeben. Stufe 2: Zahl selbst finden. Stufe 3: vollständig kürzen. */
uebung("kuerzen", (stufe) => {
  const basis = grundbruch(2, stufe === 1 ? 8 : 9);
  const k = stufe === 1 ? zufall(2, 6) : stufe === 2 ? wahl([2, 3, 5, 7, 4, 6]) : wahl([4, 6, 8, 9, 10, 12]);
  const z = basis.z * k, n = basis.n * k;
  const eingabe = bruchEingabe();
  const frage = [
    ["Kürze mit ", el("strong", {}, String(k)), "."],
    ["Kürze den Bruch. Finde selbst eine passende Zahl."],
    ["Kürze den Bruch ", el("strong", {}, "vollständig"), "."]
  ][stufe - 1];
  function pruefe() {
    if (stufe === 1) return genauPruefen(eingabe, basis.z, basis.n, { z, n }, `Dividiere Zähler und Nenner durch ${k}.`);
    const e = eingabe.lesen();
    const tipp = "Suche eine Zahl, durch die Zähler und Nenner teilbar sind.";
    // Nur echtes Kürzen mit einer ganzen Zahl gilt.
    const gekuerzt = e && e.n > 0 && e.n < n && n % e.n === 0 && e.z * n === e.n * z;
    if (gekuerzt && stufe === 2) return { art: "richtig", text: `Richtig! Du hast mit ${n / e.n} gekürzt.` };
    if (gekuerzt && e.n !== basis.n) return { art: "offen", zaehlt: true, text: "Bis hierhin richtig gekürzt. Es geht aber noch weiter." };
    return genauPruefen(eingabe, basis.z, basis.n, { z, n }, tipp);
  }
  return {
    schluessel: `${z}/${n}`,
    inhalt: [absatz(...frage), gleichung(bruch(z, n), "=", eingabe.element)],
    pruefe,
    loese() {
      eingabe.setzen(basis.z, basis.n);
      return ["Gekürzt mit ", String(k), ": ", bruch(z, n), " = ", bruch(`${z} : ${k}`, `${n} : ${k}`), " = ", bruch(basis.z, basis.n)];
    }
  };
}, DREI_STUFEN);

/* Übung 4: Zahl bestimmen. Stufe 1: Rechenart ist bekannt. Stufe 2: Rechenart selbst bestimmen. */
uebung("zahl", (stufe) => {
  const b = grundbruch(2, 9), k = zufall(2, 9);
  const kuerzen = Math.random() < 0.5;
  const gross = { z: b.z * k, n: b.n * k };
  const [von, nach] = kuerzen ? [gross, b] : [b, gross];
  const wort = kuerzen ? "gekürzt" : "erweitert";
  const feld = zahlFeld("Zahl");
  const arten = ["erweitert", "gekürzt"].map((name) => {
    const knopf = el("button", { type: "button", "aria-pressed": "false" }, name);
    knopf.addEventListener("click", () => arten.forEach((a) => a.setAttribute("aria-pressed", String(a === knopf))));
    return knopf;
  });
  const gewaehlt = () => (stufe === 1 ? wort : (arten.find((a) => a.getAttribute("aria-pressed") === "true") || {}).textContent);
  return {
    schluessel: `${von.z}/${von.n}`,
    inhalt: [
      absatz(stufe === 1 ? `Mit welcher Zahl wurde ${wort}?` : "Wurde erweitert oder gekürzt? Und mit welcher Zahl?"),
      gleichung(bruch(von.z, von.n), "=", bruch(nach.z, nach.n)),
      el("div", { class: "zahl-eingabe" },
        ...(stufe === 1 ? [`${wort} mit`] : [el("div", { class: "art" }, ...arten), "mit"]), feld)
    ],
    pruefe() {
      const w = feld.value.trim();
      if (!/^\d+$/.test(w)) return { art: "offen", text: "Trage eine ganze Zahl ein." };
      if (!gewaehlt()) return { art: "offen", text: "Wähle aus, ob erweitert oder gekürzt wurde." };
      if (gewaehlt() !== wort) return { art: "falsch", text: "Vergleiche die Nenner: Beim Erweitern werden die Zahlen größer, beim Kürzen kleiner." };
      if (Number(w) === k) return { art: "richtig", text: "Richtig!" };
      return { art: "falsch", text: kuerzen
        ? `Überlege: ${von.n} geteilt durch welche Zahl ergibt ${nach.n}?`
        : `Überlege: ${von.n} mal welche Zahl ergibt ${nach.n}?` };
    },
    loese() {
      feld.value = k;
      arten.forEach((a) => a.setAttribute("aria-pressed", String(a.textContent === wort)));
      const t = kuerzen ? ":" : "·";
      return [`Es wurde mit ${k} ${wort}: ${von.z} ${t} ${k} = ${nach.z} und ${von.n} ${t} ${k} = ${nach.n}`];
    }
  };
}, ZWEI_STUFEN);

/* Übung 5: Gleich große Brüche. Stufe 1: gekürzter Ausgangsbruch. Stufe 2: ungekürzter Ausgangsbruch. */
uebung("gleich", (stufe) => {
  const b = grundbruch(2, 6);
  const m = stufe === 1 ? 1 : zufall(2, 3);
  const ziel = { z: b.z * m, n: b.n * m };
  const richtige = mischen([1, 2, 3, 4, 5].filter((k) => k !== m)).slice(0, zufall(2, 3))
    .map((k) => ({ z: b.z * k, n: b.n * k }));
  const vorschlaege = [2, 3, 4].flatMap((k) => [
    { z: ziel.z + k, n: ziel.n + k },
    { z: b.z * k, n: b.n * (k + 1) },
    { z: b.z * k + 1, n: b.n * k },
    { z: b.z, n: ziel.n * k },
    { z: ziel.z, n: ziel.n + k }
  ]);
  const falsche = [];
  for (const v of mischen(vorschlaege)) {
    const neu = !falsche.some((f) => f.z === v.z && f.n === v.n);
    if (neu && v.z < v.n && v.z * ziel.n !== v.n * ziel.z && falsche.length < 6 - richtige.length) falsche.push(v);
  }
  const karten = auswahlKarten(mischen([
    ...richtige.map((r) => ({ inhalt: [bruch(r.z, r.n)], richtig: true })),
    ...falsche.map((f) => ({ inhalt: [bruch(f.z, f.n)], richtig: false }))
  ]), "brueche");
  return {
    schluessel: `${b.z}/${b.n}`,
    inhalt: [absatz("Wähle alle Brüche, die gleich groß sind wie ", bruch(ziel.z, ziel.n), "."), karten.element],
    pruefe() {
      const v = karten.vergleichen();
      if (v.leer) return { art: "offen", text: "Wähle mindestens einen Bruch aus." };
      if (v.zuviel) return { art: "falsch", text: "Mindestens ein ausgewählter Bruch passt nicht. Kürze die Brüche vollständig und vergleiche." };
      if (v.fehlt) return { art: "falsch", text: "Bisher stimmt alles, aber es fehlt noch mindestens ein Bruch." };
      return { art: "richtig", text: "Richtig! Du hast alle gefunden." };
    },
    loese() {
      karten.loese();
      return ["Vollständig gekürzt ergeben diese Brüche alle ", bruch(b.z, b.n), "."];
    }
  };
}, ZWEI_STUFEN);

/* Übung 6: Fehler finden. Stufe 1: Erweitern. Stufe 2: auch Kürzen. */
const FEHLER = ["plus", "nurZaehler", "nurNenner", "verschieden"];

// fehler: null (richtige Rechnung) oder ein Eintrag aus FEHLER
function rechnung(kuerzen, fehler) {
  const b = grundbruch(3, 6);
  const zeichen = fehler === "plus" ? (kuerzen ? "−" : "+") : kuerzen ? ":" : "·";
  const rechne = (a, k) => ({ "+": a + k, "−": a - k, ":": a / k, "·": a * k }[zeichen]);
  const gross = kuerzen ? 6 : 1; // durch 2 und 3 teilbar
  const z = b.z * gross, n = b.n * gross;
  const k = wahl([2, 3]);
  const kn = fehler === "verschieden" ? 5 - k : k;
  const zFrei = fehler === "nurNenner", nFrei = fehler === "nurZaehler";
  return [
    bruch(z, n), " = ",
    bruch(zFrei ? z : `${z} ${zeichen} ${k}`, nFrei ? n : `${n} ${zeichen} ${kn}`), " = ",
    bruch(zFrei ? z : rechne(z, k), nFrei ? n : rechne(n, kn))
  ];
}

uebung("fehler", (stufe) => {
  const anzahlFalsch = zufall(1, 3);
  const fehlerarten = mischen(FEHLER);
  const karten = auswahlKarten(mischen([0, 1, 2, 3].map((i) => {
    const fehler = i < anzahlFalsch ? fehlerarten[i] : null;
    return { inhalt: rechnung(stufe === 2 && Math.random() < 0.5, fehler), richtig: fehler !== null };
  })), "rechnungen");
  return {
    inhalt: [absatz("Wähle alle Rechnungen, die ", el("strong", {}, "falsch"), " sind."), karten.element],
    pruefe() {
      const v = karten.vergleichen();
      if (v.leer) return { art: "offen", text: "Wähle mindestens eine Rechnung aus." };
      if (v.zuviel) return { art: "falsch", text: "Mindestens eine ausgewählte Rechnung ist in Ordnung. Wird oben und unten mit derselben Zahl multipliziert oder dividiert?" };
      if (v.fehlt) return { art: "falsch", text: "Bisher stimmt alles, aber es fehlt noch mindestens eine falsche Rechnung." };
      return { art: "richtig", text: "Richtig! Du hast alle Fehler gefunden." };
    },
    loese() {
      karten.loese();
      return "Die markierten Rechnungen sind falsch: Dort wird addiert oder subtrahiert, nur eine Zahl verändert oder mit verschiedenen Zahlen gerechnet.";
    }
  };
}, ZWEI_STUFEN);

/* Übung 7: Alltag. Stufe 1: direkt kürzen. Stufe 2: auch mit Zwischenschritt oder Erweitern auf 100. */
// Zähler so wählen, dass man kürzen kann
function kuerzbar(nenner) {
  const n = wahl(nenner);
  let z;
  do { z = zufall(2, n - 2); } while (ggt(z, n) === 1);
  return { z, n };
}

const TEXT_DIREKT = [
  () => {
    const { z, n } = kuerzbar([20, 24, 25, 30]);
    return { z, n, text: `In einer Klasse sind ${n} Kinder. ${z} davon haben ein Haustier. Welcher Anteil der Kinder hat ein Haustier?` };
  },
  () => {
    const { z, n } = kuerzbar([10, 12, 15, 20]);
    return { z, n, text: `Beim Basketball wird ${n}-mal auf den Korb geworfen. ${z} Würfe treffen. Welcher Anteil der Würfe trifft?` };
  },
  () => {
    const z = wahl([20, 30, 40, 50, 60, 80, 90]), n = wahl([100, 120]);
    return { z, n, text: `Ein Buch hat ${n} Seiten. ${z} Seiten sind schon gelesen. Welcher Anteil des Buches ist gelesen?` };
  }
];
const TEXT_SCHRITT = [
  () => {
    const { z, n } = kuerzbar([12, 15, 16, 18, 20]);
    return { z, n, text: `In einer Schachtel liegen ${z} rote und ${n - z} blaue Kugeln. Welcher Anteil der Kugeln ist rot?`, tipp: "Überlege zuerst, wie viele Kugeln es insgesamt sind." };
  },
  () => {
    const { z, n } = kuerzbar([18, 20, 24, 30]);
    return { z, n, text: `Von ${n} Keksen werden ${n - z} gegessen. Welcher Anteil der Kekse bleibt übrig?`, tipp: "Überlege zuerst, wie viele Kekse übrig bleiben." };
  },
  () => {
    const z = wahl([10, 12, 15, 20, 24, 36, 40, 45, 48]);
    return { z, n: 60, text: `Ein Film dauert noch ${z} Minuten. Welcher Anteil einer Stunde ist das?`, tipp: "Eine Stunde hat 60 Minuten." };
  },
  () => {
    const n = wahl([10, 20, 25, 50]), z = zufall(3, n - 1);
    return { z, n, hundert: true, text: `In einem Quiz werden ${z} von ${n} Punkten erreicht. Schreibe den Anteil als Bruch mit dem Nenner 100.`, tipp: `Überlege: ${n} mal welche Zahl ergibt 100?` };
  }
];

uebung("alltag", (stufe) => {
  const vorlage = wahl(stufe === 1 ? TEXT_DIREKT : [...TEXT_DIREKT, ...TEXT_SCHRITT]);
  const { z, n, hundert, text, tipp } = vorlage();
  const t = ggt(z, n);
  const ziel = hundert ? { z: (z * 100) / n, n: 100 } : { z: z / t, n: n / t };
  const eingabe = bruchEingabe(hundert ? { n: 100 } : {});
  return {
    schluessel: vorlage,
    inhalt: [absatz(text, hundert ? "" : " Gib den Bruch vollständig gekürzt an."), eingabe.element],
    pruefe() {
      const e = eingabe.lesen();
      if (e && !hundert && e.n > ziel.n && e.z * n === e.n * z) {
        return { art: "offen", zaehlt: true, text: "Der Anteil stimmt. Kürze den Bruch noch vollständig." };
      }
      return genauPruefen(eingabe, ziel.z, ziel.n, { z, n }, tipp || "Schreibe zuerst den Anteil als Bruch. Kürze ihn dann.");
    },
    loese() {
      eingabe.setzen(ziel.z, ziel.n);
      return [bruch(z, n), " = ", bruch(ziel.z, ziel.n)];
    }
  };
}, ZWEI_STUFEN);
