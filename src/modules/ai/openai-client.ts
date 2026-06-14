import { env } from "@/env";
import { OpenAiResponse } from "@/types/types";

export async function createOpenAiTextResponse({
  instructions,
  input,
  tools,
  executeTool,
}: {
  instructions: string;
  input: string;
  tools?: unknown[];
  executeTool?: (toolCall: {
    name: string;
    arguments: Record<string, unknown>;
  }) => Promise<Record<string, unknown>>;
}) {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  let response = await createResponse({
    instructions,
    input,
    tools,
  });

  if (tools?.length && executeTool) {
    for (let toolLoopIndex = 0; toolLoopIndex < 8; toolLoopIndex += 1) {
      const toolCalls = getFunctionCalls(response);

      if (!toolCalls.length) {
        break;
      }

      const functionOutputs = [];

      for (const toolCall of toolCalls) {
        let result: Record<string, unknown>;

        try {
          result = await executeTool({
            name: toolCall.name,
            arguments: parseToolArguments(toolCall.arguments),
          });
        } catch (error) {
          result = {
            ok: false,
            error:
              error instanceof Error ? error.message : "Tool execution failed.",
          };
        }

        functionOutputs.push({
          type: "function_call_output",
          call_id: toolCall.call_id,
          output: JSON.stringify(result),
        });
      }

      response = await createResponse({
        previousResponseId: response.id,
        input: functionOutputs,
        tools,
      });
    }
  }

  const outputText = getOutputText(response);

  if (!outputText) {
    throw new Error(
      `OpenAI response did not include output text. Last response summary: ${JSON.stringify(
        summarizeResponse(response),
      )}`,
    );
  }

  return outputText.trim();
}

async function createResponse({
  instructions,
  input,
  previousResponseId,
  tools,
}: {
  instructions?: string;
  input: string | unknown[];
  previousResponseId?: string;
  tools?: unknown[];
}) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      input,
      ...(instructions && { instructions }),
      ...(previousResponseId && { previous_response_id: previousResponseId }),
      tools,
      tool_choice: "auto",
    }),
  });

  const responseBody = await response.text();

  if (!response.ok) {
    throw new Error(
      `OpenAI request failed: ${response.status} ${responseBody}`,
    );
  }

  const openAiResponse = JSON.parse(responseBody) as OpenAiResponse;
  console.log({ responseOpenAi: summarizeResponse(openAiResponse) });

  return openAiResponse;
}

function getFunctionCalls(response: OpenAiResponse) {
  return (
    response.output?.filter(
      (
        item,
      ): item is {
        type: string;
        call_id: string;
        name: string;
        arguments: string;
      } =>
        item.type === "function_call" &&
        typeof item.call_id === "string" &&
        typeof item.name === "string",
    ) ?? []
  );
}

function parseToolArguments(value?: string): Record<string, unknown> {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function getOutputText(response: OpenAiResponse) {
  return (
    response.output_text ??
    response.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => typeof content.text === "string")?.text
  );
}

function summarizeResponse(response: OpenAiResponse) {
  return {
    id: response.id,
    outputTypes: response.output?.map((item) => ({
      type: item.type,
      name: item.name,
      callId: item.call_id,
      hasContent: Boolean(item.content?.length),
      contentTypes: item.content?.map((content) => content.type),
    })),
  };
}
