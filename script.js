const STORAGE_KEY = 'quest-for-avalon-v1';

const CLASS_META = {
  'male-knight': {
    label: 'MALE KNIGHT',
    flavor: 'A Stage 1 Knight steps into the firelight—dagger ready, cloak plain, vow unbroken.'
  },
  'male-wizard': {
    label: 'MALE WIZARD',
    flavor: 'Arcane light sparks at his staff. The tavern hush deepens as runes awaken.'
  },
  'female-wizard': {
    label: 'FEMALE WIZARD',
    flavor: 'She rises from shadow; violet sparks crown her hat. Avalon stirs.'
  }
};

const MONSTER_TYPES = ['goblin', 'skeleton', 'slime', 'bat', 'dragon', 'ghost', 'orc'];

const defaultQuests = () => ([
  {
    id: uid(),
    title: 'Health',
    goal: 'Build functional strength and stamina',
    milestones: [
      { id: uid(), text: 'Lift weights 3x a week', done: false },
      { id: uid(), text: 'Maintain 10 mins of vigorous cardio daily', done: false }
    ]
  },
  {
    id: uid(),
    title: 'Wealth',
    goal: 'Optimize current investment portfolio',
    milestones: [
      { id: uid(), text: 'Manage tax-loss harvesting strategy', done: false },
      { id: uid(), text: 'Balance tech/defense sectors', done: false }
    ]
  },
  {
    id: uid(),
    title: 'Home',
    goal: 'Curate the collection display',
    milestones: [
      { id: uid(), text: 'Build custom diorama shelving for 1/6 scale figures', done: false },
      { id: uid(), text: 'Install lighting for Mythic Legions display', done: false }
    ]
  },
  {
    id: uid(),
    title: 'Relationships',
    goal: 'Execute the New Zealand Trip',
    milestones: [
      { id: uid(), text: 'Plan the 10-day October itinerary with Debra', done: false }
    ]
  },
  {
    id: uid(),
    title: 'Career',
    goal: 'Drive digital transformation',
    milestones: [
      { id: uid(), text: 'Execute the next phase of organizational AI orchestration', done: false }
    ]
  },
  {
    id: uid(),
    title: 'Creative Explorations',
    goal: 'Launch the new tabletop campaign',
    milestones: [
      { id: uid(), text: 'Finalize the backdrop lore for the AD&D 2nd Edition game', done: false }
    ]
  },
  {
    id: uid(),
    title: 'Knowledge & Wisdom',
    goal: 'Advance personal studies',
    milestones: [
      { id: uid(), text: 'Complete the next chapter of historical and prophetic research', done: false }
    ]
  }
]);

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.quests)) throw new Error('empty');
    return {
      name: saved.name || '',
      classId: saved.classId || '',
      quests: saved.quests,
      onboarded: Boolean(saved.onboarded),
      muted: Boolean(saved.muted)
    };
  } catch {
    return {
      name: '',
      classId: '',
      quests: defaultQuests(),
      onboarded: false,
      muted: false
    };
  }
}

let state = loadState();
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ---------- Audio (Web Audio chiptune-ish) ---------- */
const AudioBus = (() => {
  let ctx = null;
  let master = null;
  let musicNodes = [];
  let musicTimer = null;
  let track = null;

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = state.muted ? 0 : 0.22;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function setMuted(muted) {
    state.muted = muted;
    save();
    if (master) master.gain.setTargetAtTime(muted ? 0 : 0.22, ctx.currentTime, 0.05);
  }

  function beep(freq, dur = 0.08, type = 'square', gain = 0.08, when = 0) {
    if (state.muted) return;
    const c = ensure();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + when + dur);
    osc.connect(g); g.connect(master);
    osc.start(c.currentTime + when);
    osc.stop(c.currentTime + when + dur + 0.02);
  }

  function typeClick() {
    beep(880 + Math.random() * 200, 0.03, 'square', 0.04);
  }

  function thud() {
    beep(80, 0.18, 'triangle', 0.18);
    beep(55, 0.22, 'sine', 0.12, 0.02);
  }

  function chime() {
    [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.25, 'square', 0.07, i * 0.08));
  }

  function cut() {
    stopMusic();
    beep(110, 0.05, 'sawtooth', 0.05);
  }

  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    musicNodes.forEach(n => { try { n.stop(); } catch (_) {} });
    musicNodes = [];
    track = null;
  }

  function playLoop(name) {
    if (track === name) return;
    stopMusic();
    track = name;
    ensure();
    const patterns = {
      title: {
        notes: [262, 311, 349, 392, 349, 311, 262, 233, 262, 311, 392, 466, 392, 349, 311, 262],
        tempo: 160
      },
      tavern: {
        notes: [196, 233, 262, 233, 196, 175, 196, 220, 233, 262, 294, 262, 233, 220, 196, 175],
        tempo: 200
      },
      world: {
        notes: [330, 392, 440, 494, 440, 392, 349, 392, 440, 523, 494, 440, 392, 349, 330, 294],
        tempo: 170
      }
    };
    const p = patterns[name] || patterns.title;
    let i = 0;
    musicTimer = setInterval(() => {
      if (state.muted || document.hidden) return;
      const f = p.notes[i % p.notes.length];
      beep(f, 0.12, 'square', 0.045);
      if (i % 4 === 0) beep(f / 2, 0.18, 'triangle', 0.03);
      i += 1;
    }, p.tempo);
  }

  return { ensure, setMuted, beep, typeClick, thud, chime, cut, stopMusic, playLoop };
})();

