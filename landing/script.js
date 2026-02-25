const root = document.documentElement;
const nav = document.querySelector('.nav');
const menuToggle = document.querySelector('.menu-toggle');
const themeToggle = document.querySelector('.theme-toggle');
const form = document.getElementById('quizForm');
const modal = document.getElementById('thanksModal');
const closeModal = document.getElementById('closeModal');
const seatsEl = document.getElementById('seats');
const seatsProgress = document.getElementById('seatsProgress');
const reserveBtn = document.getElementById('reserveBtn');
const timerEl = document.getElementById('timer');

const quizSteps = Array.from(document.querySelectorAll('.quiz-step'));
const quizBack = document.getElementById('quizBack');
const quizNext = document.getElementById('quizNext');
const quizSubmit = document.getElementById('quizSubmit');
const quizProgressBar = document.getElementById('quizProgressBar');
const quizStepLabel = document.getElementById('quizStepLabel');

const savedTheme = localStorage.getItem('petcareTheme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);

themeToggle?.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('petcareTheme', next);
});

menuToggle?.addEventListener('click', () => {
  nav?.classList.toggle('open');
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
});

document.querySelectorAll('.nav a').forEach((a) => {
  a.addEventListener('click', () => {
    nav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

let currentStep = 0;
const updateQuizStep = () => {
  quizSteps.forEach((step, index) => {
    step.classList.toggle('active', index === currentStep);
  });

  const progress = ((currentStep + 1) / quizSteps.length) * 100;
  if (quizProgressBar) quizProgressBar.style.width = `${progress}%`;
  if (quizStepLabel) quizStepLabel.textContent = `Крок ${currentStep + 1} з ${quizSteps.length}`;

  if (quizBack) quizBack.style.display = currentStep === 0 ? 'none' : 'inline-flex';
  if (quizNext) quizNext.style.display = currentStep === quizSteps.length - 1 ? 'none' : 'inline-flex';
  if (quizSubmit) quizSubmit.style.display = currentStep === quizSteps.length - 1 ? 'inline-flex' : 'none';
};

const validateStep = () => {
  const activeStep = quizSteps[currentStep];
  const field = activeStep?.querySelector('input, select');
  if (!field) return true;
  return field.reportValidity();
};

quizNext?.addEventListener('click', () => {
  if (!validateStep()) return;
  currentStep = Math.min(currentStep + 1, quizSteps.length - 1);
  updateQuizStep();
});

quizBack?.addEventListener('click', () => {
  currentStep = Math.max(currentStep - 1, 0);
  updateQuizStep();
});

updateQuizStep();

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateStep()) return;

  const data = Object.fromEntries(new FormData(form).entries());
  const payload = { ...data, createdAt: new Date().toISOString() };
  const existing = JSON.parse(localStorage.getItem('petcareQuiz') || '[]');
  existing.push(payload);
  localStorage.setItem('petcareQuiz', JSON.stringify(existing));

  modal?.classList.add('show');
  modal?.setAttribute('aria-hidden', 'false');
  form.reset();
  currentStep = 0;
  updateQuizStep();
});

closeModal?.addEventListener('click', () => {
  modal?.classList.remove('show');
  modal?.setAttribute('aria-hidden', 'true');
});

const maxSeats = 60;
let seats = Number(localStorage.getItem('petcareSeats') || '47');

const updateSeats = () => {
  if (seatsEl) seatsEl.textContent = String(seats);
  if (seatsProgress) seatsProgress.style.width = `${(seats / maxSeats) * 100}%`;
};

updateSeats();

reserveBtn?.addEventListener('click', () => {
  seats = Math.max(0, seats - 1);
  localStorage.setItem('petcareSeats', String(seats));
  updateSeats();
});

const renderTimer = (totalSec) => {
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  if (!timerEl) return;
  timerEl.innerHTML = `
    <span class="pill"><b>${h}</b><small>HH</small></span>
    <span class="pill"><b>${m}</b><small>MM</small></span>
    <span class="pill"><b>${s}</b><small>SS</small></span>
  `;
};

let sec = 23 * 3600 + 59 * 60 + 59;
renderTimer(sec);
setInterval(() => {
  sec = sec > 0 ? sec - 1 : 23 * 3600 + 59 * 60 + 59;
  renderTimer(sec);
}, 1000);

const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  const button = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  button?.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    faqItems.forEach((el) => {
      el.classList.remove('open');
      const panel = el.querySelector('.faq-answer');
      if (panel) panel.style.maxHeight = '0px';
    });

    if (!isOpen) {
      item.classList.add('open');
      if (answer) answer.style.maxHeight = `${answer.scrollHeight}px`;
    }
  });
});
