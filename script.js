document.addEventListener("DOMContentLoaded", function () {
  // Initialize AOS
  AOS.init({ duration: 1000, once: true });

  // TOGGLE MENU
  const hamburger = document.getElementById("hamburger");
  const navbar = document.getElementById("navbar");

  if (hamburger && navbar) {
    hamburger.addEventListener("click", () => {
      navbar.classList.toggle("active");
    });
  }

  // TYPING EFFECT
  const typingElement = document.getElementById("typing");
  if (typingElement) {
    new Typed("#typing", {
      strings: ["AI & Data Science.", "Generative AI.", "Machine Learning."],
      typeSpeed: 60,
      backSpeed: 30,
      backDelay: 1000,
      loop: true,
    });
  }

  // CHATBOT IMPLEMENTATION
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendButton = document.querySelector(".input-area button");

  window.sendMessage = async function () {
    if (!chatBox || !userInput) return;

    const question = userInput.value.trim();
    if (!question) return;

    // Add user message
    const userMsg = document.createElement("div");
    userMsg.className = "user-msg";
    userMsg.textContent = question;
    chatBox.appendChild(userMsg);

    // Clear input and disable button during processing
    userInput.value = "";
    if (sendButton) sendButton.disabled = true;

    // Simple greeting
    if (/hello|hi|hey/i.test(question)) {
      const botMsg = document.createElement("div");
      botMsg.className = "bot-msg";
      botMsg.textContent =
        "Hello! This is Saquib's AI assistant. How can I help you today?";
      chatBox.appendChild(botMsg);
      if (sendButton) sendButton.disabled = false;
      chatBox.scrollTop = chatBox.scrollHeight;
      return;
    }

    // AI Response
    try {
      const response = await fetch(
        "https://saquib-ai-assistant.onrender.com/ask",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        }
      );

      const data = await response.json();
      const botMsg = document.createElement("div");
      botMsg.className = "bot-msg";
      botMsg.textContent =
        data.answer || "I didn't understand that. Please try again.";
      chatBox.appendChild(botMsg);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg = document.createElement("div");
      errorMsg.className = "bot-msg error";
      errorMsg.textContent =
        "Sorry, I'm having trouble responding. Please try again later.";
      chatBox.appendChild(errorMsg);
    } finally {
      if (sendButton) sendButton.disabled = false;
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  };

  if (userInput) {
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") window.sendMessage();
    });
  }

  if (sendButton) {
    sendButton.addEventListener("click", window.sendMessage);
  }
});
