import jwt from "jsonwebtoken";

function requireSecret(name: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function signAccessToken(userId: string) {
  return jwt.sign({ userId }, requireSecret("JWT_ACCESS_SECRET"), { expiresIn: "15m" });
}
export function signRefreshToken(userId: string) {
  return jwt.sign({ userId }, requireSecret("JWT_REFRESH_SECRET"), { expiresIn: "7d" });
}
export function verifyAccessToken(token: string) {
  return jwt.verify(token, requireSecret("JWT_ACCESS_SECRET")) as { userId: string };
}
export function verifyRefreshToken(token: string) {
  return jwt.verify(token, requireSecret("JWT_REFRESH_SECRET")) as { userId: string };
}
