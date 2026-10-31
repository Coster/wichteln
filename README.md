# Wichtel-Los

Wichteln mit Familie und Freunden – ohne Anmeldung, ohne Server, ohne Datenbank.

1. `index.html` öffnen, Runde benennen (Datum, Budget, Hinweis optional).
2. Teilnehmer eintragen, optional mit Wunsch. Der Wunsch erscheint bei der
   Person, die sie zieht.
3. Optional Ausschlüsse (z. B. Paare ziehen sich nicht gegenseitig).
4. **Auslosen** – danach für jede Person **WhatsApp**, **Teilen …** (Signal,
   Threema, SMS, …) oder **Kopieren**.
5. Jede Person öffnet ihren Link, tippt „Ich bin … – Los aufdecken“ und sieht,
   wen sie beschenkt.

## Wie das ohne Server geht

- Die Auslosung passiert nur im Browser des Organisators.
- Das Los steckt im Link hinter dem `#`. Dieser Teil wird vom Browser **nie an
  den Webserver geschickt** – der Server liefert nur die immer gleiche Seite aus.
  Die Link-Vorschau in WhatsApp zeigt deshalb auch nur „Wichtel-Los 🎁“.
- Das Los ist im Link **verschleiert, nicht verschlüsselt**: Man kann den Namen
  nicht einfach ablesen, aber wer einen Link öffnet, sieht dessen Los. Der
  Organisator kann mitwichteln, solange er die Links der anderen nicht selbst öffnet.
- Der Organisator behält die Runde im `localStorage` seines Browsers, um
  verlorene Links erneut zu schicken. Kein Cookie, kein Tracking, keine externen
  Schriften oder Skripte.
- Neu auslosen erzeugt neue Links; alte bleiben gültig. Jedes Los zeigt deshalb
  den Zeitpunkt der Auslosung – allen Bescheid geben, dass nur die neuen zählen.

## Ablegen

Es sind nur zwei statische Dateien (`index.html`, `wichteln.js`). Sie können
auf jedem Webspace liegen, z. B. GitHub Pages, Netlify oder einem eigenen
Server. Als lokale Datei (`file://`) funktionieren die Links auf anderen Handys
nicht.

## Entwicklung

```sh
npm test            # Auslosung und Link-Kodierung (node --test)
```
