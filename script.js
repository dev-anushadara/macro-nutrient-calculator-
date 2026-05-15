/* ============================================================
   MacroFuel – Macro Nutrient Calculator
   script.js
   ============================================================ */

/* ── State ───────────────────────────────────────────── */
let currentResults = null;  // Stores the last calculated results

/* ── Toggle Helpers ──────────────────────────────────── */
function selectToggle(groupId, clickedBtn) {
  const group = document.getElementById(groupId);
  group.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-checked', 'false');
  });
  clickedBtn.classList.add('active');
  clickedBtn.setAttribute('aria-checked', 'true');
}

function selectGoal(clickedBtn) {
  document.querySelectorAll('.goal-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-checked', 'false');
  });
  clickedBtn.classList.add('active');
  clickedBtn.setAttribute('aria-checked', 'true');
}

/* ── Unit Switch ─────────────────────────────────────── */
function switchUnits() {
  const isMetric = document.getElementById('btn-metric').classList.contains('active');
  document.getElementById('height-metric-group').classList.toggle('hidden', !isMetric);
  document.getElementById('height-imperial-group').classList.toggle('hidden', isMetric);
  document.getElementById('weight-unit').textContent = isMetric ? 'kg' : 'lb';
}

/* ── Gather Inputs ───────────────────────────────────── */
function getInputs() {
  const gender   = document.querySelector('#gender-group .toggle-btn.active')?.dataset.value;
  const age      = parseFloat(document.getElementById('age').value);
  const isMetric = document.getElementById('btn-metric').classList.contains('active');
  const activity = parseFloat(document.getElementById('activity').value);
  const goal     = document.querySelector('.goal-btn.active')?.dataset.value;
  const weightRaw = parseFloat(document.getElementById('weight').value);

  let weightKg, heightCm;

  if (isMetric) {
    weightKg = weightRaw;
    heightCm = parseFloat(document.getElementById('height-cm').value);
  } else {
    weightKg = weightRaw * 0.453592;
    const ft = parseFloat(document.getElementById('height-ft').value) || 0;
    const inch = parseFloat(document.getElementById('height-in').value) || 0;
    heightCm = (ft * 12 + inch) * 2.54;
  }

  return { gender, age, weightKg, heightCm, activity, goal, valid: isValid(gender, age, weightKg, heightCm, activity, goal) };
}

function isValid(gender, age, weightKg, heightCm, activity, goal) {
  return (
    gender && goal &&
    !isNaN(age) && age >= 10 && age <= 100 &&
    !isNaN(weightKg) && weightKg > 0 && weightKg < 500 &&
    !isNaN(heightCm) && heightCm > 50 && heightCm < 300 &&
    !isNaN(activity)
  );
}

/* ── BMR (Mifflin-St Jeor) ───────────────────────────── */
function calcBMR(gender, weightKg, heightCm, age) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

/* ── Macro Ratios by Goal ────────────────────────────── */
function getMacroRatios(goal) {
  switch (goal) {
    case 'loss':     return { protein: 0.35, carbs: 0.40, fat: 0.25 };
    case 'maintain': return { protein: 0.30, carbs: 0.45, fat: 0.25 };
    case 'gain':     return { protein: 0.30, carbs: 0.50, fat: 0.20 };
    default:         return { protein: 0.30, carbs: 0.45, fat: 0.25 };
  }
}

/* ── Goal multiplier / label ─────────────────────────── */
function getGoalMeta(goal) {
  switch (goal) {
    case 'loss':     return { multiplier: 0.80, label: 'Fat Loss (–20%)' };
    case 'maintain': return { multiplier: 1.00, label: 'Maintenance'     };
    case 'gain':     return { multiplier: 1.15, label: 'Muscle Gain (+15%)' };
    default:         return { multiplier: 1.00, label: 'Maintenance'     };
  }
}

