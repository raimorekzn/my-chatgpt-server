// server/index.js
import express from "express";
import fetch from "node-fetch"; // если Node 18+, можно без этого (встроенный fetch)
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors()); // разрешаем запросы с фронта (если будете использовать прямой URL)
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.error("❌ OPENAI_API_KEY не задан в .env");
  process.exit(1);
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // используем GPT-4o
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message }
        ],
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).send(errText);
    }

    const data = await response.json();
    const assistantReply = data.choices?.[0]?.message?.content ?? "";
    res.json({ reply: assistantReply });
  } catch (err) {
    console.error("Ошибка на сервере:", err);
    res.status(500).json({ error: "server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
