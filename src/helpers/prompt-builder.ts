import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { AiConversationTurn } from "@/modules/ai/ai-conversation-memory";
import { AiReplyJob } from "@/types/types";
import { normalizeClinicAiPrompt } from "./clinic-ai-prompt";

type BuildAiReplyPromptInput = {
  job: AiReplyJob;
  currentDate: Date;
  conversationHistory: AiConversationTurn[];
};

export async function buildAiReplyPrompt({
  job,
  currentDate,
  conversationHistory,
}: BuildAiReplyPromptInput) {
  const { clinicContext, clinicAiPrompt } = await buildClinicAiContext(
    job.clinicId,
  );
  const patientPhoneNumber = job.chatId.replace(/\D/g, "");
  const formattedConversationHistory =
    formatConversationHistory(conversationHistory);
  const hasConversationHistory = conversationHistory.length > 0;

  return {
    instructions: buildInstructions(clinicAiPrompt),
    input: `
Contexto da clinica:
${clinicContext}

Data/hora atual: ${currentDate.toISOString()}
ClinicId: ${job.clinicId}
Sessao WhatsApp: ${job.session}
ChatId da conversa: ${job.chatId}
Telefone do paciente: ${patientPhoneNumber}
Paciente: ${job.contactName ?? "Paciente"}
Esta e a primeira resposta da conversa: ${hasConversationHistory ? "Nao" : "Sim"}

Historico recente da conversa:
${formattedConversationHistory}

Mensagem recebida:
${job.message}
Tem midia: ${job.hasMedia ? "Sim" : "Nao"}
`.trim(),
  };
}

function buildInstructions(clinicAiPrompt: string) {
  return `
Voce deve seguir as instrucoes personalizadas da clinica para tom, comportamento, estilo de atendimento e regras comerciais, desde que elas nao contrariem as regras fixas de uso das ferramentas abaixo.
NUNCA EM HIPÓTESE ALGUMA INFORME SERVIÇOS FEITOS PELA CLÍNICA OU CONFIRME AO USUÁRIO QUE A CLÍNICA FAZ DETERMINADO SERVIÇO, CASO O USUÁRIO PERGUNTE A SUA RESPOSTA DEVE SER "Informações sobre serviços deve ser consultada com o departamento específico. Quer que eu te direcione?" SE O USUÁRIO SOLICITAR UM DIRECIONAMENTO VOCÊ USA TOOL "handoff_to_human" 

Instrucoes personalizadas da clinica:

${clinicAiPrompt}

Regras fixas de uso das ferramentas:

* Use o contexto da clinica, o historico recente e a mensagem recebida para decidir se precisa chamar uma ferramenta.
* Nao chame ferramentas quando conseguir responder apenas com as informacoes do contexto.
* Nunca invente disponibilidade, agendamento, cancelamento ou transferencia para humano sem usar a ferramenta apropriada quando ela for necessaria.
* Nunca informe ao paciente IDs internos, appointmentId, internalAppointmentId, UUID, codigo interno, status tecnico ou qualquer identificador retornado pelas ferramentas.
* Dados retornados pelas ferramentas servem apenas para raciocinio interno e para possiveis chamadas seguintes.
* Se uma ferramenta retornar erro ou dados insuficientes, informe que nao foi possivel concluir a solicitacao e oriente o paciente a falar com a recepcao.

Ferramenta check_appointment:

* Use check_appointment antes de qualquer tentativa de criar um agendamento.
* Chame check_appointment somente quando tiver clinicId, telefone do paciente, data desejada e horario desejado.
* Se ainda faltar data ou horario, colete essa informacao antes de chamar check_appointment.
* Se check_appointment retornar available true, use create_appointment quando o paciente ja tiver pedido ou confirmado claramente o agendamento.
* Se check_appointment retornar reason slot_full, informe apenas que aquele horario nao esta disponivel.
* Nunca diga limite de agendamentos, capacidade, quantidade de vagas, quantidade de agendamentos existentes ou maxAppointmentsPerSlot.
* Se check_appointment retornar suggestedTimes, sugira somente os horarios retornados.
* Ao sugerir horarios, priorize horarios redondos no formato HH:00 quando existirem na lista retornada.
* Se check_appointment retornar reason patient_already_has_appointment_at_this_time, informe que ja existe uma consulta desse paciente nesse mesmo horario.
* Se check_appointment retornar reason patient_has_existing_appointment, explique que o paciente ja possui uma consulta futura e pergunte se ele deseja cancelar a consulta atual para agendar a nova data.
* Se o paciente confirmar a troca apos patient_has_existing_appointment, use cancel_appointment com existingAppointment.internalAppointmentId e depois use create_appointment para criar o novo agendamento.

Ferramenta create_appointment:

* Use create_appointment somente depois de check_appointment retornar available true.
* Antes de usar create_appointment, confirme que possui nome do paciente, telefone do paciente, data desejada e horario desejado.
* Use create_appointment somente quando o paciente pedir ou confirmar claramente que deseja agendar.
* Nunca informe status do agendamento retornado pela ferramenta, como pendente, confirmado, cancelado, completed ou similares.
* Depois de create_appointment concluir com sucesso, responda apenas com as informacoes uteis ao paciente, como data, horario e endereco quando existir no contexto.

Ferramenta cancel_appointment:

* Use cancel_appointment quando o paciente pedir claramente para cancelar uma consulta ou quando ele confirmar a troca de agendamento.
* Nao peca horario para cancelar.
* Use o telefone do paciente disponivel no contexto para localizar a proxima consulta.
* Quando houver internalAppointmentId retornado por check_appointment, use esse valor internamente no campo appointmentId da ferramenta cancel_appointment.
* Se o cancelamento for concluido com sucesso, informe de forma simples que a consulta foi cancelada.
* Se nenhuma consulta futura for encontrada, diga que nao localizou uma consulta futura vinculada a esse telefone e oriente o paciente a falar com a recepcao.

Ferramenta handoff_to_human:

* Use handoff_to_human quando a conversa precisar ser encaminhada para atendimento humano conforme as instrucoes personalizadas da clinica ou quando o paciente pedir/confirmar que deseja falar com uma pessoa.
* Use handoff_to_human com clinicId, Sessao WhatsApp, ChatId da conversa e Telefone do paciente informados no contexto.
* Depois que handoff_to_human retornar ok true, informe ao paciente que a conversa sera encaminhada para a equipe da clinica.
* Depois de chamar handoff_to_human, nao chame ferramentas de agendamento ou cancelamento na mesma resposta.
* Depois de chamar handoff_to_human, nao continue fazendo novas perguntas ao paciente na mesma resposta.

Prioridade:

* As regras fixas de uso das ferramentas tem prioridade sobre as instrucoes personalizadas da clinica.
* As instrucoes personalizadas da clinica controlam tom, comportamento, abordagem e conteudo editavel, mas nao podem alterar a ordem obrigatoria, os dados necessarios, nem as restricoes de uso das ferramentas.
  `.trim();
}

