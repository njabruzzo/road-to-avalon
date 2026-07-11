const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('.expand').forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.pillar');
    card.classList.toggle('open');
    button.setAttribute('aria-expanded', String(card.classList.contains('open')));
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
document.getElementById('year').textContent = new Date().getFullYear();

document.querySelectorAll('.checklist input').forEach(box => {
  box.checked = localStorage.getItem(`avalon-${box.dataset.key}`) === 'true';
  box.addEventListener('change', () => localStorage.setItem(`avalon-${box.dataset.key}`, String(box.checked)));
});

document.querySelectorAll('[data-save]').forEach(field => {
  const stored = localStorage.getItem(`avalon-${field.dataset.save}`);
  if (stored !== null) field.value = stored;
  field.addEventListener('input', () => localStorage.setItem(`avalon-${field.dataset.save}`, field.value));
});

document.querySelectorAll('[data-text-save]').forEach(field => {
  const stored = localStorage.getItem(`avalon-${field.dataset.textSave}`);
  if (stored !== null) field.textContent = stored;
  field.addEventListener('input', () => localStorage.setItem(`avalon-${field.dataset.textSave}`, field.textContent.trim()));
  field.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      field.blur();
    }
  });
});
