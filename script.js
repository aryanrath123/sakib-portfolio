// Wait for DOM to load before executing JavaScript
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

  // ... [keep all your other existing code until the chat section]

  // CHATBOT FUNCTIONALITY - WITH NULL CHECKS
  const chatBox = document.getElementById("chat-box");
  const sendButton = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");

  // Only initialize chat if elements exist
  if (chatBox && sendButton && userInput) {
    function appendMessage(content, isUser) {
      const msg = document.createElement("div");
      msg.className = isUser ? "user-msg" : "bot-msg";
      msg.textContent = content;
      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Handle Enter key press
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    });

    // Handle send button click
    sendButton.addEventListener("click", sendMessage);

    async function sendMessage() {
      const question = userInput.value.trim();
      if (!question) return;

      appendMessage(question, true);
      userInput.value = "";
      sendButton.disabled = true;

      // Simple greetings response
      if (/hello|hi|hey/i.test(question)) {
        appendMessage(
          "Hello! This is Saquib's AI assistant. How can I help you today?",
          false
        );
        sendButton.disabled = false;
        return;
      }

      try {
        const response = await fetch(
          "https://your-render-url.onrender.com/ask",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        appendMessage(
          data.answer || "I didn't get a response. Please try again.",
          false
        );
      } catch (err) {
        console.error("Chatbot error:", err);
        appendMessage(
          "Sorry, the chatbot service is currently unavailable. Please try again later.",
          false
        );
      } finally {
        sendButton.disabled = false;
      }
    }
  } else {
    console.warn("Chat elements not found - disabling chat functionality");
  }
});
