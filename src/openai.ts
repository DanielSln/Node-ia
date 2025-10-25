import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { ChatCompletionTool } from "openai/resources/index.mjs";
import { z } from "zod";

const schema = z.object({
  produtos: z.array(z.string()),
});

const client = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "produtos_em_estoque",
      description: "Retorna uma lista de produtos que estão em estoque.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
        strict: true,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "produtos_em_falta",
      description: "Retorna uma lista de produtos que estão em falta no estoque.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
        strict: true,
      },
    },
  },
],

export const generateProducts = async (message: string) => {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "developer",
      content:
      "Liste três produtos que atendam a necessidade do usuário. Considere apenas os produtos em estoque.",
    },
    {
      role: "user",
      content: message,
    },
  ];

  const completion = await client.chat.completions.parse({
    model: "gpt-4o-mini",
    max_tokens: 100,
    response_format: zodResponseFormat(schema, "produtos"),
    tools,
    messages,
});

  if (completion.choices[0].message.refusal) {
    throw new Error("Refusal");
  }

  return completion.choices[0].message.parsed;
};
