import { Router } from "express";
import crypto from "crypto";
import { list, get, create, update, addPhoto, addWork, setPublic, addDescriptionVersion, remove, exportAll, importMany, deletePhoto, deleteWork } from "../storage.js";
import { computePrice } from "./ai.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { CONFIG } from "../config.js";
import { uploadLocalFile } from "../services/s3.js";
import { requireRole } from "../middleware/auth.js";
import { appendLog } from "../services/logs.js";

const router = Router();

const uploadDir = path.join(process.cwd(), "server", "public", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024, fieldSize: 50 * 1024 * 1024 } // 50MB limit
});

router.get("/", (req, res) => {
  const q = req.query || {};
  let items = list();
  if (q.stato) items = items.filter(x => x.stato_generale === q.stato);
  if (q.anno) items = items.filter(x => String(x.anno) === String(q.anno));
  if (q.bagno) items = items.filter(x => (x.componenti||{}).bagno === q.bagno);
  if (q.sanitrit !== undefined) items = items.filter(x => Boolean((x.componenti||{}).sanitrit) === (q.sanitrit === "true"));
  if (q.q) {
    const term = String(q.q).toLowerCase();
    const isPriceQuery = term.includes("prezzo") || term.includes("€") || !isNaN(Number(term));
    
    items = items.filter(x => {
      // Basic text search
      const basicMatch = [x.marca, x.modello, x.anno, ...(x.accessori||[]), ...(x.difetti||[])].some(v => String(v||"").toLowerCase().includes(term));
      if (basicMatch) return true;

      // Advanced accessory search (e.g. "con mover")
      if (term.startsWith("con ")) {
         const acc = term.replace("con ", "").trim();
         return (x.accessori||[]).some(a => a.toLowerCase().includes(acc));
      }

      // Price search (e.g. "5000", "<5000")
      if (isPriceQuery) {
         const price = Number(x.prezzo_consigliato) || 0;
         if (term.startsWith("<")) return price <= Number(term.slice(1));
         if (term.startsWith(">")) return price >= Number(term.slice(1));
         return Math.abs(price - Number(term)) < 500; // tolerance
      }
      
      return false;
    });
  }
  
  // Sorting
  if (q.sort) {
    const [field, dir] = q.sort.split(":"); // e.g. "prezzo:asc"
    items.sort((a, b) => {
       let valA, valB;
       if (field === 'prezzo') { valA = Number(a.prezzo_consigliato)||0; valB = Number(b.prezzo_consigliato)||0; }
       else if (field === 'anno') { valA = Number(a.anno)||0; valB = Number(b.anno)||0; }
       else if (field === 'created') { valA = new Date(a.created_at).getTime(); valB = new Date(b.created_at).getTime(); }
       else return 0;
       
       return dir === 'desc' ? valB - valA : valA - valB;
    });
  } else {
    // Default sort: Newest first
    items.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const page = Math.max(1, Number(q.page)||1);
  const size = Math.max(1, Math.min(50, Number(q.page_size)||20));
  const start = (page-1)*size;
  const paged = items.slice(start, start+size);
  res.json(paged);
});

router.get("/meta", (req, res) => {
  const q = req.query || {};
  let items = list();
  if (q.stato) items = items.filter(x => x.stato_generale === q.stato);
  if (q.anno) items = items.filter(x => String(x.anno) === String(q.anno));
  if (q.bagno) items = items.filter(x => (x.componenti||{}).bagno === q.bagno);
  if (q.sanitrit !== undefined) items = items.filter(x => Boolean((x.componenti||{}).sanitrit) === (q.sanitrit === "true"));
  const size = Math.max(1, Math.min(50, Number(q.page_size)||20));
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const byState = items.reduce((acc, it) => { const st = it.stato_generale||""; acc[st]=(acc[st]||0)+1; return acc; }, {});
  res.json({ total, pages, by_state: byState });
});

router.post("/", (req, res) => {
  const body = req.body || {};
  const id = body.id || crypto.randomUUID();
  const created_at = body.created_at || new Date().toISOString();
  let obj = { ...body, id, created_at };
  if (!obj.prezzo_consigliato) {
    const est = computePrice({ marca: obj.marca, modello: obj.modello, anno: obj.anno, stato_generale: obj.stato_generale, componenti: obj.componenti||{}, lavori: obj.lavori||[], prezzi_storici: [] });
    obj.prezzo_consigliato = est.prezzo_consigliato;
  }
  create(obj);
  res.status(201).json(obj);
});

router.get("/:id", (req, res) => {
  const item = get(req.params.id);
  if (!item) return res.status(404).json({ error: "not_found" });
  res.json(item);
});

router.put("/:id", (req, res) => {
  const existing = get(req.params.id);
  if (!existing) return res.status(404).json({ error: "not_found" });
  const obj = { ...req.body, id: req.params.id, created_at: existing.created_at };
  const updated = update(req.params.id, obj);
  appendLog({ type: "update_roulotte", id: req.params.id });
  res.json(updated);
});

router.get("/:id/descrizioni", (req, res) => {
  const item = get(req.params.id);
  if (!item) return res.status(404).json({ error: "not_found" });
  res.json(item.descrizioni || []);
});

router.post("/:id/photos", upload.array("files"), async (req, res) => {
  console.log("Upload request received for id:", req.params.id);
  try {
    const categoria = (req.body || {}).categoria;
    const files = req.files || [];
    console.log("Files received:", files.length);
    
    if (files.length === 0) {
       console.log("No files in req.files");
       if (req.file) files.push(req.file);
       else return res.status(400).json({ error: "bad_request", details: "No files provided" });
    }

    const uploaded = [];
    
    for (const file of files) {
      console.log("Processing file:", file.originalname);
      let url = `/public/uploads/${file.filename}`;
      
      // generate thumbnail
      try {
        const sharp = (await import('sharp')).default;
        const thumbsDir = path.join(process.cwd(), 'server', 'uploads', 'thumbs');
        fs.mkdirSync(thumbsDir, { recursive: true });
        const thumbPath = path.join(thumbsDir, file.filename);
        await sharp(file.path).resize(480).toFile(thumbPath);
      } catch (e) {
        console.error("Thumbnail error:", e);
      }

      if (CONFIG.S3_BUCKET) {
        try{
          const key = await uploadLocalFile(file.path);
          if (key) {
            url = `/public/images/${key}`;
            fs.unlinkSync(file.path);
          }
        }catch(e){
           console.error("S3 error:", e);
        }
      }
      
      const thumb_url = `/public/uploads/thumbs/${file.filename}`;
      const photo = { id: crypto.randomUUID(), url, categoria, thumb_url };
      const saved = addPhoto(req.params.id, photo);
      if (saved) {
         uploaded.push(saved);
         appendLog({ type: "add_photo", id: req.params.id, photo_id: photo.id });
      }
    }

    if (uploaded.length === 0) return res.status(404).json({ error: "not_found", details: "Could not save photos" });
    
    // Return last one or array
    return res.status(201).json({ uploaded: uploaded.length, last_id: uploaded[uploaded.length-1].id, photos: uploaded });
  } catch (error) {
    console.error("Upload route error:", error);
    res.status(500).json({ error: "internal_error", details: error.message });
  }
});

router.post("/:id/lavori", (req, res) => {
  const { titolo, costo } = req.body || {};
  if (!titolo) return res.status(400).json({ error: "bad_request" });
  const lavoro = { titolo, costo: Number(costo)||0, data: new Date().toISOString().slice(0,10), stato: "da_fare" };
  const saved = addWork(req.params.id, lavoro);
  if (!saved) return res.status(404).json({ error: "not_found" });
  appendLog({ type: "add_work", id: req.params.id, titolo });
  res.status(201).json(saved);
});

router.delete("/:id/photos/:photoId", requireRole(["admin","superadmin"]), (req, res) => {
  const ok = deletePhoto(req.params.id, req.params.photoId);
  if (!ok) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true });
});

