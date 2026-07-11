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

const fitTextarea = field => {
  field.style.height = 'auto';
  field.style.height = `${field.scrollHeight}px`;
};

document.querySelectorAll('textarea').forEach(field => {
  fitTextarea(field);
  field.addEventListener('input', () => fitTextarea(field));
});

const editToggle = document.querySelector('.edit-toggle');
const finishEdit = document.querySelector('.finish-edit');
const pageTextSelector = [
  'h1', 'h2', 'h3', 'blockquote',
  'p:not(:has(input)):not(:has(textarea))',
  '.hero-footer > span', '.brand > span', '.nav-links > a',
  '.pillar-index', '.pillar-icon', '.section-number',
  '.metric-card > a', '.metric-card > span',
  '.vision-card .card-no', '.vision-card .line-link', '.compass',
  '.checklist .milestone-text', 'footer .shell > span'
].join(',');

const pageText = [...new Set(document.querySelectorAll(pageTextSelector))]
  .filter(field => !field.closest('.edit-toolbar') && !field.closest('button'));

pageText.forEach((field, index) => {
  const key = field.dataset.textSave || `page-copy-${index}`;
  field.dataset.pageEditKey = key;
  field.classList.add('page-editable');
  field.setAttribute('contenteditable', 'false');
  const stored = localStorage.getItem(`avalon-page-${key}`);
  if (stored !== null) field.innerHTML = stored;
  field.addEventListener('input', () => localStorage.setItem(`avalon-page-${key}`, field.innerHTML));
  field.addEventListener('keydown', event => {
    if (event.key === 'Escape') field.blur();
  });
});

const setEditMode = enabled => {
  document.body.classList.toggle('editing', enabled);
  editToggle.setAttribute('aria-pressed', String(enabled));
  editToggle.textContent = enabled ? 'Editing…' : 'Edit page';
  pageText.forEach(field => field.setAttribute('contenteditable', String(enabled)));
};

editToggle.addEventListener('click', () => setEditMode(!document.body.classList.contains('editing')));
finishEdit.addEventListener('click', () => setEditMode(false));

document.querySelectorAll('a.page-editable').forEach(link => {
  link.addEventListener('click', event => {
    if (document.body.classList.contains('editing')) event.preventDefault();
  });
});

const goalPairs = [
  ['measure-creative', 'creative-description'],
  ['measure-health', 'health-description'],
  ['measure-wealth', 'wealth-description'],
  ['measure-relationships', 'relationships-description'],
  ['measure-travel', 'travel-description']
];

goalPairs.forEach(([summaryKey, detailKey]) => {
  const summary = document.querySelector(`[data-save="${summaryKey}"]`);
  const detail = document.querySelector(`[data-save="${detailKey}"]`);
  const saved = localStorage.getItem(`avalon-${detailKey}`) || localStorage.getItem(`avalon-${summaryKey}`);
  if (saved) summary.value = detail.value = saved;
  const sync = (source, target, targetKey) => {
    target.value = source.value;
    localStorage.setItem(`avalon-${targetKey}`, source.value);
    fitTextarea(source);
    fitTextarea(target);
  };
  summary.addEventListener('input', () => sync(summary, detail, detailKey));
  detail.addEventListener('input', () => sync(detail, summary, summaryKey));
  fitTextarea(summary);
  fitTextarea(detail);
});
