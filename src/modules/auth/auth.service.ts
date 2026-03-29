import { compare } from "bcrypt";
import { IUserRepository } from "../user/repositories/user-repository.interface";
import { signAccessToken, signRefreshToken } from "../../lib/jwt";
import { UnauthorizedError } from "../../errors/unauthorized.error";

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
        const doesUserExist = await this.userRepository.findByEmail(email)
        
        if(!doesUserExist) {
            throw new UnauthorizedError('Invalid user credentials')
        }

        const isPasswordValid = await compare(password, doesUserExist.password_hash)

        if(!isPasswordValid) {
            throw new UnauthorizedError('Invalid user credentials')
        }

        const accessToken = signAccessToken({sub: doesUserExist.id, role: doesUserExist.role})
        const refreshToken = signRefreshToken({sub: doesUserExist.id})

        return {
            accessToken,
            refreshToken
        }
    }
}