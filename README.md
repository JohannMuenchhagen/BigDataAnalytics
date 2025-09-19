# AR APP

Dieses Projekt ist eine AR Anwendung (Augmented Reality) im Rahmen des Kurses Big Data Analytics an der HTW Berlin.
Diese Anwendung basiert auf Node.js und AR.js.

## Voraussetzungen

* [Node.js](https://nodejs.org/en/download/)
* npm
* Ein moderner Browser mit WebXR/AR-Unterstützung (z.B. Chrome oder Firefox)

## Installation
1. Repository klonen oder herunterladen:
```bash
git clone https://github.com/JohannMuenchhagen/BigDataAnalytics.git
```
2. Abhängigkeiten installieren
```bash
npm install
```

## Nutzung
1. Anwendung starten
```bash
npm start
```
2. Die App stellt automatisch ein HTTPS-Zertifikat bereit. Öffne im Browser die angegebene URL (z.B. https://localhost:3000). **Achtung** Die Verbindung wird als unsicher eingestuft, da das Zertifikat von einer selbstsignierten Zertifizierungsstellenstamm ist.
3. Kamera freigeben und den **Marker HIRO** vor die Kamera halten, um das AR Objekt anzuzeigen. (*Hinweis: Der Marker kann sich noch ändern, da sich das Projekt noch in der Entwicklung befindet*)

## Marker
Aktuell wird der **HIRO Marker** als Standard verwendet.
Der Marker kann [hier heruntergeladen werden](https://jeromeetienne.github.io/AR.js/data/images/HIRO.jpg)

## Entwicklung
* Das Projekt befindet sich in der aktiven Entwicklung.
* Marker, Inhalte und Funktionen können sich jederzeit ändern.