/* ---------- Screen transitions ---------- */
async function blackout(ms = 450) {
  const el = $('#blackout');
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('on'));
  await wait(ms);
}

async function reveal(ms = 450) {
  const el = $('#blackout');
  el.classList.remove('on');
  await wait(ms);
  el.hidden = true;
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function showScreen(id) {
  $$('.screen').forEach(s => {
    const active = s.id === id;
    s.classList.toggle('is-active', active);
    s.hidden = !active;
  });
}

async function typeText(el, text, { sfx = true, speed = 38 } = {}) {
  el.textContent = '';
  for (const ch of text) {
    el.textContent += ch;
    if (sfx && ch.trim()) AudioBus.typeClick();
    await wait(speed);
  }
}

/* ---------- TITLE ---------- */
function initTitle() {
  $('#btn-begin').addEventListener('click', async () => {
    AudioBus.ensure();
    AudioBus.cut();
    await blackout(500);
    showScreen('screen-tavern');
    await reveal(400);
    startTavern();
  });
}

/* ---------- TAVERN ---------- */
async function startTavern() {
  AudioBus.playLoop('tavern');
  $('#name-stage').hidden = false;
  $('#class-stage').hidden = true;
  $('#btn-confirm-name').hidden = true;
  $('#adventurer-name').value = state.name || '';

  await typeText($('#name-prompt'), 'WHAT IS YOUR NAME, ADVENTURER?');
  $('#btn-confirm-name').hidden = false;
  $('#adventurer-name').focus();
}

function initTavern() {
  const nameInput = $('#adventurer-name');
  const confirm = $('#btn-confirm-name');

  const maybeShow = () => {
    confirm.hidden = !nameInput.value.trim();
  };
  nameInput.addEventListener('input', () => {
    nameInput.value = nameInput.value.toUpperCase().replace(/[^A-Z0-9_\- ]/g, '');
    maybeShow();
    AudioBus.typeClick();
  });
  nameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && nameInput.value.trim()) confirm.click();
  });

  confirm.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    if (!name) return;
    state.name = name;
    save();
    AudioBus.beep(440, 0.1, 'square', 0.08);
    await blackout(350);
    $('#name-stage').hidden = true;
    $('#class-stage').hidden = false;
    await reveal(350);
    await typeText($('#class-prompt'), 'WHAT DO YOU WANT TO BE WHEN YOU GROW UP?');
  });

  $$('.class-option, .shadow-figure').forEach(btn => {
    btn.addEventListener('click', () => selectClass(btn.dataset.class));
    btn.addEventListener('mouseenter', () => previewClass(btn.dataset.class));
  });
}

function previewClass(classId) {
  $$('.shadow-figure').forEach(fig => {
    fig.classList.toggle('is-chosen', fig.dataset.class === classId);
    fig.classList.toggle('is-dim', fig.dataset.class !== classId);
  });
  $$('.class-option').forEach(opt => {
    opt.classList.toggle('is-selected', opt.dataset.class === classId);
  });
  $('#class-flavor').textContent = CLASS_META[classId]?.flavor || '';
}

async function selectClass(classId) {
  previewClass(classId);
  state.classId = classId;
  save();
  AudioBus.chime();
  await wait(700);
  await blackout(400);
  showScreen('screen-quests');
  await reveal(300);
  startQuestLog();
}

/* ---------- QUEST LOG ---------- */
function startQuestLog() {
  AudioBus.playLoop('tavern');
  AudioBus.thud();
  const parchment = $('#parchment');
  parchment.style.animation = 'none';
  // reflow to restart drop
  void parchment.offsetWidth;
  parchment.style.animation = '';
  renderQuestLog();
}

