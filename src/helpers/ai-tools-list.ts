import { prisma } from "@/db/prisma";
import { makeCreateAppointmentServiceFactory } from "@/modules/appointments/factories/make-create-appointment-service.factory";
import makeCreateWhatsappConversation from "@/modules/whatsapp-conversations/factories/make-create-whatsapp-conversation.factory";
import makeFindWhatsappConversationFactory from "@/modules/whatsapp-conversations/factories/make-find-whatsapp-conversation.factory";
import makeUpdateWhatsappConversationFactory from "@/modules/whatsapp-conversations/factories/make-update-whatsapp-conversation.factory";
import { WEEKDAY_BY_INDEX } from "@/types/types";
import { AppointmentStatus } from "@prisma/client";

type ToolResult = Record<string, unknown>;

export const aiToolsList = [
  {
    type: "function",
    name: "check_appointment",
    description:
      "Verifica se a data e horario desejados podem receber um novo agendamento antes de criar a consulta.",
    parameters: {
      type: "object",
      properties: {
        clinicId: { type: "string" },
        customerPhoneNumber: {
          type: "string",
          description: "Telefone somente com digitos, incluindo DDI e DDD.",
        },
        appointmentDate: {
          type: "string",
          description: "Data no formato YYYY-MM-DD.",
        },
        time: {
          type: "string",
          description: "Horario no formato HH:MM.",
        },
      },
      required: ["clinicId", "customerPhoneNumber", "appointmentDate", "time"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "create_appointment",
    description:
      "Cria um agendamento apos check_appointment confirmar que o agendamento pode ser criado.",
    parameters: {
      type: "object",
      properties: {
        clinicId: { type: "string" },
        customerName: { type: "string" },
        customerPhoneNumber: {
          type: "string",
          description: "Telefone somente com digitos, incluindo DDI e DDD.",
        },
        appointmentDate: {
          type: "string",
          description: "Data no formato YYYY-MM-DD.",
        },
        time: {
          type: "string",
          description: "Horario no formato HH:MM.",
        },
        notes: { type: "string" },
      },
      required: [
        "clinicId",
        "customerName",
        "customerPhoneNumber",
        "appointmentDate",
        "time",
        "notes",
      ],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "cancel_appointment",
    description:
      "Cancela uma consulta existente apos pedido claro do paciente ou confirmacao de troca de agendamento.",
    parameters: {
      type: "object",
      properties: {
        clinicId: { type: "string" },
        appointmentId: {
          type: "string",
          description:
            "Identificador interno retornado por check_appointment em existingAppointment.internalAppointmentId. Use string vazia quando nao houver identificador.",
        },
        customerPhoneNumber: {
          type: "string",
          description: "Telefone somente com digitos, incluindo DDI e DDD.",
        },
        cancellationReason: { type: "string" },
      },
      required: [
        "clinicId",
        "appointmentId",
        "customerPhoneNumber",
        "cancellationReason",
      ],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "handoff_to_human",
    description:
      "Desliga a IA nesta conversa quando o paciente pedir para falar com uma pessoa, atendente, recepcao ou humano.",
    parameters: {
      type: "object",
      properties: {
        clinicId: { type: "string" },
        session: {
          type: "string",
          description: "Sessao do WhatsApp da conversa.",
        },
        chatId: {
          type: "string",
          description: "ChatId exato da conversa no WhatsApp.",
        },
        customerPhoneNumber: {
          type: "string",
          description: "Telefone somente com digitos, incluindo DDI e DDD.",
        },
        handoffReason: {
          type: "string",
          description: "Motivo resumido do repasse para atendimento humano.",
        },
      },
      required: [
        "clinicId",
        "session",
        "chatId",
        "customerPhoneNumber",
        "handoffReason",
      ],
      additionalProperties: false,
    },
    strict: true,
  },
];

export async function executeAiSchedulingTool({
  name,
  arguments: toolArguments,
}: {
  name: string;
  arguments: Record<string, unknown>;
}): Promise<ToolResult> {
  switch (name) {
    case "check_appointment":
      return checkAppointmentFromAi({
        clinicId: String(toolArguments.clinicId),
        customerPhoneNumber: normalizePhoneNumber(
          String(toolArguments.customerPhoneNumber),
        ),
        appointmentDate: String(toolArguments.appointmentDate),
        time: String(toolArguments.time),
      });
    case "create_appointment":
      return createAppointmentFromAi({
        clinicId: String(toolArguments.clinicId),
        customerName: String(toolArguments.customerName),
        customerPhoneNumber: normalizePhoneNumber(
          String(toolArguments.customerPhoneNumber),
        ),
        appointmentDate: String(toolArguments.appointmentDate),
        time: String(toolArguments.time),
        notes: String(toolArguments.notes ?? ""),
      });
    case "cancel_appointment":
      return cancelAppointmentFromAi({
        clinicId: String(toolArguments.clinicId),
        appointmentId: normalizeOptionalValue(toolArguments.appointmentId),
        customerPhoneNumber: normalizePhoneNumber(
          String(toolArguments.customerPhoneNumber),
        ),
        cancellationReason: String(toolArguments.cancellationReason ?? ""),
      });
    case "handoff_to_human":
      return handoffToHumanFromAi({
        clinicId: String(toolArguments.clinicId),
        session: String(toolArguments.session),
        chatId: String(toolArguments.chatId),
        customerPhoneNumber: normalizePhoneNumber(
          String(toolArguments.customerPhoneNumber),
        ),
        handoffReason: String(toolArguments.handoffReason ?? ""),
      });
    default:
      return {
        ok: false,
        error: `Tool ${name} is not supported.`,
      };
  }
}

function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeOptionalValue(value: unknown) {
  const normalizedValue = String(value ?? "").trim();

  if (
    !normalizedValue ||
    normalizedValue === "undefined" ||
    normalizedValue === "null"
  ) {
    return null;
  }

  return normalizedValue;
}

function buildAppointmentDate(appointmentDate: string, time: string) {
  const [year, month, day] = appointmentDate.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function getCanceledStatuses() {
  return [
    AppointmentStatus.CANCELED_BY_CLINIC,
    AppointmentStatus.CANCELED_BY_PATIENT,
  ];
}

async function checkAppointmentFromAi({
  clinicId,
  customerPhoneNumber,
  appointmentDate,
  time,
}: {
  clinicId: string;
  customerPhoneNumber: string;
  appointmentDate: string;
  time: string;
}): Promise<ToolResult> {
  const desiredAppointmentDate = buildAppointmentDate(appointmentDate, time);
  const [clinicSettings, appointmentsAtDesiredTime, patientAppointments] =
    await Promise.all([
      prisma.clinicSettings.findUnique({
        where: { clinic_id: clinicId },
      }),
      prisma.appointments.findMany({
        where: {
          clinic_id: clinicId,
          appointment_date: desiredAppointmentDate,
          status: {
            notIn: getCanceledStatuses(),
          },
        },
        orderBy: { appointment_date: "asc" },
      }),
      prisma.appointments.findMany({
        where: {
          clinic_id: clinicId,
          customer_phone_number: customerPhoneNumber,
          appointment_date: {
            gte: new Date(),
          },
          status: {
            notIn: getCanceledStatuses(),
          },
        },
        orderBy: { appointment_date: "asc" },
      }),
    ]);

  const maxAppointmentsPerSlot = clinicSettings?.max_appointments_per_slot ?? 1;
  const patientAppointmentAtDesiredTime = appointmentsAtDesiredTime.find(
    (appointment) => appointment.customer_phone_number === customerPhoneNumber,
  );
  const patientExistingAppointment = patientAppointments.find(
    (appointment) =>
      appointment.appointment_date.getTime() !==
      desiredAppointmentDate.getTime(),
  );

  if (patientAppointmentAtDesiredTime) {
    return {
      ok: true,
      available: false,
      reason: "patient_already_has_appointment_at_this_time",
      message:
        "This patient already has an active appointment at the requested date and time.",
      appointment: formatPublicAppointment(patientAppointmentAtDesiredTime),
    };
  }

  if (appointmentsAtDesiredTime.length >= maxAppointmentsPerSlot) {
    const suggestedTimes = await findRoundedAvailableTimes({
      clinicId,
      appointmentDate,
      desiredAppointmentDate,
      maxAppointmentsPerSlot,
    });

    return {
      ok: true,
      available: false,
      reason: "slot_full",
      suggestedTimes,
    };
  }

  if (patientExistingAppointment) {
    return {
      ok: true,
      available: false,
      reason: "patient_has_existing_appointment",
      canReplaceAfterPatientConfirmation: true,
      desiredAppointment: {
        appointmentDate: desiredAppointmentDate.toISOString(),
      },
      existingAppointment: formatAppointmentForInternalToolUse(
        patientExistingAppointment,
      ),
      message:
        "The requested slot is available, but this patient already has an active upcoming appointment. Ask whether they want to cancel the current appointment and schedule the new one.",
    };
  }

  return {
    ok: true,
    available: true,
    reason: "slot_available",
  };
}

async function findRoundedAvailableTimes({
  clinicId,
  appointmentDate,
  desiredAppointmentDate,
  maxAppointmentsPerSlot,
}: {
  clinicId: string;
  appointmentDate: string;
  desiredAppointmentDate: Date;
  maxAppointmentsPerSlot: number;
}) {
  const periods = await getAppointmentPeriods(clinicId, appointmentDate);
  const now = new Date();
  const suggestedTimes: string[] = [];

  for (const period of periods) {
    const startHour = Number(period.startTime.split(":")[0]);
    const endHour = Number(period.endTime.split(":")[0]);

    for (let hour = startHour; hour < endHour; hour += 1) {
      const roundedTime = `${String(hour).padStart(2, "0")}:00`;
      const roundedDate = buildAppointmentDate(appointmentDate, roundedTime);

      if (
        roundedDate <= now ||
        roundedDate.getTime() === desiredAppointmentDate.getTime()
      ) {
        continue;
      }

      const appointmentCount = await prisma.appointments.count({
        where: {
          clinic_id: clinicId,
          appointment_date: roundedDate,
          status: {
            notIn: getCanceledStatuses(),
          },
        },
      });

      if (appointmentCount < maxAppointmentsPerSlot) {
        suggestedTimes.push(roundedTime);
      }

      if (suggestedTimes.length >= 5) {
        return suggestedTimes;
      }
    }
  }

  return suggestedTimes;
}

async function getAppointmentPeriods(clinicId: string, appointmentDate: string) {
  const specialDates = await prisma.clinicSpecialDate.findMany({
    where: {
      clinic_id: clinicId,
      date: appointmentDate,
    },
    orderBy: {
      start_time: "asc",
    },
  });

  if (specialDates.some((specialDate) => !specialDate.is_open)) {
    return [];
  }

  const openSpecialDatePeriods = specialDates
    .filter(
      (specialDate) =>
        specialDate.is_open && specialDate.start_time && specialDate.end_time,
    )
    .map((specialDate) => ({
      startTime: specialDate.start_time!,
      endTime: specialDate.end_time!,
    }));

  if (openSpecialDatePeriods.length) {
    return openSpecialDatePeriods;
  }

  const weekday = WEEKDAY_BY_INDEX[buildAppointmentDate(appointmentDate, "00:00").getDay()];
  const workingHours = await prisma.clinicWorkingHour.findMany({
    where: {
      clinic_id: clinicId,
      weekday,
    },
    orderBy: {
      start_time: "asc",
    },
  });

  return workingHours.map((workingHour) => ({
    startTime: workingHour.start_time,
    endTime: workingHour.end_time,
  }));
}

async function createAppointmentFromAi({
  clinicId,
  customerName,
  customerPhoneNumber,
  appointmentDate,
  time,
  notes,
}: {
  clinicId: string;
  customerName: string;
  customerPhoneNumber: string;
  appointmentDate: string;
  time: string;
  notes: string;
}): Promise<ToolResult> {
  const createAppointmentService = makeCreateAppointmentServiceFactory();
  const { appointment } = await createAppointmentService.exec({
    clinicId,
    customerName,
    customerPhoneNumber,
    appointmentDate,
    time,
    notes,
    status: AppointmentStatus.PENDING,
  });

  return {
    ok: true,
    appointment: formatPublicAppointment(appointment),
  };
}

async function cancelAppointmentFromAi({
  clinicId,
  appointmentId,
  customerPhoneNumber,
  cancellationReason,
}: {
  clinicId: string;
  appointmentId: string | null;
  customerPhoneNumber: string;
  cancellationReason: string;
}): Promise<ToolResult> {
  const appointment = await prisma.appointments.findFirst({
    where: {
      ...(appointmentId ? { id: appointmentId } : {}),
      clinic_id: clinicId,
      ...(appointmentId ? {} : { customer_phone_number: customerPhoneNumber }),
      appointment_date: {
        gte: new Date(),
      },
      status: {
        notIn: getCanceledStatuses(),
      },
    },
    orderBy: { appointment_date: "asc" },
  });

  if (!appointment) {
    return {
      ok: false,
      error: "No upcoming appointment found for this patient.",
    };
  }

  const updatedAppointment = await prisma.appointments.update({
    where: { id: appointment.id },
    data: {
      status: AppointmentStatus.CANCELED_BY_PATIENT,
      notes: cancellationReason
        ? [appointment.notes, `Cancelamento: ${cancellationReason}`]
            .filter(Boolean)
            .join("\n")
        : appointment.notes,
    },
  });

  return {
    ok: true,
    appointment: formatPublicAppointment(updatedAppointment),
  };
}

async function handoffToHumanFromAi({
  clinicId,
  session,
  chatId,
  customerPhoneNumber,
  handoffReason,
}: {
  clinicId: string;
  session: string;
  chatId: string;
  customerPhoneNumber: string;
  handoffReason: string;
}): Promise<ToolResult> {
  const findWhatsappConversationService = makeFindWhatsappConversationFactory();
  const updateWhatsappConversationService =
    makeUpdateWhatsappConversationFactory();
  const createWhatsappConversationService = makeCreateWhatsappConversation();

  const conversation = await findWhatsappConversationService.exec({
    clinicId,
    chatId,
  });

  if (conversation) {
    await updateWhatsappConversationService.exec({
      id: conversation.id,
      clinicId,
      chatId,
      aiEnabled: false,
    });
  } else {
    await createWhatsappConversationService.exec({
      clinicId,
      chatId,
      session,
      phoneNumber: customerPhoneNumber,
      aiEnabled: false,
    });
  }

  return {
    ok: true,
    aiEnabled: false,
    handoffReason,
    message:
      "AI disabled for this WhatsApp conversation. Future patient messages should be handled by a human.",
  };
}

function formatPublicAppointment(appointment: {
  id: string;
  status: AppointmentStatus;
  appointment_date: Date;
  customer_name: string | null;
  customer_phone_number: string;
}) {
  return {
    status: appointment.status,
    appointmentDate: appointment.appointment_date.toISOString(),
    customerName: appointment.customer_name,
    customerPhoneNumber: appointment.customer_phone_number,
  };
}

function formatAppointmentForInternalToolUse(appointment: {
  id: string;
  status: AppointmentStatus;
  appointment_date: Date;
  customer_name: string | null;
  customer_phone_number: string;
}) {
  return {
    internalAppointmentId: appointment.id,
    status: appointment.status,
    appointmentDate: appointment.appointment_date.toISOString(),
    customerName: appointment.customer_name,
    customerPhoneNumber: appointment.customer_phone_number,
  };
}
