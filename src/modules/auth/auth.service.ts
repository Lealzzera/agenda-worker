import { compare } from "bcrypt";
import { IUserRepository } from "@/modules/user/repositories/user-repository.interface";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { UnauthorizedError } from "@/errors/unauthorized.error";
import { prisma } from "@/db/prisma";

interface AuthServiceRequest {
    email: string;
    password: string;
}

interface AuthServiceResponse {
    accessToken: string
    refreshToken: string
}

export class AuthService {
    constructor(private readonly userRepository: IUserRepository) {}

    async exec({email, password}: AuthServiceRequest): Promise<AuthServiceResponse> {
        const user = await this.userRepository.findByEmail(prisma, email)

        if(!user) {
            throw new UnauthorizedError('Invalid user credentials')
        }

        const isPasswordValid = await compare(password, user.password_hash)

        if(!isPasswordValid) {
            throw new UnauthorizedError('Invalid user credentials')
        }

        const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role })
        const refreshToken = signRefreshToken({ sub: user.id })

        return { accessToken, refreshToken }
    }
}
