(() => {
  const STORAGE_KEYS = {
    quizState: 'petcareQuizState',
    theme: 'petcareTheme',
    slots: 'petcareSlotsLeft',
    countdownStart: 'petcareCountdownStart'
  };

  const MIN_SLOTS = 7;
  const DEFAULT_SLOTS = 12;
  const COUNTDOWN_DURATION = 24 * 60 * 60 * 1000;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const state = {
    petType: null,
    breed: null,
    age: null,
    goal: null,
    name: null,
    contact: null
  };

  const quizSteps = [
    { key: 'petType', label: 'Выберите вид питомца.' },
    { key: 'breed', label: 'Укажите породу питомца.' },
    { key: 'age', label: 'Выберите возраст питомца.' },
    { key: 'goal', label: 'Выберите цель.' },
    { key: 'name', label: 'Введите ваше имя.' },
    { key: 'contact', label: 'Введите корректный email.', validator: (value) => EMAIL_REGEX.test(value) }
  ];

  const elements = {
    menuToggle: document.querySelector('.menu-toggle'),
    nav: document.querySelector('.nav'),
    navLinks: document.querySelectorAll('.nav a'),
    revealElements: document.querySelectorAll('.reveal'),
    faqItems: document.querySelectorAll('.faq-item'),
    themeToggle: document.querySelector('.theme-toggle'),
    countdown: document.querySelector('.countdown'),
    slotsCounter: document.querySelector('.slots-counter'),
    quiz: document.querySelector('.quiz'),
    screens: document.querySelectorAll('.quiz-screen'),
    progress: document.querySelector('.quiz__progress'),
    progressFill: document.querySelector('.quiz__progress span'),
    stepLabel: document.querySelector('.quiz-current-step'),
    error: document.querySelector('.quiz-error'),
    prevButton: document.querySelector('.quiz-prev'),
    nextButton: document.querySelector('.quiz-next'),
    toast: document.querySelector('.toast'),
    modal: document.querySelector('.modal'),
    modalClose: document.querySelector('.modal-close')
  };

  let currentStep = 0;
  let countdownTimer;

  const init = () => {
    initMenu();
    initReveal();
    initFaq();
    initThemeToggle();
    initSlotsCounter();
    initCountdown();
    initQuiz();
    initModal();
  };

  const initMenu = () => {
    if (!elements.menuToggle || !elements.nav) return;

    elements.menuToggle.addEventListener('click', () => {
      const isOpen = elements.nav.classList.toggle('is-open');
      elements.menuToggle.setAttribute('aria-expanded', String(isOpen));
      elements.menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });

    elements.navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        elements.nav.classList.remove('is-open');
        elements.menuToggle.setAttribute('aria-expanded', 'false');
        elements.menuToggle.setAttribute('aria-label', 'Открыть меню');
      });
    });
  };

  const initReveal = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.18 }
    );

    elements.revealElements.forEach((node) => observer.observe(node));
  };

  const initFaq = () => {
    elements.faqItems.forEach((item) => {
      const button = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      if (!button || !answer) return;

      const toggleFaq = () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!isExpanded));
        answer.hidden = isExpanded;
      };

      button.addEventListener('click', toggleFaq);
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleFaq();
        }
      });
    });
  };

  const initThemeToggle = () => {
    if (!elements.themeToggle) return;

    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    if (savedTheme === 'light') document.body.classList.add('theme-light');

    elements.themeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('theme-light');
      localStorage.setItem(STORAGE_KEYS.theme, isLight ? 'light' : 'dark');
    });
  };

  const initSlotsCounter = () => {
    const storedSlots = Number.parseInt(localStorage.getItem(STORAGE_KEYS.slots) || '', 10);
    const slots = Number.isNaN(storedSlots) ? DEFAULT_SLOTS : Math.max(storedSlots, MIN_SLOTS);
    localStorage.setItem(STORAGE_KEYS.slots, String(slots));
    renderSlots(slots);
  };

  const initCountdown = () => {
    if (!elements.countdown) return;

    const savedStart = Number.parseInt(localStorage.getItem(STORAGE_KEYS.countdownStart) || '', 10);
    const now = Date.now();
    const start = Number.isNaN(savedStart) || now - savedStart >= COUNTDOWN_DURATION ? now : savedStart;

    localStorage.setItem(STORAGE_KEYS.countdownStart, String(start));
    updateCountdown(start);
    countdownTimer = setInterval(() => updateCountdown(start), 1000);
  };

  const updateCountdown = (start) => {
    const elapsed = Date.now() - start;
    const remaining = COUNTDOWN_DURATION - elapsed;

    if (remaining <= 0) {
      clearInterval(countdownTimer);
      localStorage.setItem(STORAGE_KEYS.countdownStart, String(Date.now()));
      initCountdown();
      return;
    }

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    elements.countdown.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const initQuiz = () => {
    if (!elements.quiz) return;

    hydrateState();
    syncInputsFromState();
    bindQuizInputHandlers();
    elements.prevButton.addEventListener('click', () => changeStep(-1));
    elements.nextButton.addEventListener('click', () => handleNext());
    renderStep();
  };

  const hydrateState = () => {
    const saved = localStorage.getItem(STORAGE_KEYS.quizState);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      Object.keys(state).forEach((key) => {
        state[key] = parsed[key] ?? null;
      });
    } catch {
      localStorage.removeItem(STORAGE_KEYS.quizState);
    }
  };

  const syncInputsFromState = () => {
    Object.entries(state).forEach(([key, value]) => {
      const input = elements.quiz.querySelector(`[name="${key}"]`);
      if (input && value) input.value = value;
    });
  };

  const bindQuizInputHandlers = () => {
    quizSteps.forEach(({ key }) => {
      const input = elements.quiz.querySelector(`[name="${key}"]`);
      if (!input) return;
      input.addEventListener('input', () => {
        state[key] = input.value.trim();
        clearError();
      });
      input.addEventListener('change', () => {
        state[key] = input.value.trim();
        clearError();
      });
    });
  };

  const changeStep = (direction) => {
    currentStep = Math.max(0, Math.min(currentStep + direction, quizSteps.length - 1));
    renderStep();
  };

  const handleNext = () => {
    const config = quizSteps[currentStep];
    const value = (state[config.key] || '').trim();
    const isValid = config.validator ? config.validator(value) : Boolean(value);

    if (!isValid) {
      showError(config.label);
      return;
    }

    if (currentStep === quizSteps.length - 1) {
      finishQuiz();
      return;
    }

    changeStep(1);
  };

  const finishQuiz = () => {
    localStorage.setItem(STORAGE_KEYS.quizState, JSON.stringify(state));
    decrementSlots();
    openModal();
    showToast('Заявка принята. Проверьте email.');
  };

  const decrementSlots = () => {
    const currentSlots = Number.parseInt(localStorage.getItem(STORAGE_KEYS.slots) || String(DEFAULT_SLOTS), 10);
    const nextSlots = Math.max(MIN_SLOTS, (Number.isNaN(currentSlots) ? DEFAULT_SLOTS : currentSlots) - 1);
    localStorage.setItem(STORAGE_KEYS.slots, String(nextSlots));
    renderSlots(nextSlots);
  };

  const renderSlots = (value) => {
    if (elements.slotsCounter) elements.slotsCounter.textContent = String(value);
  };

  const renderStep = () => {
    elements.screens.forEach((screen, index) => {
      screen.hidden = index !== currentStep;
    });

    const progress = Math.round(((currentStep + 1) / quizSteps.length) * 100);
    elements.progress.setAttribute('aria-valuenow', String(progress));
    elements.progressFill.style.width = `${progress}%`;
    elements.stepLabel.textContent = String(currentStep + 1);

    elements.prevButton.disabled = currentStep === 0;
    elements.nextButton.textContent = currentStep === quizSteps.length - 1 ? 'Отправить' : 'Далее';
    clearError();
  };

  const showError = (message) => {
    elements.error.textContent = message;
  };

  const clearError = () => {
    elements.error.textContent = '';
  };

  const showToast = (message) => {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    setTimeout(() => elements.toast.classList.remove('show'), 2400);
  };

  const initModal = () => {
    if (!elements.modal || !elements.modalClose) return;
    elements.modalClose.addEventListener('click', closeModal);
    elements.modal.addEventListener('click', (event) => {
      if (event.target === elements.modal) closeModal();
    });
  };

  const openModal = () => {
    if (elements.modal) elements.modal.hidden = false;
  };

  const closeModal = () => {
    if (elements.modal) elements.modal.hidden = true;
  };

  init();
})();
