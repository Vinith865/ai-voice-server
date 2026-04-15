const express = require("express");
const fetch = require("node-fetch");

const app = express();

// ✅ Root test
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// 🔊 FINAL WORKING STREAM (TTS ONLY - stable)
app.get("/stream", async (req, res) => {
  try {
    const text = req.query.text || "Hello this is your AI assistant";

    console.log("Text:", text);

    // 🔥 SARVAM TTS (CORRECT FORMAT)
    const ttsRes = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SARVAM_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: [text],                // ✅ correct field
        target_language_code: "en-IN",
        speaker: "anushka",            // ✅ valid speaker
        audio_format: "mp3",           // ✅ correct field
        sample_rate: 22050
      })
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      return res.send("TTS ERROR: " + err);
    }

    const audioBuffer = await ttsRes.arrayBuffer();

    console.log("Audio size:", audioBuffer.byteLength);

    if (audioBuffer.byteLength < 1000) {
      return res.send("Audio too small / invalid");
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.byteLength);

    res.send(Buffer.from(audioBuffer));

  } catch (err) {
    console.error(err);
    res.send("SERVER ERROR: " + err.message);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