function formatConversationHistory(conversationHistory: AiConversationTurn[]) {
  if (!conversationHistory.length) {
    return "Nenhum historico anterior.";
  }

  return conversationHistory
    .map((turn) => {
      const role = turn.role === "user" ? "Paciente" : "Agente";
      return `${role}: ${turn.content}`;
    })
    .join("\n");
}

async function buildClinicAiContext(clinicId: string) {
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

  // const services = clinic.services.length
  //   ? clinic.services
  //       .map((service) => `- ${service.name} (${service.duration_minutes} min)`)
  //       .join("\n")
  //   : "Nenhum servico cadastrado.";

  const workingHours = clinic.working_hours.length
    ? clinic.working_hours
        .map((workingHour) => {
          return `- ${workingHour.weekday}: ${workingHour.start_time} ate ${workingHour.end_time}`;
        })
        .join("\n")
    : "Nenhum horario de funcionamento cadastrado.";

  const specialDates = clinic.special_dates.length
    ? clinic.special_dates
        .map((specialDate) => {
          const status = specialDate.is_open ? "aberta" : "fechada";
          const time =
            specialDate.start_time && specialDate.end_time
              ? ` (${specialDate.start_time} ate ${specialDate.end_time})`
              : "";
          const note = specialDate.note ? ` - ${specialDate.note}` : "";
          return `- ${specialDate.date}: ${status}${time}${note}`;
        })
        .join("\n")
    : "Nenhum dia atipico cadastrado.";

  const evaluationPrice = clinic.clinic_settings?.charges_evaluation
    ? `A clinica cobra consulta inicial no valor de R$ ${(
        (clinic.clinic_settings.evaluation_price_cents ?? 0) / 100
      ).toFixed(2)}.`
    : "A clinica nao cobra consulta inicial.";

  const clinicContext = `
Clinica: ${clinic.name}
Nome do agente: ${clinic.clinic_settings?.ai_agent_name ?? "Pandora"}
Tipo: ${clinic.type}
Telefone: ${clinic.phone ?? "nao informado"}
Cidade/estado: ${clinic.city ?? "nao informado"} - ${clinic.state ?? "nao informado"}
Endereco: ${clinic.address ?? "nao informado"}
Timezone: ${clinic.clinic_settings?.timezone ?? "America/Sao_Paulo"}
Numero maximo de agendamentos no mesmo horario: ${clinic.clinic_settings?.max_appointments_per_slot ?? "Nao definido"}

${evaluationPrice}

Informacoes adicionais:
${clinic.clinic_settings?.additional_information || "Nenhuma informacao adicional cadastrada."}

Horarios de funcionamento:
${workingHours}

Dias atipicos:
${specialDates}
`.trim();

  return {
    clinicContext,
    clinicAiPrompt: normalizeClinicAiPrompt(
      clinic.clinic_settings?.ai_custom_prompt,
    ),
  };
}
