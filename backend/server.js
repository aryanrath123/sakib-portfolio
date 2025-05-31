const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 10000;

// CORS config
app.use(
  cors({
    origin: ["https://sakib-portfolio.onrender.com", "http://localhost:10000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Serve static files from ../public
app.use(express.static(path.join(__dirname, "..", "public")));

app.use(express.json());

// Load resume
let resume = "";
try {
  resume = fs.readFileSync(path.join(__dirname, "resume.txt"), "utf-8");
} catch (err) {
  console.error("❌ Could not load resume.txt:", err.message);
}

// API route
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
    const answer =
      data.choices?.[0]?.message?.content?.trim() ||
      "I couldn't generate an answer.";
    res.json({ answer });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve index.html as fallback
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
