// Global state management
const chatState = {
  isTyping: false,
  audioInitialized: false,
  audioEnabled: true,
  audioElement: null,
};

// Initialize chat when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Cache DOM elements
  const inputBox = document.getElementById("user-input");
  const sendButton =
    document.getElementById("send-button") || inputBox.nextElementSibling;
  chatState.audioElement = document.getElementById("typing-sound");

  // Audio initialization handler
  const initializeAudio = () => {
    if (chatState.audioInitialized || !chatState.audioElement) return;

    chatState.audioElement.volume = 0.2;
    chatState.audioElement
      .play()
      .then(() => {
        chatState.audioElement.pause();
        chatState.audioElement.currentTime = 0;
        chatState.audioInitialized = true;
      })
      .catch((error) => {
        console.warn("Audio initialization failed:", error);
        chatState.audioEnabled = false;
      });
  };

  // Set up event listeners
  const setupEventListeners = () => {
    // Audio initialization triggers
    document.addEventListener("click", initializeAudio, { once: true });
    document.addEventListener("keypress", initializeAudio, { once: true });

    // Message submission
    inputBox.addEventListener("keypress", handleEnterKey);
    if (sendButton) sendButton.addEventListener("click", sendMessage);
  };

  // Handle Enter key press
  const handleEnterKey = (e) => {
    if (e.key === "Enter" && inputBox.value.trim()) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Initial setup
  inputBox.focus();
  setupEventListeners();
  setupAudioToggle();

  // Show welcome message
  setTimeout(() => {
    addMessageToChat(
      "Hello! I'm your AI assistant. How can I help you today?",
      "bot"
    );
  }, 500);
});

// Main message sending function
async function sendMessage() {
  if (chatState.isTyping) return;

  const inputBox = document.getElementById("user-input");
  const message = inputBox.value.trim();
  if (!message) return;

  // Prepare UI for new message
  inputBox.value = "";
  disableInput(true);
  addMessageToChat(message, "user");

  // Show typing indicator
  const botMessageId = addMessageToChat(createTypingDots(), "bot", true);
  scrollChatToBottom();

  try {
    // Simulate thinking time
    await simulateThinkingDelay();

    // Get bot response
    const botResponse = await getBotResponse(message);
    typewriterEffect(botMessageId, botResponse);
  } catch (error) {
    handleResponseError(error, botMessageId);
  } finally {
    resetInputState();
  }
}

// Simulate natural thinking delay
async function simulateThinkingDelay() {
  const delay = 800 + Math.random() * 800; // 0.8-1.6 seconds
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// Fetch bot response from server
async function getBotResponse(message) {
  const response = await fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: message }),
  });

  if (!response.ok) {
    throw new Error((await response.text()) || "Server error");
  }

  const data = await response.json();
  return data.answer || "I couldn't find an answer to that question.";
}

// Handle API errors
function handleResponseError(error, messageId) {
  console.error("⚠️ Error:", error);
  updateBotMessage(
    messageId,
    "⚠️ Sorry, I encountered an error. Please try again later."
  );
  chatState.isTyping = false;
}

// Reset input after processing
function resetInputState() {
  disableInput(false);
  document.getElementById("user-input").focus();
}

// Typewriter effect implementation
function typewriterEffect(elementId, text, baseSpeed = 30) {
  const element = document.getElementById(elementId);
  if (!element) return;

  chatState.isTyping = true;
  let currentIndex = 0;
  element.innerHTML = "";

  const typeNextCharacter = () => {
    if (currentIndex >= text.length) {
      completeTyping();
      return;
    }

    const char = text.charAt(currentIndex);
    element.innerHTML += char;
    scrollChatToBottom();

    playTypingSound(currentIndex, char);
    currentIndex++;

    setTimeout(typeNextCharacter, getTypingSpeed(char));
  };

  const completeTyping = () => {
    chatState.isTyping = false;
    stopAudioPlayback();
  };

  const playTypingSound = (index, char) => {
    if (!chatState.audioEnabled || !chatState.audioElement || !/\w/.test(char))
      return;

    // Play sound only for every 2nd character to reduce intensity
    if (index % 2 === 0) {
      chatState.audioElement.currentTime = 0;
      chatState.audioElement.play().catch(() => {
        chatState.audioEnabled = false;
      });
    }
  };

  const stopAudioPlayback = () => {
    if (chatState.audioElement && !chatState.audioElement.paused) {
      chatState.audioElement.pause();
      chatState.audioElement.currentTime = 0;
    }
  };

  const getTypingSpeed = (char) => {
    if (/[.,;!?]/.test(char)) return baseSpeed * 6; // Longer pause for punctuation
    if (char === " ") return baseSpeed * 3; // Medium pause for spaces
    return baseSpeed + Math.random() * 20; // Slight randomness for letters
  };

  setTimeout(typeNextCharacter, 200); // Initial delay before typing starts
}

// Chat helper functions
function addMessageToChat(content, sender, assignId = false) {
  const chatBox = document.getElementById("chat-box");
  const messageDiv = document.createElement("div");

  messageDiv.className = sender === "user" ? "user-msg" : "bot-msg";
  if (assignId) {
    messageDiv.id = `msg-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  messageDiv.innerHTML = content;
  chatBox.appendChild(messageDiv);
  scrollChatToBottom();
  return messageDiv.id;
}

function updateBotMessage(id, content) {
  const msg = document.getElementById(id);
  if (msg) {
    msg.innerHTML = content;
    scrollChatToBottom();
  }
}

function disableInput(disabled) {
  const input = document.getElementById("user-input");
  const btn = document.getElementById("send-button");
  if (input) input.disabled = disabled;
  if (btn) btn.disabled = disabled;
}

function scrollChatToBottom() {
  const chatBox = document.getElementById("chat-box");
  if (chatBox) {
    setTimeout(() => {
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 50);
  }
}

function createTypingDots() {
  return `
    <span class="typing-dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </span>
  `;
}

// Audio toggle functionality
function setupAudioToggle() {
  const toggleBtn = document.getElementById("toggle-audio");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      chatState.audioEnabled = !chatState.audioEnabled;
      toggleBtn.textContent = chatState.audioEnabled
        ? "🔈 Sound On"
        : "🔇 Sound Off";
      toggleBtn.setAttribute(
        "aria-label",
        chatState.audioEnabled ? "Sound enabled" : "Sound disabled"
      );
    });
  }
}
