import fs from 'fs/promises';
import path from 'path';

const OUTPUT_DIR = path.resolve('static_export');
const DATA_DIR = path.resolve('server/data');
const PUBLIC_DIR = path.resolve('server/public');
const UPLOADS_DIR = path.resolve('server/uploads');

// Template for Detail Page (extracted from vetrina.js)
const getDetailHtml = (i) => {
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

  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${i.marca} ${i.modello} - Roulotte Pro</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
  <header>
    <div class="container-header">
      <div class="brand">Roulotte Pro</div>
      <a href="../index.html" class="nav-link">← Torna al catalogo</a>
    </div>
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
};

// Template for Catalog Page (Home)
const getCatalogHtml = (products) => {
  const cards = products.map(x => {
    const img = (x.foto||[])[0]?.url || "";
    const prezzo = (x.dettagli?.prezzo_condizioni?.prezzo_richiesto || x.prezzo_consigliato || 0).toLocaleString('it-IT');
    return `
      <div class="card">
        <div class="img-wrap">
           <img src="${img}" alt="${x.marca} ${x.modello}" loading="lazy">
           ${x.stato_generale === 'nuovo' ? '<span class="badge-new">Nuovo</span>' : ''}
        </div>
        <div class="card-body">
          <div class="card-meta">${x.anno} · ${x.stato_generale}</div>
          <h3 class="card-title">${x.marca} ${x.modello}</h3>
          <div class="card-price">€ ${prezzo}</div>
          <a href="dettagli/${x.id}.html" class="btn-details">Vedi dettagli</a>
        </div>
      </div>
    `;
  }).join('');

  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Roulotte Pro - Catalogo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  <header>
    <div class="container-header">
      <div class="brand">Roulotte Pro</div>
    </div>
  </header>

  <main class="container">
    <div class="hero">
       <h1>Trova la tua prossima Roulotte</h1>
       <p>Catalogo completo di roulotte nuove e usate, garantite e pronte per partire.</p>
    </div>

    <div class="catalog-grid">
      ${cards}
    </div>
  </main>
</body>
</html>`;
};

const getCss = () => `
:root {
  --primary: #e11d48;
  --bg: #f8fafc;
  --text: #0f172a;
  --text-light: #64748b;
  --border: #e2e8f0;
  --card: #ffffff;
}
body { font-family: 'Inter', sans-serif; margin: 0; background: var(--bg); color: var(--text); line-height: 1.6; }
header { background: #fff; border-bottom: 1px solid var(--border); padding: 1rem 0; }
.container-header { max-width: 1200px; margin: 0 auto; padding: 0 1rem; display: flex; justify-content: space-between; align-items: center; }
.brand { font-weight: 700; font-size: 1.25rem; letter-spacing: -0.5px; }
.nav-link { color: var(--text); text-decoration: none; font-weight: 500; }
.container { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }

/* Grid & Cards */
.catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
.card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.img-wrap { height: 220px; position: relative; background: #f1f5f9; }
.img-wrap img { width: 100%; height: 100%; object-fit: cover; }
.card-body { padding: 1.25rem; }
.card-meta { font-size: 0.85rem; color: var(--text-light); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
.card-title { margin: 0.5rem 0; font-size: 1.25rem; font-weight: 700; }
.card-price { font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-bottom: 1rem; }
.btn-details { display: block; text-align: center; background: var(--bg); color: var(--text); padding: 0.75rem; border-radius: 8px; text-decoration: none; font-weight: 600; transition: background 0.2s; }
.btn-details:hover { background: #e2e8f0; }

/* Detail Page Styles */
.left-col { width: 100%; }
.right-col { width: 100%; }
.gallery-main { width: 100%; aspect-ratio: 16/9; background: #eee; border-radius: 12px; overflow: hidden; margin-bottom: 1rem; }
.gallery-main img { width: 100%; height: 100%; object-fit: contain; background: #000; }
.gallery-thumbs { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
.thumb { width: 80px; height: 60px; border-radius: 6px; overflow: hidden; cursor: pointer; border: 2px solid transparent; flex-shrink: 0; }
.thumb:hover { border-color: var(--primary); }
.thumb img { width: 100%; height: 100%; object-fit: cover; }
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
.cta-btn { display: block; width: 100%; background: var(--text); color: #fff; text-align: center; padding: 1rem; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 1.1rem; transition: background 0.2s; margin-top: 1rem; }
.cta-btn:hover { background: var(--primary); }

@media (min-width: 768px) {
  .container { display: grid; grid-template-columns: 1.4fr 1fr; gap: 3rem; }
}
@media (max-width: 767px) {
  .container { display: block; }
  .right-col { margin-top: 2rem; }
}
`;

async function main() {
  console.log('🚀 Starting static site generation...');

  // 1. Load Data
  try {
    const rawData = await fs.readFile(path.join(DATA_DIR, 'roulottes.json'), 'utf8');
    const allProducts = JSON.parse(rawData);
    // Filter public products
    const products = allProducts.filter(p => p.pubblico);
    console.log(`📦 Loaded ${products.length} public products from ${allProducts.length} total.`);

    // 2. Prepare Directories
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.mkdir(path.join(OUTPUT_DIR, 'dettagli'), { recursive: true });
    await fs.mkdir(path.join(OUTPUT_DIR, 'assets', 'css'), { recursive: true });
    await fs.mkdir(path.join(OUTPUT_DIR, 'assets', 'js'), { recursive: true });
    await fs.mkdir(path.join(OUTPUT_DIR, 'public', 'uploads'), { recursive: true });
    await fs.mkdir(path.join(OUTPUT_DIR, 'public', 'images'), { recursive: true });

    // 3. Generate CSS
    await fs.writeFile(path.join(OUTPUT_DIR, 'assets', 'css', 'style.css'), getCss());
    console.log('🎨 CSS generated.');

    // 4. Generate Catalog Page (Index)
    const indexHtml = getCatalogHtml(products);
    await fs.writeFile(path.join(OUTPUT_DIR, 'index.html'), indexHtml);
    console.log('🏠 Index page generated.');

    // 5. Generate Detail Pages
    for (const p of products) {
      const html = getDetailHtml(p);
      await fs.writeFile(path.join(OUTPUT_DIR, 'dettagli', `${p.id}.html`), html);
    }
    console.log(`📄 Generated ${products.length} detail pages.`);

    // 6. Copy Assets (Images)
    // We need to copy images referenced in products
    // Note: In a real scenario, we might only copy used images to save space.
    // For now, we will try to copy the files if they exist locally.
    console.log('🖼️  Copying assets...');
    
    // Copy uploads folder recursively if it exists
    try {
        const copyDir = async (src, dest) => {
            const entries = await fs.readdir(src, { withFileTypes: true });
            await fs.mkdir(dest, { recursive: true });
            for (let entry of entries) {
                const srcPath = path.join(src, entry.name);
                const destPath = path.join(dest, entry.name);
                if (entry.isDirectory()) {
                    await copyDir(srcPath, destPath);
                } else {
                    await fs.copyFile(srcPath, destPath);
                }
            }
        };
        // Copy server/uploads to static_export/public/uploads
        // Because the URLs in DB are like /public/uploads/filename
        await copyDir(UPLOADS_DIR, path.join(OUTPUT_DIR, 'public', 'uploads'));
        console.log('✅ Uploads copied.');
    } catch (e) {
        console.warn('⚠️  Could not copy uploads directory (maybe empty or permission issue):', e.message);
    }

    console.log('✨ Static export completed successfully!');

  } catch (err) {
    console.error('❌ Error during build:', err);
    process.exit(1);
  }
}

main();
