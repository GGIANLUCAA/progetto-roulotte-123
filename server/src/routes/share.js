import { Router } from "express";

const router = Router();

router.post("/:id", (req, res) => {
  const base = process.env.PUBLIC_BASE_URL || "http://localhost:3000";
  const url = `${base}/vetrina/${req.params.id}`;
  res.json({ url });
});

export default router;
