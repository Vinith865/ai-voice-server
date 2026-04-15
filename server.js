const express = require("express");
const fetch = require("node-fetch");

const app = express();

// ✅ Root check
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// 🔊 FINAL WORKING AUDIO (WAV - ESP32 compatible)
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
        audio_format: "wav",      // ✅ WAV works better
        sample_rate: 16000        // ✅ IMPORTANT
      })
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      console.log("TTS ERROR:", err);
      return res.send("TTS ERROR: " + err);
    }

    const audioBuffer = await ttsRes.arrayBuffer();

    console.log("Audio size:", audioBuffer.byteLength);

    // ❌ Prevent empty audio
    if (audioBuffer.byteLength < 1000) {
      return res.send("Audio empty ❌");
    }

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", audioBuffer.byteLength);

    res.send(Buffer.from(audioBuffer));

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.send("SERVER ERROR: " + err.message);
  }
});

app.listen(3000, () => console.log("Server running"));
