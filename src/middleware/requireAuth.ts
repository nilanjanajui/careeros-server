import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ error: "unauthenticated" });
  try {
    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ error: "unauthenticated" });
    const payload = verifyAccessToken(token);
    (req as any).userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "invalid or expired token" });
  }
}
