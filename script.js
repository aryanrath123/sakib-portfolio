AOS.init({ duration: 1000, once: true });

//TOGGLE

const hamburger = document.getElementById("hamburger");
const navbar = document.getElementById("navbar");

hamburger.addEventListener("click", () => {
  navbar.classList.toggle("active");
});

//TYPING EFFECT

new Typed("#typing", {
  strings: ["AI & Data Science.", "Generative AI.", "Machine Learning."],
  typeSpeed: 60,
  backSpeed: 30,
  backDelay: 1000,
  loop: true,
});

//COUNTER ANIMATION
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

document.querySelector(".viewMoreBtn").addEventListener("click", function () {
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

const chatBox = document.getElementById("chat-box");

function appendMessage(content, isUser) {
  const msg = document.createElement("div");
  msg.className = isUser ? "user-msg" : "bot-msg";
  msg.textContent = content;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("user-input");
  const question = input.value.trim();
  if (!question) return;

  appendMessage(question, true);
  input.value = "";

  if (question.toLowerCase().includes("hi")) {
    appendMessage(
      "Hello! This is Saquib's AI assistant. How can I help you today?",
      false
    );
    return;
  }

  try {
    const response = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await response.json();
    appendMessage(data.answer, false);
  } catch (err) {
    appendMessage("Sorry, something went wrong.", false);
  }
}
