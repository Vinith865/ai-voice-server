const express = require("express");

const app = express();

// ✅ Root check
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// 🔊 FINAL WORKING STREAM (RADIO PROXY)
app.get("/stream", async (req, res) => {
  try {
    const url = "http://streams.ilovemusic.de/iloveradio1.mp3";

    const response = await fetch(url);

    if (!response.ok) {
      return res.send("Stream fetch failed ❌");
    }

    res.setHeader("Content-Type", "audio/mpeg");

    // 🔥 STREAM DIRECTLY (THIS IS WHAT ESP32 NEEDS)
    response.body.pipe(res);

  } catch (err) {
    res.send("ERROR: " + err.message);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
