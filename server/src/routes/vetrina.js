import { Router } from "express";
import { get } from "../storage.js";

const router = Router();

router.get("/:id", (req, res) => {
  const item = get(req.params.id);
  if (!item) return res.status(404).send("Not found");
  if (!item.pubblico) return res.status(403).send("Non pubblicato");

  const i = item;
  const d = i.dettagli || {};
  const ig = d.info_generali || {};
  const sg = d.stato_generale || {};
  const pc = d.prezzo_condizioni || {};
  const dim = i.dimensioni || d.dimensioni || {};
  const peso = i.peso || d.peso || {};

  const img = (i.foto||[])[0]?.url || "";
  const gallery = (i.foto||[]).map(f => `<div class="thumb" onclick="setMainImage('${f.url}')"><img src="${f.url}" loading="lazy"></div>`).join("");
  
  const features = [];
  if (ig.posti_letto) features.push({ label: "Posti letto", value: ig.posti_letto, icon: "🛏️" });
  if (dim.lunghezza) features.push({ label: "Lunghezza", value: dim.lunghezza + " m", icon: "📏" });
  if (dim.larghezza) features.push({ label: "Larghezza", value: dim.larghezza + " m", icon: "↔️" });
  if (peso.massimo) features.push({ label: "Peso Max", value: peso.massimo + " kg", icon: "⚖️" });
  if (ig.condizioni_veicolo) features.push({ label: "Condizione", value: ig.condizioni_veicolo, icon: "✨" });
  if (ig.garanzia_mesi) features.push({ label: "Garanzia", value: ig.garanzia_mesi + " Mesi", icon: "🛡️" });

  // Details Sections
  const accList = (i.accessori||[]).filter(x=>x);
  const ext = accList.filter(x => ['Veranda','Tendalino','Mover','Stabilizzatore','Porta Bici','Pannello Solare','Cerchi Lega','Ruota Scorta','Piedini Rinforzati'].includes(x));
  const int = accList.filter(x => ['Climatizzatore','Stufa','Canalizzazione','Boiler','Frigo Grande','Forno','Microonde','Zanzariera Porta','Maxi Oblò'].includes(x));
  const tec = accList.filter(x => ['Antenna TV','TV','Impianto Audio','Prese USB','Inverter','Doccia Separata','WC Cassetta','Serbatoio Grigie','Attacco Acqua City'].includes(x));
  const others = accList.filter(x => ![...ext, ...int, ...tec].includes(x));

  const accHtml = [
    { title: "Esterno & Telaio", items: ext },
    { title: "Interno & Comfort", items: int },
    { title: "Tecnologia & Bagno", items: tec },
    { title: "Altro", items: others }
  ].filter(g => g.items.length > 0).map(g => `
    <h3 style="margin:1.5rem 0 0.5rem;font-size:1rem;color:var(--text-light);border-bottom:1px solid var(--border);padding-bottom:0.2rem">${g.title}</h3>
    <div class="tags">${g.items.map(a => `<span class="tag">${a}</span>`).join("")}</div>
  `).join("");
  const dif = (i.difetti||[]).length ? `<div class="alert-box"><h4>Note sullo stato</h4><ul>${(i.difetti||[]).map(d=>`<li>${d}</li>`).join('')}</ul></div>` : '';
  
  const prezzo = pc.prezzo_richiesto || i.prezzo_consigliato || 0;
  const listino = pc.prezzo_listino;
  const sconto = listino ? Math.round(((listino - prezzo) / listino) * 100) : 0;

  const html = `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${i.marca} ${i.modello} - Roulotte Pro</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #e11d48;
      --bg: #f8fafc;
      --text: #0f172a;
      --text-light: #64748b;
      --border: #e2e8f0;
    }
    body { font-family: 'Inter', sans-serif; margin: 0; background: var(--bg); color: var(--text); line-height: 1.6; }
    
    header { background: #fff; padding: 1rem 2rem; border-bottom: 1px solid var(--border); }
    .nav-link { color: var(--text); text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 0.5rem; }
    
    .container { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; display: grid; grid-template-columns: 1.4fr 1fr; gap: 3rem; }
    
    /* Gallery */
    .gallery-main { width: 100%; aspect-ratio: 16/9; background: #eee; border-radius: 12px; overflow: hidden; margin-bottom: 1rem; }
    .gallery-main img { width: 100%; height: 100%; object-fit: contain; background: #000; }
    .gallery-thumbs { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
    .thumb { width: 80px; height: 60px; border-radius: 6px; overflow: hidden; cursor: pointer; border: 2px solid transparent; flex-shrink: 0; }
    .thumb:hover { border-color: var(--primary); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    
    /* Info */
    .product-header h1 { margin: 0; font-size: 2rem; letter-spacing: -0.5px; }
    .product-subtitle { color: var(--text-light); font-size: 1.1rem; margin-top: 0.5rem; }
    
    .price-card { background: #fff; padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border); margin: 2rem 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .price-label { color: var(--text-light); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .price-val { font-size: 2.5rem; font-weight: 800; color: var(--primary); margin: 0.5rem 0; }
    .price-old { text-decoration: line-through; color: var(--text-light); font-size: 1.1rem; }
    
    .specs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .spec-box { background: #fff; padding: 1rem; border-radius: 8px; border: 1px solid var(--border); display: flex; align-items: center; gap: 1rem; }
    .spec-icon { font-size: 1.5rem; }
    .spec-label { font-size: 0.85rem; color: var(--text-light); display: block; }
    .spec-val { font-weight: 600; font-size: 1.1rem; }
    
    .section-title { font-size: 1.25rem; font-weight: 700; margin: 2rem 0 1rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5rem; display: inline-block; }
    
    .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .tag { background: #eff6ff; color: #1e40af; padding: 0.5rem 1rem; border-radius: 999px; font-weight: 500; font-size: 0.9rem; }
    
    .description { white-space: pre-line; color: var(--text-light); }
    
    .alert-box { background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 1rem; margin-top: 1.5rem; }
    .alert-box h4 { margin: 0 0 0.5rem; color: #991b1b; }
    .alert-box ul { margin: 0; padding-left: 1.2rem; color: #b91c1c; }
    
    .cta-btn { display: block; width: 100%; background: var(--text); color: #fff; text-align: center; padding: 1rem; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 1.1rem; transition: background 0.2s; margin-top: 1rem; }
    .cta-btn:hover { background: var(--primary); }

    @media (max-width: 768px) {
      .container { grid-template-columns: 1fr; gap: 1rem; }
    }
  </style>
</head>
<body>
  <header>
    <a href="/catalogo" class="nav-link">← Torna al catalogo</a>
  </header>
  
  <div class="container">
    <div class="left-col">
      <div class="gallery-main">
        <img id="mainImg" src="${img}" alt="Foto principale">
      </div>
      <div class="gallery-thumbs">
        ${gallery}
      </div>
      
      <h2 class="section-title">Descrizione</h2>
      <div class="description">
        ${d.descrizione_testo || "Nessuna descrizione disponibile."}
      </div>
      
      ${accHtml ? `<h2 class="section-title">Accessori e Dotazioni</h2>${accHtml}` : ''}
      
      ${dif}
    </div>
    
    <div class="right-col">
      <div class="product-header">
        <h1>${i.marca} ${i.modello}</h1>
        <div class="product-subtitle">${i.anno} · ${ig.condizioni_veicolo || "Usato"}</div>
      </div>
      
      <div class="price-card">
        <div class="price-label">Prezzo offerta</div>
        <div class="price-val">€ ${prezzo.toLocaleString('it-IT')}</div>
        ${listino ? `<div class="price-old">Listino: € ${listino.toLocaleString('it-IT')}</div>` : ''}
        ${pc.trattabile ? '<div style="color:#059669;font-weight:600;margin-top:0.5rem">Prezzo trattabile</div>' : ''}
        <div style="margin-top:1rem;font-size:0.9rem;color:var(--text-light)">
          ${pc.trasporto ? '✅ Possibilità di trasporto' : '❌ Ritiro in sede'}
          <br>
          ${pc.disponibile_da ? `📅 Disponibile dal ${pc.disponibile_da}` : '⚡ Pronta consegna'}
        </div>
        <a href="mailto:info@roulotte.pro?subject=Info ${i.marca} ${i.modello}" class="cta-btn">Richiedi Informazioni</a>
      </div>
      
      <div class="specs-grid">
        ${features.map(f => `
          <div class="spec-box">
            <div class="spec-icon">${f.icon}</div>
            <div>
              <span class="spec-label">${f.label}</span>
              <span class="spec-val">${f.value}</span>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div style="background:#f1f5f9;padding:1.5rem;border-radius:12px">
        <h3 style="margin-top:0">Finanziamento</h3>
        <p style="font-size:0.9rem;color:var(--text-light)">Possibilità di finanziamento personalizzato fino a 120 mesi. Contattaci per un preventivo su misura.</p>
      </div>
    </div>
  </div>

  <script>
    function setMainImage(url) {
      document.getElementById('mainImg').src = url;
    }
  </script>
</body>
</html>`;
  res.type("html").send(html);
});

export default router;
