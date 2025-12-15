# SPEC TECNICA – Roulotte Pro

## Obiettivo
App web + mobile (PWA) per catalogare, valutare, descrivere e pubblicare roulotte, con automazioni AI su foto, testi, prezzo e suggerimenti lavori. Ottimizzata per inserimento rapido operatore e presentazione elegante al cliente.

## Target
- Operatori (rivenditori/rigeneratori)
- Meccanici/restauratori (multi-utente interno)
- Clienti finali (vetrina pubblica condivisibile)

## Funzioni Core
- Inserimento rapido con upload foto multiplo e form guidato
- AI Vision: categorizzazione, tag, bounding boxes, anteprime annotate
- Generatore annuncio AI con varianti base/professionale/emozionale
- Stima prezzo AI con motivazioni sintetiche
- Check-list tecnica, stato lavori, galleria prima/dopo
- Generazione PDF scheda tecnica elegante + QR verso vetrina
- Vetrina pubblica mobile-first e shareable
- Multi-utente, storico interventi, dashboard metriche

## Architettura
- Frontend: React PWA (Tailwind + shadcn)
- Backend: Node.js/Express (alternativa FastAPI)
- DB: Firestore/MongoDB (NoSQL) o PostgreSQL (relazionale) a scelta
- Storage immagini: S3/Cloud Storage con signed URLs
- AI: OpenAI (text+vision) con fallback Google Vision/AWS Rekognition
- Hosting: Vercel/Netlify (FE), GCP/AWS (BE), funzioni serverless per automazioni

## Dati – Modello Roulotte
- Schema JSON conforme a `docs/json-schemas/roulotte.schema.json`
- Campi principali: identificativi, stato, componenti/impianti, finestre, accessori, difetti, lavori, foto con `ai_tags` e `bboxes`, prezzi e visibilità

## AI Vision – Pipeline
1. Upload: invio asincrono allo storage + generazione miniature
2. Analisi: chiamata modello vision, output `categoria`, `tags`, `bboxes`, `raw`
3. Persistenza: salvataggio `ai_tags`, `ai_raw` e immagini annotate per PDF
4. Automazioni:
   - Tag "infiltrazione" ⇒ flag e suggerimento test umidità
   - Tag "sanitrit" ⇒ flag `sanitrit: true`
5. Conferma operatore: pre-spunte nel form con possibilità di modifica

## Generatore Testo – Varianti
- Input: scheda completa + foto tags + stato lavori + prezzo consigliato
- Output: 3 varianti (base/professionale/emozionale), lingua IT/EN parametrizzata
- Editing operatore + versioning per storicizzazione e revert

## Stima Prezzo – Logica
- Input: marca/modello/anno, stato generale, componenti/lavori, storici
- Output: range min/max, prezzo consigliato, prezzo ritiro, motivi sintetici

## Flusso Utente
1. Login
2. Dashboard → “+ Aggiungi Roulotte”
3. Upload foto + compilazione rapida con suggerimenti AI
4. Revisione campi
5. Genera descrizione e prezzo
6. Genera PDF / pubblica vetrina / condividi link
7. Stato “in lavorazione” → aggiungi lavori e costi
8. Pubblica / esporta

## UI/UX Chiave
- Card grandi, bottone “Carica foto” su ogni card
- Ricerca + filtri rapidi (stato, bagno, sanitrit, documenti, anno)
- Tag colorati (verde/giallo/rosso), sezioni espandibili
- Modal per generazione annuncio e preview PDF

## PDF / Vetrina
- PDF responsive: foto grande, caratteristiche, difetti, lavori, prezzo, QR
- Vetrina pubblica: pagina mobile-first, senza login, shareable

## Sicurezza & Permessi
- JWT con ruoli `admin`, `operator`, `viewer`
- Limiti upload per utente
- Accesso immagini protetto (signed URLs)
- Log operazioni sensibili (prezzo, pubblicazione)

## API Endpoints
- Specifica completa in `docs/openapi.yaml`
- Principali: auth, CRUD roulotte, upload foto, AI vision, generate-description, estimate-price, pdf generate, share link

## MVP – 4 Sprint
- Sprint 1 (MVP): inserimento roulotte, upload foto, scheda, descrizione base, vetrina, PDF base
- Sprint 2: AI vision tag, stima prezzo, check-list lavori, dashboard
- Sprint 3: descrizioni avanzate, automazioni lavori, storicizzazione, ruoli
- Sprint 4: premium (video annuncio, marketplace, integrazione portali)

## Note Tecniche
- Endpoint vision con fallback: Google Vision/AWS se tag specifici mancano
- Salvare `ai_raw` + `normalized tags` per UI
- Parametri generativa: `tone` [base|professionale|emozionale], `language` [IT|EN]
- Ottimizzare costi AI (batch upload massivo)

## Allegati (da preparare)
- Palette colori, icone SVG
- Foto esempi reali
- Liste marche/modelli comuni
- Esempi descrizioni (3 varianti)

## Testing & Monitoraggio
- Dataset reale 50 roulotte per taratura AI
- Test UX con 3 operatori (time-on-task: inserire una scheda completa)
- Monitoraggio errori vision e log AI per 30 giorni post-lancio

## Collegamenti
- OpenAPI: `docs/openapi.yaml`
- JSON Schema: `docs/json-schemas/roulotte.schema.json`
