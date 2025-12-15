import { Router } from "express";
import { requireRole } from "../middleware/auth.js";
import { readLogs } from "../services/logs.js";
import { getFilters, saveFilter, removeFilter } from "../services/filters.js";
import { generateDescription } from "../ai/vision.js";
import { get, addDescriptionVersion, create, remove as removeRoulotte } from "../storage.js";
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Endpoint per aggiungere una nuova roulotte
router.post("/roulottes", requireRole(["admin", "superadmin"]), (req, res) => {
    const { marca, modello, anno, prezzo, descrizione } = req.body;
    if (!marca || !modello || !anno || !prezzo) {
        return res.status(400).json({ error: "I campi marca, modello, anno e prezzo sono obbligatori." });
    }
    const nuovaRoulotte = {
        id: uuidv4(),
        ...req.body,
        created_at: new Date().toISOString(),
    };
    create(nuovaRoulotte);
    res.status(201).json(nuovaRoulotte);
});

// Endpoint per eliminare una roulotte
router.delete("/roulottes/:id", requireRole(["admin", "superadmin"]), (req, res) => {
    const { id } = req.params;
    const success = removeRoulotte(id);
    if (success) {
        res.status(200).json({ ok: true });
    } else {
        res.status(404).json({ error: "Roulotte non trovata." });
    }
});

router.get("/logs", requireRole(["admin","superadmin"]), (req, res) => {
  res.json(readLogs());
});

router.get("/filters", requireRole(["admin","superadmin"]), (req, res) => {
  res.json(getFilters());
});

router.post("/filters", requireRole(["admin","superadmin"]), (req, res) => {
  const filter = req.body || {};
  if (!filter.name) return res.status(400).json({ error: "bad_request" });
  res.json(saveFilter(filter));
});

router.delete("/filters/:name", requireRole(["admin","superadmin"]), (req, res) => {
  removeFilter(req.params.name);
  res.json({ ok: true });
});

router.post("/auto-describe/:id", requireRole(["admin","superadmin"]), (req, res) => {
  const item = get(req.params.id);
  if (!item) return res.status(404).json({ error: "not_found" });
  const tone = (req.body||{}).tone || "professionale";
  const j = generateDescription(item, tone, "IT");
  addDescriptionVersion(req.params.id, { text: j.text, variant: j.variant, version_id: j.version_id, created_at: new Date().toISOString() });
  res.json({ ok: true, text: j.text });
});

router.post("/auto-describe-batch", requireRole(["admin","superadmin"]), (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  let count = 0;
  ids.forEach(id => {
    const item = get(id);
    if (item) {
      const j = generateDescription(item, "professionale", "IT");
      addDescriptionVersion(id, { text: j.text, variant: j.variant, version_id: j.version_id, created_at: new Date().toISOString() });
      count++;
    }
  });
  res.json({ processed: count });
});

export default router;
