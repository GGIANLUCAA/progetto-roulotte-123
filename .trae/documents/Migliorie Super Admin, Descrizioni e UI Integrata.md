## Generatore Descrizioni Avanzato
- Arricchire i template (base/professionale/emozionale) includendo: dimensioni, posti letto, accessori, componenti, difetti, lavori e stato documenti
- Aggiungere multi‑lingua (IT/EN) e parametri di tono, con auto‑selezione in base al contesto (es. “pubblicata” → professionale)
- Salvare automaticamente ogni descrizione generata nello storico e permettere “revert” della versione

## Auto‑salvataggi e Bozze
- Estendere l’autosalvataggio (debounce) a tutti i form (nuova/dettagliata) e ripristino bozza da LocalStorage
- Aggiungere autosalvataggio lato server per l’editor JSON (cronologia diff e rollback)

## UI Operatore (Ordine e Intuitività)
- Aggiungere sezione “Storico descrizioni” per ogni scheda con selezione versione e confronto
- Consentire rimozione singola di foto e lavori direttamente dalle card (con conferma e feedback)
- Migliorare galleria: toggle overlay difetti, legenda tag AI, navigazione multi‑foto

## UI Amministratore / Super Admin
- Gestione filtri salvati: creare/applicare/rimuovere (stato/anno/tag) e esportare/importare set di filtri
- Azioni bulk estese: auto‑descrizione massiva, publish/unpublish/delete con riepilogo
- Editor JSON con autosalvataggio e cronologia versioni (diff e revert)

## Vetrina e PDF
- Vetrina: visualizzare dettagli (dimensioni, posti letto, documenti, accessori) con layout responsive e tema coerente
- PDF: multi‑foto, legenda difetti, QR verso vetrina, sezioni ordinabili e stile professionale

## AI Vision e Normalizzazione
- Integrare Google Vision reale come fallback ad OpenAI; salvare ai_raw e normalizzare i tag in un vocabolario controllato
- Regole automatiche: tag→campi (es. sanitrit, infiltrazioni), suggerimenti lavori (es. “test umidità”)

## Storage, Dati e API
- Migrare lo storage immagini a S3 con signed URLs, generazione thumbnail e code di elaborazione
- Passare da JSON a DB (MongoDB/PostgreSQL) con schema per filtri/descrizioni/lavori e indici per ricerca
- Ampliare le API: listare descrizioni per scheda, revert, delete foto/lavori (già in parte), export filtrato

## Sicurezza e Abilitazioni
- Ripristinare protezioni selettive (scritture/admin) lasciando public‑read aperto; ruoli: operator/admin/superadmin
- Rate limiting per AI, CORS controllato, audit log esteso per operazioni critiche

## Performance, Test e Monitoraggio
- Paginazione lista, caching, lazy‑load immagini
- Test end‑to‑end su dataset di 50 roulotte; monitoraggio errori AI e tempi UX
- Metriche dashboard: pubblicate, valore inventario, lavori attivi, costi totali

## Piano di Implementazione (iterativo)
1. UI: storico descrizioni + delete foto/lavori nelle card
2. PDF multi‑foto + legenda difetti e QR
3. Fallback Google Vision reale + normalizzazione tag
4. Migliorie admin: filtri salvati e bulk auto‑descrizione
5. DB migration (NoSQL/SQL) + S3 thumbnails
6. Sicurezza selettiva e audit log; test e paginazione