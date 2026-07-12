const STORAGE_KEY = 'road-to-avalon-v3';

const defaults = {
  categories: [
    { id:'creative', number:'01', icon:'✦', title:'Creative experiments', headline:'Make the strange things real.', description:'Turn imagination into tangible worlds—games, toys, books, and stories that invite others in.', goal:'Publish one original tabletop setting and run two complete campaigns.', type:'milestones', current:'Concept development', target:'1 setting + 2 campaigns', currentValue:0, targetValue:100, unit:'%', note:'', milestones:[['Choose the flagship setting and define its promise',false],['Complete a playable first draft',false],['Run campaign one and collect feedback',false],['Revise, illustrate, and publish',false]] },
    { id:'health', number:'02', icon:'♥', title:'Health & strength', headline:'Build a body for the long adventure.', description:'Steady progress over perfection: strength, energy, metabolic health, and confidence.', goal:'Reach 190 lb and an A1C below 6 while building durable strength.', type:'number-down', current:'215 lb', target:'190 lb', startValue:215, currentValue:215, targetValue:190, unit:'lb', note:'', milestones:[['Strength train three days each week',false],['Establish a sustainable nutrition routine',false],['Reach an interim A1C below 7',false],['Bench 230 lb and deadlift 405 lb',false]] },
    { id:'wealth', number:'03', icon:'⌂', title:'Home & wealth', headline:'Create freedom, not just assets.', description:'A fulfilling home, a resilient portfolio, and the freedom to choose how each day is spent.', goal:'Create a home that supports the life we want and a clear path to retirement at 65.', type:'milestones', current:'Defining the next chapter', target:'Ideal home + retirement plan', currentValue:0, targetValue:100, unit:'%', note:'', milestones:[['Define our ideal home and community',false],['Set the home budget and down-payment target',false],['Complete an annual retirement-plan review',false],['Establish the next long-term home base',false]] },
    { id:'relationships', number:'04', icon:'∞', title:'Relationships', headline:'Choose connection, again and again.', description:'Make time feel abundant for Debra, Francesca, Anthony, and Isabella. Listen well. Show up fully.', goal:'Create reliable rituals for deeper connection with Debra and each of the kids.', type:'milestones', current:'Building consistency', target:'Weekly + monthly rituals', currentValue:0, targetValue:100, unit:'%', note:'', milestones:[['Plan one intentional date with Debra each month',false],['Create a one-on-one ritual with each child',false],['Plan a full-family experience each quarter',false],['Take one meaningful family trip together',false]] },
    { id:'experiences', number:'05', icon:'↗', title:'Experiences & travel', headline:'Collect stories, not souvenirs.', description:'Follow wild trout, strange conventions, old cities, and the irresistible pull of places not yet known.', goal:'Take one major journey and three smaller curiosity-driven adventures every year.', type:'milestones', current:'Planning the next journey', target:'1 major + 3 small / year', currentValue:0, targetValue:100, unit:'%', note:'', milestones:[['Choose and schedule this year’s major journey',false],['Book a destination fly-fishing experience',false],['Attend a game, miniatures, or weird convention',false],['Explore somewhere outside the usual orbit',false]] },
    { id:'wisdom', number:'06', icon:'◈', title:'Learning & wisdom', headline:'Stay curious. Become useful.', description:'Keep learning deeply, make sense of the changing world, and turn knowledge into better choices.', goal:'Build a deliberate practice for learning, reflection, and sharing what I know.', type:'milestones', current:'Choosing a learning rhythm', target:'A durable learning practice', currentValue:0, targetValue:100, unit:'%', note:'', milestones:[['Choose three subjects for deep learning this year',false],['Create a weekly reading and reflection ritual',false],['Complete one meaningful course or project',false],['Share or teach something I have learned',false]] }
  ],
  copy: {}
};

