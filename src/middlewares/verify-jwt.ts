import { FastifyReply, FastifyRequest } from "fastify";
import { verifyAccessToken } from "../lib/jwt";

export async function verifyJwt(req: FastifyRequest, res: FastifyReply) {
    try {
        const authHeader = req.headers.authorization;
        
        if(!authHeader) {
            return res.status(401).send({message: 'Unauthorized'})
        }

        const [scheme, token] = authHeader.split(' ')

        if(scheme !== 'Bearer') {
            return res.status(401).send({message: "Unauthorized"})
        }

        if(!token) {
            return res.status(401).send({message: 'Unauthorized'})
        }

        const payload = verifyAccessToken(token)

        req.user = {
            sub: payload.sub,
            role: payload.role
        }
    } catch {
        return res.status(401).send({message: 'Invalid or expired token'})
    }
}