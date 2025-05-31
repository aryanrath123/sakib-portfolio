AOS.init({ duration: 1000, once: true });

// TOGGLE MENU
const hamburger = document.getElementById("hamburger");
const navbar = document.getElementById("navbar");

hamburger.addEventListener("click", () => {
  navbar.classList.toggle("active");
});

// TYPING EFFECT
new Typed("#typing", {
  strings: ["AI & Data Science.", "Generative AI.", "Machine Learning."],
  typeSpeed: 60,
  backSpeed: 30,
  backDelay: 1000,
  loop: true,
});

// COUNTER ANIMATION
const counters = document.querySelectorAll(".counter");
const speed = 50;

const runCounter = (counter) => {
  const target = +counter.getAttribute("data-target");
  const count = +counter.innerText;
  const increment = Math.ceil(target / speed);

  if (count < target) {
    counter.innerText = count + increment;
    setTimeout(() => runCounter(counter), 20);
  } else {
    counter.innerText = target;
  }
};

// Observer setup
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      counters.forEach((counter) => runCounter(counter));
      observer.disconnect(); // run only once
    }
  });
});

// Observe the section
const counterSection = document.querySelector(".counter-section");
if (counterSection) {
  observer.observe(counterSection);
}

// SCROLL TO TOP
window.onscroll = () => {
  const scrollY = window.scrollY,
    topBtn = document.getElementById("backToTop");

  topBtn.style.display = scrollY > 300 ? "block" : "none";
};

document
  .getElementById("backToTop")
  ?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

// VIEW MORE/LESS TOGGLE
document.querySelector(".viewMoreBtn")?.addEventListener("click", function () {
  const expandedSection = document.querySelector(".tech-grid-expanded");
  const btn = this;

  if (
    expandedSection.style.display === "none" ||
    !expandedSection.style.display
  ) {
    expandedSection.style.display = "grid";
    btn.textContent = "View Less";
    expandedSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } else {
    expandedSection.style.display = "none";
    btn.textContent = "View More";
  }
});

// CHATBOT FUNCTIONALITY
const chatBox = document.getElementById("chat-box");
const sendButton = document.getElementById("send-button");

function appendMessage(content, isUser) {
  const msg = document.createElement("div");
  msg.className = isUser ? "user-msg" : "bot-msg";
  msg.textContent = content;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Handle Enter key press
document.getElementById("user-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Handle send button click
sendButton.addEventListener("click", sendMessage);

async function sendMessage() {
  const input = document.getElementById("user-input");
  const question = input.value.trim();
  if (!question) return;

  appendMessage(question, true);
  input.value = "";
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
    const response = await fetch("https://your-render-url.onrender.com/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

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
