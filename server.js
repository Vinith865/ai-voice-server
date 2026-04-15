const express = require("express");
const fetch = require("node-fetch");

const app = express();

// ✅ Root check
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// 🔊 FINAL STREAM (MP3 - ESP32 compatible)
app.get("/stream", async (req, res) => {
  try {
    const text = req.query.text || "Hello this is your AI assistant";

    console.log("Request:", text);

    const ttsRes = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SARVAM_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: "en-IN",
        speaker: "anushka",
        audio_format: "mp3",     // 🔥 IMPORTANT
        sample_rate: 22050
      })
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      console.log("TTS ERROR:", err);
      return res.send("TTS ERROR: " + err);
    }

    // 🔥 STREAM DIRECTLY (NO BUFFER)
    res.setHeader("Content-Type", "audio/mpeg");

    ttsRes.body.pipe(res);

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.send("SERVER ERROR: " + err.message);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
