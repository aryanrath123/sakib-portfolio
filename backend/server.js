const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// ✅ Allow frontend domain
app.use(
  cors({
    origin: ["https://sakib-portfolio.onrender.com"], // your actual frontend
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, ".."))); // serves index.html if needed

// Load resume content
let resume = "";
try {
  resume = fs.readFileSync(path.join(__dirname, "resume.txt"), "utf-8");
} catch (err) {
  console.error("❌ Could not load resume.txt:", err.message);
}

// AI Assistant Endpoint
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question)
      return res.status(400).json({ error: "Question is required" });

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are Saquib's personal assistant. Answer questions based on this resume:\n${resume}\n\nKeep responses professional and concise.`,
            },
            { role: "user", content: question },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter API Error:", data);
      return res.status(500).json({ error: "AI service error" });
    }

    const answer =
      data.choices?.[0]?.message?.content?.trim() ||
      "I couldn't generate an answer.";
    res.json({ answer });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve frontend fallback
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
