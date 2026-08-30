import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { FastifyReply, FastifyRequest } from "fastify";
import { GetMyClinicService } from "./get-my-clinic.service";
import { ClinicRepository } from "./repositories/clinic-repository";
import { UserRepository } from "../user/repositories/user-respository";
import { ClinicMemberRepository } from "../clinic-member/repositories/clinic-member-repository";

export async function getMyClinicController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const userId = req.user.sub;
  const { clinicId } = req.params as { clinicId: string };
  const clinicRepository = new ClinicRepository();
  const userRepository = new UserRepository();
  const clinicMemberRepository = new ClinicMemberRepository();
  const getMyClinicService = new GetMyClinicService(
    clinicMemberRepository,
    userRepository,
    clinicRepository,
  );

  const member = await getMyClinicService.exec(userId);

  if (!member) {
    throw new NotFoundError("No active clinic found for this user.");
  }

  return res.send({
    clinicId: member.clinicId,
    clinic: member.clinic,
    role: member.role,
    globalUserRole: member.globalUserRole,
  });
}
