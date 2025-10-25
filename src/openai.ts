import dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from "zod";  

const schema = z.object({
  produtos: z.array(z.string()),
});

const client = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export const generateProducts = async (message: string) => {
    const completion = await client.chat.completions.parse({
      model: "gpt-4o-mini",
      max_tokens: 100,
      response_format: zodResponseFormat(schema, "produtos"),
      messages: [
        {
          role: "developer",
          content: "Liste três produtos que atendam a necessidade do usuário. Considere apenas os produtos em estoque.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    if (completion.choices[0].message.refusal) {
      throw new Error("Refusal");
    }

    return completion.choices[0].message.parsed;
}