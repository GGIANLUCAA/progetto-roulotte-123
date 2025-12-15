# Guida all'installazione su WordPress

Ciao! Ecco la guida passo-passo per trasferire il tuo nuovo sito su **roulotte.online** utilizzando WordPress.

Ho preparato per te due file ZIP che contengono tutto il necessario:
1. `roulotte-pro-theme.zip` (Il design del sito)
2. `roulotte-pro-core.zip` (Le funzionalità, come le schede tecniche e l'importazione)

Segui questi passaggi:

## 1. Accedi al tuo pannello WordPress
Vai su `https://roulotte.online/wp-admin` ed effettua il login con le tue credenziali.

## 2. Installa il Plugin (Funzionalità)
Il plugin serve a creare la sezione "Roulotte" nel tuo sito.
1. Nel menu a sinistra, vai su **Plugin** > **Aggiungi nuovo**.
2. Clicca sul pulsante in alto **Carica plugin**.
3. Clicca su **Scegli file** e seleziona il file `roulotte-pro-core.zip` che ti ho creato.
4. Clicca **Installa ora**.
5. Dopo l'installazione, clicca su **Attiva plugin**.
   - *Nota: Ora vedrai una nuova voce "Roulotte Pro" nel menu a sinistra!*

## 3. Installa il Tema (Grafica)
Il tema serve a dare al sito l'aspetto che abbiamo creato (colori, layout, ecc.).
1. Nel menu a sinistra, vai su **Aspetto** > **Temi**.
2. Clicca sul pulsante in alto **Aggiungi nuovo**.
3. Clicca su **Carica tema**.
4. Clicca su **Scegli file** e seleziona il file `roulotte-pro-theme.zip`.
5. Clicca **Installa ora**.
6. Dopo l'installazione, clicca su **Attiva**.

## 4. Importa i tuoi dati (Opzionale)
Se hai già inserito delle roulotte nel programma attuale e vuoi portarle su WordPress:
1. Dal programma attuale, vai nella scheda **Amministrazione** e clicca su **Esporta JSON**. Salva il file `roulotte-export.json`.
2. Su WordPress, vai su **Roulotte** > **Importa JSON**.
3. Seleziona il file `roulotte-export.json` e clicca **Importa**.
   - *Le tue schede verranno create automaticamente su WordPress!*

## 5. Fatto!
Ora se visiti `https://roulotte.online` vedrai il tuo nuovo catalogo attivo.

### Note Aggiuntive
- **Immagini**: Se importi dal JSON, le immagini potrebbero non vedersi se il vecchio server è spento. Per le nuove roulotte che creerai direttamente su WordPress, potrai caricare le foto direttamente dalla libreria media di WordPress.
- **Permessi**: Assicurati che i permalink siano impostati su "Nome articolo" in **Impostazioni** > **Permalink** per far funzionare correttamente i link delle singole roulotte.

Se hai bisogno di altro aiuto, chiedi pure!
