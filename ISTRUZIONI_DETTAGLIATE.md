# Guida Completa all'Installazione su Roulotte.online

Ciao! Per evitare qualsiasi errore, ho riscritto le istruzioni in modo estremamente dettagliato. Segui questi passaggi uno alla volta.

---

## FASE 1: Scarica i file corretti
Assicurati di avere sul tuo computer questi due file che ho appena generato nella cartella del progetto:
1.  **`roulotte-pro-core.zip`** (Il Plugin)
2.  **`roulotte-pro-theme.zip`** (Il Tema)

> **Importante:** Non decomprimere (non estrarre) questi file. WordPress ha bisogno che siano in formato `.zip`.

---

## FASE 2: Accedi a WordPress
1.  Apri il tuo browser (Chrome, Firefox, ecc.).
2.  Vai all'indirizzo del tuo sito seguito da `/wp-admin`.
    *   Esempio: `https://roulotte.online/wp-admin`
3.  Inserisci il tuo Nome Utente e Password.
4.  Ora sei nella "Bacheca" (il pannello di controllo).

---

## FASE 3: Installa il Plugin "Roulotte Pro"
Questo passaggio aggiunge la funzionalità per gestire le roulotte.

1.  Nel menu nero a sinistra, cerca la voce **Plugin**.
2.  Passa il mouse sopra e clicca su **Aggiungi nuovo**.
3.  In alto alla pagina, accanto al titolo "Aggiungi plugin", clicca sul pulsante **Carica plugin**.
4.  Si aprirà un riquadro. Clicca su **Scegli file**.
5.  Seleziona il file **`roulotte-pro-core.zip`** dal tuo computer.
6.  Clicca sul pulsante **Installa ora**.
7.  Aspetta qualche secondo. Quando ha finito, vedrai una schermata di conferma.
8.  Clicca sul pulsante blu **Attiva plugin**.

> **Controllo:** Se hai fatto tutto giusto, nel menu nero a sinistra apparirà una nuova voce chiamata **Roulotte Pro** (spesso con l'icona di una macchinina).

---

## FASE 4: Installa il Tema "Roulotte Pro Theme"
Questo passaggio cambia l'aspetto grafico del sito.

1.  Nel menu nero a sinistra, cerca la voce **Aspetto**.
2.  Clicca su **Temi**.
3.  In alto, clicca sul pulsante **Aggiungi nuovo**.
4.  In alto, clicca sul pulsante **Carica tema**.
5.  Clicca su **Scegli file**.
6.  Seleziona il file **`roulotte-pro-theme.zip`** dal tuo computer.
7.  Clicca su **Installa ora**.
8.  Aspetta il caricamento.
9.  Clicca sul pulsante **Attiva**.

> **Controllo:** Se visiti ora la home page del tuo sito (`https://roulotte.online`), dovresti vedere la nuova grafica (anche se sarà vuota perché non ci sono ancora roulotte).

---

## FASE 5: Importa i tuoi Dati (Le Roulotte)
Ora portiamo le tue roulotte dal vecchio programma al nuovo sito WordPress.

**A. Prepara il file dati:**
1.  Vai nella cartella `server/data` del tuo progetto attuale sul computer.
2.  Troverai un file chiamato `roulottes.json`. Questo è il tuo database.

**B. Carica su WordPress:**
1.  Torna nel pannello di WordPress (`/wp-admin`).
2.  Nel menu a sinistra, clicca su **Roulotte Pro**.
3.  Sotto questa voce, clicca su **Importa JSON**.
4.  Clicca su **Scegli file** e seleziona il file `roulottes.json`.
5.  Clicca su **Carica e Importa**.

Il sistema lavorerà per qualche secondo e ti dirà quante roulotte sono state importate.

---

## FASE 6: Verifica Finale
1.  Vai su `https://roulotte.online`.
2.  Dovresti vedere la lista delle tue roulotte con prezzi, dettagli e foto.
3.  Clicca su una roulotte per vedere la scheda completa.

---

### Hai problemi?
*   **Errore "Il link che hai seguito è scaduto":** Significa che il file zip è troppo grande per le impostazioni del tuo server. Contattami se succede.
*   **Non vedo le foto:** Le foto importate via JSON puntano al vecchio percorso. Per le nuove roulotte caricate direttamente da WordPress, funzionerà tutto in automatico.
