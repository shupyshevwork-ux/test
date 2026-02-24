const root = document.documentElement;
const nav = document.querySelector('.nav');
const menuToggle = document.querySelector('.menu-toggle');
const themeToggle = document.querySelector('.theme-toggle');
const form = document.getElementById('quizForm');
const modal = document.getElementById('thanksModal');
const closeModal = document.getElementById('closeModal');
const seatsEl = document.getElementById('seats');
const reserveBtn = document.getElementById('reserveBtn');
const timerEl = document.getElementById('timer');

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
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const payload = { ...data, createdAt: new Date().toISOString() };
  const existing = JSON.parse(localStorage.getItem('petcareQuiz') || '[]');
  existing.push(payload);
  localStorage.setItem('petcareQuiz', JSON.stringify(existing));
  console.log('PetCare quiz:', payload);
  modal?.classList.add('show');
  modal?.setAttribute('aria-hidden', 'false');
  form.reset();
});

closeModal?.addEventListener('click', () => {
  modal?.classList.remove('show');
  modal?.setAttribute('aria-hidden', 'true');
});

let seats = Number(localStorage.getItem('petcareSeats') || '47');
seatsEl.textContent = String(seats);
reserveBtn?.addEventListener('click', () => {
  seats = Math.max(0, seats - 1);
  seatsEl.textContent = String(seats);
  localStorage.setItem('petcareSeats', String(seats));
});

let sec = 23 * 3600 + 59 * 60 + 59;
setInterval(() => {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  timerEl.textContent = `${h}:${m}:${s}`;
  sec = sec > 0 ? sec - 1 : 23 * 3600 + 59 * 60 + 59;
}, 1000);