const clone = value => JSON.parse(JSON.stringify(value));
const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved?.categories) return clone(defaults);
    const merged = clone(defaults);
    merged.copy = saved.copy || {};
    merged.categories = defaults.categories.map(base => ({...base, ...(saved.categories.find(item => item.id === base.id) || {})}));
    return merged;
  } catch { return clone(defaults); }
};
let state = load();
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const clamp = n => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));
const progress = item => {
  if (item.type === 'milestones') return item.milestones.length ? clamp(item.milestones.filter(m => m[1]).length / item.milestones.length * 100) : 0;
  const start = Number(item.startValue), current = Number(item.currentValue), target = Number(item.targetValue);
  if ([start,current,target].some(Number.isNaN) || start === target) return 0;
  return clamp(item.type === 'number-down' ? (start-current)/(start-target)*100 : (current-start)/(target-start)*100);
};
const escapeHtml = text => String(text).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function renderSummary(){
  const grid = document.querySelector('#summary-grid');
  grid.innerHTML = state.categories.map(item => {
    const pct = Math.round(progress(item));
    const status = item.type === 'milestones' ? `${item.milestones.filter(m=>m[1]).length} of ${item.milestones.length} milestones` : `${item.currentValue} ${item.unit} now · ${item.targetValue} ${item.unit} goal`;
    return `<a class="summary-card ${item.id}" href="#path-${item.id}"><div class="summary-top"><span>${item.icon}</span><small>${escapeHtml(item.title)}</small></div><strong>${pct}%</strong><div class="track"><i style="width:${pct}%"></i></div><p>${escapeHtml(status)}</p></a>`;
  }).join('');
  const overall = Math.round(state.categories.reduce((sum,item)=>sum+progress(item),0)/state.categories.length);
  document.querySelector('#overall-progress').textContent = `${overall}%`;
  document.querySelector('#overall-bar').style.width = `${overall}%`;
  document.querySelector('#overall-caption').textContent = overall ? 'Progress is the accumulation of ordinary, intentional days.' : 'Begin with one next step.';
}

function pathTemplate(item){
  const pct = Math.round(progress(item));
  const numeric = item.type !== 'milestones';
  return `<article class="path-card ${item.id}" id="path-${item.id}">
    <button class="path-summary" type="button" aria-expanded="false">
      <span class="path-number">${item.number}</span><span class="path-icon">${item.icon}</span>
      <span class="path-title"><small>${escapeHtml(item.title)}</small><strong>${escapeHtml(item.headline)}</strong><span>${escapeHtml(item.description)}</span></span>
      <span class="path-progress"><strong>${pct}%</strong><i><b style="width:${pct}%"></b></i></span><span class="chevron">+</span>
    </button>
    <div class="path-detail"><div class="detail-inner">
      <div class="goal-block"><label>Goal<textarea data-field="goal">${escapeHtml(item.goal)}</textarea></label></div>
      <div class="status-grid">
        <label>Where I am now<input data-field="current" value="${escapeHtml(item.current)}"></label>
        <span>→</span><label>Where I’m going<input data-field="target" value="${escapeHtml(item.target)}"></label>
      </div>
      <div class="goal-method">
        <label>How should progress be measured?<select data-field="type"><option value="milestones" ${item.type==='milestones'?'selected':''}>Completed milestones</option><option value="number-up" ${item.type==='number-up'?'selected':''}>A number increasing</option><option value="number-down" ${item.type==='number-down'?'selected':''}>A number decreasing</option></select></label>
        <div class="number-fields ${numeric?'':'hidden'}"><label>Starting value<input type="number" step="any" data-field="startValue" value="${item.startValue ?? ''}"></label><label>Current value<input type="number" step="any" data-field="currentValue" value="${item.currentValue ?? ''}"></label><label>Goal value<input type="number" step="any" data-field="targetValue" value="${item.targetValue ?? ''}"></label><label>Unit<input data-field="unit" value="${escapeHtml(item.unit || '')}" placeholder="lb, $, books…"></label></div>
      </div>
      <label class="update-label">Latest update<textarea data-field="note" placeholder="What moved forward recently?">${escapeHtml(item.note)}</textarea></label>
      <div class="milestone-head"><div><small>Milestones</small><strong>Steps along this path</strong></div><button class="add-milestone" type="button">+ Add milestone</button></div>
      <div class="milestones">${item.milestones.map((m,i)=>`<div class="milestone"><label><input type="checkbox" data-milestone="${i}" ${m[1]?'checked':''}><i></i><span contenteditable="false" data-milestone-text="${i}">${escapeHtml(m[0])}</span></label><button class="delete-milestone" data-delete="${i}" type="button" aria-label="Delete milestone">×</button></div>`).join('')}</div>
    </div></div>
  </article>`;
}

