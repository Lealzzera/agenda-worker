import { prisma } from "@/db/prisma";
import { IUserRepository } from "../user/repositories/user-repository.interface";
import nodemailer from 'nodemailer'

export class SendEmailService {
    constructor(private readonly userRepository: IUserRepository) {}

    async exec(email: string) {
        const doesEmailExist = await this.userRepository.findByEmail(prisma, email) 

        if(!doesEmailExist) {
            return;
        }
        
        const testAccount = await nodemailer.createTestAccount()

        const transporter =  nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        })

        const info = await transporter.sendMail({
            from: 'MEU APP NO REPLY <no-reply@meuapp.com>',
            to: email,
            subject: 'Teste de email',
            text: 'Teste de email',
            html: `
                  <h1>Redefinir senha</h1>
      <p>Clique no link abaixo:</p>
      <a href="http://localhost:3000/reset-password?token=abc123">
        Redefinir minha senha
      </a>`
        })
    }
}