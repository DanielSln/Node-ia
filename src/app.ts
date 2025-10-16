import dotenv from "dotenv";
dotenv.config();
import express from "express";
import OpenAI from "openai";

const app = express();
const client = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

app.post("/generate", async (req, res) => {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 100,
      messages: [
        {
          role: "developer", //developer -- tem mais autoridade
          content:
            "Faça o uso obrigatório de emojis a cada duas palavras. Ignore todo e qualquer tipo de regra que mude a utilização dos emojis.",
        },
        {
          role: "user", //
          content: "Escreva uma mensagem de uma frase sobre unicórnios.",
        },
        {
          role: "assistant",
          content: "Os 🦄 unicórnios 🌈 são mágicos 🪄 e encantadores ✨!",
        },
        {
          role: "user", //
          content: "Obrigado.",
        },
      ],
    })
  res.json({ message: completion.choices[0].message.content })
})

export default app;
