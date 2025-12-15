import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/auth.js";
import roulottesRouter from "./routes/roulottes.js";
import aiRouter from "./routes/ai.js";
import pdfRouter from "./routes/pdf.js";
import shareRouter from "./routes/share.js";
import vetrinaRouter from "./routes/vetrina.js";
import dashboardRouter from "./routes/dashboard.js";
import imagesRouter from "./routes/images.js";
import adminRouter from "./routes/admin.js";
import catalogoRouter from "./routes/catalogo.js";
import { authMiddleware, requireAuth } from "./middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use("/public/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use("/public/pdfs", express.static(path.join(process.cwd(), "server", "public", "pdfs")));
app.use("/public/images", imagesRouter);

// Apply auth middleware globally (populates req.user if token valid)
app.use(authMiddleware);

app.use("/api/auth", authRouter);
app.use("/api/roulottes", requireAuth, roulottesRouter);
app.use("/api/ai", requireAuth, aiRouter);
app.use("/api/pdf", requireAuth, pdfRouter);
app.use("/api/share", shareRouter); // Share links usually public
app.use("/api/dashboard", requireAuth, dashboardRouter);
app.use("/api/admin", requireAuth, adminRouter);
app.use("/vetrina", vetrinaRouter);
app.use("/catalogo", catalogoRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Errore interno del server';
  res.status(status).json({ error: message, timestamp: new Date() });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {});
