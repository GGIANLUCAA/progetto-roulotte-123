import { Router } from "express";
import { issueToken } from "../middleware/auth.js";
import { findByEmail } from "../services/userStorage.js";
import bcrypt from "bcryptjs";

const router = Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email e password richiesti" });

  const user = findByEmail(email);
  if (!user) return res.status(401).json({ error: "Credenziali non valide" });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: "Credenziali non valide" });

  const token = issueToken({ sub: user.email, role: user.role, id: user.id, name: user.name });
  res.json({ token, role: user.role, name: user.name });
});

router.get("/profile", (req, res) => {
  // If middleware is applied, req.user will be populated
  if (!req.user) return res.status(401).json({ error: "Non autenticato" });
  res.json({ user: req.user });
});

export default router;
