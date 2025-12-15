import { Router } from "express";
import { analyzeImage, generateDescription } from "../ai/vision.js";
import { get, update, updatePhotoAI } from "../storage.js";

const router = Router();

router.post("/vision", async (req, res) => {
  const { url, fallback, roulotte_id, photo_id } = req.body || {};
  if (!url) return res.status(400).json({ error: "bad_request" });
  const result = await analyzeImage(url, fallback);
  if (roulotte_id && photo_id) {
    const pf = updatePhotoAI(roulotte_id, photo_id, { ai_tags: result.tags, ai_raw: result.raw, bboxes: result.bboxes });
    const item = get(roulotte_id);
    if (item) {
      const difetti = new Set(item.difetti||[]);
      const comp = { ...(item.componenti||{}) };
      if ((result.tags||[]).includes("infiltrazione")) difetti.add("infiltrazioni");
      if ((result.tags||[]).includes("sanitrit")) comp.sanitrit = true;
      const updated = { ...item, difetti: Array.from(difetti), componenti: comp };
      update(roulotte_id, updated);
    }
  }
  res.json(result);
});

router.post("/generate-description", (req, res) => {
  const { roulotte, tone = "base", language = "IT" } = req.body || {};
  if (!roulotte) return res.status(400).json({ error: "bad_request" });
  const j = generateDescription(roulotte, tone, language);
  res.json(j);
});

router.post("/estimate-price", (req, res) => {
  const { marca, modello, anno, stato_generale, componenti = {}, lavori = [], prezzi_storici = [], dettagli = {} } = req.body || {};
  const result = computePrice({ marca, modello, anno, stato_generale, componenti, lavori, prezzi_storici, dettagli });
  res.json(result);
});

router.post("/suggest-works", (req, res) => {
  const { componenti = {}, difetti = [], ai_tags = [] } = req.body || {};
  const s = new Set([...(difetti||[]), ...(ai_tags||[])]);
  const suggestions = [];
  if (s.has("infiltrazione") || (difetti||[]).includes("infiltrazioni")) suggestions.push({ titolo: "Test umidità e sigillature", impatto: "+valore", costo_stimato: 80 });
  if (componenti.bagno === "rimosso") suggestions.push({ titolo: "Installazione WC Thetford", impatto: "+valore", costo_stimato: 300 });
  if (componenti.cucina === "mancante") suggestions.push({ titolo: "Installazione piano cottura e lavello", impatto: "+valore", costo_stimato: 250 });
  if (s.has("sanitrit") || componenti.sanitrit) suggestions.push({ titolo: "Verifica scarichi e aerazione", impatto: "±", costo_stimato: 50 });
  if ((difetti||[]).includes("pavimento_punti_molli")) suggestions.push({ titolo: "Rinforzo/laminazione pavimento", impatto: "+valore", costo_stimato: 200 });
  res.json({ suggestions });
});

export function computePrice({ marca, modello, anno, stato_generale, componenti = {}, lavori = [], prezzi_storici = [], dettagli = {} }){
  const base = 2000;
  let score = base;

  // Year factor
  if (anno) score += Math.max(0, 200 - (new Date().getFullYear() - anno));

  // Condition factor (prioritize detailed evaluation)
  const stato = dettagli.stato_generale?.valutazione || stato_generale;
  if (stato === "ottimo") score += 800;
  if (stato === "buono") score += 400;
  if (stato === "da_sistemare") score -= 300;
  if (stato === "da_rottamare") score -= 800;

  // Detailed factors
  const info = dettagli.info_generali || {};
  if (info.posti_letto) score += (info.posti_letto * 150);
  if (info.stato_documenti?.demolizione) score *= 0.5;
  if (info.stato_documenti?.solo_stanziale) score *= 0.7;

  // Components
  if (componenti.pavimento_rifatto) score += 300;
  if (componenti.bagno === "rimosso") score -= 250;
  if (componenti.cucina === "mancante") score -= 200;

  // Works
  const lavoriCost = lavori.reduce((a, x) => a + (Number(x.costo)||0), 0);
  score += Math.min(400, lavoriCost * 0.3);

  // Historical average
  const avg = prezzi_storici.length ? prezzi_storici.reduce((a,b)=>a+b,0)/prezzi_storici.length : score;
  const consigliato = Math.round((score + avg) / 2);
  const min = Math.round(consigliato * 0.85);
  const max = Math.round(consigliato * 1.15);
  const prezzo_ritiro = Math.round(min * 0.7);

  const motivi = [];
  if (componenti.pavimento_rifatto) motivi.push("Pavimento rifatto (+)");
  if (componenti.sanitrit) motivi.push("Sanitrit (±)");
  if (componenti.bagno === "rimosso") motivi.push("Bagno mancante (-)");
  if (info.posti_letto > 4) motivi.push("Molti posti letto (+)");
  if (info.stato_documenti?.demolizione) motivi.push("Da demolizione (-)");

  return { min, max, prezzo_consigliato: consigliato, prezzo_ritiro, motivi };
}

export default router;
