import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "../../data/users.json");

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

export function findByEmail(email) {
  return readAll().find(x => x.email === email);
}

export function findById(id) {
  return readAll().find(x => x.id === id);
}

export function createUser(user) {
  const all = readAll();
  if (all.find(x => x.email === user.email)) return null;
  all.push(user);
  writeAll(all);
  return user;
}
