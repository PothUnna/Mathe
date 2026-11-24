/* Seitenverzeichnis: Aus dieser Liste entstehen alle Kacheln und die Pfadanzeige.
 *
 * Neue Seite hinzufügen:
 *   1. Ordner mit einer index.html anlegen (am einfachsten eine vorhandene kopieren).
 *   2. In der neuen index.html den Titel, data-pfad und die Anzahl der "../" anpassen.
 *   3. Hier einen Eintrag ergänzen. "ordner" ist genau der Ordnername.
 *
 * fusszeile: true  = Link in der Fußzeile statt Kachel (nur auf oberster Ebene)
 */
const STRUKTUR = {
  titel: "Startseite",
  kinder: [
    {
      ordner: "klasse-6",
      titel: "Klasse 6",
      text: "Brüche verstehen und anwenden",
      kinder: [
        {
          ordner: "brueche",
          titel: "Brüche",
          text: "Anteile erkennen und darstellen",
          kinder: [
            {
              ordner: "anteile-als-brueche",
              titel: "Anteile als Brüche darstellen",
              text: "Erklärung, Beispiele und Übungen"
            },
            {
              ordner: "erweitern-und-kuerzen",
              titel: "Brüche erweitern und kürzen",
              text: "Erklärung, Beispiele und Übungen"
            },
            {
              ordner: "brueche-vergleichen",
              titel: "Brüche vergleichen",
              text: "Erklärung, Beispiele und Übungen"
            }
          ]
        }
      ]
    },
    { ordner: "impressum", titel: "Impressum", fusszeile: true },
    { ordner: "datenschutz", titel: "Datenschutz", fusszeile: true }
  ]
};
