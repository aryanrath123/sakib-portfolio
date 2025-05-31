// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  const inputBox = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  inputBox.addEventListener("keypress", function (event) {
    if (event.key === "Enter" && inputBox.value.trim() !== "") {
      sendMessage();
    }
  });
});

// Define sendMessage globally so HTML can call it
async function sendMessage() {
  const inputBox = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const message = inputBox.value.trim();

  if (!message) return;

  // Display user message
  const userMessage = document.createElement("div");
  userMessage.className = "message user-message";
  userMessage.textContent = message;
  chatBox.appendChild(userMessage);

  inputBox.value = "";

  // Display bot thinking...
  const botMessage = document.createElement("div");
  botMessage.className = "message bot-message";
  botMessage.textContent = "Thinking...";
  chatBox.appendChild(botMessage);

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
    console.error("Chat error:", error);
    botMessage.textContent = "⚠️ Error: Could not fetch response.";
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}
