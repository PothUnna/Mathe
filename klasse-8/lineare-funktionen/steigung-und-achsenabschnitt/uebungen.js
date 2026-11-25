/* Seite "Steigung und y-Achsenabschnitt" */
"use strict";

const ZWEI_STUFEN = 3;           // nach 3 richtigen Lösungen Stufe 2
const DREI_STUFEN = [3, 6];
const VIER_STUFEN = [3, 6, 9];

const absatz = (...inhalt) => el("p", {}, ...inhalt);
const fett = (t) => el("strong", {}, t);

/* ---------- Ausprobieren mit Reglern ---------- */
(function ausprobieren() {
  const ort = document.getElementById("ausprobieren");
  const k = koordinatensystem(6, "Graph zu den eingestellten Werten von m und b");
  const regler = (name, min, max, schritt, wert) => el("input",
    { type: "range", min, max, step: schritt, value: wert, "aria-label": name });
  const rm = regler("Steigung m", -3, 3, 0.5, 1), rb = regler("y-Achsenabschnitt b", -5, 5, 1, 1);
  const om = el("output"), ob = el("output");
  const term = el("p", { class: "term-gross" });
  function zeigen() {
    const m = rat(Math.round(Number(rm.value) * 2), 2), b = rat(Number(rb.value));
    om.replaceChildren(ratBild(m));
    ob.replaceChildren(ratBild(b));
    term.replaceChildren(termBild(m, b));
    k.leeren();
    k.dreieck(0, b.z, m.n, m.z, m.z !== 0);
    k.gerade(ratWert(m), b.z, "g1");
    k.punkt(0, b.z);
  }
  rm.addEventListener("input", zeigen);
  rb.addEventListener("input", zeigen);
  ort.append(el("div", { class: "regler" }, "m", rm, om, "b", rb, ob), term, k.bild);
  zeigen();
})();

/* ---------- Zufällige Funktionen ---------- */
const vorzeichen = () => wahl([-1, 1]);
const ganzeSteigung = () => rat(zufall(1, 3) * vorzeichen());
function bruchSteigung() {
  let z, n;
  do { n = zufall(2, 4); z = zufall(1, 5); } while (ggt(z, n) !== 1);
  return rat(z * vorzeichen(), n);
}
// b so, dass das Steigungsdreieck ab der y-Achse in den Ausschnitt passt
function passendesB(m, ohneNull = false) {
  let b;
  do { b = zufall(-4, 4); } while (Math.abs(b + m.z) > 6 || (ohneNull && b === 0));
  return rat(b);
}
const kennung = (m, b) => `${ratText(m)};${ratText(b)}`;

function graph(m, b, klasse = "g1") {
  const k = koordinatensystem(6, "Graph einer linearen Funktion");
  k.gerade(ratWert(m), ratWert(b), klasse);
  return k;
}
// Dreieck ab der y-Achse
const dreieckAb = (k, m, b) => k.dreieck(0, b.z, m.n, m.z);

// Prüft eine Steigung und erkennt typische Fehler
function steigungPruefen(e, m) {
  if (!e) return { art: "offen", text: "Trage für m eine Zahl ein." };
  if (ratGleich(e, m)) return { art: "richtig", text: "Richtig!" };
  if (ratGleich(e, ratMinus(m))) {
    return { art: "falsch", text: m.z > 0 ? "Prüfe das Vorzeichen: Die Gerade steigt von links nach rechts." : "Prüfe das Vorzeichen: Die Gerade fällt von links nach rechts." };
  }
  if (m.z && Math.abs(e.z) * Math.abs(m.z) === e.n * m.n) {
    return { art: "falsch", text: "Du hast vermutlich Zähler und Nenner vertauscht: Schritte nach oben oder unten geteilt durch Schritte nach rechts." };
  }
  return { art: "falsch", text: "Zeichne in Gedanken ein Steigungsdreieck: Wie viele Schritte nach rechts, wie viele nach oben oder unten?" };
}

