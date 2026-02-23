const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const navLinks = document.querySelectorAll('.nav a');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Открыть меню');
    });
  });
}

const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.18 }
);

revealElements.forEach((element) => observer.observe(element));

const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  const button = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

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

const form = document.querySelector('.lead-form');
const toast = document.querySelector('.toast');

if (form && toast) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const leadData = {
      name: formData.get('name')?.toString().trim(),
      contact: formData.get('contact')?.toString().trim(),
      petType: formData.get('petType')?.toString(),
      breed: formData.get('breed')?.toString().trim(),
      age: formData.get('age')?.toString(),
      goal: formData.get('goal')?.toString()
    };

    const existingLeads = JSON.parse(localStorage.getItem('petcareLeads') || '[]');
    existingLeads.push({ ...leadData, createdAt: new Date().toISOString() });
    localStorage.setItem('petcareLeads', JSON.stringify(existingLeads));

    console.log('PetCare Lead:', leadData);

    toast.textContent = 'Заявка принята';
    toast.classList.add('show');

    form.reset();

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2600);
  });
}
