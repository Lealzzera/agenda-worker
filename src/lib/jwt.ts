import jwt from "jsonwebtoken";
import { env } from "../env";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: "ADMIN" | "USER";
}

export interface RefreshTokenPayload {
  sub: string;
}

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "15min",
  });
}

export function signRefreshToken(payload: RefreshTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "14d",
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as RefreshTokenPayload;
}
