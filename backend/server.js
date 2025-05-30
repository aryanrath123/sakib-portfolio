// server.js

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.OPENROUTER_API_KEY) {
  console.error("❌ Missing OPENROUTER_API_KEY in environment variables");
  process.exit(1); // Stop the server if API key is not set
}

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

let resume = "";

try {
  resume = fs.readFileSync(path.join(__dirname, "resume.txt"), "utf-8");
} catch (err) {
  console.error("❌ Could not load resume.txt:", err.message);
}

app.post("/ask", async (req, res) => {
  const question = req.body.question;

  if (!question) {
    return res.status(400).json({ error: "Question is required." });
  }

  try {
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
              content: `You are a personal assistant for Saquib. Based on the resume below, answer any question asked by the user as clearly and concisely as possible. Resume:\n${resume}`,
            },
            { role: "user", content: question },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ OpenRouter API Error:", data);
      return res.status(500).json({ error: "Failed to get response from AI." });
    }

    const answer = data.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      throw new Error("No response from model.");
    }

    res.json({ answer });
  } catch (error) {
    console.error("❌ Error in /ask route:", {
      message: error.message,
      data: error.response?.data,
      status: error.response?.status,
    });

    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
