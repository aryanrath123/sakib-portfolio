require("dotenv").config();
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static files from root (where index.html is)
app.use(express.static(path.join(__dirname, "..")));

// Load resume file
const resume = fs.readFileSync(path.join(__dirname, "resume.txt"), "utf-8");

// Chatbot endpoint
app.post("/ask", async (req, res) => {
  const userQuestion = req.body.question;

  const prompt = `
You are Saquib's AI assistant. Use the resume below to answer questions clearly and professionally.

Resume:
${resume}

Question:
${userQuestion}
`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer = response.data.choices[0].message.content;
    res.json({ answer });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// ✅ Serve index.html for all routes
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
