const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

app.get("/stream", async (req, res) => {
  try {
    const text = req.query.text || "Hello";

    // 🧠 AI
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

    if (!aiData.choices || !aiData.choices[0]) {
      return res.send("AI ERROR: " + JSON.stringify(aiData));
    }

    const reply = aiData.choices[0].message.content;

    // 🔊 TTS (FIXED)
    const ttsRes = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SARVAM_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: reply,
        target_language_code: "en-IN",
        speaker: "anushka",
        format: "mp3"
      })
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      return res.send("TTS ERROR: " + err);
    }

    // 🔥 SAFE METHOD (NO STREAM CRASH)
    const audioBuffer = await ttsRes.arrayBuffer();

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.byteLength);

    res.send(Buffer.from(audioBuffer));

  } catch (err) {
    console.error(err);
    res.send("SERVER ERROR: " + err.message);
  }
});

app.listen(3000, () => console.log("Server running"));