/* Übung 1: m und b bestimmen. Stufe 1: mit Steigungsdreieck, m ganzzahlig.
   Stufe 2: ohne Dreieck, m ganzzahlig. Stufe 3: ohne Dreieck, m als Bruch. */
uebung("bestimmen", (stufe) => {
  const m = stufe === 3 ? bruchSteigung() : ganzeSteigung();
  const b = passendesB(m);
  const k = graph(m, b);
  if (stufe === 1) {
    // Manchmal ist das Dreieck größer als nötig.
    const faktor = Math.abs(b.z + 2 * m.z) <= 6 ? wahl([1, 2]) : 1;
    k.dreieck(0, b.z, faktor, faktor * m.z, false);
  }
  const em = ratEingabe("m", stufe === 3), eb = ratEingabe("b");
  const nullstelle = b.z ? rat(-b.z * m.n, m.z) : null;
  return {
    schluessel: kennung(m, b),
    inhalt: [
      absatz("Bestimme den y-Achsenabschnitt b und die Steigung m.", stufe === 3 ? " Gib m als Bruch an." : ""),
      k.bild,
      el("div", { class: "werte" }, el("span", {}, "b =", eb.element), el("span", {}, "m =", em.element))
    ],
    pruefe() {
      const wb = eb.lesen(), wm = em.lesen();
      if (!wb || !wm) return { art: "offen", text: "Trage für b und für m Zahlen ein." };
      const bStimmt = ratGleich(wb, b), mStimmt = ratGleich(wm, m);
      if (bStimmt && mStimmt) return { art: "richtig", text: ["Richtig! ", termBild(m, b)] };
      if (ratGleich(wb, m) && ratGleich(wm, b)) return { art: "falsch", text: "Du hast m und b vertauscht." };
      if (bStimmt) return { art: "falsch", text: "b stimmt. " + steigungPruefen(wm, m).text };
      const anfang = mStimmt ? "m stimmt. " : "Beide Werte stimmen noch nicht. Beginne mit b: ";
      if (b.z && ratGleich(wb, ratMinus(b))) return { art: "falsch", text: anfang + "Prüfe das Vorzeichen von b." };
      if (nullstelle && ratGleich(wb, nullstelle)) return { art: "falsch", text: anfang + "Du hast den Schnittpunkt mit der x-Achse abgelesen. Für b brauchst du die y-Achse." };
      return { art: "falsch", text: anfang + "Schau, wo die Gerade die y-Achse (senkrechte Achse) schneidet." };
    },
    loese() {
      eb.setzen(b);
      em.setzen(m);
      k.punkt(0, b.z);
      if (stufe > 1) dreieckAb(k, m, b);
      return ["b = ", ratBild(b), " und m = ", ratBild(m), `: ${m.n} nach rechts, ${Math.abs(m.z)} nach ${m.z > 0 ? "oben" : "unten"}.`];
    }
  };
}, DREI_STUFEN);

/* Übung 2: Zeichnen. Stufe 1: Punkt auf der y-Achse ist gegeben. Stufe 2: ganze Steigung.
   Stufe 3: Bruch als Steigung. Stufe 4: besondere Formen. */
