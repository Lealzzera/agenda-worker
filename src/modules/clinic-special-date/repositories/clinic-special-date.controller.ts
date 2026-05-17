import { BadRequestError } from "@/errors/bad-request.error";
import { NotFoundError } from "@/errors/not-found.error";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import makeCreateSpecialDateServiceFactory from "./factories/make-create-special-date-service.factory";

export async function createSpecialDateController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const createSpecialDateBodySchema = z.object({
    clinicId: z.string(),
    isOpen: z.boolean(),
    note: z.string().optional(),
    specialDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Invalid day format. Expected YYYY-MM-DD.",
    }),
    periods: z.array(
      z.object({
        startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, {
          message: "Invalid time format. Expected HH:MM or HH:MM:SS.",
        }),
        endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, {
          message: "Invalid time format. Expected HH:MM or HH:MM:SS.",
        }),
      }),
    ),
  });

  const { clinicId, specialDate, isOpen, periods, note } =
    createSpecialDateBodySchema.parse(req.body);
  try {
    const clinicSpecialDateService = makeCreateSpecialDateServiceFactory();
    await clinicSpecialDateService.exec({
      clinicId,
      specialDate,
      isOpen,
      periods,
      note,
    });

    return res.status(201).send({
      success: true,
      message: "Special date created successfully.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).send({
        success: false,
        message: "Validation error.",
        errors: err.flatten(),
      });
    }

    if (err instanceof BadRequestError || err instanceof NotFoundError) {
      return res.status(err.statusCode).send({
        success: false,
        message: err.message,
      });
    }

    console.error(err);

    return res.status(500).send({
      success: false,
      message: "Internal server error.",
    });
  }
}
