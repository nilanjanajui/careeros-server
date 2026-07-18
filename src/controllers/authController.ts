import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "name, email, password are required" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "password must be at least 8 characters" });
  }
  const existing = await User.findOne({ email });
  if (existing)
    return res.status(409).json({ error: "email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    authProvider: "local",
  });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ accessToken, user: sanitize(user) });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "invalid credentials" });
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: "invalid credentials" });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken, user: sanitize(user) });
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function sanitize(user: any) {
  const { passwordHash, ...safe } = user.toObject();
  return safe;
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refreshToken; // this only works because of Step 1 (cookie-parser)
  if (!token) return res.status(401).json({ error: "no refresh token" });

  try {
    const payload = verifyRefreshToken(token);
    const newAccessToken = signAccessToken(payload.userId);
    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ error: "invalid or expired refresh token" });
  }
}

export function logout(req: Request, res: Response) {
  res.clearCookie("refreshToken");
  res.json({ message: "logged out" });
}
