import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import makeCheckUserEmailServiceFactory from "./factories/make-check-user-email-service.factory";
import makeRegisterUserServiceFactory from "./factories/make-regiser-user-service-factory";

export async function registerUserController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const registerUserBodySchema = z.object({
    fullName: z.string(),
    email: z.email(),
    password: z.string().min(6),
    clinicId: z.uuid(),
    pictureUrl: z.url().optional(),
    userRole: z.enum(["ADMIN", "OWNER", "MEMBER"]),
  });

  const { clinicId, email, fullName, password, pictureUrl, userRole } =
    registerUserBodySchema.parse(req.body);

  const registerUserService = makeRegisterUserServiceFactory();
  const user = await registerUserService.exec({
    clinicId,
    email,
    fullName,
    password,
    pictureUrl,
    userRole,
  });

  return res.status(201).send({ user });
}

export async function checkUserEmailController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const checkUserEmailQuerySchema = z.object({
    email: z.email(),
  });

  const { email } = checkUserEmailQuerySchema.parse(req.query);

  if (!email) {
    return res.status(400).send({ error: "Email is required" });
  }

  try {
    const checkUserEmailService = makeCheckUserEmailServiceFactory();
    const { exists } = await checkUserEmailService.exec(email);
    return res.status(200).send({ exists });
  } catch (error) {
    return res.status(500).send({ error: "Internal server error" });
  }
}
