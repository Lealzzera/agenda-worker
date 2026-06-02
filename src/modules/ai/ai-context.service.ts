import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";

export async function buildClinicAiContext(clinicId: string) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    include: {
      clinic_settings: true,
      services: {
        orderBy: { created_at: "asc" },
      },
      working_hours: {
        orderBy: { weekday: "asc" },
      },
      special_dates: {
        orderBy: { date: "asc" },
        take: 20,
      },
    },
  });

  if (!clinic) {
    throw new NotFoundError("Clinic not found");
  }

  const services = clinic.services.length
    ? clinic.services
        .map((service) => {
          const price = service.price_cents
            ? ` - R$ ${(service.price_cents / 100).toFixed(2)}`
            : "";
          return `- ${service.name}${price}`;
        })
        .join("\n")
    : "Nenhum serviço cadastrado.";

  const workingHours = clinic.working_hours.length
    ? clinic.working_hours
        .map((workingHour) => {
          return `- ${workingHour.weekday}: ${workingHour.start_time} até ${workingHour.end_time}`;
        })
        .join("\n")
    : "Nenhum horário de funcionamento cadastrado.";

  const specialDates = clinic.special_dates.length
    ? clinic.special_dates
        .map((specialDate) => {
          const status = specialDate.is_open ? "aberta" : "fechada";
          const time =
            specialDate.start_time && specialDate.end_time
              ? ` (${specialDate.start_time} até ${specialDate.end_time})`
              : "";
          const note = specialDate.note ? ` - ${specialDate.note}` : "";
          return `- ${specialDate.date}: ${status}${time}${note}`;
        })
        .join("\n")
    : "Nenhum dia atípico cadastrado.";

  const evaluationPrice = clinic.clinic_settings?.charges_evaluation
    ? `A clínica cobra consulta inicial no valor de R$ ${(
        (clinic.clinic_settings.evaluation_price_cents ?? 0) / 100
      ).toFixed(2)}.`
    : "A clínica não cobra consulta inicial.";

  return `
Clínica: ${clinic.name}
Tipo: ${clinic.type}
Cidade/estado: ${clinic.city ?? "não informado"} - ${clinic.state ?? "não informado"}
Endereço: ${clinic.address ?? "não informado"}
Agente: ${clinic.clinic_settings?.ai_agent_name ?? "Blink"}

${evaluationPrice}

Informações adicionais:
${clinic.clinic_settings?.additional_information || "Nenhuma informação adicional cadastrada."}

Serviços:
${services}

Horários de funcionamento:
${workingHours}

Dias atípicos:
${specialDates}
`.trim();
}