uebung("zeichnen", (stufe) => {
  let m, b, umgestellt = false;
  if (stufe <= 2) { m = ganzeSteigung(); b = passendesB(m, true); }
  else if (stufe === 3) { m = bruchSteigung(); b = passendesB(m, true); }
  else {
    const art = zufall(1, 3);
    m = art === 1 ? rat(0) : wahl([ganzeSteigung, bruchSteigung])();
    b = art === 2 ? rat(0) : passendesB(m, true);
    umgestellt = art === 3;
  }
  const flaeche = zeichenFlaeche({ fest: stufe === 1 ? [0, b.z] : null });
  return {
    schluessel: kennung(m, b),
    inhalt: [
      absatz("Zeichne den Graphen zu ", termBild(m, b, umgestellt), ". ", stufe === 1
        ? "Der Punkt auf der y-Achse ist schon markiert. Tippe einen zweiten Punkt an."
        : "Tippe zwei Punkte an. Du kannst sie danach noch verschieben."),
      flaeche.bild
    ],
    pruefe() {
      const p = flaeche.punkte();
      if (p.length < 2) return { art: "offen", text: stufe === 1 ? "Tippe noch einen zweiten Punkt an." : "Tippe zwei Punkte an, dann entsteht die Gerade." };
      const [[x1, y1], [x2, y2]] = p;
      if (x1 === x2) return { art: "falsch", text: "Eine senkrechte Gerade ist kein Graph einer linearen Funktion. Gehe vom ersten Punkt auch nach rechts." };
      const mm = rat(y2 - y1, x2 - x1);
      const bb = rat(y1 * mm.n - mm.z * x1, mm.n);
      const bStimmt = ratGleich(bb, b);
      if (ratGleich(mm, m) && bStimmt) return { art: "richtig", text: "Richtig!" };
      if (ratGleich(mm, m)) return { art: "falsch", text: `Die Steigung stimmt. Die Gerade muss die y-Achse aber bei ${ratText(b)} schneiden.` };
      const anfang = bStimmt ? "Der y-Achsenabschnitt stimmt. " : "";
      if (m.z === 0) return { art: "falsch", text: anfang + "Hier kommt kein x vor, also ist m = 0. Die Gerade steigt und fällt nicht." };
      if (ratGleich(mm, ratMinus(m))) return { art: "falsch", text: anfang + (m.z > 0 ? "m ist positiv, die Gerade muss steigen." : "m ist negativ, die Gerade muss fallen.") };
      if (mm.z && Math.abs(mm.z * m.z) === mm.n * m.n) return { art: "falsch", text: anfang + "Du hast bei der Steigung die Richtungen vertauscht. Der Nenner geht nach rechts, der Zähler nach oben oder unten." };
      if (bStimmt) return { art: "falsch", text: anfang + (m.n === 1 ? "Gehe von dort 1 nach rechts. Wie weit musst du dann nach oben oder unten?" : `Gehe von dort ${m.n} nach rechts. Wie weit musst du dann nach oben oder unten?`) };
      return { art: "falsch", text: "Beginne mit dem y-Achsenabschnitt b auf der y-Achse. Zeichne von dort ein Steigungsdreieck." };
    },
    loese() {
      flaeche.setzen([[0, b.z], m.z === 0 ? [3, b.z] : [m.n, b.z + m.z]]);
      if (m.z) flaeche.dreieck(0, b.z, m.n, m.z);
      return m.z === 0 ? [`Die Gerade verläuft parallel zur x-Achse durch (0 | ${ratText(b)}).`]
        : [`Beginne bei (0 | ${ratText(b)}). Gehe ${m.n} nach rechts und ${Math.abs(m.z)} nach ${m.z > 0 ? "oben" : "unten"}.`];
    }
  };
}, VIER_STUFEN);

/* Übung 3: Term ablesen. Stufe 1: ganze positive Steigung. Stufe 2: auch negative.
   Stufe 3: Steigungen, die sich als Dezimalzahl schreiben lassen. */
function dezimalSteigung() {
  let z, n;
  do { n = wahl([2, 2, 4, 5]); z = zufall(1, 5); } while (ggt(z, n) !== 1);
  return rat(z * vorzeichen(), n);
}

