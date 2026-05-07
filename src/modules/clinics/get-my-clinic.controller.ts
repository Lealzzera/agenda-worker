import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function getMyClinicController(req: FastifyRequest, res: FastifyReply) {
  const userId = req.user.sub;

  const member = await prisma.clinicMember.findFirst({
    where: { user_id: userId, status: "ACTIVE" },
    include: { clinic: true },
  });

  if (!member) {
    throw new NotFoundError("No active clinic found for this user.");
  }

  return res.send({
    clinicId: member.clinic_id,
    clinic: member.clinic,
    role: member.role,
  });
}
