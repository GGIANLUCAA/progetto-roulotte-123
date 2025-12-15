import { CONFIG } from "../config.js";
import OpenAI from "openai";

export async function analyzeImage(url, fallback) {
  if (CONFIG.AI_PROVIDER === "openai" && CONFIG.OPENAI_API_KEY) {
    try{
      const client = new OpenAI({ apiKey: CONFIG.OPENAI_API_KEY });
      const sys = "Sei un assistente che estrae un JSON con categoria, tags e bounding boxes normalizzate (0-1). Restituisci SOLO JSON.";
      const usr = "Analizza l'immagine e ritorna {categoria,tags,bboxes:[{label,x,y,w,h}]}";
      const resp = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: [
            { type: "text", text: usr },
            { type: "image_url", image_url: { url } }
          ] }
        ]
      });
      const txt = resp.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(txt);
      return { categoria: parsed.categoria || "esterno", tags: parsed.tags || [], bboxes: parsed.bboxes || [], raw: { provider: "openai", fallback } };
    }catch{
      // fallthrough
    }
  }
  if (CONFIG.AI_PROVIDER === "mock" || !CONFIG.AI_PROVIDER) {
    const categoria = url.includes("int") ? "interno" : url.includes("doc") ? "documento" : "esterno";
    let tags = [];
    if (url.includes("sanitrit")) tags.push("sanitrit");
    if (url.includes("infiltr")) tags.push("infiltrazione");
    tags = normalizeTags(tags);
    const bboxes = tags.map(t => ({ label: t, x: 0.1, y: 0.1, w: 0.5, h: 0.3 }));
    return { categoria, tags, bboxes, raw: { source: "mock", fallback } };
  }
  if (fallback === "google" && CONFIG.GOOGLE_VISION_KEY) {
    const categoria = url.includes("int") ? "interno" : url.includes("doc") ? "documento" : "esterno";
    let tags = [];
    if (url.includes("sanitrit")) tags.push("sanitrit");
    if (url.includes("infiltr")) tags.push("infiltrazione");
    tags = normalizeTags(tags);
    const bboxes = tags.map(t => ({ label: t, x: 0.15, y: 0.15, w: 0.4, h: 0.25 }));
    return { categoria, tags, bboxes, raw: { provider: "google", note: "heuristic", fallback } };
  }
  return { categoria: "esterno", tags: [], bboxes: [], raw: { source: CONFIG.AI_PROVIDER, fallback } };
}

function normalizeTags(tags){
  const map = {
    "sanitrit": "sanitrit",
    "wc": "wc",
    "infiltrazione": "infiltrazione",
    "crepa": "crepa",
    "muffa": "muffa",
    "ammaccatura": "ammaccatura"
  };
  return Array.from(new Set(tags.map(t => (map[t.toLowerCase()]||t.toLowerCase()))));
}

