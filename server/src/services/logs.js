import fs from "fs";
import path from "path";

const logPath = path.join(process.cwd(), "server", "data", "logs.json");

export function appendLog(entry) {
  const line = { ...entry, ts: new Date().toISOString() };
  const arr = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, "utf-8")||"[]") : [];
  arr.push(line);
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, JSON.stringify(arr, null, 2));
}

export function readLogs() {
  if (!fs.existsSync(logPath)) return [];
  try { return JSON.parse(fs.readFileSync(logPath, "utf-8")||"[]"); } catch { return []; }
}
