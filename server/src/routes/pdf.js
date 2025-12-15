import { Router } from "express";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import sizeOf from "image-size";
import { get } from "../storage.js";

const router = Router();

router.post("/generate/:id", (req, res) => {
  const item = get(req.params.id);
  if (!item) return res.status(404).json({ error: "not_found" });

  const outDir = path.join(process.cwd(), "server", "public", "pdfs");
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${req.params.id}.pdf`);
  
  // Create PDF with margins
  const doc = new PDFDocument({ autoFirstPage: true, margin: 40 });
  const stream = fs.createWriteStream(file);
  doc.pipe(stream);

  // Helper: Extract data safely
  const d = item.dettagli || {};
  const ig = d.info_generali || {};
  const sg = d.stato_generale || {};
  const pc = d.prezzo_condizioni || {};
  const dim = item.dimensioni || d.dimensioni || {};
  const peso = item.peso || d.peso || {};

  // --- HEADER ---
  doc.fillColor('#e11d48').fontSize(24).font('Helvetica-Bold').text('ROULOTTE PRO', { align: 'center' });
  doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('www.roulotte.pro - info@roulotte.pro', { align: 'center' });
  doc.moveDown(1.5);

  // --- TITLE & HERO ---
  doc.fillColor('#0f172a').fontSize(20).font('Helvetica-Bold').text(`${item.marca} ${item.modello}`, { align: 'left' });
  doc.fontSize(14).font('Helvetica').fillColor('#64748b').text(`Anno: ${item.anno} · ${ig.condizioni_veicolo || "Usato"}`, { align: 'left' });
  doc.moveDown();

  // Draw main image if available
  const mainPhoto = (item.foto || []).find(f => f.url && f.url.startsWith("/public/uploads/"));
  if (mainPhoto) {
    try {
      const p = path.join(process.cwd(), "server", mainPhoto.url.replace("/public/", ""));
      if (fs.existsSync(p)) {
        doc.image(p, { width: 500, align: 'center' });
        doc.moveDown();
      }
    } catch (e) { console.error("PDF Image Error", e); }
  }

  // --- TECH SPECS GRID ---
  doc.moveDown();
  const startY = doc.y;
  
  // Left Column: Technical
  doc.fontSize(12).fillColor('#0f172a').font('Helvetica-Bold').text('DATI TECNICI', 40, startY);
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  doc.text(`Posti letto: ${ig.posti_letto || item.posti_letto || '-'}`);
  doc.text(`Lunghezza: ${dim.lunghezza || '-'} m`);
  doc.text(`Larghezza: ${dim.larghezza || '-'} m`);
  doc.text(`Peso Max: ${peso.massimo || '-'} kg`);
  doc.text(`Telaio: ${ig.numero_telaio || '-'}`);

  // Right Column: Commercial
  doc.fontSize(12).fillColor('#0f172a').font('Helvetica-Bold').text('OFFERTA', 300, startY);
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#334155');
  
  const prezzo = pc.prezzo_richiesto || item.prezzo_consigliato || 0;
  const listino = pc.prezzo_listino;
  
  if (listino) {
    doc.fillColor('#64748b').text(`Listino: € ${listino.toLocaleString('it-IT')}`, 300, doc.y, { strike: true });
  }
  
  doc.fontSize(16).fillColor('#e11d48').font('Helvetica-Bold').text(`€ ${prezzo.toLocaleString('it-IT')}`, 300, doc.y + 5);
  
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#334155').font('Helvetica');
  if (ig.garanzia_mesi) doc.text(`Garanzia: ${ig.garanzia_mesi} Mesi`, 300);
  if (pc.trattabile) doc.text('Prezzo Trattabile', 300);
  doc.text(pc.trasporto ? 'Possibilità Trasporto' : 'Ritiro in sede', 300);

  // Reset Y for next section
  doc.y = Math.max(doc.y, startY + 120);
  doc.moveDown();

  // --- DETAILS SECTIONS ---
  
  // Accessori
  if (item.accessori && item.accessori.length) {
    doc.fontSize(12).fillColor('#0f172a').font('Helvetica-Bold').text('ACCESSORI E DOTAZIONI');
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text(item.accessori.join(", "), { width: 500 });
    doc.moveDown();
  }

  // Descrizione
  const desc = item.dettagli?.descrizione_testo || "";
  if (desc) {
    doc.fontSize(12).fillColor('#0f172a').font('Helvetica-Bold').text('DESCRIZIONE');
    doc.fontSize(10).font('Helvetica').fillColor('#334155').text(desc, { width: 500 });
    doc.moveDown();
  }

  // Difetti/Stato
  if (item.difetti && item.difetti.length) {
    doc.fontSize(12).fillColor('#b91c1c').font('Helvetica-Bold').text('NOTE SULLO STATO');
    doc.fontSize(10).font('Helvetica').fillColor('#b91c1c').text(item.difetti.join(", "), { width: 500 });
    doc.moveDown();
  }

  // --- FOOTER ---
  const bottomY = doc.page.height - 100;
  doc.y = bottomY;
  
  // QR Code Link (Text only for now)
  const baseUrl = process.env.PUBLIC_BASE_URL || "http://localhost:3000";
  const link = `${baseUrl}/vetrina/${req.params.id}`;
  
  doc.fontSize(10).fillColor('#e11d48').text('Scansiona per vedere online:', { align: 'center' });
  doc.fillColor('#2563eb').text(link, { link, align: 'center', underline: true });

  doc.end();
  stream.on("finish", () => {
    res.json({ url: `/public/pdfs/${req.params.id}.pdf` });
  });
});

router.post("/label/:id", (req, res) => {
  const item = get(req.params.id);
  if (!item) return res.status(404).json({ error: "not_found" });

  const outDir = path.join(process.cwd(), "server", "public", "labels");
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${req.params.id}.pdf`);
  
  // Create Label PDF (A5 landscape or similar small format)
  const doc = new PDFDocument({ size: 'A5', layout: 'landscape', margin: 20 });
  const stream = fs.createWriteStream(file);
  doc.pipe(stream);

  const prezzo = item.dettagli?.prezzo_condizioni?.prezzo_richiesto || item.prezzo_consigliato || 0;
  const listino = item.dettagli?.prezzo_condizioni?.prezzo_listino;
  const garanzia = item.dettagli?.info_generali?.garanzia_mesi;
  
  // Bordo rosso
  doc.rect(10, 10, doc.page.width - 20, doc.page.height - 20).lineWidth(4).strokeColor('#e11d48').stroke();

  // Header
  doc.fillColor('#e11d48').fontSize(20).font('Helvetica-Bold').text('ROULOTTE PRO', 30, 30);
  doc.fillColor('#64748b').fontSize(12).font('Helvetica').text('Occasione Garantita', 30, 55);

  // Main Info
  doc.fillColor('#0f172a').fontSize(36).font('Helvetica-Bold').text(`${item.marca}`, 30, 100);
  doc.fontSize(28).font('Helvetica').text(`${item.modello}`, 30, 140);
  
  // Price Circle/Box
  const priceBoxX = doc.page.width - 220;
  const priceBoxY = 40;
  
  doc.circle(priceBoxX + 90, priceBoxY + 90, 80).fill('#e11d48');
  doc.fillColor('#ffffff').fontSize(14).text('PREZZO', priceBoxX, priceBoxY + 50, { width: 180, align: 'center' });
  doc.fontSize(32).font('Helvetica-Bold').text(`€${prezzo.toLocaleString('it-IT')}`, priceBoxX, priceBoxY + 75, { width: 180, align: 'center' });
  
  if (listino) {
    doc.fontSize(12).text(`Listino €${listino.toLocaleString('it-IT')}`, priceBoxX, priceBoxY + 115, { width: 180, align: 'center', strike: true });
  }

  // Key Features Bottom
  const bottomY = doc.page.height - 120;
  doc.fillColor('#0f172a').fontSize(16).font('Helvetica');
  doc.text(`Anno: ${item.anno}`, 30, bottomY);
  doc.text(`Posti: ${item.dettagli?.info_generali?.posti_letto || item.posti_letto || '-'}`, 180, bottomY);
  
  if (garanzia) {
    doc.fillColor('#059669').font('Helvetica-Bold').text(`GARANZIA ${garanzia} MESI`, 30, bottomY + 30);
  }

  // QR Placeholder text
  const baseUrl = process.env.PUBLIC_BASE_URL || "http://localhost:3000";
  const link = `${baseUrl}/vetrina/${req.params.id}`;
  doc.fillColor('#64748b').fontSize(10).font('Helvetica').text(link, 30, bottomY + 60);

  doc.end();
  stream.on("finish", () => {
    res.json({ url: `/public/labels/${req.params.id}.pdf` });
  });
});

export default router;