function renderQuestLog() {
  const list = $('#quest-list');
  list.innerHTML = state.quests.map((quest, qi) => `
    <article class="quest-block" data-quest="${quest.id}">
      <div class="quest-top">
        <div class="quest-title-wrap">
          <input class="quest-title" data-field="title" value="${escapeHtml(quest.title)}" aria-label="Quest category">
        </div>
        <button class="delete-quest" type="button" data-delete-quest="${quest.id}">[x] Delete Quest</button>
      </div>
      <div class="field-row">
        <label>Goal:</label>
        <input data-field="goal" value="${escapeHtml(quest.goal)}" aria-label="Quest goal">
      </div>
      ${quest.milestones.map((m, mi) => `
        <div class="milestone-row">
          <label>Milestone ${mi + 1}:</label>
          <input data-milestone="${m.id}" value="${escapeHtml(m.text)}" aria-label="Milestone ${mi + 1}">
          <button class="delete-milestone" type="button" data-delete-milestone="${m.id}" aria-label="Delete milestone">[x]</button>
        </div>
      `).join('')}
      <button class="add-milestone" type="button" data-add-milestone="${quest.id}">[ + Add Milestone ]</button>
    </article>
  `).join('');

  list.querySelectorAll('[data-field]').forEach(input => {
    input.addEventListener('input', () => {
      const block = input.closest('.quest-block');
      const quest = state.quests.find(q => q.id === block.dataset.quest);
      if (!quest) return;
      quest[input.dataset.field] = input.value;
      save();
    });
  });

  list.querySelectorAll('[data-milestone]').forEach(input => {
    input.addEventListener('input', () => {
      const block = input.closest('.quest-block');
      const quest = state.quests.find(q => q.id === block.dataset.quest);
      const mile = quest?.milestones.find(m => m.id === input.dataset.milestone);
      if (!mile) return;
      mile.text = input.value;
      save();
    });
  });

  list.querySelectorAll('[data-delete-quest]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.deleteQuest;
      if (state.quests.length <= 1) {
        AudioBus.beep(120, 0.1, 'sawtooth', 0.08);
        return;
      }
      state.quests = state.quests.filter(q => q.id !== id);
      save();
      AudioBus.beep(180, 0.08, 'square', 0.06);
      renderQuestLog();
    });
  });

  list.querySelectorAll('[data-delete-milestone]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mid = btn.dataset.deleteMilestone;
      const block = btn.closest('.quest-block');
      const quest = state.quests.find(q => q.id === block.dataset.quest);
      if (!quest) return;
      quest.milestones = quest.milestones.filter(m => m.id !== mid);
      save();
      AudioBus.beep(200, 0.06, 'square', 0.05);
      renderQuestLog();
    });
  });

  list.querySelectorAll('[data-add-milestone]').forEach(btn => {
    btn.addEventListener('click', () => {
      const quest = state.quests.find(q => q.id === btn.dataset.addMilestone);
      if (!quest) return;
      quest.milestones.push({ id: uid(), text: 'New milestone', done: false });
      save();
      AudioBus.beep(520, 0.06, 'square', 0.05);
      renderQuestLog();
      const inputs = $$(`[data-quest="${quest.id}"] [data-milestone]`);
      const last = inputs[inputs.length - 1];
      if (last) { last.focus(); last.select(); }
    });
  });
}

