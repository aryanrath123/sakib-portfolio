const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? "*"
        : "your-production-domain.com",
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Resume loader
let resumeText = "";
let resumeLastModified = null;

const loadResume = () => {
  try {
    const resumePath = path.join(__dirname, "resume.txt");
    if (!fs.existsSync(resumePath)) {
      console.warn("❗ resume.txt not found.");
      resumeText = "";
      return;
    }

    const stats = fs.statSync(resumePath);
    if (!resumeLastModified || stats.mtime > resumeLastModified) {
      let text = fs
        .readFileSync(resumePath, "utf-8")
        .replace(/\s+/g, " ")
        .replace(/[^\x00-\x7F]/g, "")
        .trim();

      const maxLength = 6000;
      resumeText =
        text.length > maxLength
          ? text.slice(0, maxLength) + "\n\n[Resume truncated]"
          : text;

      resumeLastModified = stats.mtime;
      console.log("✅ Resume loaded. Length:", resumeText.length);
      console.log("📝 Preview:", resumeText.slice(0, 300));
    }
  } catch (err) {
    console.error("❌ Failed to load resume:", err.message);
  }
};

loadResume();

// Auto-reload resume in dev
if (process.env.NODE_ENV === "development") {
  fs.watchFile(path.join(__dirname, "resume.txt"), (curr, prev) => {
    if (curr.mtime !== prev.mtime) loadResume();
  });
}

// === /ask Endpoint ===
app.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== "string" || question.length > 500) {
    return res.status(400).json({ error: "Invalid question format." });
  }

  if (!resumeText) {
    return res.status(503).json({ error: "Resume is empty or not loaded." });
  }

  console.log("📥 Question received:", question);

  const resumePrompt = `You are Saquib's AI assistant. ONLY answer questions using the resume content below.

⚠️ RULES:
- Do NOT generate general answers or definitions.
- If the answer is not clearly found, reply: "This isn't mentioned in my resume."
- Keep answers under 2 sentences.

[RESUME START]
${resumeText}
[RESUME END]`;

  try {
    const startTime = Date.now();

    const apiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "your-website-url.com",
          "X-Title": "Saquib's Portfolio",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324",
          messages: [
            { role: "system", content: resumePrompt },
            {
              role: "user",
              content: `Regarding the resume, answer this concisely: ${question}`,
            },
          ],
          temperature: 0.1,
          max_tokens: 200,
          top_p: 0.3,
        }),
        timeout: 10000,
      }
    );

    const data = await apiResponse.json();
    const responseTime = Date.now() - startTime;

    console.log("📬 Response time:", responseTime + "ms");
    console.log("📦 Raw response:", JSON.stringify(data, null, 2));

    if (!apiResponse.ok) {
      return res.status(502).json({
        error: "AI service failed.",
        details: data?.error?.message || "Unknown error",
      });
    }

    let answer = data.choices?.[0]?.message?.content || "No response received.";

    // Optional: basic check for hallucinations
    if (
      answer.toLowerCase().includes("as an ai") ||
      answer.toLowerCase().includes("i don't know")
    ) {
      answer = "This isn't mentioned in my resume.";
    }

    res.json({ answer });
  } catch (error) {
    console.error("🔥 Error during OpenRouter call:", error.message);
    res.status(500).json({
      error: "Internal error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// === Debug endpoint to test resume load ===
app.get("/resume-preview", (req, res) => {
  res.send(resumeText || "No resume loaded.");
});

// === Serve static frontend ===
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: process.env.NODE_ENV === "production" ? "1h" : "0",
  })
);

// === Health check ===
app.get("/health", (req, res) => {
  res.status(resumeText ? 200 : 503).json({
    status: resumeText ? "healthy" : "degraded",
    resumeLoaded: !!resumeText,
    uptime: process.uptime(),
  });
});

// === Start Server ===
app.listen(port, () => {
  console.log(`🚀 Server is live at http://localhost:${port}`);
});
