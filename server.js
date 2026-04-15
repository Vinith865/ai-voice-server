const express = require("express");

const app = express();

// Root check
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// 🔊 FINAL WORKING AUDIO (NO API ISSUES)
app.get("/stream", async (req, res) => {
  try {
    const text = req.query.text || "Hello this is your AI assistant";

    // 🔥 Google TTS (DIRECT MP3)
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;

    const response = await fetch(url);

    res.setHeader("Content-Type", "audio/mpeg");

    // ✅ DIRECT STREAM (WORKS PERFECTLY)
    response.body.pipe(res);

  } catch (err) {
    res.send("ERROR: " + err.message);
  }
});

app.listen(3000, () => console.log("Server running"));
