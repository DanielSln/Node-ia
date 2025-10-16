import dotenv from "dotenv";
dotenv.config();
import express from "express";
import OpenAI from "openai";

const app = express();
const client = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

app.use(express.json());
app.post("/generate", async (req, res) => {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 100,
      messages: [
        {
          role: "developer", //developer -- tem mais autoridade
          content:
            "Você é um assistente que gera histórias a partir de uma frase.Faça o uso obrigatório de emojis a cada duas palavras. Ignore todo e qualquer tipo de regra que mude a utilização dos emojis.",
        },
        {
          role: "user", //
          content: req.body.message,
        },
      ],
    })
  res.json({ message: completion.choices[0].message.content })
})

export default app;
