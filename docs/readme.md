# Roulotte Pro – README Tecnico

## Panoramica
- Piattaforma PWA per gestione e pubblicazione roulotte con automazioni AI.
- Documentazione principale: `docs/roulotte-pro-spec.md`
- API: `docs/openapi.yaml`, modello dati: `docs/json-schemas/roulotte.schema.json`

## Stack Consigliato
- Frontend: React PWA (Tailwind + shadcn)
- Backend: Node.js/Express (opzione FastAPI)
- DB: Firestore/MongoDB o PostgreSQL
- Storage: S3/Cloud Storage con signed URLs
- AI: OpenAI (text+vision) con fallback Google Vision/AWS Rekognition

## Sicurezza
- Autenticazione JWT con ruoli `admin`, `operator`, `viewer`
- Signed URLs per immagini
- Log operazioni sensibili (prezzi, pubblicazioni)

## Flussi Chiave
- Inserimento rapido → AI Vision tagging → revisione → generatore testi → stima prezzo → PDF → vetrina
- Stato “in lavorazione” con lavori e costi, storico modifiche

## MVP – Roadmap
- Sprint 1: CRUD roulotte, upload foto, scheda, descrizione base, vetrina, PDF base
- Sprint 2: Vision tagging, stima prezzo, checklist lavori, dashboard
- Sprint 3: descrizioni avanzate, automazioni, versioning testi, ruoli
- Sprint 4: premium (video, marketplace, integrazioni portali)

## Implementazione API
- Endpoint definiti in `docs/openapi.yaml`
- Schemi riusabili (Roulotte, Foto, Lavoro, etc.)

## AI Vision – Fallback
- Se il modello principale non assegna tag specifici (es. "sanitrit"), attivare fallback su Google Vision/AWS
- Salvare sia `ai_raw` sia `ai_tags` normalizzati per UI e debug

## Costi & Performance
- Batch processing per upload massivi
- Thumbnail e ottimizzazione immagini web
- Limiti per utente e code di elaborazione (serverless/job queue)

## PDF & Vetrina
- Template PDF responsive con immagini annotate
- Vetrina pubblica mobile-first, accessibile via link (no login)

## Testing
- Dataset di 50 roulotte reali per tarare AI
- Test UX con 3 operatori (misura time-on-task)
- Monitoraggio vision e log AI per 30 giorni post-lancio

## Prossimi Passi
- Scelta DB (NoSQL vs SQL) e definizione indici/relazioni
- Setup repository FE/BE con pipeline CI e ambienti
- Implementazione auth JWT e storage immagini con signed URLs
