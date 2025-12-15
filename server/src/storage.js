import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/database.db');

const db = new Database(dbPath);

// Funzione di utilità per eseguire query e restituire risultati
function db_all(query, params = {}) {
  const stmt = db.prepare(query);
  return stmt.all(params);
}

// Funzione di utilità per eseguire comandi (INSERT, UPDATE, DELETE)
function db_run(query, params = {}) {
  const stmt = db.prepare(query);
  return stmt.run(params);
}

// Funzione per "unire" i dati JSON con l'oggetto principale
function unpack(item) {
  if (!item) return null;
  const { json_data, ...rest } = item;
  try {
    const jsonData = JSON.parse(json_data || '{}');
    return { ...jsonData, ...rest };
  } catch {
    return rest;
  }
}

// Funzione per "separare" i dati JSON dall'oggetto principale
function pack(obj) {
  const { id, marca, modello, anno, stato_generale, prezzo_consigliato, pubblico, created_at, ...rest } = obj;
  return {
    main: {
      id: id || crypto.randomUUID(),
      marca: marca || null,
      modello: modello || null,
      anno: Number(anno) || null,
      stato_generale: stato_generale || null,
      prezzo_consigliato: Number(prezzo_consigliato) || 0,
      pubblico: pubblico ? 1 : 0,
      created_at: created_at || new Date().toISOString(),
    },
    json_data: JSON.stringify(rest)
  };
}

export function list() {
  const rows = db_all('SELECT * FROM roulottes');
  return rows.map(unpack);
}

export function get(id) {
  const row = db_all('SELECT * FROM roulottes WHERE id = @id', { id })[0];
  return unpack(row);
}

export function create(obj) {
  const { main, json_data } = pack(obj);
  db_run(
    'INSERT INTO roulottes (id, marca, modello, anno, stato_generale, prezzo_consigliato, pubblico, created_at, json_data) VALUES (@id, @marca, @modello, @anno, @stato_generale, @prezzo_consigliato, @pubblico, @created_at, @json_data)',
    { ...main, json_data }
  );
  return obj;
}

export function update(id, obj) {
  const { main, json_data } = pack({ ...obj, id });
  db_run(
    'UPDATE roulottes SET marca = @marca, modello = @modello, anno = @anno, stato_generale = @stato_generale, prezzo_consigliato = @prezzo_consigliato, pubblico = @pubblico, json_data = @json_data WHERE id = @id',
    { ...main, json_data }
  );
  return obj;
}

export function remove(id) {
  const result = db_run('DELETE FROM roulottes WHERE id = @id', { id });
  return result.changes > 0;
}

// Le funzioni che modificano campi JSON (foto, lavori, etc.) ora leggono, modificano e riscrivono.

export function addPhoto(id, photo) {
  const item = get(id);
  if (!item) return null;
  item.photos = Array.isArray(item.photos) ? item.photos : [];
  item.photos.push(photo);
  update(id, item);
  return photo;
}

export function deletePhoto(roulotteId, photoId) {
  const item = get(roulotteId);
  if (!item) return false;
  item.photos = (item.photos || []).filter(f => f.id !== photoId);
  update(roulotteId, item);
  return true;
}

// ... e così via per tutte le altre funzioni che modificano parti dell'oggetto

export function addWork(id, lavoro) {
    const item = get(id);
    if (!item) return null;
    item.lavori = Array.isArray(item.lavori) ? item.lavori : [];
    item.lavori.push(lavoro);
    update(id, item);
    return lavoro;
}

export function deleteWork(roulotteId, index) {
    const item = get(roulotteId);
    if (!item || !Array.isArray(item.lavori) || index < 0 || index >= item.lavori.length) {
        return false;
    }
    item.lavori.splice(index, 1);
    update(roulotteId, item);
    return true;
}

export function setPublic(id, pub) {
    const item = get(id);
    if (!item) return null;
    item.pubblico = !!pub;
    update(id, item);
    return item;
}

export function addDescriptionVersion(id, entry) {
    const item = get(id);
    if (!item) return null;
    item.descrizioni = Array.isArray(item.descrizioni) ? item.descrizioni : [];
    item.descrizioni.push(entry);
    update(id, item);
    return entry;
}

export function updatePhotoAI(roulotteId, photoId, { ai_tags, ai_raw, bboxes }) {
    const item = get(roulotteId);
    if (!item) return null;
    const photoIndex = (item.photos || []).findIndex(f => f.id === photoId);
    if (photoIndex === -1) return null;

    const photo = item.photos[photoIndex];
    photo.ai_tags = ai_tags ?? photo.ai_tags;
    photo.ai_raw = ai_raw ?? photo.ai_raw;
    photo.bboxes = bboxes ?? photo.bboxes;

    update(roulotteId, item);
    return photo;
}

export function importMany(items) {
    const transaction = db.transaction(() => {
        for (const item of items) {
            const existing = get(item.id);
            if (existing) {
                update(item.id, { ...existing, ...item });
            } else {
                create(item);
            }
        }
    });
    transaction();
    return items.length;
}

export function exportAll() {
    return list();
}