/* ── Main Calculate ──────────────────────────────────── */
function calculate() {
  const inputs = getInputs();

  // Show/hide error
  document.getElementById('error-msg').classList.toggle('hidden', inputs.valid);
  if (!inputs.valid) return;

  const { gender, age, weightKg, heightCm, activity, goal } = inputs;

  const bmr  = Math.round(calcBMR(gender, weightKg, heightCm, age));
  const tdee = Math.round(bmr * activity);
  const meta = getGoalMeta(goal);
  const target = Math.round(tdee * meta.multiplier);

  const ratios = getMacroRatios(goal);
  const proteinKcal = Math.round(target * ratios.protein);
  const carbsKcal   = Math.round(target * ratios.carbs);
  const fatKcal     = Math.round(target * ratios.fat);

  const proteinG = Math.round(proteinKcal / 4);
  const carbsG   = Math.round(carbsKcal   / 4);
  const fatG     = Math.round(fatKcal     / 9);

  currentResults = { bmr, tdee, target, goal,
    protein: { g: proteinG, kcal: proteinKcal, pct: Math.round(ratios.protein * 100) },
    carbs:   { g: carbsG,   kcal: carbsKcal,   pct: Math.round(ratios.carbs   * 100) },
    fat:     { g: fatG,     kcal: fatKcal,     pct: Math.round(ratios.fat     * 100) },
  };

  renderResults(currentResults, meta.label);
}

