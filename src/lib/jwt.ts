import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../env";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: "ADMIN" | "USER";
  jti: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

const activeAccessTokenJtiByUser = new Map<string, string>();
const activeRefreshTokenJtiByUser = new Map<string, string>();

type SignAccessTokenPayload = Omit<AccessTokenPayload, "jti">;
type SignRefreshTokenPayload = Omit<RefreshTokenPayload, "jti">;

export function signAccessToken(payload: SignAccessTokenPayload) {
  const tokenId = randomUUID();
  activeAccessTokenJtiByUser.set(payload.sub, tokenId);

  return jwt.sign({ ...payload, jti: tokenId }, env.JWT_SECRET, {
    expiresIn: "15min",
  });
}

export function signRefreshToken(payload: SignRefreshTokenPayload) {
  const tokenId = randomUUID();
  activeRefreshTokenJtiByUser.set(payload.sub, tokenId);

  return jwt.sign({ ...payload, jti: tokenId }, env.JWT_SECRET, {
    expiresIn: "14d",
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as RefreshTokenPayload;
}

export function verifyActiveAccessToken(token: string) {
  const payload = verifyAccessToken(token);
  const activeTokenId = activeAccessTokenJtiByUser.get(payload.sub);

  if (!activeTokenId || activeTokenId !== payload.jti) {
    throw new Error("Inactive access token");
  }

  return payload;
}

export function verifyActiveRefreshToken(token: string) {
  const payload = verifyRefreshToken(token);
  const activeTokenId = activeRefreshTokenJtiByUser.get(payload.sub);

  if (!activeTokenId || activeTokenId !== payload.jti) {
    throw new Error("Inactive refresh token");
  }

  return payload;
}
