document.addEventListener("DOMContentLoaded", function () {
  const inputBox = document.getElementById("input-box");
  const chatBox = document.getElementById("chat-box");

  inputBox.addEventListener("keypress", function (event) {
    if (event.key === "Enter" && inputBox.value.trim() !== "") {
      const message = inputBox.value.trim();
      inputBox.value = "";
      sendMessage(message);
    }
  });

  async function sendMessage(message) {
    // Display user message
    const userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.textContent = message;
    chatBox.appendChild(userMessage);

    // Display loading message from bot
    const botMessage = document.createElement("div");
    botMessage.className = "message bot-message";
    botMessage.textContent = "Thinking...";
    chatBox.appendChild(botMessage);

    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const response = await fetch("/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: message }),
      });

      const data = await response.json();
      botMessage.textContent = data.answer || "No response received.";
    } catch (error) {
      botMessage.textContent = "⚠️ Error: Could not fetch response.";
      console.error("Chat error:", error);
    }

    // Auto-scroll
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
