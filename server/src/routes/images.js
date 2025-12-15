import { Router } from "express";
import { streamObject } from "../services/s3.js";

const router = Router();

router.get("/:key*", async (req, res) => {
  const key = req.params.key + (req.params[0] || "");
  const ok = await streamObject(key, res);
  if (!ok) res.status(404).send("Not found");
});

export default router;
