import { Router } from "express";
import { list } from "../storage.js";

const router = Router();

router.get("/", (req, res) => {
  const items = list();
  
  // Basic Counts
  const count = items.length;
  const pubblicate = items.filter(x => x.pubblico).length;
  
  // Financials
  let valoreTotale = 0;
  let valorePubblicato = 0;
  let costoLavoriTotale = 0;

  // Status Distribution
  const stati = {
    "ottimo": 0,
    "buono": 0,
    "da_sistemare": 0,
    "da_rottamare": 0
  };

  // Condition Distribution (New/Used/Km0)
  const condizioni = {
    "Nuovo": 0,
    "Usato": 0,
    "Km0": 0,
    "Ex-Noleggio": 0
  };

  items.forEach(x => {
    // Price calculation: prioritize manual price -> estimated price -> 0
    const prezzo = x.dettagli?.prezzo_condizioni?.prezzo_richiesto || x.prezzo_consigliato || 0;
    valoreTotale += Number(prezzo);
    if (x.pubblico) valorePubblicato += Number(prezzo);

    // Works cost
    const lavori = (x.lavori || []).reduce((acc, l) => acc + (Number(l.costo) || 0), 0);
    costoLavoriTotale += lavori;

    // Status count
    if (stati[x.stato_generale] !== undefined) stati[x.stato_generale]++;
    
    // Condition count
    const cond = x.dettagli?.info_generali?.condizioni_veicolo || "Usato";
    if (condizioni[cond] !== undefined) condizioni[cond]++;
    else condizioni["Usato"]++; // fallback
  });

  const inLavorazione = stati["da_sistemare"];

  res.json({
    count,
    pubblicate,
    valore_inventario: valoreTotale,
    valore_pubblicato: valorePubblicato,
    costo_lavori_totale: costoLavoriTotale,
    in_lavorazione: inLavorazione,
    distribuzione_stato: stati,
    distribuzione_condizioni: condizioni,
    prezzo_medio: count ? Math.round(valoreTotale / count) : 0
  });
});

export default router;
