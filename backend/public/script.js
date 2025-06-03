// Global state management
const appState = {
  chat: {
    isTyping: false,
    audioInitialized: false,
    audioEnabled: true,
    audioElement: null,
    countersAnimated: false,
  },
  ui: {
    backToTopVisible: false,
  },
};

// DOM Content Loaded - Main Initialization
document.addEventListener("DOMContentLoaded", function () {
  initializeChat();
  initializeNavigation();
  initializeBackToTop();
  initializeCounters();
});

// ================= CHAT FUNCTIONALITY =================
function initializeChat() {
  const inputBox = document.getElementById("user-input");
  const sendButton =
    document.getElementById("send-button") || inputBox.nextElementSibling;
  appState.chat.audioElement = document.getElementById("typing-sound");

  const setupEventListeners = () => {
    const initializeAudio = () => {
      if (appState.chat.audioInitialized || !appState.chat.audioElement) return;

      appState.chat.audioElement.volume = 0.2;
      appState.chat.audioElement
        .play()
        .then(() => {
          appState.chat.audioElement.pause();
          appState.chat.audioElement.currentTime = 0;
          appState.chat.audioInitialized = true;
        })
        .catch((error) => {
          console.warn("Audio initialization failed:", error);
          appState.chat.audioEnabled = false;
        });
    };

    document.addEventListener("click", initializeAudio, { once: true });
    document.addEventListener("keypress", initializeAudio, { once: true });

    inputBox.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && inputBox.value.trim()) {
        e.preventDefault();
        sendMessage();
      }
    });

    if (sendButton) sendButton.addEventListener("click", sendMessage);
  };

  // Delay focus to prevent unwanted scroll on page load
  setTimeout(() => {
    inputBox.focus();
  }, 500);

  setupEventListeners();
  setupAudioToggle();

  setTimeout(() => {
    addMessageToChat(
      "Hello! I'm your AI assistant. How can I help you today?",
      "bot"
    );
  }, 500);
}

async function sendMessage() {
  if (appState.chat.isTyping) return;

  const inputBox = document.getElementById("user-input");
  const message = inputBox.value.trim();
  if (!message) return;

  inputBox.value = "";
  disableInput(true);
  addMessageToChat(message, "user");

  const botMessageId = addMessageToChat(createTypingDots(), "bot", true);
  scrollChatToBottom();

  try {
    await simulateThinkingDelay();
    const botResponse = await getBotResponse(message);
    typewriterEffect(botMessageId, botResponse);
  } catch (error) {
    handleResponseError(error, botMessageId);
  } finally {
    resetInputState();
  }
}

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

// ================= UI COMPONENTS =================
function initializeNavigation() {
  const hamburger = document.getElementById("hamburger");
  const navBar = document.getElementById("navBar");

  if (hamburger && navBar) {
    hamburger.addEventListener("click", () => {
      navBar.classList.toggle("active");
      hamburger.classList.toggle("open");
    });

    document.querySelectorAll(".navBar a").forEach((link) => {
      link.addEventListener("click", () => {
        navBar.classList.remove("active");
        hamburger.classList.remove("open");
      });
    });
  }
}

function initializeBackToTop() {
  const backToTopBtn = document.getElementById("backToTop");
  if (!backToTopBtn) return;

  window.addEventListener(
    "scroll",
    throttle(() => {
      const scrollPosition =
        window.scrollY || document.documentElement.scrollTop;
      const shouldBeVisible = scrollPosition > 300;

      if (shouldBeVisible !== appState.ui.backToTopVisible) {
        backToTopBtn.classList.toggle("visible", shouldBeVisible);
        appState.ui.backToTopVisible = shouldBeVisible;
      }
    }, 100)
  );

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initializeCounters() {
  window.addEventListener(
    "scroll",
    throttle(() => {
      if (!appState.chat.countersAnimated) {
        const aboutSection = document.querySelector(".about-right");
        if (
          aboutSection?.getBoundingClientRect().top <
          window.innerHeight - 100
        ) {
          animateCounters();
          appState.chat.countersAnimated = true;
        }
      }
    }, 100)
  );
}

// ================= UTILITY FUNCTIONS =================
function throttle(callback, limit) {
  let waiting = false;
  return function () {
    if (!waiting) {
      callback.apply(this, arguments);
      waiting = true;
      setTimeout(() => {
        waiting = false;
      }, limit);
    }
  };
}

async function simulateThinkingDelay() {
  const delay = 800 + Math.random() * 800;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

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

function handleResponseError(error, messageId) {
  console.error("⚠️ Error:", error);
  updateBotMessage(
    messageId,
    "⚠️ Sorry, I encountered an error. Please try again later."
  );
  appState.chat.isTyping = false;
}

function resetInputState() {
  disableInput(false);
  document.getElementById("user-input").focus();
}

function animateCounters() {
  const counters = document.querySelectorAll(".counter");
  const speed = 200;

  counters.forEach((counter) => {
    const updateCount = () => {
      const target = +counter.getAttribute("data-target");
      const count = +counter.innerText;
      const increment = target / speed;

      if (count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(updateCount, 10);
      } else {
        counter.innerText = target;
      }
    };

    updateCount();
  });
}

function setupAudioToggle() {
  const toggleBtn = document.getElementById("toggle-audio");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      appState.chat.audioEnabled = !appState.chat.audioEnabled;
      toggleBtn.textContent = appState.chat.audioEnabled
        ? "🔈 Sound On"
        : "🔇 Sound Off";
      toggleBtn.setAttribute(
        "aria-label",
        appState.chat.audioEnabled ? "Sound enabled" : "Sound disabled"
      );
    });
  }
}

function typewriterEffect(elementId, text, baseSpeed = 30) {
  const element = document.getElementById(elementId);
  if (!element) return;

  appState.chat.isTyping = true;
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
    appState.chat.isTyping = false;
    stopAudioPlayback();
  };

  const playTypingSound = (index, char) => {
    if (
      !appState.chat.audioEnabled ||
      !appState.chat.audioElement ||
      !/\w/.test(char)
    )
      return;
    if (index % 2 === 0) {
      appState.chat.audioElement.currentTime = 0;
      appState.chat.audioElement.play().catch(() => {
        appState.chat.audioEnabled = false;
      });
    }
  };

  const stopAudioPlayback = () => {
    if (appState.chat.audioElement && !appState.chat.audioElement.paused) {
      appState.chat.audioElement.pause();
      appState.chat.audioElement.currentTime = 0;
    }
  };

  const getTypingSpeed = (char) => {
    if (/[.,;!?]/.test(char)) return baseSpeed * 6;
    if (char === " ") return baseSpeed * 3;
    return baseSpeed + Math.random() * 20;
  };

  setTimeout(typeNextCharacter, 200);
}

// Force scroll to top on load
window.addEventListener("load", () => {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 300);
});
