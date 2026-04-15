const express = require("express");
const fetch = require("node-fetch");

const app = express();

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// 🔊 FINAL WORKING AUDIO ENDPOINT
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
        audio_format: "mp3",
        sample_rate: 22050
      })
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      console.log("TTS ERROR:", err);
      return res.send("TTS ERROR: " + err);
    }

    const buffer = await ttsRes.arrayBuffer();
    console.log("Audio size:", buffer.byteLength);

    // ❌ Avoid empty audio
    if (buffer.byteLength < 5000) {
      return res.send("Audio empty ❌");
    }

    // 🔥 CRITICAL HEADERS (fixes 0:00 issue)
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.byteLength);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "no-cache");

    res.end(Buffer.from(buffer));   // ✅ MUST USE end()

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.send("SERVER ERROR: " + err.message);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
