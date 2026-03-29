import { FastifyReply, FastifyRequest } from "fastify";
import { makeCreateClinicService } from "./factories/makeCreateClinicService";
import { z } from "zod";

export async function registerClinicController(req: FastifyRequest, res: FastifyReply) {
 const registerClinicSchema = z.object({
    userFullName: z.string(),
    userEmail: z.email(),
    password: z.string().min(6),

    userPictureUrl: z
        .url()
        .optional()
        .or(z.literal(""))
        .transform(val => val === "" ? undefined : val),

    clinicName: z.string(),

    cnpj: z.string().optional(),
    phone: z.string().optional(),

    clinicEmail: z
        .email()
        .optional()
        .or(z.literal(""))
        .transform(val => val === "" ? undefined : val),

    address: z.string().optional(),
    postalCode: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),

    planId: z.string(),
})

    const data = registerClinicSchema.parse(req.body);
    const {userFullName, userEmail, password, clinicName, planId} = data;
    const userPictureUrl = data.userPictureUrl || undefined;
    const cnpj = data.cnpj || undefined;
    const phone = data.phone || undefined;
    const clinicEmail = data.clinicEmail || undefined;
    const address = data.address || undefined;
    const postalCode = data.postalCode || undefined;
    const city = data.city || undefined;
    const state = data.state || undefined;
    
    const registerClinicService = makeCreateClinicService();
    await registerClinicService.exec({
        userFullName,
        userEmail,
        password,
        userPictureUrl,
        clinicName,
        cnpj,
        phone,
        clinicEmail,
        address,
        postalCode,
        city,
        state,
        planId
    });

    return res.status(201).send({message: "Clinic created successfully"})
}