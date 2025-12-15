import { Router } from "express";
import { requireRole } from "../middleware/auth.js";
import { readLogs } from "../services/logs.js";
import { getFilters, saveFilter, removeFilter } from "../services/filters.js";
import { generateDescription } from "../ai/vision.js";
import { get, addDescriptionVersion } from "../storage.js";

const router = Router();

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