export function generateDescription(roulotte, tone = "base", language = "IT") {
  const r = roulotte;
  const d = r.dettagli || {};
  const info = d.info_generali || {};
  const sg = d.stato_generale || {};
  const pc = d.prezzo_condizioni || {};
  const dim = r.dimensioni || {};
  const peso = r.peso || {};

  const marca = r.marca || "";
  const modello = r.modello || "";
  const anno = r.anno || "";
  const titolo = `${marca} ${modello} ${anno}`.trim();

  // Helper for lists
  const join = (arr) => (arr && arr.length ? arr.join(", ") : "");
  const formatVal = (v, suffix="") => v ? `${v}${suffix}` : "n.d.";

  // Sections
  const accessori = join(r.accessori);
  const difetti = join(r.difetti);
  const componenti = join(Object.keys(r.componenti || {}).filter(k => r.componenti[k]));
  const lavori = join((r.lavori || []).map(x => x.titolo));
  const lavoriConsigliati = sg.lavori_consigliati || "";

  // Prices and conditions
  const prezzo = pc.prezzo_richiesto || r.prezzo_richiesto || 0;
  const trattabile = pc.trattabile ? "(trattabile)" : "";
  const disponibilita = pc.disponibile_da ? `Disponibile dal ${pc.disponibile_da}` : "Pronta consegna";
  const trasporto = pc.trasporto ? "Possibilità di trasporto." : "Ritiro in sede.";

  // Documents
  const docs = [];
  if (info.stato_documenti) {
    if (info.stato_documenti.libretto_presente) docs.push("Libretto presente");
    if (info.stato_documenti.demolizione) docs.push("Uso demolizione/stanziale");
    if (info.stato_documenti.solo_stanziale) docs.push("Solo stanziale");
  }
  const docsStr = docs.length ? docs.join(", ") : "Documenti da verificare";

  let text = "";

  if (tone === "professionale") {
    text = `SCHEDA TECNICA: ${titolo.toUpperCase()}

VEICOLO
- Marca/Modello: ${marca} ${modello}
- Anno: ${anno}
- Posti letto: ${info.posti_letto || r.posti_letto || "n.d."}
- Dimensioni: ${formatVal(dim.lunghezza, "m")} x ${formatVal(dim.larghezza, "m")}
- Peso: Vuoto ${formatVal(peso.vuoto, "kg")} / Max ${formatVal(peso.massimo, "kg")}

CONDIZIONI
- Valutazione generale: ${sg.valutazione || r.stato_generale || "n.d."}
- Difetti noti: ${difetti || "Nessuno segnalato"}
- Lavori eseguiti: ${lavori || "Nessuno"}
- Lavori consigliati: ${lavoriConsigliati || "Nessuno"}

DOTAZIONI
- Accessori: ${accessori || "Base"}
- Componenti: ${componenti || "Standard"}

DOCUMENTI E VENDITA
- Documenti: ${docsStr}
- Targa: ${info.targa || "n.d."} / Telaio: ${info.numero_telaio || "n.d."}
- Prezzo: €${prezzo} ${trattabile}
- Note vendita: ${disponibilita}. ${trasporto}
`;
  } else if (tone === "emozionale") {
    text = `Scopri la libertà con questa splendida ${titolo}!

Perfetta per chi cerca un veicolo ${sg.valutazione || "affidabile"}, questa roulotte offre ${info.posti_letto || "comodi"} posti letto in un ambiente accogliente.
Con una lunghezza di ${dim.lunghezza || "contenuta"} metri, è ideale per ${r.utilizzo_consigliato || "viaggi e campeggio"}.

I punti di forza:
✨ ${accessori ? "Accessoriata con " + accessori : "Pronta per partire"}
✨ Interni curati e spazi ben distribuiti
${lavori ? "✨ Manutenzione recente: " + lavori : ""}

Il veicolo viene proposto a €${prezzo} ${trattabile}.
${trasporto} ${disponibilita}

Non lasciartela scappare! Contattaci per una visione.`;
  } else if (tone === "tecnico") {
    text = `REPORT TECNICO ${new Date().toISOString().split('T')[0]}
ID: ${r.id || "N/A"}
REF: ${titolo}

DATI TECNICI
L x P: ${dim.lunghezza || "-"} x ${dim.larghezza || "-"}
Masse (V/P): ${peso.vuoto || "-"} / ${peso.massimo || "-"} kg
Telaio: ${info.numero_telaio || "-"}

STATO D'USO
Struttura: ${sg.valutazione || "-"}
Impermeabilità: ${difetti.includes("infiltrazioni") ? "CRITICA (Infiltrazioni rilevate)" : "Conforme"}
Impianti: ${componenti}

INTERVENTI
Eseguiti: ${lavori || "Nessuno"}
Da programmare: ${lavoriConsigliati || "Verifica generale"}

NOTE COMMERCIALI
Richiesta: €${prezzo}
Doc: ${docsStr}
`;
  } else {
    // Base/Default
    text = `${titolo}. ${sg.valutazione || r.stato_generale}.
Posti: ${info.posti_letto}. Accessori: ${accessori}.
Prezzo: €${prezzo}.`;
  }

  return { text, variant: tone, version_id: Date.now().toString(), language };
}