function initQuestLog() {
  $('#btn-add-quest').addEventListener('click', () => {
    state.quests.push({
      id: uid(),
      title: 'New Quest',
      goal: 'Declare your vow…',
      milestones: [{ id: uid(), text: 'First milestone', done: false }]
    });
    save();
    AudioBus.beep(620, 0.08, 'square', 0.06);
    renderQuestLog();
    const titles = $$('.quest-title');
    const last = titles[titles.length - 1];
    if (last) { last.focus(); last.select(); }
  });

  $('#btn-seal-oaths').addEventListener('click', async () => {
    // prune empty milestones / empty quests lightly
    state.quests.forEach(q => {
      q.title = q.title.trim() || 'Untitled Quest';
      q.goal = q.goal.trim() || 'An unspoken vow';
      q.milestones = q.milestones
        .map(m => ({ ...m, text: m.text.trim() }))
        .filter(m => m.text.length);
      if (!q.milestones.length) {
        q.milestones.push({ id: uid(), text: 'Define the first step', done: false });
      }
    });
    state.onboarded = true;
    save();

    AudioBus.cut();
    const flame = $('#flame-overlay');
    flame.hidden = false;
    AudioBus.beep(200, 0.15, 'sawtooth', 0.1);
    AudioBus.beep(400, 0.2, 'square', 0.08, 0.05);
    await wait(700);
    flame.hidden = true;
    await blackout(300);
    showScreen('screen-world');
    await reveal(250);
    startWorld({ announce: true });
  });

  $('#export-data').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `quest-for-avalon-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $('#import-data').addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported.quests)) throw new Error('bad');
        state = {
          name: imported.name || state.name,
          classId: imported.classId || state.classId,
          quests: imported.quests,
          onboarded: Boolean(imported.onboarded),
          muted: Boolean(imported.muted)
        };
        save();
        renderQuestLog();
        AudioBus.chime();
      } catch {
        alert('That file is not a valid Quest for Avalon backup.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  });
}

/* ---------- WORLD ---------- */
function allMilestones() {
  const out = [];
  state.quests.forEach(q => {
    q.milestones.forEach(m => out.push({ quest: q, milestone: m }));
  });
  return out;
}

function progressPct() {
  const all = allMilestones();
  if (!all.length) return 0;
  const done = all.filter(x => x.milestone.done).length;
  return Math.round((done / all.length) * 100);
}

function monsterTypeFor(index) {
  return MONSTER_TYPES[index % MONSTER_TYPES.length];
}

function startWorld({ announce = false } = {}) {
  AudioBus.playLoop('world');
  const name = (state.name || 'ADVENTURER').toUpperCase();
  const classLabel = CLASS_META[state.classId]?.label || 'KNIGHT';
  $('#hud-name').textContent = name;
  $('#hud-class').textContent = classLabel;
  $('#hero-sprite').dataset.class = state.classId || 'male-knight';
  updateHud();
  renderMonsters();

  if (announce) {
    AudioBus.chime();
    const banner = $('#quest-banner');
    banner.hidden = false;
    banner.style.animation = 'none';
    void banner.offsetWidth;
    banner.style.animation = '';
    setTimeout(() => { banner.hidden = true; }, 5200);
  }
}

function updateHud() {
  const pct = progressPct();
  $('#hud-pct').textContent = `${pct}%`;
  $('#hud-bar').style.width = `${pct}%`;
  $('#hero-label').textContent = pct >= 100 ? 'LEGEND' : pct > 0 ? 'Advancing' : 'Ready';
}

function renderMonsters() {
  const road = $('#monster-road');
  const items = allMilestones();
  road.innerHTML = items.map((item, index) => {
    const { quest, milestone } = item;
    const type = monsterTypeFor(index);
    const defeated = milestone.done ? 'defeated' : '';
    return `
      <button class="monster ${defeated}" type="button"
        data-type="${type}"
        data-quest="${quest.id}"
        data-milestone="${milestone.id}"
        ${milestone.done ? 'disabled' : ''}
        aria-label="${escapeHtml(milestone.text)}">
        <div class="monster-sprite" aria-hidden="true"></div>
        <div class="monster-name">${escapeHtml(milestone.text)}</div>
        <div class="monster-quest">${escapeHtml(quest.title)}</div>
      </button>
    `;
  }).join('');

  road.querySelectorAll('.monster:not(.defeated)').forEach(btn => {
    btn.addEventListener('click', () => strikeMonster(btn));
  });
}

function strikeMonster(btn) {
  const qid = btn.dataset.quest;
  const mid = btn.dataset.milestone;
  const quest = state.quests.find(q => q.id === qid);
  const mile = quest?.milestones.find(m => m.id === mid);
  if (!mile || mile.done) return;

  mile.done = true;
  save();
  btn.classList.add('hit');
  AudioBus.beep(660, 0.08, 'square', 0.09);
  AudioBus.beep(880, 0.12, 'square', 0.07, 0.06);
  setTimeout(() => {
    btn.classList.add('defeated');
    btn.disabled = true;
    updateHud();
    if (progressPct() >= 100) AudioBus.chime();
  }, 280);
}

function initWorld() {
  $('#btn-open-log').addEventListener('click', async () => {
    await blackout(300);
    showScreen('screen-quests');
    await reveal(250);
    startQuestLog();
  });

  $('#btn-mute').addEventListener('click', () => {
    AudioBus.setMuted(!state.muted);
    $('#btn-mute').setAttribute('aria-pressed', String(state.muted));
    $('#btn-mute').textContent = state.muted ? '[ MUTED ]' : '[ SOUND ]';
  });
}

/* ---------- Boot ---------- */
function boot() {
  initTitle();
  initTavern();
  initQuestLog();
  initWorld();

  $('#btn-mute')?.setAttribute('aria-pressed', String(state.muted));
  if ($('#btn-mute')) $('#btn-mute').textContent = state.muted ? '[ MUTED ]' : '[ SOUND ]';

  // Returning adventurer: skip to world if already onboarded
  if (state.onboarded && state.name && state.classId) {
    showScreen('screen-world');
    startWorld({ announce: false });
  } else {
    showScreen('screen-title');
    // Soft-start title music after first gesture only — hint shown on screen
    const unlock = () => {
      AudioBus.ensure();
      AudioBus.playLoop('title');
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }
}

boot();