uebung("ablesen", (stufe) => {
  const m = stufe === 1 ? rat(zufall(1, 3)) : stufe === 2 ? ganzeSteigung() : dezimalSteigung();
  const b = passendesB(m);
  const k = graph(m, b);
  const eingabe = termEingabe();
  return {
    schluessel: kennung(m, b),
    inhalt: [absatz("Lies den Term der linearen Funktion ab.", stufe === 3 ? " Schreibe die Steigung als Dezimalzahl." : ""), k.bild, eingabe.element],
    pruefe() {
      if (eingabe.leer()) return { art: "offen", text: "Trage einen Term ein, zum Beispiel 4x − 7." };
      const e = eingabe.lesen();
      if (!e) return { art: "offen", text: "Diesen Term verstehe ich nicht. Schreibe ihn so wie 4x − 7 oder 1,5x + 2." };
      const mStimmt = ratGleich(e.m, m), bStimmt = ratGleich(e.b, b);
      if (mStimmt && bStimmt) return { art: "richtig", text: ["Richtig! f(x) = ", termText(m, b)] };
      if (ratGleich(e.m, b) && ratGleich(e.b, m)) return { art: "falsch", text: "Du hast m und b vertauscht. Die Steigung steht vor dem x." };
      if (mStimmt) return { art: "falsch", text: "Die Steigung stimmt. Prüfe, wo die Gerade die y-Achse schneidet." };
      if (e.m.z === 0) return { art: "falsch", text: "In deinem Term fehlt das x. Die Steigung steht vor dem x." };
      const anfang = bStimmt ? "Der y-Achsenabschnitt stimmt. " : "Beide Zahlen stimmen noch nicht. Beginne mit dem Schnittpunkt mit der y-Achse. Zur Steigung: ";
      return { art: "falsch", text: anfang + steigungPruefen(e.m, m).text };
    },
    loese() {
      eingabe.setzen(m, b);
      k.punkt(0, b.z);
      dreieckAb(k, m, b);
      return ["b = ", ratBild(b), " und m = ", ratBild(m), ...(m.n > 1 ? [` = ${dezimalText(m)}`] : []), `, also f(x) = ${termText(m, b)}`];
    }
  };
}, DREI_STUFEN);

/* Übung 4: Zuordnen. Stufe 1: entweder m oder b ist bei allen gleich. Stufe 2: gemischt. */
uebung("zuordnen", (stufe) => {
  const namen = ["A", "B", "C"];
  let funktionen;
  if (stufe === 1) {
    if (Math.random() < 0.5) {
      const m = wahl([rat(1), rat(-1), rat(1, 2), rat(-1, 2), rat(2)]);
      funktionen = mischen([-3, -1, 1, 3]).slice(0, 3).map((b) => ({ m, b: rat(b) }));
    } else {
      const b = rat(zufall(-2, 2));
      funktionen = mischen([rat(2), rat(1, 2), rat(-1), rat(-3), rat(1)]).slice(0, 3).map((m) => ({ m, b }));
    }
  } else {
    // Verwechslungsgefahr: Vorzeichen von m oder b, vertauschte Zahlen
    const z = zufall(1, 3), b = wahl([1, 2, 3].filter((x) => x !== z));
    funktionen = mischen([[z, b], [-z, b], [z, -b], [b, z], [-z, -b]]).slice(0, 3).map(([m, c]) => ({ m: rat(m), b: rat(c) }));
  }
  const k = koordinatensystem(6, "Drei Geraden A, B und C");
  funktionen.forEach((f, i) => k.gerade(ratWert(f.m), f.b.z, `g${i + 1}`, namen[i]));
  const reihenfolge = mischen([0, 1, 2]);
  const felder = reihenfolge.map(() => wahlKnoepfe(namen.map((t) => ({ wert: t, text: t }))));
  return {
    schluessel: funktionen.map((f) => kennung(f.m, f.b)).join(),
    inhalt: [absatz("Welche Gerade gehört zu welchem Term?"), k.bild,
      el("div", { class: "zeilen" }, ...reihenfolge.map((i, zeile) =>
        el("div", { class: "vergleichszeile" }, termBild(funktionen[i].m, funktionen[i].b), felder[zeile].element)))],
    pruefe() {
      if (felder.some((f) => f.wert() === null)) return { art: "offen", text: "Wähle in jeder Zeile einen Buchstaben." };
      const falsch = reihenfolge.find((i, zeile) => felder[zeile].wert() !== namen[i]);
      if (falsch === undefined) return { art: "richtig", text: "Richtig!" };
      const f = funktionen[falsch];
      return { art: "falsch", text: ["Prüfe ", termBild(f.m, f.b), `: Wo schneidet die Gerade die y-Achse? Muss sie steigen oder fallen?`] };
    },
    loese() {
      felder.forEach((feld, zeile) => feld.setzen(namen[reihenfolge[zeile]]));
      return funktionen.flatMap((f, i) => [`${i ? ", " : ""}${namen[i]}: `, termBild(f.m, f.b)]);
    }
  };
}, ZWEI_STUFEN);

