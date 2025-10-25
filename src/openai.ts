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
        properties: {
          dummy: { type: "string", enum: ["true"] },
        },
        required: ["dummy"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "produtos_em_falta",
      description:
        "Retorna uma lista de produtos que estão em falta no estoque.",
      parameters: {
        type: "object",
        properties: {
          dummy: { type: "string", enum: ["true"] },
        },
        required: ["dummy"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
];

export const generateProducts = async (message: string) => {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "developer",
      content:
        "Liste três produtos que atendam a necessidade do usuário. Considere apenas os produtos em falta.",
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

  const produtosEmEstoque = () => [];
  const produtosEmFalta = () => [];

  const {tool_calls} = completion.choices[0].message;
  if (tool_calls && tool_calls.length > 0) {
    const tool_call = tool_calls[0];
    const toolsMap = {
      produtos_em_estoque: produtosEmEstoque,
      produtos_em_falta: produtosEmFalta,
    } as const;
    const functionToCall = toolsMap[tool_call.function.name as keyof typeof toolsMap];
    if (!functionToCall){
      throw new Error("Function not found");
    }
    const result = functionToCall();
  }

  return completion.choices[0].message.parsed;
};