/* ── Render Results ──────────────────────────────────── */
function renderResults(r, goalLabel) {
  // Show panel
  document.getElementById('placeholder-state').classList.add('hidden');
  document.getElementById('results-content').classList.remove('hidden');
  document.getElementById('results-content').classList.add('animate-in');

  // Calorie stats
  document.getElementById('bmr-val').textContent    = r.bmr.toLocaleString();
  document.getElementById('tdee-val').textContent   = r.tdee.toLocaleString();
  document.getElementById('target-val').textContent = r.target.toLocaleString();
  document.getElementById('goal-label-sub').textContent = goalLabel;
  document.getElementById('donut-cal').textContent  = r.target.toLocaleString();

  // Macro bars
  renderMacroBar('protein', r.protein, 100);
  renderMacroBar('carbs',   r.carbs,   100);
  renderMacroBar('fat',     r.fat,     100);

  // Donut chart
  renderDonut(r);

  // Meal split
  updateMealSplit();

  // Tips
  renderTips(r);

  // Smooth scroll on mobile
  if (window.innerWidth < 900) {
    setTimeout(() => {
      document.getElementById('results-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

function renderMacroBar(name, macro, maxPct) {
  document.getElementById(`pct-${name}`).textContent  = `${macro.pct}%`;
  document.getElementById(`g-${name}`).textContent    = `${macro.g} g`;
  document.getElementById(`kcal-${name}`).textContent = `${macro.kcal} kcal`;
  // Animate bar width
  requestAnimationFrame(() => {
    document.getElementById(`bar-${name}`).style.width = `${macro.pct}%`;
  });
}

/* ── Donut Chart ─────────────────────────────────────── */
function renderDonut(r) {
  const circumference = 2 * Math.PI * 80; // 502.655

  const pctProtein = r.protein.pct / 100;
  const pctCarbs   = r.carbs.pct   / 100;
  const pctFat     = r.fat.pct     / 100;

  const gapFraction = 0.015; // small gap between segments
  const gap = circumference * gapFraction;

  const dashProtein = circumference * pctProtein - gap;
  const dashCarbs   = circumference * pctCarbs   - gap;
  const dashFat     = circumference * pctFat     - gap;

  // offsets: start at top (already rotated -90deg in CSS)
  // dashoffset = circumference - (start position on arc)
  const startProtein = 0;
  const startCarbs   = pctProtein;
  const startFat     = pctProtein + pctCarbs;

  setArc('arc-protein', dashProtein, circumference, startProtein * circumference);
  setArc('arc-carbs',   dashCarbs,   circumference, startCarbs   * circumference);
  setArc('arc-fat',     dashFat,     circumference, startFat     * circumference);
}

function setArc(id, dash, total, startPos) {
  const el = document.getElementById(id);
  const gap = total - dash;
  el.style.strokeDasharray  = `${dash} ${total}`;
  el.style.strokeDashoffset = `${-startPos}`;
}

/* ── Meal Split ──────────────────────────────────────── */
function updateMealSplit() {
  if (!currentResults) return;
  const meals = parseInt(document.getElementById('meal-count').value);
  document.getElementById('meal-count-badge').textContent = `${meals} meal${meals > 1 ? 's' : ''}`;

  const { target, protein, carbs, fat } = currentResults;
  const mealCal     = Math.round(target      / meals);
  const mealProtein = Math.round(protein.g   / meals);
  const mealCarbs   = Math.round(carbs.g     / meals);
  const mealFat     = Math.round(fat.g       / meals);

  const mealNames = ['Breakfast','Morning Snack','Lunch','Afternoon Snack','Dinner','Evening Snack'];
  // Distribute: bigger meals at breakfast/lunch/dinner
  const weights = {
    2: [0.5,0.5],
    3: [0.30,0.40,0.30],
    4: [0.25,0.20,0.35,0.20],
    5: [0.25,0.15,0.30,0.15,0.15],
    6: [0.22,0.10,0.25,0.12,0.22,0.09],
  };
  const w = weights[meals];

  const grid = document.getElementById('meal-grid');
  grid.innerHTML = '';
  for (let i = 0; i < meals; i++) {
    const mc   = Math.round(target     * w[i]);
    const mp   = Math.round(protein.g  * w[i]);
    const mca  = Math.round(carbs.g    * w[i]);
    const mf   = Math.round(fat.g      * w[i]);

    const item = document.createElement('div');
    item.className = 'meal-item';
    item.style.animationDelay = `${i * 0.05}s`;
    item.innerHTML = `
      <div class="meal-label">${mealNames[i]}</div>
      <div class="meal-cal">${mc} <small style="font-size:.7rem;color:var(--text-muted);font-weight:600;">kcal</small></div>
      <div class="meal-macros">
        <div class="meal-macro-row"><span style="color:var(--protein)">P</span><span>${mp}g</span></div>
        <div class="meal-macro-row"><span style="color:var(--carbs)">C</span><span>${mca}g</span></div>
        <div class="meal-macro-row"><span style="color:var(--fat)">F</span><span>${mf}g</span></div>
      </div>
    `;
    grid.appendChild(item);
  }
}

/* ── Tips Generator ──────────────────────────────────── */
function renderTips(r) {
  const tips = [];

  if (r.goal === 'loss') {
    tips.push({ icon: '💧', text: 'Drink at least 2–3 liters of water daily. Hydration supports fat metabolism and reduces hunger.' });
    tips.push({ icon: '🥩', text: `Prioritize high-protein foods (${r.protein.g}g/day) — chicken breast, eggs, Greek yogurt, tofu — to preserve lean muscle.` });
    tips.push({ icon: '⏰', text: 'Consider a moderate caloric deficit (20%) rather than aggressive cuts to avoid muscle loss and metabolic slowdown.' });
  } else if (r.goal === 'gain') {
    tips.push({ icon: '🍠', text: `Fuel workouts with complex carbs (${r.carbs.g}g/day) — oats, sweet potato, rice — for sustained energy and glycogen replenishment.` });
    tips.push({ icon: '💊', text: `Consume 20–30g of protein within 30–60 minutes post-workout to maximize muscle protein synthesis.` });
    tips.push({ icon: '😴', text: 'Prioritize 7–9 hours of sleep. Growth hormone peaks during deep sleep — this is when muscles repair and grow.' });
  } else {
    tips.push({ icon: '🎯', text: 'Maintenance calories keep your weight stable. Focus on food quality — whole foods, lean proteins, and healthy fats.' });
    tips.push({ icon: '📊', text: 'Track your intake for 2–4 weeks. Adjust calories by ±100–200 kcal based on actual weight trends.' });
  }

  tips.push({ icon: '🥦', text: 'Eat plenty of fiber-rich vegetables (300–500g/day). Fiber improves satiety, gut health, and blood sugar stability.' });
  tips.push({ icon: '🏋️', text: 'Pair nutrition with resistance training 3–5×/week. Muscle tissue is your body\'s most metabolically active tissue.' });
  tips.push({ icon: '📋', text: 'These macros are estimates using the Mifflin-St Jeor equation. Individual metabolism varies — consult a registered dietitian for a personalized plan.' });

  const list = document.getElementById('tips-list');
  list.innerHTML = tips.map(t => `
    <li class="tip-item">
      <span class="tip-icon">${t.icon}</span>
      <span>${t.text}</span>
    </li>
  `).join('');
}

/* ── Keyboard accessibility ──────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.classList.contains('form-input')) {
    calculate();
  }
});