/* Übung 5: Aussagen. Stufe 1: am Graphen. Stufe 2: am Term. */
uebung("aussagen", (stufe) => {
  const m = wahl([ganzeSteigung, bruchSteigung])();
  const b = passendesB(m, true);
  const umgestellt = Math.random() < 0.5;
  const k = graph(m, b);
  const steigt = m.z > 0;
  const anderesM = m.n === 1 ? (Math.abs(m.z) === 1 ? rat(3 * m.z) : rat(Math.sign(m.z), Math.abs(m.z))) : rat(Math.sign(m.z) * m.n, Math.abs(m.z));
  const aussagen = [
    wahl([true, false]) ? ["Die Gerade steigt.", steigt] : ["Die Gerade fällt.", !steigt],
    wahl([[`Die Gerade schneidet die y-Achse bei ${ratText(b)}.`, true], [`Die Gerade schneidet die y-Achse bei ${ratText(ratMinus(b))}.`, false]]),
    wahl([["Die Steigung ist ", m, true], ["Die Steigung ist ", ratMinus(m), false], ["Die Steigung ist ", anderesM, false]]),
    wahl([[`Geht man ${m.n} nach rechts, geht es ${Math.abs(m.z)} nach ${steigt ? "oben" : "unten"}.`, true],
      [`Geht man ${m.n} nach rechts, geht es ${Math.abs(m.z)} nach ${steigt ? "unten" : "oben"}.`, false]]),
    wahl([[`Der Punkt (${m.n} | ${ratText(rat(b.z + m.z))}) liegt auf der Geraden.`, true],
      [`Der Punkt (${m.n} | ${ratText(rat(b.z - m.z))}) liegt auf der Geraden.`, false]])
  ].map((a) => (a.length === 3 ? { inhalt: [a[0], ratBild(a[1]), "."], richtig: a[2] } : { inhalt: [a[0]], richtig: a[1] }));
  // Mindestens eine Aussage muss stimmen.
  if (!aussagen.some((a) => a.richtig)) aussagen[1] = { inhalt: [`Die Gerade schneidet die y-Achse bei ${ratText(b)}.`], richtig: true };
  const karten = auswahlKarten(mischen(aussagen), "aussagen");
  return {
    schluessel: kennung(m, b),
    inhalt: [absatz("Wähle alle ", fett("richtigen"), " Aussagen."),
      stufe === 1 ? k.bild : el("p", { class: "term-gross" }, termBild(m, b, umgestellt)), karten.element],
    pruefe() {
      const v = karten.vergleichen();
      if (v.leer) return { art: "offen", text: "Wähle mindestens eine Aussage aus." };
      if (v.zuviel) return { art: "falsch", text: "Mindestens eine ausgewählte Aussage ist falsch. Bestimme zuerst m und b und achte auf die Vorzeichen." };
      if (v.fehlt) return { art: "falsch", text: "Bisher stimmt alles, aber es fehlt noch mindestens eine Aussage." };
      return { art: "richtig", text: "Richtig!" };
    },
    loese() {
      karten.loese();
      return [termBild(m, b), ": m = ", ratBild(m), " und b = ", ratBild(b)];
    }
  };
}, ZWEI_STUFEN);
