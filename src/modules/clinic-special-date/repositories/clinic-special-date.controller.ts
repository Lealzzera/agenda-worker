import { BadRequestError } from "@/errors/bad-request.error";
import { NotFoundError } from "@/errors/not-found.error";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import makeCreateSpecialDateServiceFactory from "./factories/make-create-special-date-service.factory";
import makeDeleteSpecialDateServiceFactory from "./factories/make-delete-special-date-service.factory";
import makeListSpecialDateServiceFactory from "./factories/make-list-special-date-service.factory";
import makeUpdateSpecialDateServiceFactory from "./factories/make-update-special-date-service.factory";

const periodsSchema = z
  .array(
    z.object({
      startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, {
        message: "Invalid time format. Expected HH:MM or HH:MM:SS.",
      }),
      endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, {
        message: "Invalid time format. Expected HH:MM or HH:MM:SS.",
      }),
    }),
  )
  .optional();

const specialDateRouteParamsSchema = z.object({
  clinicId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid day format. Expected YYYY-MM-DD.",
  }),
});

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
    periods: periodsSchema,
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
    return handleSpecialDateError(err, res);
  }
}

export async function listSpecialDateController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const listSpecialDateParamsSchema = z.object({
    clinicId: z.string(),
  });

  const { clinicId } = listSpecialDateParamsSchema.parse(req.params);

  try {
    const listSpecialDateService = makeListSpecialDateServiceFactory();
    const { specialDates } = await listSpecialDateService.exec({ clinicId });

    return res.status(200).send({
      success: true,
      specialDates,
    });
  } catch (err) {
    return handleSpecialDateError(err, res);
  }
}

export async function updateSpecialDateController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const updateSpecialDateBodySchema = z.object({
    isOpen: z.boolean(),
    note: z.string().optional(),
    periods: periodsSchema,
  });

  const { clinicId, date } = specialDateRouteParamsSchema.parse(req.params);
  const { isOpen, note, periods } = updateSpecialDateBodySchema.parse(req.body);

  try {
    const updateSpecialDateService = makeUpdateSpecialDateServiceFactory();
    await updateSpecialDateService.exec({
      clinicId,
      specialDate: date,
      isOpen,
      note,
      periods,
    });

    return res.status(200).send({
      success: true,
      message: "Special date updated successfully.",
    });
  } catch (err) {
    return handleSpecialDateError(err, res);
  }
}

export async function deleteSpecialDateController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const { clinicId, date } = specialDateRouteParamsSchema.parse(req.params);

  try {
    const deleteSpecialDateService = makeDeleteSpecialDateServiceFactory();
    await deleteSpecialDateService.exec({
      clinicId,
      specialDate: date,
    });

    return res.status(200).send({
      success: true,
      message: "Special date deleted successfully.",
    });
  } catch (err) {
    return handleSpecialDateError(err, res);
  }
}

function handleSpecialDateError(err: unknown, res: FastifyReply) {
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
