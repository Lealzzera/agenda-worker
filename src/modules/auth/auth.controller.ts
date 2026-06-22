import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import makeAuthServiceFactory from "./factories/make-auth-service.factory";
import makeRefreshTokenServiceFactory from "./factories/make-refresh-token-service.factory";
import makeRequestPasswordResetServiceFactory from "./factories/make-request-password-reset-service.factory";
import makeResetPasswordServiceFactory from "./factories/make-reset-password-service.factory";

export async function loginController(req: FastifyRequest, res: FastifyReply) {
  const bodySchema = z.object({
    email: z.email(),
    password: z.string(),
  });

  const { email, password } = bodySchema.parse(req.body);

  const authService = makeAuthServiceFactory();

  const { accessToken, refreshToken } = await authService.exec({
    email,
    password,
  });

  res.setCookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).send({
    access_token: accessToken,
  });
}

export async function refreshTokenController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const refreshTokenFromCookie = req.cookies.refresh_token;

    if (!refreshTokenFromCookie) {
      return res.status(401).send({ message: "Refresh token not found" });
    }

    const refreshTokenService = makeRefreshTokenServiceFactory();
    const { refreshToken, accessToken } = await refreshTokenService.exec(
      refreshTokenFromCookie,
    );

    res.setCookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).send({
      access_token: accessToken,
    });
  } catch (error) {
    return res.status(401).send({ message: "Invalid refresh token" });
  }
}

export async function requestPasswordResetController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const bodySchema = z.object({
    email: z.email(),
  });

  const { email } = bodySchema.parse(req.body);
  const requestPasswordResetService = makeRequestPasswordResetServiceFactory();

  await requestPasswordResetService.exec({ email });

  return res.status(200).send({
    message:
      "If this email exists, password reset instructions will be sent shortly.",
  });
}

export async function resetPasswordController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const bodySchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8),
  });

  const { token, password } = bodySchema.parse(req.body);
  const resetPasswordService = makeResetPasswordServiceFactory();

  await resetPasswordService.exec({ token, password });

  return res.status(200).send({
    message: "Password reset successfully.",
  });
}
