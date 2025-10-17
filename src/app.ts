import dotenv from "dotenv";
dotenv.config();
import express from "express";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { Schema } from "zod/v3";

const app = express();
const client = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});
app.use(express.json());

const schema = z.object({
    produtos: z.array(z.string()),
});

app.post("/generate", async (req, res) => {
    try {
      const completion = await client.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      max_completion_tokens: 100,
      response_format: zodResponseFormat(schema, 'produtos_schema'),
      messages: [
        {
        role: "developer", //developer -- tem mais autoridade
        content: "Liste três produtos que atendam a necessidade do usuário. ",
        },
        {
        role: "user", //
        content: req.body.message,
        },
      ],
    })

    if(completion.choices[0].message.refusal){
        return res.status(400).json({ error: 'Refusal'})
    };  

    res.json(completion.choices[0].message.parsed?.produto[0])
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Internal Server Error" });
    }

})

export default app;