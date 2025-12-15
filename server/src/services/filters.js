import fs from "fs";
import path from "path";

const file = path.join(process.cwd(), "server", "data", "filters.json");

export function getFilters(){
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, "utf-8")||"[]"); } catch { return []; }
}

export function saveFilter(filter){
  const all = getFilters();
  const i = all.findIndex(f => f.name === filter.name);
  if (i >= 0) all[i] = filter; else all.push(filter);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(all, null, 2));
  return filter;
}

export function removeFilter(name){
  const all = getFilters();
  const n = all.filter(f => f.name !== name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(n, null, 2));
  return true;
}