function renderPaths(openId){
  const list = document.querySelector('#path-list');
  list.innerHTML = state.categories.map(pathTemplate).join('');
  list.querySelectorAll('.path-card').forEach(card => {
    const item = state.categories.find(x => `path-${x.id}` === card.id);
    const summary = card.querySelector('.path-summary');
    summary.addEventListener('click', () => { card.classList.toggle('open'); summary.setAttribute('aria-expanded', card.classList.contains('open')); });
    if (item.id === openId) { card.classList.add('open'); summary.setAttribute('aria-expanded','true'); }
    card.querySelectorAll('[data-field]').forEach(field => field.addEventListener('input', () => {
      item[field.dataset.field] = field.type === 'number' ? Number(field.value) : field.value;
      if (field.dataset.field === 'type') card.querySelector('.number-fields').classList.toggle('hidden', field.value === 'milestones');
      save(); renderSummary(); updateCardProgress(card,item);
    }));
    card.querySelectorAll('[data-milestone]').forEach(box => box.addEventListener('change', () => { item.milestones[Number(box.dataset.milestone)][1] = box.checked; save(); renderSummary(); updateCardProgress(card,item); }));
    card.querySelectorAll('[data-milestone-text]').forEach(field => field.addEventListener('input', () => { item.milestones[Number(field.dataset.milestoneText)][0] = field.textContent.trim(); save(); }));
    card.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', () => { item.milestones.splice(Number(button.dataset.delete),1); save(); renderSummary(); renderPaths(item.id); setEditMode(document.body.classList.contains('editing')); }));
    card.querySelector('.add-milestone').addEventListener('click', () => { item.milestones.push(['New milestone',false]); save(); renderPaths(item.id); setEditMode(true); const fields=document.querySelectorAll(`#${card.id} [data-milestone-text]`); fields[fields.length-1]?.focus(); });
  });
  autosize();
}

function updateCardProgress(card,item){ const pct=Math.round(progress(item)); card.querySelector('.path-progress strong').textContent=`${pct}%`; card.querySelector('.path-progress b').style.width=`${pct}%`; }
function autosize(){ document.querySelectorAll('textarea').forEach(area=>{ const fit=()=>{area.style.height='auto';area.style.height=`${area.scrollHeight}px`;}; fit(); area.addEventListener('input',fit); }); }

function initEditableCopy(){
  document.querySelectorAll('[data-edit]').forEach(field => {
    const key=field.dataset.edit; if(state.copy[key]) field.innerHTML=state.copy[key];
    field.addEventListener('input',()=>{state.copy[key]=field.innerHTML;save();});
  });
}
function setEditMode(enabled){
  document.body.classList.toggle('editing',enabled);
  document.querySelector('.edit-toggle').setAttribute('aria-pressed',String(enabled));
  document.querySelector('.edit-toggle').textContent=enabled?'Editing…':'Edit journey';
  document.querySelectorAll('[data-edit],[data-milestone-text]').forEach(field=>field.setAttribute('contenteditable',String(enabled)));
}

document.querySelector('.edit-toggle').addEventListener('click',()=>setEditMode(!document.body.classList.contains('editing')));
document.querySelector('.finish-edit').addEventListener('click',()=>setEditMode(false));
document.querySelector('#export-data').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`road-to-avalon-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(a.href);
});
document.querySelector('#import-data').addEventListener('change',event=>{
  const file=event.target.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{ try{const imported=JSON.parse(reader.result);if(!Array.isArray(imported.categories))throw new Error();state=imported;save();renderSummary();renderPaths();initEditableCopy();setEditMode(false);}catch{alert('That file is not a valid Road to Avalon backup.');} };reader.readAsText(file);
});

document.querySelector('#year').textContent=new Date().getFullYear();
renderSummary(); renderPaths(); initEditableCopy();