router.delete("/:id/lavori/:index", requireRole(["admin","superadmin"]), (req, res) => {
  const idx = Number(req.params.index);
  const ok = deleteWork(req.params.id, idx);
  if (!ok) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true });
});

router.put("/:id/lavori/:index", (req, res) => {
  const idx = Number(req.params.index);
  const item = get(req.params.id);
  if (!item) return res.status(404).json({ error: "not_found" });
  if (!Array.isArray(item.lavori) || idx<0 || idx>=item.lavori.length) return res.status(404).json({ error: "not_found" });
  const { stato, scadenza } = req.body || {};
  const lv = item.lavori[idx];
  if (stato) lv.stato = stato;
  if (scadenza) lv.scadenza = scadenza;
  item.lavori[idx] = lv;
  update(req.params.id, item);
  res.json(lv);
});

router.post("/:id/publish", (req, res) => {
  const item = setPublic(req.params.id, true);
  if (!item) return res.status(404).json({ error: "not_found" });
  appendLog({ type: "publish", id: req.params.id });
  res.json({ ok: true });
});

router.post("/:id/unpublish", requireRole(["admin","superadmin"]), (req, res) => {
  const item = setPublic(req.params.id, false);
  if (!item) return res.status(404).json({ error: "not_found" });
  appendLog({ type: "unpublish", id: req.params.id });
  res.json({ ok: true });
});

router.post("/:id/descrizioni", (req, res) => {
  const { text, variant } = req.body || {};
  if (!text) return res.status(400).json({ error: "bad_request" });
  const entry = { text, variant: variant||"base", version_id: Date.now().toString(), created_at: new Date().toISOString() };
  const saved = addDescriptionVersion(req.params.id, entry);
  if (!saved) return res.status(404).json({ error: "not_found" });
  res.status(201).json(saved);
});

router.post("/:id/descrizioni/revert", (req, res) => {
  const { version_id } = req.body || {};
  const item = get(req.params.id);
  if (!item) return res.status(404).json({ error: "not_found" });
  const v = (item.descrizioni||[]).find(d => d.version_id === String(version_id));
  if (!v) return res.status(404).json({ error: "version_not_found" });
  const entry = { text: v.text, variant: "revert", version_id: Date.now().toString(), created_at: new Date().toISOString() };
  const saved = addDescriptionVersion(req.params.id, entry);
  res.status(201).json(saved);
});

router.post("/:id/duplicate", (req, res) => {
  const item = get(req.params.id);
  if (!item) return res.status(404).json({ error: "not_found" });
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  const clone = { ...item, id, created_at, pubblico: false };
  create(clone);
  appendLog({ type: "duplicate", id: req.params.id, new_id: id });
  res.status(201).json(clone);
});

router.delete("/:id", requireRole(["admin","superadmin"]), (req, res) => {
  const ok = remove(req.params.id);
  if (!ok) return res.status(404).json({ error: "not_found" });
  appendLog({ type: "delete", id: req.params.id });
  res.json({ ok: true });
});

router.get("/export", requireRole(["admin","superadmin"]), (req, res) => {
  res.json(exportAll());
});

router.post("/import", requireRole(["admin","superadmin"]), (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [];
  const count = importMany(items);
  appendLog({ type: "import", count });
  res.json({ imported: count });
});

export default router;
