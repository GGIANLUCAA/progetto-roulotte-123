import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../data/roulottes.json');
const dbPath = path.join(__dirname, '../data/database.db');

// 1. Inizializza il database
const db = new Database(dbPath, { verbose: console.log });

console.log('Database creato/aperto con successo.');

// 2. Crea la tabella se non esiste
const createTableStmt = `
CREATE TABLE IF NOT EXISTS roulottes (
  id TEXT PRIMARY KEY,
  marca TEXT,
  modello TEXT,
  anno INTEGER,
  stato_generale TEXT,
  prezzo_consigliato REAL,
  pubblico BOOLEAN DEFAULT FALSE,
  created_at TEXT,
  json_data TEXT
);
`;
db.exec(createTableStmt);
console.log('Tabella `roulottes` creata o già esistente.');

// 3. Leggi i dati dal file JSON
let roulottes = [];
if (fs.existsSync(jsonPath)) {
  try {
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    roulottes = JSON.parse(jsonData);
    console.log(`Trovate ${roulottes.length} roulotte nel file JSON.`);
  } catch (error) {
    console.error('Errore nella lettura o nel parsing del file JSON:', error);
    process.exit(1);
  }
} else {
  console.log('File roulottes.json non trovato. Nessun dato da migrare.');
  process.exit(0);
}

// 4. Inserisci i dati nel database
const insert = db.prepare(`
  INSERT OR REPLACE INTO roulottes (id, marca, modello, anno, stato_generale, prezzo_consigliato, pubblico, created_at, json_data)
  VALUES (@id, @marca, @modello, @anno, @stato_generale, @prezzo_consigliato, @pubblico, @created_at, @json_data)
`);

const insertMany = db.transaction((items) => {
  for (const item of items) {
    const { id, marca, modello, anno, stato_generale, prezzo_consigliato, pubblico, created_at, ...rest } = item;
    insert.run({
      id: id || crypto.randomUUID(),
      marca: marca || null,
      modello: modello || null,
      anno: Number(anno) || null,
      stato_generale: stato_generale || null,
      prezzo_consigliato: Number(prezzo_consigliato) || 0,
      pubblico: pubblico ? 1 : 0,
      created_at: created_at || new Date().toISOString(),
      json_data: JSON.stringify(rest)
    });
  }
});

try {
  insertMany(roulottes);
  console.log(`Migrazione completata con successo! ${roulottes.length} record inseriti/aggiornati nel database.`);
} catch (error) {
  console.error('Errore durante la transazione di inserimento:', error);
} finally {
  db.close();
  console.log('Connessione al database chiusa.');
}
