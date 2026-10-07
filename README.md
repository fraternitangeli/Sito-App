# Fraternità Santa Maria degli Angeli — ConFrancesco PWA

Applicazione Web Progressiva (PWA) ufficiale per la Fraternità Santa Maria degli Angeli ([www.confrancesco.it](https://www.confrancesco.it)).

## Caratteristiche
- **Installabile**: Funziona come app nativa su Android, iOS, Windows e Mac con icona di San Francesco.
- **100% Offline**: Memorizza in cache tutte le pagine, le foto, i font e i testi grazie al Service Worker.
- **Sincronizzazione Automatica**:
  - Ogni giorno alle 04:00 UTC (o manualmente dalla scheda **Actions** di GitHub con un clic), una GitHub Action verifica se ci sono novità su `www.confrancesco.it`.
  - In caso di novità, aggiorna i contenuti e pubblica la nuova versione.
  - Netlify riceve il codice aggiornato e distribuisce la nuova versione a tutti i dispositivi installati.

## Struttura del Progetto
- `index.html`, `chi-siamo.html`, etc. : Pagine dell'applicazione
- `assets/css/style.css` : Stile grafico fedele a Google Sites
- `assets/fonts/` : Font Comic Neue per il funzionamento offline
- `assets/images/` : Immagini e foto storiche
- `icons/` : Icone PWA generate da San Francesco
- `sw.js` : Service Worker per la cache offline e aggiornamenti
- `.github/workflows/sync-site.yml` : Workflow di automazione su GitHub Actions
- `scripts/sync_site.py` : Script di rilevamento modifiche
