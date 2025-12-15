import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "dev-secret";

export function authMiddleware(req, res, next) {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;
  
  if (!t) {
    req.user = null;
    return next();
  }

  try {
    const p = jwt.verify(t, secret);
    req.user = p;
    next();
  } catch {
    req.user = null;
    next();
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Autenticazione richiesta" });
  next();
}

export function issueToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function requireRole(role) {
  return function(req, res, next) {
    if (!req.user) return res.status(401).json({ error: "Autenticazione richiesta" });
    
    const r = req.user.role;
    
    if (Array.isArray(role)) {
      if (!role.includes(r)) return res.status(403).json({ error: "Accesso negato" });
    } else {
      if (r !== role) return res.status(403).json({ error: "Accesso negato" });
    }
    next();
  };
}
