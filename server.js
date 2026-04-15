const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

app.get("/stream", async (req, res) => {
  try {
    const text = req.query.text || "Hello";

    console.log("Input:", text);

    // 🧠 AI CALL
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
    console.log("AI DATA:", aiData);

    if (!aiData.choices || !aiData.choices[0]) {
      return res.send("AI ERROR: " + JSON.stringify(aiData));
    }

    const reply = aiData.choices[0].message.content;

    console.log("Reply:", reply);

    // 🔊 TTS CALL
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

    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      return res.send("TTS ERROR: " + err);
    }

    // 🔥 STREAM PROPERLY
    res.setHeader("Content-Type", "audio/mpeg");

    ttsRes.body.on("data", (chunk) => {
      res.write(chunk);
    });

    ttsRes.body.on("end", () => {
      res.end();
    });

  } catch (err) {
    console.error("CRASH:", err);
    res.send("SERVER ERROR: " + err.message);
  }
});

app.listen(3000, () => console.log("Server running"));
