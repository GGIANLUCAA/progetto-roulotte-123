import { Router } from "express";
import { list } from "../storage.js";

const router = Router();

router.get("/", (req, res) => {
  const items = list().filter(x => x.pubblico);
  
  // Get unique brands for filter
  const brands = [...new Set(items.map(i => i.marca).filter(Boolean))].sort();

  const cards = items.map(i => {
    const img = (i.foto||[])[0]?.url || "";
    const prezzo = i.dettagli?.prezzo_condizioni?.prezzo_richiesto || i.prezzo_consigliato || 0;
    const listino = i.dettagli?.prezzo_condizioni?.prezzo_listino;
    const sconto = listino ? Math.round(((listino - prezzo) / listino) * 100) : 0;
    const letti = i.dettagli?.info_generali?.posti_letto || i.posti_letto || "-";
    const peso = i.peso?.massimo || i.dettagli?.peso?.massimo || "-";
    const lungh = i.dimensioni?.lunghezza || i.dettagli?.dimensioni?.lunghezza || "-";
    const cond = i.dettagli?.info_generali?.condizioni_veicolo || "Usato";
    
    return `
    <div class="card product-card" data-brand="${i.marca||''}" data-price="${prezzo}">
      <div class="img-wrap">
        ${img ? `<img src="${img}" alt="${i.marca} ${i.modello}" loading="lazy" />` : '<div class="no-img">No Foto</div>'}
        <span class="badge-cond ${cond.toLowerCase()}">${cond}</span>
        ${sconto > 0 ? `<span class="badge-sale">-${sconto}%</span>` : ''}
      </div>
      <div class="content">
        <div class="header">
          <div class="brand">${i.marca || 'Brand'}</div>
          <h3 class="model">${i.modello || 'Modello'}</h3>
          <div class="year">${i.anno || ''}</div>
        </div>
        
        <div class="specs">
          <div class="spec-item" title="Posti letto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16M22 4v16M2 12h20M2 8h20M2 16h20"/></svg>
            <span>${letti}</span>
          </div>
          <div class="spec-item" title="Lunghezza (m)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M2 12l4-4m-4 4l4 4M22 12l-4-4m4 4l-4 4"/></svg>
            <span>${lungh}</span>
          </div>
          <div class="spec-item" title="Peso max (kg)">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.5a2.12 2.12 0 0 0-.09-3.66Z"/><path d="M5 5.43V13a2.12 2.12 0 0 0 1.07 1.84l5.93 3.43a1.93 1.93 0 0 0 1.91 0l3.09-1.79"/></svg>
            <span>${peso}</span>
          </div>
        </div>

        <div class="price-box">
          ${listino ? `<div class="list-price">Listino: €${listino.toLocaleString('it-IT')}</div>` : ''}
          <div class="final-price">€ ${prezzo.toLocaleString('it-IT')}</div>
          ${i.dettagli?.prezzo_condizioni?.trattabile ? '<div class="nego">Trattabile</div>' : ''}
        </div>

        <a href="/vetrina/${i.id}" class="cta-button">Scopri di più</a>
      </div>
    </div>`;
  }).join("");

  const html = `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Catalogo Roulotte Pro</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #e11d48; /* Red similar to Bonometti accent */
      --primary-dark: #be123c;
      --bg: #f3f4f6;
      --card-bg: #ffffff;
      --text: #1f2937;
      --text-light: #6b7280;
      --border: #e5e7eb;
    }
    * { box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; margin: 0; background: var(--bg); color: var(--text); }
    
    header { background: #fff; border-bottom: 1px solid var(--border); padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .logo { font-weight: 800; font-size: 1.5rem; color: var(--text); text-decoration: none; display: flex; align-items: center; gap: 0.5rem; }
    .logo span { color: var(--primary); }

    .layout { display: flex; gap: 2rem; max-width: 1400px; margin: 2rem auto; padding: 0 1rem; }
    
    /* Sidebar Filters */
    .filters { width: 260px; flex-shrink: 0; background: #fff; padding: 1.5rem; border-radius: 12px; height: fit-content; position: sticky; top: 90px; border: 1px solid var(--border); }
    .filter-group { margin-bottom: 1.5rem; }
    .filter-title { font-weight: 600; margin-bottom: 0.75rem; font-size: 0.95rem; }
    .filter-opt { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-light); cursor: pointer; }
    .filter-opt:hover { color: var(--primary); }
    
    /* Grid */
    .grid { flex: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    
    /* Product Card */
    .product-card { background: var(--card-bg); border-radius: 12px; overflow: hidden; border: 1px solid var(--border); transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.08); border-color: var(--primary); }
    
    .img-wrap { position: relative; aspect-ratio: 4/3; background: #eee; overflow: hidden; }
    .img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .product-card:hover .img-wrap img { transform: scale(1.05); }
    .no-img { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-light); }
    
    .badge-cond { position: absolute; top: 10px; left: 10px; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; z-index: 2; }
    .badge-cond.nuovo { background: var(--primary); color: #fff; }
    .badge-cond.usato { background: #374151; color: #fff; }
    .badge-cond.km0 { background: #059669; color: #fff; }
    
    .badge-sale { position: absolute; top: 10px; right: 10px; background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-weight: 700; font-size: 0.85rem; z-index: 2; }

    .content { padding: 1.25rem; display: flex; flex-direction: column; flex: 1; }
    
    .header { margin-bottom: 1rem; }
    .brand { font-size: 0.85rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .model { font-size: 1.25rem; margin: 0.25rem 0; font-weight: 700; color: var(--text); line-height: 1.3; }
    .year { font-size: 0.9rem; color: var(--text-light); }
    
    .specs { display: flex; gap: 1rem; margin-bottom: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border); }
    .spec-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--text-light); }
    
    .price-box { margin-top: auto; margin-bottom: 1rem; }
    .list-price { text-decoration: line-through; color: var(--text-light); font-size: 0.9rem; }
    .final-price { font-size: 1.5rem; font-weight: 700; color: var(--primary); }
    .nego { font-size: 0.8rem; color: #059669; font-weight: 500; }
    
    .cta-button { display: block; text-align: center; background: var(--text); color: #fff; padding: 0.85rem; border-radius: 8px; text-decoration: none; font-weight: 600; transition: background 0.2s; }
    .cta-button:hover { background: var(--primary); }

    @media (max-width: 768px) {
      .layout { flex-direction: column; }
      .filters { width: 100%; position: static; }
    }
  </style>
</head>
<body>
  <header>
    <a href="/" class="logo">ROULOTTE<span>PRO</span></a>
    <div>
      <a href="/admin" style="color:var(--text);text-decoration:none;font-size:0.9rem">Area Riservata</a>
    </div>
  </header>
  
  <div class="layout">
    <aside class="filters">
      <div class="filter-group">
        <div class="filter-title">Marca</div>
        ${brands.map(b => `<label class="filter-opt"><input type="checkbox" value="${b}" onchange="filterGrid()"> ${b}</label>`).join('')}
      </div>
      <div class="filter-group">
        <div class="filter-title">Prezzo Max</div>
        <input type="range" id="priceRange" min="0" max="100000" step="1000" style="width:100%" oninput="document.getElementById('priceVal').textContent='€ '+Number(this.value).toLocaleString(); filterGrid()">
        <div id="priceVal" style="font-size:0.9rem;margin-top:0.5rem;color:var(--text-light)">Tutti</div>
      </div>
    </aside>
    
    <main class="grid" id="productGrid">
      ${cards || '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light)">Nessun veicolo disponibile al momento.</div>'}
    </main>
  </div>

  <script>
    function filterGrid() {
      const brands = Array.from(document.querySelectorAll('.filters input[type=checkbox]:checked')).map(cb => cb.value);
      const maxPrice = document.getElementById('priceRange').value > 0 ? Number(document.getElementById('priceRange').value) : Infinity;
      
      document.querySelectorAll('.product-card').forEach(card => {
        const brand = card.dataset.brand;
        const price = Number(card.dataset.price);
        
        const brandMatch = brands.length === 0 || brands.includes(brand);
        const priceMatch = maxPrice === 0 || maxPrice === Infinity || price <= maxPrice;
        
        card.style.display = (brandMatch && priceMatch) ? 'flex' : 'none';
      });
    }
  </script>
</body>
</html>`;
  res.type("html").send(html);
});

export default router;
