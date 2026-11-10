# Londra, novembre 2026

Diario fotografico del viaggio del **5–9 novembre 2026**, da Londra a Cambridge: 65 immagini selezionate da 232, cinque giornate, sequenza notturna, provini filtrabili e galleria a schermo intero.

## In locale

Richiede Node.js 20 o successivo. Nessuna dipendenza npm da installare.

```sh
npm start
```

Apri <http://localhost:4173/holidays_londra-2026/>. Le modifiche a `src/` ricostruiscono la pagina e aggiornano l’anteprima.

```sh
npm test
npm run build
npm run preview
```

L’output statico è `dist/`. Dopo la build puoi anche aprire **`dist/index.html` direttamente nel browser**, senza server: diario, provini e galleria funzionano offline. HTML, CSS e JavaScript nativi: il contenuto fotografico è già presente nell’HTML e gli ingrandimenti hanno un collegamento diretto anche senza JavaScript. Nessun font, mappa, analytics o servizio esterno viene caricato.

## GitHub Pages

URL di destinazione: <https://danielepassabi.github.io/holidays_londra-2026/>.

In **Settings → Pages → Build and deployment**, seleziona **GitHub Actions**. Il workflow `.github/workflows/deploy.yml` esegue test e build, quindi pubblica `dist/` a ogni push su `main`; è disponibile anche l’avvio manuale. I percorsi degli asset sono relativi e compatibili con il sottopercorso della repository.

La preparazione locale non pubblica automaticamente nulla: servono commit, push e l’abilitazione di Pages. Il file `integration/2026-11_Londra.mdx` è pronto da copiare in `MindMash-private/docs/tracking/Holidays/` dopo la pubblicazione; la sidebar di MindMash è autogenerata, come per Marocco e Toscana.

## Contenuti

- `src/journey.mjs`: giornate, sequenze fotografiche e brevi testi.
- `content/selection.json`: selezione delle foto, luogo e testo alternativo. Gli identificativi corrispondono a `IMG_XXXX` negli originali.
- `public/photos.json`: metadati pubblici e dimensioni responsive, generati dallo script di export.
- `public/photos/`: solo le immagini selezionate, in WebP a 480, 960 e 1920 pixel sul lato lungo.
- `src/styles.css`: impaginazione e adattamenti per telefono.
- `src/app.js`: navigazione, provini e galleria.

### Fotografie e metadati

Gli originali rimangono in `.temp/`, esclusa da Git e dalla build, insieme a tutti i `.MOV`. Le Live Photo vengono usate solo nella loro componente statica. Nessun video è stato convertito, caricato o incorporato.

Sono stati selezionati scatti diversi per momento e soggetto, scartando raffiche, duplicati, schermate del telefono e molte varianti simili. Le immagini di gruppo conservano l’inquadratura intera nel diario; gli ingrandimenti mostrano sempre l’immagine intera.

L’export converte il profilo colore in sRGB, rispetta l’orientamento e rimuove EXIF/GPS dai file distribuiti. Il diario conserva soltanto data, ora, modello di fotocamera, focale e dimensioni. Gli orari EXIF con offset vengono riportati in GMT, corrispondente all’ora di Londra in queste date; l’eventuale ripiego sul nome del file è indicato come “export” nella galleria. I luoghi sono stati ricostruiti dalle immagini e dai metadati, senza pubblicare coordinate precise.

Per rifare la selezione, con Python, Pillow e pillow-heif disponibili:

```sh
python -m pip install -r scripts/requirements-images.txt
python scripts/catalog_photos.py
# Modificare content/selection.json e src/journey.mjs
python scripts/export_photos.py
npm test
npm run build
```

I provini di lavoro e il catalogo completo, con GPS, sono salvati in `.cache/`, anch’essa esclusa da Git e dalla pubblicazione. Gli strumenti Python non servono per la build di GitHub Pages.

### Video YouTube, in seguito

In `src/journey.mjs`, aggiungi a `videos` un elemento per ciascun video selezionato:

```js
{ day: '06', id: 'abcdefghijk', title: 'Una sera sul Tamigi' }
```

Sostituisci l’ID di esempio con gli 11 caratteri dell’URL YouTube. Il video compare alla fine della giornata scelta. Il player `youtube-nocookie.com` viene caricato solo quando il visitatore preme “Guarda”. Con l’elenco vuoto non compaiono segnaposto.

## Verifiche

I test controllano corrispondenza tra selezione e giornate, unicità, date, esistenza di tutte le risoluzioni, assenza di GPS e video originali nell’output, collegamenti relativi e configurazione degli eventuali video. L’interfaccia è verificata anche nel browser su desktop e telefono.
