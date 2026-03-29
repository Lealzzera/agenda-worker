import { FastifyReply, FastifyRequest } from "fastify";

export async function verifyAdmin(req: FastifyRequest, res: FastifyReply) {
    if(req.user.role !== 'ADMIN') {
        return res.status(403).send({message: 'Forbidden'})
    }
}