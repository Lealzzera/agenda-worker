import { prisma } from "@/db/prisma";
import { env } from "@/env";
import { IUserRepository } from "@/modules/user/repositories/user-repository.interface";
import { createHash, randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { IPasswordResetTokenRepository } from "./repositories/password-reset-token-repository.interface";

type RequestPasswordResetServiceRequest = {
  email: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export class RequestPasswordResetService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
  ) {}

  async exec({ email }: RequestPasswordResetServiceRequest): Promise<void> {
    const user = await this.userRepository.findByEmail(prisma, email);

    if (!user) {
      return;
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await this.passwordResetTokenRepository.deleteUnusedByUserId(
      prisma,
      user.id,
    );
    await this.passwordResetTokenRepository.create(prisma, {
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS,
            }
          : undefined,
    });

    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: user.email,
      subject: "Redefinição de senha (Não responda)",
      text: `Acesse este link para redefinir sua senha blinki: ${resetUrl}`,
      html: `
        <h1>Redefinir senha</h1>
        <p>Recebemos uma solicitação para redefinir sua senha do sistema blinki.</p>
        <p>Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
        <p>Para redefinir sua senha, clique no link abaixo:</p>
        <p>Este link expira em 30 minutos.</p>
        <a href="${resetUrl}">Redefinir minha senha</a>
      `,
    });
  }
}
