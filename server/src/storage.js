import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "../data/roulottes.json");

function readAll() {
  if (!fs.existsSync(dataPath)) return [];
  const raw = fs.readFileSync(dataPath, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAll(items) {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(items, null, 2));
}

export function list() {
  return readAll();
}

export function get(id) {
  return readAll().find(x => x.id === id) || null;
}

export function create(obj) {
  const all = readAll();
  all.push(obj);
  writeAll(all);
  return obj;
}

export function update(id, obj) {
  const all = readAll();
  const i = all.findIndex(x => x.id === id);
  if (i === -1) return null;
  all[i] = obj;
  writeAll(all);
  return obj;
}

export function addPhoto(id, photo) {
  const all = readAll();
  const i = all.findIndex(x => x.id === id);
  if (i === -1) return null;
  const item = all[i];
  item.foto = Array.isArray(item.foto) ? item.foto : [];
  item.foto.push(photo);
  all[i] = item;
  writeAll(all);
  return photo;
}

export function updatePhotoAI(roulotteId, photoId, { ai_tags, ai_raw, bboxes }) {
  const all = readAll();
  const i = all.findIndex(x => x.id === roulotteId);
  if (i === -1) return null;
  const item = all[i];
  const idx = (item.foto||[]).findIndex(f => f.id === photoId);
  if (idx === -1) return null;
  const pf = item.foto[idx];
  pf.ai_tags = Array.isArray(ai_tags) ? ai_tags : pf.ai_tags;
  pf.ai_raw = ai_raw ?? pf.ai_raw;
  pf.bboxes = Array.isArray(bboxes) ? bboxes : pf.bboxes;
  item.foto[idx] = pf;
  all[i] = item;
  writeAll(all);
  return pf;
}

export function deletePhoto(roulotteId, photoId) {
  const all = readAll();
  const i = all.findIndex(x => x.id === roulotteId);
  if (i === -1) return false;
  const item = all[i];
  item.foto = (item.foto||[]).filter(f => f.id !== photoId);
  all[i] = item;
  writeAll(all);
  return true;
}

export function deleteWork(roulotteId, index) {
  const all = readAll();
  const i = all.findIndex(x => x.id === roulotteId);
  if (i === -1) return false;
  const item = all[i];
  if (!Array.isArray(item.lavori)) return false;
  if (index < 0 || index >= item.lavori.length) return false;
  item.lavori.splice(index, 1);
  all[i] = item;
  writeAll(all);
  return true;
}

export function remove(id) {
  const all = readAll();
  const i = all.findIndex(x => x.id === id);
  if (i === -1) return false;
  all.splice(i, 1);
  writeAll(all);
  return true;
}

export function exportAll() {
  return readAll();
}

export function importMany(items) {
  const all = readAll();
  const map = new Map(all.map(x => [x.id, x]));
  items.forEach(x => { map.set(x.id, x); });
  const merged = Array.from(map.values());
  writeAll(merged);
  return merged.length;
}

export function addWork(id, lavoro) {
  const all = readAll();
  const i = all.findIndex(x => x.id === id);
  if (i === -1) return null;
  const item = all[i];
  item.lavori = Array.isArray(item.lavori) ? item.lavori : [];
  item.lavori.push(lavoro);
  all[i] = item;
  writeAll(all);
  return lavoro;
}

export function setPublic(id, pub) {
  const all = readAll();
  const i = all.findIndex(x => x.id === id);
  if (i === -1) return null;
  const item = all[i];
  item.pubblico = !!pub;
  all[i] = item;
  writeAll(all);
  return item;
}

export function addDescriptionVersion(id, entry) {
  const all = readAll();
  const i = all.findIndex(x => x.id === id);
  if (i === -1) return null;
  const item = all[i];
  item.descrizioni = Array.isArray(item.descrizioni) ? item.descrizioni : [];
  item.descrizioni.push(entry);
  all[i] = item;
  writeAll(all);
  return entry;
}
