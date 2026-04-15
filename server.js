const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.get("/stream", async (req, res) => {
  try {
    const text = req.query.text || "Hello";

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: text }]
      })
    });

    const aiData = await aiRes.json();
    const reply = aiData.choices[0].message.content;

    const ttsRes = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SARVAM_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: reply,
        target_language_code: "en-IN",
        speaker: "male",
        format: "mp3"
      })
    });

    res.setHeader("Content-Type", "audio/mpeg");
    ttsRes.body.pipe(res);

  } catch (err) {
    res.status(500).send("Error");
  }
});

app.listen(3000, () => console.log("Server running"));
