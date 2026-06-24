const h = React.createElement;
const { useState, useEffect, useRef } = React;

// ---------- Icon component ----------

function Icon({ name, size = 16, color = 'currentColor', style = {} }) {
  const inner = window.ICONS[name] || '';
  return h('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: { flexShrink: 0, ...style },
    dangerouslySetInnerHTML: { __html: inner },
  });
}

// ---------- Constants ----------

const DOMAINS = {
  health: {
    name: 'Health',
    icon: 'heart',
    color: '#e24b4a',
    light: '#fcebeb',
    dark900: '#501313',
    dark600: '#a32d2d',
    subcats: ['Physical', 'Mental / Spiritual'],
  },
  relationships: {
    name: 'Relationships',
    icon: 'users',
    color: '#d4537e',
    light: '#fbeaf0',
    dark900: '#4b1528',
    dark600: '#993556',
    subcats: ['Romantic', 'Family', 'Friends', 'Professional'],
  },
  career: {
    name: 'Career',
    icon: 'briefcase',
    color: '#378add',
    light: '#e6f1fb',
    dark900: '#042c53',
    dark600: '#185fa5',
    subcats: ['Learning', 'Skills', 'Business', 'Creative Work'],
  },
  finance: {
    name: 'Finance',
    icon: 'coins',
    color: '#ef9f27',
    light: '#faeeda',
    dark900: '#412402',
    dark600: '#854f0b',
    subcats: ['Budgeting', 'Investing', 'Financial Education', 'Income'],
  },
};

const DOMAIN_KEYS = Object.keys(DOMAINS);

const DAILY_GOAL = 100;       // default — overridden per-user by state.economy.dailyGoal
const CONSISTENCY_MIN = 50;   // default — overridden per-user by state.economy.consistencyMin
const SELL_REFUND_RATIO = 0.5; // tickets sell back for 50% of cost — hardcoded, never changes

// Default economy config — all values editable in Settings > Economy
const DEFAULT_ECONOMY = {
  dailyGoal: 100,
  consistencyMin: 50,
  streakCoinsEvery: 10,
  streakCoinsAmount: 10,
  powerStreakCoinsEvery: 10,
  powerStreakCoinsAmount: 30,
  powerStreakUnlockDays: 15,
  questCoinRatio: 0.33,
  bossCoinBase: 75,
  miniGateCoinBase: 40,
  gateTierMultipliers: { B: 1.0, A: 1.5, S: 2.0 },
  miniGateTierMultipliers: { C: 0.75, B: 1.0, A: 1.5 },
  challengeXpMin: 30,
  challengeXpMax: 70,
  challengeCoinMin: 10,
  challengeCoinMax: 100,
  reminderThresholdDays: 7,
};

// Difficulty presets — sensible out-of-the-box tunings for different player types.
// Advanced users can override individual values via Economy Config in Advanced Settings.
const DIFFICULTY_PRESETS = {
  easy:      { dailyGoal: 60,  consistencyMin: 30, powerStreakUnlockDays: 10, streakCoinsAmount: 15, bossCoinBase: 100 },
  balanced:  { dailyGoal: 100, consistencyMin: 50, powerStreakUnlockDays: 15, streakCoinsAmount: 10, bossCoinBase: 75  },
  ambitious: { dailyGoal: 150, consistencyMin: 75, powerStreakUnlockDays: 21, streakCoinsAmount: 8,  bossCoinBase: 60  },
};

// Helper: get economy value from state, falling back to defaults
function eco(state, key) {
  return (state && state.economy && state.economy[key] !== undefined)
    ? state.economy[key]
    : DEFAULT_ECONOMY[key];
}
const BOSS_LEVELS_ALL = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const BOSS_LEVELS_DEFAULT = [10, 20, 30, 40, 50];
const BOSS_LEVELS = BOSS_LEVELS_ALL; // back-compat alias

const DEFAULT_BOSSES = {
  health: {
    5: ['Walk daily for 1 week', 'Try a new healthy recipe', 'Sleep 7+ hours for 3 nights'],
    10: ['Run a 5K', 'Complete a 2-week sleep reset', 'Hit a strength PR'],
    15: ['Try a new physical activity (yoga, climbing, etc.)', 'Meal-prep for one full week', 'Hold a daily stretch routine for 14 days'],
    20: ['Complete a 30-day mobility challenge', '10,000 steps for 14 days straight', 'Cut a habit for 30 days'],
    25: ['Run a 7-8K distance', 'Hit a new strength PR', '21 days mindful eating'],
    30: ['Run a 10K', 'Complete a fitness milestone', 'Finish a structured training block'],
    35: ['Complete a multi-week strength program', 'Hit a flexibility/mobility benchmark', '30 days alcohol-free'],
    40: ['Complete a half-marathon', 'Reach a body composition goal', 'Master a new physical skill'],
    45: ['Complete a 100-day workout streak', 'Run a 15K', 'Earn a fitness certification'],
    50: ['Complete a major endurance event', 'Reach peak physical milestone', 'Year-long consistency badge'],
  },
  relationships: {
    5: ['Have a meaningful 1:1 with someone close', 'Send a thoughtful message to 3 friends', 'Plan a small gathering'],
    10: ['Plan a meaningful experience', 'Have a difficult conversation', 'Reconnect with an old friend'],
    15: ['Mentor or help someone', 'Reach out to 5 distant contacts', 'Host a small dinner or hangout'],
    20: ['Complete a communication challenge', 'Plan a trip with someone close', 'Resolve a lingering conflict'],
    25: ['Strengthen a key relationship through commitment', 'Volunteer with someone', 'Mediate a conflict for others'],
    30: ['Plan a meaningful experience', 'Complete a communication challenge', 'Reach a relationship milestone'],
    35: ['Build a regular tradition', 'Help someone through a major life event', 'Lead a community initiative'],
    40: ['Deepen a key relationship', 'Host a gathering', 'Mentor someone'],
    45: ['Reconnect across distance with intention', 'Sustain weekly meaningful conversations for a quarter', 'Build a lasting friendship anchor'],
    50: ['Major relationship milestone', 'Build a lasting tradition', 'Community contribution'],
  },
  career: {
    5: ['Read a foundational book/article in your field', 'Apply something you learned', 'Talk to a professional in your field'],
    10: ['Finish an intro course', 'Ship a small project', 'Complete a skill assessment'],
    15: ['Build a small public project', 'Start a learning journal', 'Get feedback on your work'],
    20: ['Build a portfolio piece', 'Get feedback from a mentor', 'Complete an intermediate course'],
    25: ['Lead a small initiative', 'Teach what you know', 'Publish something publicly'],
    30: ['Finish a major course', 'Release a playable prototype', 'Complete a creative project'],
    35: ['Build a long-term portfolio piece', 'Establish a side project', 'Get a notable mention/recognition'],
    40: ['Launch a product or service', 'Land a major opportunity', 'Complete an advanced certification'],
    45: ['Sustain a long-term project for 6+ months', 'Mentor others in your craft', 'Reach a domain expertise marker'],
    50: ['Major career milestone', 'Establish recurring income stream', 'Master-level project complete'],
  },
  finance: {
    5: ['Track every expense for 2 weeks', 'Read a personal finance book', 'Cancel one unused subscription'],
    10: ['Track spending for 30 days', 'Set up a budget system', 'Pay off a small debt'],
    15: ['Save first ₹10,000 / $100', 'Negotiate a bill down', 'Open a separate savings account'],
    20: ['Build a starter emergency fund', 'Automate savings', 'Complete a financial literacy course'],
    25: ['Increase income through a side gig', 'Reach a savings milestone', 'Build a simple budget that holds for 3 months'],
    30: ['Create an investment plan', 'Build a full emergency fund', 'Complete a financial milestone'],
    35: ['Reach a meaningful net worth marker', 'Open an investment account and contribute monthly', 'Pay off significant debt'],
    40: ['Reach a net worth milestone', 'Diversify income streams', 'Optimize tax strategy'],
    45: ['Sustain investment habit for a year', 'Build a meaningful passive income line', 'Reach financial flexibility'],
    50: ['Major financial independence milestone', 'Reach a long-term wealth goal', 'Achieve a passive income target'],
  },
};

const STARTER_ACTIVITIES = [
  { id: 'a1', name: 'Meditation', domain: 'health', subcat: 'Mental / Spiritual', type: 'duration', curve: [[5,5],[15,15],[30,25],[60,35]], desc: 'Mindfulness practice' },
  { id: 'a2', name: 'Workout', domain: 'health', subcat: 'Physical', type: 'duration', curve: [[15,15],[30,25],[45,32],[60,40]], desc: 'Strength or cardio session' },
  { id: 'a3', name: 'Journaling', domain: 'health', subcat: 'Mental / Spiritual', type: 'duration', curve: [[5,5],[15,15],[30,25]], desc: 'Reflective writing' },
  { id: 'a4', name: 'Reading', domain: 'career', subcat: 'Learning', type: 'duration', curve: [[15,15],[30,25],[60,40]], desc: 'Books, articles, study material' },
  { id: 'a5', name: 'Calling Parents', domain: 'relationships', subcat: 'Family', type: 'fixed', xp: 20, desc: 'Check in with family' },
  { id: 'a6', name: 'Budget Review', domain: 'finance', subcat: 'Budgeting', type: 'fixed', xp: 25, desc: 'Review spending and budget' },
  { id: 'a7', name: 'Demartini Process', domain: 'health', subcat: 'Mental / Spiritual', type: 'fixed', xp: 25, desc: 'Values clarification exercise' },
  { id: 'a8', name: 'RPG Maker Study', domain: 'career', subcat: 'Skills', type: 'duration', curve: [[15,15],[30,25],[60,40]], desc: 'Game dev learning session' },
];

const STARTER_QUESTS = [
  { id: 'q1', name: 'Anatomy Fundamentals', desc: 'Complete an anatomy fundamentals course', domain: 'health', days: 30, xpReward: 150, progress: 72, createdAt: Date.now() - 1000*60*60*24*21 },
  { id: 'q2', name: 'Build Coaching Website', desc: 'Design and launch a simple coaching website', domain: 'career', days: 60, xpReward: 300, progress: 35, createdAt: Date.now() - 1000*60*60*24*21 },
  { id: 'q3', name: 'Finish RPG Maker Course', desc: 'Complete the full RPG Maker course', domain: 'career', days: 90, xpReward: 400, progress: 18, createdAt: Date.now() - 1000*60*60*24*16 },
];

// Achievement registry — every achievement the system can unlock.
// Adding a new achievement: add an entry here + a trigger in checkAchievements().
// The UI reads from this for display; the data stores only the unlocked set.
const ACHIEVEMENTS = {
  first_activity:  { name: 'First Steps',        desc: 'Create your first activity',              icon: 'zap',    color: '#a78bfa' },
  first_log:       { name: 'In Motion',           desc: 'Log your first activity',                 icon: 'zap',    color: '#a78bfa' },
  log_10:          { name: 'Getting Started',     desc: 'Log 10 activities',                       icon: 'zap',    color: '#60a5fa' },
  log_50:          { name: 'Building Habits',     desc: 'Log 50 activities',                       icon: 'flame',  color: '#fb923c' },
  log_100:         { name: 'Centurion',           desc: 'Log 100 activities',                      icon: 'trophy', color: '#fbbf24' },
  xp_100:          { name: 'First XP',            desc: 'Earn 100 total XP',                       icon: 'star',   color: '#a78bfa' },
  xp_1000:         { name: 'XP Grinder',          desc: 'Earn 1,000 total XP',                     icon: 'star',   color: '#60a5fa' },
  xp_10000:        { name: 'XP Legend',           desc: 'Earn 10,000 total XP',                    icon: 'star',   color: '#fbbf24' },
  streak_7:        { name: '7-Day Consistent',    desc: 'Maintain a 7-day consistency streak',     icon: 'flame',  color: '#fb923c' },
  streak_30:       { name: 'The Month',           desc: 'Maintain a 30-day consistency streak',    icon: 'flame',  color: '#f59e0b' },
  streak_100:      { name: 'Unbreakable',         desc: 'Maintain a 100-day consistency streak',   icon: 'shield', color: '#34d399' },
  first_boss:      { name: 'Gate Breaker',        desc: 'Defeat your first boss gate',             icon: 'trophy', color: '#fbbf24' },
  boss_5:          { name: 'Gate Veteran',        desc: 'Defeat 5 boss gates',                     icon: 'trophy', color: '#f59e0b' },
  first_quest:     { name: 'Quest Completed',     desc: 'Complete and archive your first quest',   icon: 'target', color: '#818cf8' },
  quest_5:         { name: 'Quest Veteran',       desc: 'Complete and archive 5 quests',           icon: 'target', color: '#a78bfa' },
  quest_10:        { name: 'Quest Master',        desc: 'Complete and archive 10 quests',          icon: 'target', color: '#fbbf24' },
};

const DEFAULT_REWARDS = [
  { id: 'r1', name: 'Special meal',   cost: 50,  desc: 'Treat yourself to a meal out',  requirements: [] },
  { id: 'r2', name: 'Day off',        cost: 200, desc: 'A guilt-free rest day',          requirements: [] },
  { id: 'r3', name: 'Hobby purchase', cost: 100, desc: 'Buy something for a hobby',      requirements: [] },
  { id: 'r4', name: 'Entertainment',  cost: 60,  desc: 'Movie, game, or show night',     requirements: [] },
];

// Evaluate whether a reward's requirements are all met.
// Requirements can reference activities, streaks, or quests that may have
// been deleted — those are simply treated as fulfilled (removed from the check).
function canAffordReward(reward, state) {
  const gold = state.gold || 0;
  const reqs = reward.requirements || [];
  const goldCost = reward.cost || 0;
  if (gold < goldCost) return false;
  for (const req of reqs) {
    if (req.type === 'activity') {
      // Count how many times this activity has been logged (by name, since id could be deleted)
      const activityExists = (state.activities || []).some(a => a.id === req.activityId);
      if (!activityExists) continue; // deleted — skip this requirement
      const count = (state.activityLog || []).filter(l => l.activityName === req.activityName).length;
      if (count < req.count) return false;
    } else if (req.type === 'streak') {
      if ((state.consistencyStreak || 0) < req.days) return false;
    } else if (req.type === 'quest') {
      const questExists = (state.quests || []).some(q => q.id === req.questId) ||
                          (state.archivedQuests || []).some(q => q.id === req.questId);
      if (!questExists) continue; // deleted — skip
      const completed = (state.archivedQuests || []).some(q => q.id === req.questId);
      if (!completed) return false;
    }
  }
  return true;
}

// Title registry — cosmetic titles unlocked by reaching certain achievements.
// One title may be equipped at a time; displayed next to player name in CharacterView.
// Adding a new title: add an entry here. The equip UI reads from this automatically.
const TITLES = {
  the_consistent:  { name: 'The Consistent',  requiredAchievement: 'streak_7',    color: '#fb923c', desc: 'Awarded for a 7-day streak' },
  the_disciplined: { name: 'The Disciplined',  requiredAchievement: 'streak_30',   color: '#f59e0b', desc: 'Awarded for a 30-day streak' },
  the_unbreakable: { name: 'The Unbreakable',  requiredAchievement: 'streak_100',  color: '#34d399', desc: 'Awarded for a 100-day streak' },
  the_builder:     { name: 'The Builder',      requiredAchievement: 'first_boss',  color: '#60a5fa', desc: 'Awarded for clearing a gate' },
  the_veteran:     { name: 'The Veteran',      requiredAchievement: 'boss_5',      color: '#818cf8', desc: 'Awarded for clearing 5 gates' },
  the_scholar:     { name: 'The Scholar',      requiredAchievement: 'log_50',      color: '#a78bfa', desc: 'Awarded for logging 50 activities' },
  the_centurion:   { name: 'The Centurion',    requiredAchievement: 'log_100',     color: '#fbbf24', desc: 'Awarded for logging 100 activities' },
  the_finisher:    { name: 'The Finisher',     requiredAchievement: 'quest_5',     color: '#34d399', desc: 'Awarded for completing 5 quests' },
  the_legend:      { name: 'The Legend',       requiredAchievement: 'xp_10000',    color: '#fbbf24', desc: 'Awarded for earning 10,000 XP' },
};

// Class progression — cosmetic mastery tracks tied to what you actually do.
// Mastery points = XP earned through domain/tag-matching activities.
// Thresholds: Bronze 500, Silver 2000, Gold 5000
const CLASS_DEFINITIONS = [
  { id: 'warrior',   name: 'Warrior',    desc: 'Fitness & health activities',   domain: 'health',         icon: 'flame',    color: '#e24b4a', badge: '⚔️' },
  { id: 'scholar',   name: 'Scholar',    desc: 'Career & learning activities',  domain: 'career',         icon: 'scroll',   color: '#378add', badge: '📚' },
  { id: 'guardian',  name: 'Guardian',   desc: 'Relationship activities',       domain: 'relationships',  icon: 'users',    color: '#d4537e', badge: '🛡️' },
  { id: 'treasurer', name: 'Treasurer',  desc: 'Finance activities',            domain: 'finance',        icon: 'coins',    color: '#ef9f27', badge: '💰' },
  { id: 'creator',   name: 'Creator',    desc: 'Activities tagged "Creative"',  domain: null,             icon: 'zap',      color: '#a78bfa', badge: '🎨' },
];

const CLASS_MASTERY_THRESHOLDS = [
  { label: 'Bronze', xp: 500,  color: '#cd7f32' },
  { label: 'Silver', xp: 2000, color: '#c0c0c0' },
  { label: 'Gold',   xp: 5000, color: '#fbbf24' },
];

function levelXpRequirement(level) {
  let xp = 100;
  for (let i = 1; i < level; i++) {
    xp = xp * 1.35;
  }
  return Math.round(xp / 5) * 5;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function uid(prefix='id') {
  return `${prefix}_${Math.random().toString(36).slice(2,9)}`;
}

// ==========================================================
// SOUND ENGINE
// Procedural audio via Web Audio API — no external files.
// All sounds generated from oscillators, envelopes, and filters.
// Three style modes: fantasy, digital, atmospheric.
// ==========================================================

const SoundEngine = (() => {
  let ctx = null;
  let masterGain = null;
  let enabled = true;
  let volume = 0.6;
  let style = 'fantasy';

  function getCtx() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = ctx.createGain();
        masterGain.gain.value = volume;
        masterGain.connect(ctx.destination);
      } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function setSettings(s) {
    enabled = s.enabled !== false;
    volume = typeof s.volume === 'number' ? s.volume : 0.6;
    style = s.style || 'fantasy';
    try {
      if (masterGain && ctx) masterGain.gain.setTargetAtTime(volume, ctx.currentTime, 0.01);
    } catch (e) { /* non-fatal */ }
  }

  // ── Low-level primitives ────────────────────────────────

  function osc(freq, type, startT, dur, gainPeak, gainEnd = 0) {
    const c = getCtx(); if (!c || !masterGain) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, startT);
    g.gain.setValueAtTime(0, startT);
    g.gain.linearRampToValueAtTime(gainPeak, startT + dur * 0.1);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainEnd), startT + dur);
    o.connect(g); g.connect(masterGain);
    o.start(startT); o.stop(startT + dur + 0.05);
  }

  function oscFreqSweep(freqStart, freqEnd, type, startT, dur, gainPeak) {
    const c = getCtx(); if (!c || !masterGain) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freqStart, startT);
    o.frequency.exponentialRampToValueAtTime(freqEnd, startT + dur);
    g.gain.setValueAtTime(0, startT);
    g.gain.linearRampToValueAtTime(gainPeak, startT + dur * 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, startT + dur);
    o.connect(g); g.connect(masterGain);
    o.start(startT); o.stop(startT + dur + 0.05);
  }

  function noise(startT, dur, gainPeak, filterFreq = 800) {
    const c = getCtx(); if (!c || !masterGain) return;
    const bufSize = c.sampleRate * dur;
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 1.5;
    const g = c.createGain();
    g.gain.setValueAtTime(0, startT);
    g.gain.linearRampToValueAtTime(gainPeak, startT + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, startT + dur);
    src.connect(filter); filter.connect(g); g.connect(masterGain);
    src.start(startT); src.stop(startT + dur + 0.05);
  }

  // ── FANTASY style ───────────────────────────────────────

  const FANTASY = {
    click() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(880, 'sine', t, 0.06, 0.15);
      osc(1320, 'sine', t, 0.04, 0.08);
    },
    nav() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(440, 'sine', t, 0.08, 0.12);
      osc(660, 'sine', t + 0.04, 0.1, 0.1);
    },
    logActivity() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(523, 'sine', t,        0.18, 0.2);
      osc(659, 'sine', t + 0.07, 0.18, 0.2);
      osc(784, 'sine', t + 0.14, 0.25, 0.25);
    },
    levelUp() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(392, 'sine', t,        0.35, 0.3);
      osc(523, 'sine', t + 0.12, 0.35, 0.3);
      osc(659, 'sine', t + 0.24, 0.35, 0.3);
      osc(784, 'sine', t + 0.36, 0.5,  0.4);
      osc(1047,'sine', t + 0.36, 0.6,  0.35);
    },
    bossDefeated() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(110, 'triangle', t,        0.7, 0.4);
      osc(220, 'sine',     t,        0.8, 0.3);
      osc(330, 'sine',     t + 0.1,  0.6, 0.2);
      osc(440, 'sine',     t + 0.2,  0.5, 0.25);
      osc(880, 'sine',     t + 0.3,  0.4, 0.3);
      osc(1320,'sine',     t + 0.35, 0.4, 0.25);
    },
    achievement() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      [0, 0.06, 0.12, 0.18, 0.24].forEach((delay, i) => {
        osc(880 + i * 220, 'sine', t + delay, 0.2, 0.2 - i * 0.02);
      });
    },
    questComplete() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(523, 'sine', t,        0.3, 0.25);
      osc(659, 'sine', t + 0.1,  0.3, 0.25);
      osc(784, 'sine', t + 0.2,  0.4, 0.3);
      osc(1046,'sine', t + 0.3,  0.4, 0.35);
    },
    streakMilestone() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(659, 'sine', t,        0.3, 0.25);
      osc(880, 'sine', t + 0.1,  0.3, 0.25);
      osc(1046,'sine', t + 0.2,  0.35, 0.3);
      osc(1318,'sine', t + 0.1,  0.25, 0.2);
    },
    coinPurchase() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      [0, 0.05, 0.1].forEach((d, i) => osc(1046 + i * 200, 'sine', t + d, 0.1, 0.18));
    },
    tutorial() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(523, 'sine', t, 0.1, 0.12);
      osc(784, 'sine', t + 0.06, 0.1, 0.1);
    },
    streakRisk() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(220, 'triangle', t,       0.4, 0.2);
      osc(196, 'triangle', t + 0.2, 0.4, 0.2);
      osc(220, 'triangle', t + 0.4, 0.4, 0.15);
    },
    dayComplete() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      [392, 494, 587, 740, 880, 1047].forEach((f, i) => osc(f, 'sine', t + i * 0.09, 0.35, 0.3));
      osc(1318, 'sine', t + 0.54, 0.5, 0.45);
    },
  };

  // ── DIGITAL style ───────────────────────────────────────

  const DIGITAL = {
    click() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      oscFreqSweep(800, 400, 'square', t, 0.05, 0.1);
    },
    nav() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      oscFreqSweep(300, 600, 'square', t, 0.07, 0.12);
    },
    logActivity() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(440, 'square', t,        0.08, 0.15);
      osc(880, 'square', t + 0.06, 0.08, 0.15);
      noise(t + 0.1, 0.06, 0.08, 1200);
    },
    levelUp() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      [220, 330, 440, 550, 660].forEach((f, i) => osc(f, 'square', t + i*0.07, 0.18, 0.2));
      noise(t + 0.35, 0.15, 0.12, 2000);
    },
    bossDefeated() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      oscFreqSweep(80, 200, 'square', t, 0.4, 0.3);
      noise(t, 0.1, 0.2, 400);
      osc(440, 'square', t + 0.2, 0.3, 0.25);
      osc(660, 'square', t + 0.3, 0.3, 0.25);
      oscFreqSweep(880, 440, 'square', t + 0.4, 0.3, 0.2);
    },
    achievement() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      [0,0.04,0.08,0.12,0.16].forEach((d,i) => {
        oscFreqSweep(400 + i*100, 800 + i*100, 'square', t+d, 0.1, 0.15);
      });
    },
    questComplete() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      [440,550,660,880].forEach((f,i) => osc(f,'square',t+i*0.07, 0.12, 0.18));
    },
    streakMilestone() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      noise(t, 0.05, 0.15, 1000);
      osc(880, 'square', t + 0.05, 0.2, 0.2);
      osc(1100,'square', t + 0.15, 0.2, 0.2);
    },
    coinPurchase() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      [0,0.04,0.08].forEach(d => oscFreqSweep(600,1200,'square',t+d,0.07,0.12));
    },
    tutorial() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      oscFreqSweep(400, 600, 'square', t, 0.06, 0.1);
    },
    streakRisk() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      [0, 0.15, 0.3].forEach(d => oscFreqSweep(200, 150, 'square', t+d, 0.1, 0.15));
    },
    dayComplete() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      [220,330,440,550,660,880].forEach((f,i) => osc(f,'square',t+i*0.06,0.12,0.18));
      noise(t + 0.36, 0.2, 0.15, 2000);
    },
  };

  // ── ATMOSPHERIC style ───────────────────────────────────

  const ATMOSPHERIC = {
    click() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(180, 'sine', t, 0.08, 0.1);
      noise(t, 0.04, 0.04, 600);
    },
    nav() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(120, 'sine', t, 0.15, 0.08);
      oscFreqSweep(300, 200, 'sine', t, 0.12, 0.06);
    },
    logActivity() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(130, 'sine', t,        0.5,  0.15);
      osc(196, 'sine', t + 0.1,  0.4,  0.12);
      osc(260, 'sine', t + 0.2,  0.35, 0.1);
      noise(t, 0.15, 0.05, 300);
    },
    levelUp() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(65,  'sine', t,       0.8, 0.3);
      osc(130, 'sine', t,       0.6, 0.25);
      osc(195, 'sine', t + 0.3, 0.5, 0.25);
      osc(260, 'sine', t + 0.6, 0.5, 0.3);
      noise(t + 0.5, 0.4, 0.08, 200);
    },
    bossDefeated() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(55,  'sine', t,       1.0, 0.4);
      osc(82,  'sine', t,       0.8, 0.3);
      osc(110, 'sine', t + 0.2, 0.7, 0.3);
      noise(t, 0.3, 0.15, 150);
      osc(220, 'sine', t + 0.5, 0.8, 0.4);
    },
    achievement() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      [0,0.1,0.2,0.3].forEach((d,i) => {
        osc(220 * (i+1), 'sine', t+d, 0.5, 0.15);
        noise(t+d, 0.08, 0.04, 400 + i*200);
      });
    },
    questComplete() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(110, 'sine', t,       0.6, 0.25);
      osc(165, 'sine', t + 0.2, 0.5, 0.25);
      osc(220, 'sine', t + 0.4, 0.6, 0.3);
      noise(t + 0.3, 0.2, 0.06, 250);
    },
    streakMilestone() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(110, 'sine', t,       0.5, 0.2);
      osc(165, 'sine', t + 0.2, 0.4, 0.2);
      noise(t + 0.1, 0.3, 0.08, 180);
    },
    coinPurchase() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      [0,0.06,0.12].forEach((d,i) => osc(260 + i*40, 'sine', t+d, 0.1, 0.12));
    },
    tutorial() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(196, 'sine', t, 0.2, 0.1);
      noise(t, 0.1, 0.04, 500);
    },
    streakRisk() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      osc(55, 'sine', t,       0.6, 0.15);
      osc(52, 'sine', t + 0.3, 0.6, 0.12);
      noise(t + 0.1, 0.5, 0.06, 100);
    },
    dayComplete() {
      const c = getCtx(); if (!c) return; const t = c.currentTime;
      [55,82,110,165,220,330].forEach((f,i) => osc(f,'sine',t+i*0.12, 0.6, 0.3));
      noise(t + 0.5, 0.5, 0.1, 200);
    },
  };

  const STYLES = { fantasy: FANTASY, digital: DIGITAL, atmospheric: ATMOSPHERIC };

  function play(event) {
    if (!enabled) return;
    try {
      const s = STYLES[style] || FANTASY;
      if (s[event]) s[event]();
    } catch (e) { /* audio errors are non-fatal */ }
  }

  return { play, setSettings };
})();

// ==========================================================
// THEMES
// Each theme overrides the :root CSS variables from the
// default dark RPG system. The `fonts` field injects a
// Google Fonts import. The `bodyClass` is added to <body>.
// ==========================================================

const THEMES = {
  default: {
    label: 'Dark RPG',
    icon: '⚔️',
    desc: 'The original — deep void black, purple accents, gold highlights',
    fonts: null,
    css: '', // base is the default — no override needed
  },
  girly: {
    label: 'Girly',
    icon: '🌸',
    desc: 'Soft pinks, warm rose tones, rounded feel',
    fonts: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap',
    css: `
      :root {
        --bg-void:    #1a0f14;
        --bg-panel:   #251420;
        --bg-raised:  #2e1a26;
        --bg-hover:   #3a2030;
        --border-dim: rgba(255,180,200,0.09);
        --border-mid: rgba(255,180,200,0.18);
        --border-glow:rgba(255,130,170,0.45);
        --gold:       #f48fb1;
        --gold-dim:   rgba(244,143,177,0.15);
        --gold-glow:  rgba(244,143,177,0.3);
        --accent:     #f06292;
        --accent-dim: rgba(240,98,146,0.14);
        --accent-glow:rgba(240,98,146,0.35);
        --text-hi:    #fce4ec;
        --text-mid:   #c2849a;
        --text-lo:    #7d4e60;
        --danger:     #e57373;
        --success:    #80cbc4;
      }
      html, body, input, select, textarea, button { font-family: 'DM Sans', sans-serif !important; }
      .rpg-nav-item, .rpg-mobile-nav-item { border-radius: 12px !important; }
      .rpg-card, .rpg-modal, .rpg-sidebar { border-radius: 12px !important; }
      .rpg-nav-item::before { background: var(--accent) !important; box-shadow: 0 0 8px var(--accent-glow) !important; }
      .rpg-sidebar { background: linear-gradient(180deg, #1e0e18, #1a0f14) !important; }
      .rpg-topbar { background: rgba(26,15,20,0.9) !important; }
    `,
  },
  minimal: {
    label: 'Minimal',
    icon: '○',
    desc: 'Clean off-white, almost no colour, extreme clarity',
    fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    css: `
      :root {
        --bg-void:    #f5f4f0;
        --bg-panel:   #eeede8;
        --bg-raised:  #ffffff;
        --bg-hover:   #f0efe9;
        --border-dim: rgba(0,0,0,0.07);
        --border-mid: rgba(0,0,0,0.14);
        --border-glow:rgba(0,0,0,0.25);
        --gold:       #4a4a4a;
        --gold-dim:   rgba(0,0,0,0.06);
        --gold-glow:  rgba(0,0,0,0.15);
        --accent:     #1a1a1a;
        --accent-dim: rgba(0,0,0,0.07);
        --accent-glow:rgba(0,0,0,0.15);
        --text-hi:    #111111;
        --text-mid:   #555550;
        --text-lo:    #aaa9a0;
        --danger:     #c0392b;
        --success:    #27ae60;
      }
      html, body { background: var(--bg-void) !important; }
      html, body, input, select, textarea, button { font-family: 'Inter', sans-serif !important; font-weight: 400 !important; }
      body::after { display: none !important; }
      .rpg-sidebar { background: var(--bg-panel) !important; border-right: 1px solid var(--border-dim) !important; }
      .rpg-topbar { background: var(--bg-panel) !important; backdrop-filter: none !important; border-bottom: 1px solid var(--border-dim) !important; }
      .rpg-nav-item::before { background: var(--accent) !important; box-shadow: none !important; }
      .rpg-nav-item.active { background: rgba(0,0,0,0.06) !important; }
      .rpg-hud-chip { background: transparent !important; border-color: var(--border-dim) !important; color: var(--text-hi) !important; }
      .rpg-hud-chip.gold-chip, .rpg-hud-chip.streak-chip, .rpg-hud-chip.power-chip { color: var(--text-mid) !important; }
    `,
  },
  retro: {
    label: 'Game Boy',
    icon: '🎮',
    desc: 'Green phosphor on dark — classic handheld aesthetic',
    fonts: 'https://fonts.googleapis.com/css2?family=VT323&display=swap',
    css: `
      :root {
        --bg-void:    #0f1f0a;
        --bg-panel:   #162b0e;
        --bg-raised:  #1a3312;
        --bg-hover:   #1f3d16;
        --border-dim: rgba(74,200,50,0.18);
        --border-mid: rgba(74,200,50,0.35);
        --border-glow:rgba(74,200,50,0.6);
        --gold:       #8bdc5a;
        --gold-dim:   rgba(139,220,90,0.15);
        --gold-glow:  rgba(139,220,90,0.35);
        --accent:     #4ac832;
        --accent-dim: rgba(74,200,50,0.15);
        --accent-glow:rgba(74,200,50,0.4);
        --text-hi:    #c8f0a0;
        --text-mid:   #5a9040;
        --text-lo:    #2a5018;
        --danger:     #dc2828;
        --success:    #4ac832;
      }
      html, body, input, select, textarea, button { font-family: 'VT323', monospace !important; font-size: 16px !important; letter-spacing: 0.5px !important; }
      body::after { background: repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,0,0,0.15) 1px,rgba(0,0,0,0.15) 2px) !important; }
      .rpg-sidebar { border-right: 2px solid var(--accent-dim) !important; }
      .rpg-hud-chip { font-family: 'VT323', monospace !important; font-size: 16px !important; }
      .rpg-nav-item { font-size: 16px !important; font-family: 'VT323', monospace !important; letter-spacing: 1px !important; }
      .rpg-sidebar-logo-title { font-family: 'VT323', monospace !important; letter-spacing: 3px !important; }
      * { border-radius: 0 !important; }
    `,
  },
  cyberpunk: {
    label: 'Cyberpunk',
    icon: '⚡',
    desc: 'Neon cyan and magenta on near-black — night city aesthetic',
    fonts: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap',
    css: `
      :root {
        --bg-void:    #050508;
        --bg-panel:   #080a10;
        --bg-raised:  #0c0e18;
        --bg-hover:   #101320;
        --border-dim: rgba(0,255,220,0.1);
        --border-mid: rgba(0,255,220,0.2);
        --border-glow:rgba(0,255,220,0.5);
        --gold:       #ff0080;
        --gold-dim:   rgba(255,0,128,0.12);
        --gold-glow:  rgba(255,0,128,0.4);
        --accent:     #00ffdc;
        --accent-dim: rgba(0,255,220,0.1);
        --accent-glow:rgba(0,255,220,0.4);
        --text-hi:    #e0fff8;
        --text-mid:   #4a9090;
        --text-lo:    #1a4040;
        --danger:     #ff0055;
        --success:    #00ffdc;
      }
      html, body, input, select, textarea, button { font-family: 'Rajdhani', sans-serif !important; font-weight: 500 !important; letter-spacing: 0.5px !important; }
      body::after { background: repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,220,0.015) 3px,rgba(0,255,220,0.015) 4px) !important; }
      .rpg-sidebar { border-right: 1px solid rgba(0,255,220,0.15) !important; }
      .rpg-sidebar-logo-title { color: var(--accent) !important; text-shadow: 0 0 10px var(--accent-glow) !important; }
      .rpg-nav-item.active { background: rgba(0,255,220,0.07) !important; text-shadow: 0 0 8px var(--accent) !important; }
      .rpg-nav-item::before { background: var(--accent) !important; box-shadow: 0 0 12px var(--accent) !important; }
      .rpg-hud-chip { border-color: rgba(0,255,220,0.2) !important; }
      .rpg-hud-chip.gold-chip { color: var(--gold) !important; text-shadow: 0 0 8px var(--gold) !important; }
      .rpg-hud-chip.streak-chip { text-shadow: 0 0 8px currentColor !important; }
      .rpg-topbar { border-bottom: 1px solid rgba(0,255,220,0.1) !important; }
      * { text-rendering: geometricPrecision !important; }
    `,
  },
};

function buildInitialState() {
  const domainState = {};
  DOMAIN_KEYS.forEach(k => {
    domainState[k] = {
      totalXp: 0,
      level: 0,
      rank: 0,
      potentialRank: 0,
    };
  });

  return {
    activities: [],
    quests: [],
    dailyLogs: {},
    activityLog: [],
    domains: domainState,
    consistencyStreak: 0,
    powerStreak: 0,
    lastConsistencyDate: null,
    lastPowerDate: null,
    gold: 0,
    rewards: DEFAULT_REWARDS,
    customSubcats: {},
    bossCompletions: {},
    customBosses: {},        // {[domain]: {[level]: [str, str, str]}}
    enabledBosses: {},        // {[domain]: number[]} — list of active gate levels; defaults to BOSS_LEVELS_DEFAULT
    tickets: [],              // [{id, rewardId, name, desc, cost, purchasedAt, usedAt|null}]
    goldHistory: {},          // {[dateKey]: total gold earned that day}
    createdAt: Date.now(),    // for daily-average estimates
    lastResetAt: 0,
    pendingBonuses: [],
    economy: { ...DEFAULT_ECONOMY },
    challengeLibrary: [],
    challengeSpawnChance: 10,
    activeChallenge: null,
    powerValues: [
      { name: '', symbol: '' },
      { name: '', symbol: '' },
      { name: '', symbol: '' },
    ],
    dayMode: 'standard',
    dailyQuestLockEnabled: false,
    dailyQuestPlans: {},
    dailyQuestHistory: [],        // each entry now also stores: type, activitiesDetail[]
    missionTemplates: [],         // [{ id, name, type, activityIds, createdAt }]
    archivedQuests: [],           // quests moved here on completion
    achievements: {},             // { [achievementId]: { unlockedAt } }
    missionStats: {               // aggregate mission statistics (updated on finalize)
      totalCompleted: 0,
      totalAttempted: 0,
      longestStreak: 0,
      currentStreak: 0,
      byType: {},                 // { [type]: { completed, attempted } }
      activityCompletionCounts: {}, // { [activityId]: number }
    },
    questChains: [],
    equippedTitle: null,
    classMastery: {
      warrior: 0, scholar: 0, guardian: 0, treasurer: 0, creator: 0,
    },
    yearlyLegacy: {},
    restDayTokens: 0,
    difficultyPreset: 'balanced',
    advancedSettingsUnlocked: false,
    totalCoinsEarnedAllTime: 0,
    newAchievementsSince: null,
    soundSettings: {
      enabled: true,
      volume: 0.6,
      style: 'fantasy',
    },
    theme: 'default', // 'default' | 'girly' | 'minimal' | 'retro' | 'cyberpunk'
  };
}

// Resolve which boss gates are active for a domain (custom override or defaults)
function activeBossLevelsFor(state, domain) {
  if (state && state.enabledBosses && Array.isArray(state.enabledBosses[domain])) {
    return state.enabledBosses[domain];
  }
  return BOSS_LEVELS_DEFAULT;
}

function computeProgression(totalXp, bossCompletions, domainKey, activeBossLevels) {
  let level = 1;
  let remaining = totalXp;
  let req = levelXpRequirement(level);
  while (remaining >= req) {
    remaining -= req;
    level += 1;
    req = levelXpRequirement(level);
  }
  const potentialRank = level;

  const gates = activeBossLevels || BOSS_LEVELS_DEFAULT;
  let rank = level;
  for (const bossLevel of gates) {
    if (potentialRank > bossLevel) {
      const key = `${domainKey}-${bossLevel}`;
      if (!bossCompletions[key]) {
        rank = Math.min(rank, bossLevel);
      }
    }
  }

  return { level, rank, potentialRank, currentLevelXp: remaining, currentLevelReq: req };
}

function computeDurationXp(curve, minutes) {
  if (!curve || curve.length === 0) return 0;
  const sorted = [...curve].sort((a,b) => a[0]-b[0]);
  if (minutes <= sorted[0][0]) {
    return Math.round((minutes / sorted[0][0]) * sorted[0][1]);
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    const [m1, x1] = sorted[i];
    const [m2, x2] = sorted[i+1];
    if (minutes >= m1 && minutes <= m2) {
      const ratio = (minutes - m1) / (m2 - m1);
      return Math.round(x1 + ratio * (x2 - x1));
    }
  }
  const last = sorted[sorted.length-1];
  return last[1];
}

function relativeTime(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs/24)}d ago`;
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// Given any 'YYYY-MM-DD' date string, returns the key for the day before it.
// Used to credit a consistency streak day for a date other than "today"
// (e.g. finalizing yesterday's Daily Quest at today's rollover).
function yesterdayKeyFor(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return dateKey(d);
}

function computeDailyGoldAverage(state) {
  const history = state.goldHistory || {};
  const today = new Date();
  let total = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    if (history[key] !== undefined) total += history[key];
  }
  const daysAlive = Math.max(1, Math.floor((Date.now() - (state.createdAt || Date.now())) / (1000*60*60*24)));
  const denom = Math.min(30, Math.max(daysAlive, 1));
  if (total === 0) return 0;
  return total / denom;
}

function formatEstimate(cost, avgPerDay) {
  if (!avgPerDay || avgPerDay <= 0) return null;
  const days = Math.ceil(cost / avgPerDay);
  if (days <= 1) return '≈ today';
  if (days < 14) return `≈ ${days} days`;
  if (days < 60) return `≈ ${Math.ceil(days/7)} weeks`;
  if (days < 365) return `≈ ${Math.ceil(days/30)} months`;
  return `≈ ${(days/365).toFixed(1)} years`;
}

// Inspect a daily log to determine streak status for that day.
// Returns: 'power' | 'consistency' | 'partial' | 'none'
function dayStatus(log, dailyGoal, consistencyMin) {
  const dg = dailyGoal || DAILY_GOAL;
  const cm = consistencyMin || CONSISTENCY_MIN;
  if (!log) return 'none';
  const hasAny = DOMAIN_KEYS.some(k => (log[k] || 0) > 0);
  if (!hasAny) return 'none';
  const allMin = DOMAIN_KEYS.every(k => (log[k] || 0) >= cm);
  const allFull = DOMAIN_KEYS.every(k => (log[k] || 0) >= dg);
  if (allFull) return 'power';
  if (allMin) return 'consistency';
  return 'partial';
}

// Produce a small "fingerprint" of a state's data volume, used to detect when
// an incoming sync snapshot would silently erase work — e.g. a backgrounded
// device waking up and re-saving its stale copy with a fresher timestamp.
// Higher numbers = "richer" data. We only use this to catch big regressions
// (a device with substantially LESS data overwriting one with substantially
// MORE), not to do real merging.
function dataFingerprint(state) {
  if (!state) return { activities: 0, quests: 0, tickets: 0, activityLog: 0, totalXp: 0, gold: 0 };
  const totalXp = DOMAIN_KEYS.reduce((sum, k) => sum + ((state.domains && state.domains[k] && state.domains[k].totalXp) || 0), 0);
  return {
    activities: (state.activities || []).length,
    quests: (state.quests || []).length,
    tickets: (state.tickets || []).length,
    activityLog: (state.activityLog || []).length,
    totalXp,
    gold: state.gold || 0,
  };
}

// Returns true if `incoming` looks like it would erase meaningful data that
// `current` has AND it's not the result of an intentional reset. A small/zero
// difference (a single deletion, a spent reward, etc.) is normal and allowed
// — this only flags LARGE regressions that are far more likely to be a stale
// snapshot than an intentional bulk-delete.
function looksLikeDataLoss(current, incoming) {
  // An intentional reset (Settings > Reset) bumps lastResetAt. If the
  // incoming snapshot's reset happened more recently than anything we know
  // about, it's a deliberate wipe from another device — accept it.
  const currentResetAt = (current && current.lastResetAt) || 0;
  const incomingResetAt = (incoming && incoming.lastResetAt) || 0;
  if (incomingResetAt > currentResetAt) return false;

  const a = dataFingerprint(current);
  const b = dataFingerprint(incoming);

  // Total XP and activity log should basically never go DOWN by a lot —
  // XP is cumulative and the log only grows (capped at 30, but a big drop
  // in count combined with lower XP is a strong signal).
  const xpDropRatio = a.totalXp > 0 ? (a.totalXp - b.totalXp) / a.totalXp : 0;
  const bigXpDrop = a.totalXp >= 50 && xpDropRatio > 0.15; // lost >15% of meaningful XP

  // Activities dropping by more than a couple at once is unusual for normal
  // usage (one delete at a time) but exactly what a stale-snapshot overwrite
  // looks like after a multi-item editing session.
  const bigActivityDrop = (a.activities - b.activities) >= 3;
  // Quests are never removed by completion (only by explicit delete), so a
  // drop here is always a deliberate user action — use a higher threshold
  // so a deliberate cleanup of a few old quests doesn't false-positive.
  const bigQuestDrop = (a.quests - b.quests) >= 3;
  const bigLogDrop = (a.activityLog - b.activityLog) >= 5;

  return bigXpDrop || bigActivityDrop || bigQuestDrop || bigLogDrop;
}

// ---------- Main Component ----------

function RPGLife({ user, onSignOut }) {
  const [state, setState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'offline' | 'error'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logModal, setLogModal] = useState(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showQuestForm, setShowQuestForm] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [toast, setToast] = useState(null);
  const [bossModal, setBossModal] = useState(null);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [streakCalendar, setStreakCalendar] = useState(null); // 'consistency' | 'power' | null
  const [pvPopupOpen, setPvPopupOpen] = useState(false);
  const [resetPrompt, setResetPrompt] = useState(null); // 'all' | domainKey | null
  const [bossEditor, setBossEditor] = useState(null); // { domain, level } | null
  const [buyConfirm, setBuyConfirm] = useState(null); // reward object | null
  const [tutorialStep, setTutorialStep] = useState(null);
  const [achievementQueue, setAchievementQueue] = useState([]); // [{id, name, icon, color}]
  const [dismissedReminders, setDismissedReminders] = useState([]); // domain keys dismissed this session
  const toastTimer = useRef(null);
  const saveTimer = useRef(null);
  const lastSavedJson = useRef(null);
  const remoteUpdatedAt = useRef(0);
  const latestStateRef = useRef(null);
  const userRef = useRef(null);
  const intentionalChangeUntil = useRef(0);
  // KEY FIX: track when WE are writing so we can ignore the echo snapshot
  // that Firestore sends back after every write. Without this, our own write
  // echoes back as a snapshot, passes the timestamp guard (because it arrives
  // before remoteUpdatedAt is updated), and overwrites whatever changed between
  // when we started the write and when the echo arrived.
  const writeInFlight = useRef(false);
  const writeSettleTimer = useRef(null);

  // Load: get initial state from Firestore, then subscribe to real-time changes
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let unsub = null;

    (async () => {
      const { state: remote, updatedAt: remoteTs } = await window.RPGLifeSync.loadState(user.uid);
      if (cancelled) return;

      if (remote) {
        setState(remote);
        lastSavedJson.current = JSON.stringify(remote);
        remoteUpdatedAt.current = remoteTs;
      } else {
        // Brand new account — always start fresh and show the tutorial
        const fresh = buildInitialState();
        setState(fresh);
        lastSavedJson.current = JSON.stringify(fresh);
        const result = await window.RPGLifeSync.saveState(user.uid, fresh);
        if (result.ok) remoteUpdatedAt.current = Date.now();
        setTutorialStep(0); // show tutorial for new users
      }
      setLoaded(true);

      // Real-time subscription for changes from OTHER devices.
      unsub = window.RPGLifeSync.subscribeToState(user.uid, (snapState, updatedAt) => {
        if (!snapState) return;

        // Ignore echoes of our own writes. We set writeInFlight=true before
        // writing and clear it a short time after — any snapshot that arrives
        // during that window is almost certainly our own echo.
        if (writeInFlight.current) return;

        // Ignore snapshots that aren't newer than what we loaded/last-saw
        if (updatedAt <= remoteUpdatedAt.current) return;

        const snapJson = JSON.stringify(snapState);

        // If this matches what we last wrote, it's definitely our own echo
        // (write flight window may have already cleared). Accept silently.
        if (snapJson === lastSavedJson.current) {
          remoteUpdatedAt.current = updatedAt;
          return;
        }

        // Check for intentional reset window
        if (Date.now() < intentionalChangeUntil.current && latestStateRef.current) {
          remoteUpdatedAt.current = updatedAt;
          window.RPGLifeSync.saveState(user.uid, latestStateRef.current).then((r) => {
            if (r.ok) {
              remoteUpdatedAt.current = Date.now();
              lastSavedJson.current = JSON.stringify(latestStateRef.current);
            }
          });
          return;
        }

        // Accept incoming state from another device
        remoteUpdatedAt.current = updatedAt;
        lastSavedJson.current = snapJson;
        setState(snapState);
      });
    })();

    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [user]);

  // Save effect: debounced Firestore write on every state change
  useEffect(() => {
    if (!loaded || !state || !user) return;
    latestStateRef.current = state;
    userRef.current = user;

    const json = JSON.stringify(state);
    if (json === lastSavedJson.current) return;

    lastSavedJson.current = json;
    setSyncStatus('syncing');

    // Mark in-flight IMMEDIATELY when state changes — not inside the 400ms
    // timer. Echo snapshots from Firestore arrive ~300-800ms after a write,
    // which falls squarely inside the debounce window. If we only set
    // writeInFlight inside the setTimeout, those echoes aren't blocked and
    // can overwrite the very change we're trying to save.
    writeInFlight.current = true;
    if (writeSettleTimer.current) {
      clearTimeout(writeSettleTimer.current);
      writeSettleTimer.current = null;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      saveTimer.current = null;
      const stateToSave = latestStateRef.current;
      const currentJson = JSON.stringify(stateToSave);

      const result = await window.RPGLifeSync.saveState(user.uid, stateToSave);
      remoteUpdatedAt.current = Date.now();

      // Keep in-flight active for 3s after the write resolves — Firestore
      // echo snapshots can arrive after the write Promise resolves.
      writeSettleTimer.current = setTimeout(() => {
        writeInFlight.current = false;
      }, 3000);

      if (result.ok) {
        lastSavedJson.current = currentJson;
        setSyncStatus('idle');
      } else {
        setSyncStatus('offline');
        if (result.error) showToast(`Sync error: ${result.error}`);
      }
    }, 400);
  }, [state, loaded, user]);

  // Retry mechanism: if a save failed and we're stuck on 'offline', don't
  // require the user to restart the app. Retry the most recent state
  // periodically (backoff), and immediately when the browser regains
  // connectivity. Without this, a single transient write failure (e.g. a
  // brief disconnect, or a Firestore lock contention from another tab/device)
  // would silently block ALL future saves until restart — every edit after
  // that point would be lost.
  const retryTimer = useRef(null);
  const retryAttempt = useRef(0);

  function attemptResync() {
    if (!user || !latestStateRef.current || !window.RPGLifeSync) return;
    if (saveTimer.current) return; // a regular save is already pending/in-flight
    setSyncStatus('syncing');
    window.RPGLifeSync.saveState(user.uid, latestStateRef.current).then((result) => {
      remoteUpdatedAt.current = Date.now();
      if (result.ok) {
        retryAttempt.current = 0;
        lastSavedJson.current = JSON.stringify(latestStateRef.current);
        setSyncStatus('idle');
      } else {
        setSyncStatus('offline');
      }
    });
  }

  useEffect(() => {
    if (syncStatus !== 'offline') {
      retryAttempt.current = 0;
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
      return;
    }
    // Backoff: 5s, 10s, 20s, 40s, capped at 60s
    const delay = Math.min(60000, 5000 * Math.pow(2, retryAttempt.current));
    retryTimer.current = setTimeout(() => {
      retryAttempt.current += 1;
      attemptResync();
    }, delay);
    return () => {
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
    };
  }, [syncStatus]);

  // Retry immediately when the OS/browser reports we're back online,
  // regardless of backoff timing.
  useEffect(() => {
    function handleOnline() {
      if (syncStatus === 'offline') {
        retryAttempt.current = 0;
        attemptResync();
      }
    }
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncStatus, user]);

  // Flush any pending save immediately if the page is closing, backgrounded,
  // or losing visibility — debounced setTimeout callbacks don't reliably run
  // once a tab is closed or a mobile browser is suspended, which previously
  // caused recent edits to be lost (the last *completed* save would win on
  // next load, silently reverting newer local changes).
  useEffect(() => {
    function flush() {
      if (!saveTimer.current) return; // nothing pending
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      const st = latestStateRef.current;
      const u = userRef.current;
      if (!st || !u || !window.RPGLifeSync) return;
      // Fire-and-forget — browsers give very little time during unload,
      // but Firestore's SDK queues this and the persistent local cache
      // also picks it up so it syncs as soon as possible even if the
      // network call itself doesn't complete in time.
      window.RPGLifeSync.saveState(u.uid, st);
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') flush();
    }

    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  function showToast(msg) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  function dismissBonus(id) {
    setState(prev => ({ ...prev, pendingBonuses: (prev.pendingBonuses || []).filter(b => b.id !== id) }));
  }

  // Check and roll daily challenge on day open (run once per day per client)
  // Hook must be declared here (before early return) to satisfy Rules of Hooks
  const lastChallengeCheckRef = useRef(null);
  useEffect(() => {
    if (!loaded || !state) return;
    const currentToday = todayKey();
    if (lastChallengeCheckRef.current === currentToday) return;
    lastChallengeCheckRef.current = currentToday;

    // Expire yesterday's unfinished challenge
    if (state.activeChallenge && state.activeChallenge.date !== currentToday && !state.activeChallenge.completedAt) {
      setState(prev => ({ ...prev, activeChallenge: null }));
      return;
    }

    // Roll for new challenge only if no active challenge today
    if (!state.activeChallenge || state.activeChallenge.date !== currentToday) {
      const library = state.challengeLibrary || [];
      if (library.length === 0) return;
      const chance = state.challengeSpawnChance || 0;
      if (Math.random() * 100 < chance) {
        const pick = library[Math.floor(Math.random() * library.length)];
        const tier = pick.tier || 'B';
        const xpMin = eco(state, 'challengeXpMin');
        const xpMax = eco(state, 'challengeXpMax');
        const coinMin = eco(state, 'challengeCoinMin');
        const coinMax = eco(state, 'challengeCoinMax');
        // Roll base values then multiply by tier
        const tierMult = { C: 0.75, B: 1.0, A: 1.5, S: 2.0 };
        const mult = tierMult[tier] || 1.0;
        const xp = Math.round((Math.floor(Math.random() * (xpMax - xpMin + 1)) + xpMin) * mult);
        const coins = Math.round((Math.floor(Math.random() * (coinMax - coinMin + 1)) + coinMin) * mult);
        setState(prev => ({
          ...prev,
          activeChallenge: { id: uid('ch'), libraryId: pick.id, name: pick.name, desc: pick.desc, domain: pick.domain, tier, xp, coins, date: currentToday, completedAt: null, revealed: false },
        }));
      }
    }
  }, [loaded, state]);

  // Finalize yesterday's Daily Quest mission (if yesterday was in quest mode
  // and had a plan). Must run BEFORE the streak-rollover check below, since
  // a 100%-complete quest day should credit the consistency streak and
  // prevent that day from being treated as "missed".
  const lastQuestFinalizeRef = useRef(null);
  useEffect(() => {
    if (!loaded || !state) return;
    const currentToday = todayKey();
    if (lastQuestFinalizeRef.current === currentToday) return;
    lastQuestFinalizeRef.current = currentToday;

    const yKey = yesterdayKey();
    const yPlan = state.dailyQuestPlans && state.dailyQuestPlans[yKey];
    if (yPlan && !yPlan.finalized) {
      finalizeDailyQuest(yKey);
    }
  }, [loaded, state]);

  // Active streak-rollover check: if a day was missed (lastConsistencyDate is
  // neither today nor yesterday), reset both streaks to 0 immediately on
  // load/day-open rather than waiting for the next qualifying day to lazily
  // overwrite the stale count. Runs once per day per client, same pattern as
  // the challenge check above.
  // Sync SoundEngine settings whenever state.soundSettings changes
  useEffect(() => {
    if (!loaded || !state || !state.soundSettings) return;
    SoundEngine.setSettings(state.soundSettings);
  }, [loaded, state && state.soundSettings]);

  function saveSoundSettings(patch) {
    setState(prev => ({
      ...prev,
      soundSettings: { ...(prev.soundSettings || {}), ...patch },
    }));
  }

  function saveTheme(themeId) {
    setState(prev => ({ ...prev, theme: themeId }));
  }

  const lastStreakCheckRef = useRef(null);
  useEffect(() => {
    if (!loaded || !state) return;
    const currentToday = todayKey();
    if (lastStreakCheckRef.current === currentToday) return;
    // Wait until quest finalization (above) has had a chance to run and
    // potentially update lastConsistencyDate before evaluating "missed".
    const yKey = yesterdayKey();
    const yPlan = state.dailyQuestPlans && state.dailyQuestPlans[yKey];
    if (yPlan && !yPlan.finalized) return; // finalization pending, re-check next render
    lastStreakCheckRef.current = currentToday;

    const last = state.lastConsistencyDate;
    const wasMissed = last !== null && last !== currentToday && last !== yesterdayKey();
    if (wasMissed && (state.consistencyStreak > 0 || state.powerStreak > 0)) {
      if ((state.restDayTokens || 0) > 0) {
        // Consume one rest day token — streak is protected
        setState(prev => ({
          ...prev,
          restDayTokens: prev.restDayTokens - 1,
          lastConsistencyDate: yesterdayKey(), // treat yesterday as covered
        }));
        showToast('🛡️ Rest Day token used — streak protected!');
      } else {
        setState(prev => ({ ...prev, consistencyStreak: 0, powerStreak: 0 }));
      }
    }
  }, [loaded, state]);

  if (!loaded || !state) {
    return h('div', { style: { ...styles.app, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 } },
      h('style', null, `
        :root { --bg-void: #080810; }
        html, body { background: #080810; }
      `),
      h('div', { style: { width: 44, height: 44, borderRadius: 4, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        h(Icon, { name: 'sword', size: 22, color: '#a78bfa' })
      ),
      h('div', { style: { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#4a4868' } }, 'Loading character data'),
      user && h('div', { style: { fontSize: 10, color: '#2a2840' } }, user.email)
    );
  }

  const today = todayKey();
  const todayLog = state.dailyLogs[today] || {};

  const domainProgress = {};
  DOMAIN_KEYS.forEach(k => {
    const earned = todayLog[k] || 0;
    domainProgress[k] = earned;
  });

  const domainComputed = {};
  DOMAIN_KEYS.forEach(k => {
    domainComputed[k] = computeProgression(state.domains[k].totalXp, state.bossCompletions, k, activeBossLevelsFor(state, k));
  });

  // Shared streak-crediting logic: marks `dateStr` as a qualifying consistency
  // day, increments Consistency Streak (and derived Power Streak), and queues
  // any milestone bonuses. Used both by the live domain-XP check (Standard
  // Mode) and by finalizeDailyQuest() (Quest Mode, decided at next rollover).
  function creditConsistencyDay(next, dateStr, prevDateStr) {
    const streakEvery = eco(next, 'streakCoinsEvery') || 10;
    const streakAmount = eco(next, 'streakCoinsAmount');
    const powerEvery = eco(next, 'powerStreakCoinsEvery') || 10;
    const powerAmount = eco(next, 'powerStreakCoinsAmount');
    const unlockDays = eco(next, 'powerStreakUnlockDays') || 15;
    const bonuses = [];

    if (next.lastConsistencyDate !== dateStr) {
      if (next.lastConsistencyDate === prevDateStr) {
        next.consistencyStreak = next.consistencyStreak + 1;
      } else if (next.lastConsistencyDate === null) {
        next.consistencyStreak = next.consistencyStreak === 0 ? 1 : next.consistencyStreak;
      } else {
        next.consistencyStreak = 1;
      }
      next.lastConsistencyDate = dateStr;

      if (next.consistencyStreak > 0 && next.consistencyStreak % streakEvery === 0) {
        bonuses.push({ label: `${next.consistencyStreak}-day streak`, amount: streakAmount, type: 'streak' });
      }

      // Rest day token: earn one every 7 consistency days.
      // Tokens protect the streak on one missed day (used in the rollover check).
      if (next.consistencyStreak > 0 && next.consistencyStreak % 7 === 0) {
        next.restDayTokens = (next.restDayTokens || 0) + 1;
        bonuses.push({ label: 'Rest Day token earned', amount: 0, type: 'rest', icon: '🛡️' });
      }
      // threshold. Day `unlockDays` itself only unlocks eligibility (Power
      // Streak stays 0); from `unlockDays + 1` onward, Power Streak climbs
      // 1:1 alongside Consistency Streak. Any break in Consistency Streak
      // drops Power Streak back to 0, and it must wait for Consistency to
      // hit the threshold again.
      if (next.consistencyStreak > unlockDays) {
        next.powerStreak = next.consistencyStreak - unlockDays;
        if (next.powerStreak > 0 && next.powerStreak % powerEvery === 0) {
          bonuses.push({ label: `${next.powerStreak}-day power streak`, amount: powerAmount, type: 'power' });
        }
      } else {
        next.powerStreak = 0;
      }
    }

    if (bonuses.length > 0) {
      const totalBonus = bonuses.reduce((sum, b) => sum + b.amount, 0);
      next.gold = (next.gold || 0) + totalBonus;
      next.goldHistory = { ...(next.goldHistory || {}) };
      next.goldHistory[dateStr] = (next.goldHistory[dateStr] || 0) + totalBonus;
      next.pendingBonuses = [...(next.pendingBonuses || []), ...bonuses.map(b => ({ ...b, id: uid('bonus'), at: Date.now() }))];
      setTimeout(() => SoundEngine.play('streakMilestone'), 300);
    }

    return next;
  }

  function checkStreaks(next, dayLog, prev) {
    // In Daily Quest Mode, today's consistency credit is decided at the next
    // day's rollover (based on final mission completion %), not by domain XP
    // minimums as logged in real time. Skip the live domain-based check here;
    // finalizeDailyQuest() handles crediting the day if the mission hit 100%.
    if ((prev || next).dayMode === 'quest') return next;

    const consistencyMin = eco(prev || next, 'consistencyMin');
    const allMinMet = DOMAIN_KEYS.every(k => (dayLog[k] || 0) >= consistencyMin);
    if (!allMinMet) return next;

    return creditConsistencyDay(next, today, yesterdayKey());
  }

  function logActivity(activity, value) {
    let xpGain = 0;
    if (activity.type === 'fixed') {
      xpGain = activity.xp;
    } else if (activity.type === 'duration') {
      xpGain = computeDurationXp(activity.curve, value);
    } else if (activity.type === 'milestone') {
      xpGain = activity.xp;
    }

    setState(prev => {
      const dailyGoal = eco(prev, 'dailyGoal');
      const oldDayLog = (prev.dailyLogs[today] && prev.dailyLogs[today][activity.domain]) || 0;
      // ALL XP counts toward total/levels — no cap. The daily meter is purely visual.
      // xpOverflow is displayed on the meter (e.g. 127/100) but XP is never discarded.
      const xpOverflow = Math.max(0, (oldDayLog + xpGain) - dailyGoal);

      const next = { ...prev };
      next.domains = { ...prev.domains };
      next.domains[activity.domain] = {
        ...next.domains[activity.domain],
        totalXp: next.domains[activity.domain].totalXp + xpGain,
      };

      next.dailyLogs = { ...prev.dailyLogs };
      const dayLog = { ...(next.dailyLogs[today] || {}) };
      dayLog[activity.domain] = oldDayLog + xpGain;
      next.dailyLogs[today] = dayLog;

      next.activityLog = [
        { id: uid('log'), activityName: activity.name, domain: activity.domain, xp: xpGain, overflow: xpOverflow, timestamp: Date.now(), detail: activity.type === 'duration' ? `${value} min` : null },
        ...prev.activityLog,
      ].slice(0, 30);

      const afterStreaks = checkStreaks(next, dayLog, prev);
      const afterAchievements = checkAchievements(afterStreaks);

      // Class mastery: accumulate XP toward the matching class(es)
      const classMastery = { ...(afterAchievements.classMastery || {}) };
      if (activity.domain === 'health') classMastery.warrior = (classMastery.warrior || 0) + xpGain;
      if (activity.domain === 'career') classMastery.scholar = (classMastery.scholar || 0) + xpGain;
      if (activity.domain === 'relationships') classMastery.guardian = (classMastery.guardian || 0) + xpGain;
      if (activity.domain === 'finance') classMastery.treasurer = (classMastery.treasurer || 0) + xpGain;
      if ((activity.tags || []).some(t => t.toLowerCase() === 'creative' || t.toLowerCase() === 'creativity')) {
        classMastery.creator = (classMastery.creator || 0) + xpGain;
      }

      // Yearly legacy: accumulate XP and activity count for the current year
      const year = String(new Date().getFullYear());
      const yearlyLegacy = { ...(afterAchievements.yearlyLegacy || {}) };
      const entry = { ...(yearlyLegacy[year] || { xpEarned: 0, coinsEarned: 0, activitiesLogged: 0, questsCompleted: 0, gatesCleared: 0, highestStreak: 0, topDomain: null, _domainXp: {} }) };
      entry.xpEarned = (entry.xpEarned || 0) + xpGain;
      entry.activitiesLogged = (entry.activitiesLogged || 0) + 1;
      entry._domainXp = { ...(entry._domainXp || {}) };
      entry._domainXp[activity.domain] = (entry._domainXp[activity.domain] || 0) + xpGain;
      entry.topDomain = Object.entries(entry._domainXp).sort((a,b) => b[1]-a[1])[0]?.[0] || null;
      entry.highestStreak = Math.max(entry.highestStreak || 0, afterAchievements.consistencyStreak || 0);
      yearlyLegacy[year] = entry;

      return { ...afterAchievements, classMastery, yearlyLegacy };
    });

    showToast(`+${xpGain} XP — ${activity.name}`);
    SoundEngine.play('logActivity');
  }

  // ---------- Daily Quest Mode actions ----------

  function getTodayQuestPlan(state) {
    return (state.dailyQuestPlans && state.dailyQuestPlans[today]) || { activityIds: [], completedIds: [], locked: false };
  }

  function switchDayMode(newMode) {
    setState(prev => {
      const next = { ...prev, dayMode: newMode };
      // Starting fresh in the new mode for today — discard today's plan if
      // switching INTO quest mode after already having one (rare, but keeps
      // "today's mission" unambiguous). Switching to standard mode doesn't
      // need to touch dailyQuestPlans; today's entry (if any) simply stops
      // being the active view until quest mode is chosen again.
      if (newMode === 'quest') {
        next.dailyQuestPlans = { ...(prev.dailyQuestPlans || {}) };
        next.dailyQuestPlans[today] = { activityIds: [], completedIds: [], locked: false };
      }
      return next;
    });
  }

  function setTodayQuestActivities(activityIds) {
    setState(prev => {
      const plan = getTodayQuestPlan(prev);
      if (plan.locked) return prev; // locked missions can't be edited
      const dailyQuestPlans = { ...(prev.dailyQuestPlans || {}) };
      // Dropping an activity also drops its completion mark
      const completedIds = plan.completedIds.filter(id => activityIds.includes(id));
      dailyQuestPlans[today] = { ...plan, activityIds, completedIds };
      return { ...prev, dailyQuestPlans };
    });
  }

  function toggleQuestActivityComplete(activityId) {
    setState(prev => {
      const plan = getTodayQuestPlan(prev);
      const activity = (prev.activities || []).find(a => a.id === activityId);
      if (!activity) return prev;
      if (plan.locked && !plan.completedIds.includes(activityId)) return prev;

      const wasComplete = plan.completedIds.includes(activityId);
      const completedIds = wasComplete
        ? plan.completedIds.filter(id => id !== activityId)
        : [...plan.completedIds, activityId];

      const dailyQuestPlans = { ...(prev.dailyQuestPlans || {}) };
      const lockEnabled = !!prev.dailyQuestLockEnabled;
      const locked = plan.locked || (lockEnabled && !wasComplete && completedIds.length > 0);
      dailyQuestPlans[today] = { ...plan, completedIds, locked };

      // Award XP to the activity's domain when marking complete.
      // Reverse it when unchecking. This ensures daily mission activity
      // always contributes to domain progression regardless of overall
      // mission completion — the workout counts even if the full day wasn't finished.
      let next = { ...prev, dailyQuestPlans };
      let xpGain = 0;
      if (activity.type === 'fixed' || activity.type === 'milestone') xpGain = activity.xp || 0;
      else if (activity.type === 'duration') xpGain = computeDurationXp(activity.curve, 30); // assume 30 min default for mission check-off
      const domain = activity.domain;

      if (!wasComplete) {
        // Marking complete → award XP
        next.domains = { ...next.domains };
        next.domains[domain] = { ...next.domains[domain], totalXp: next.domains[domain].totalXp + xpGain };
        next.dailyLogs = { ...next.dailyLogs };
        next.dailyLogs[today] = { ...(next.dailyLogs[today] || {}) };
        next.dailyLogs[today][domain] = (next.dailyLogs[today][domain] || 0) + xpGain;
        next.activityLog = [
          { id: uid('log'), activityName: activity.name, domain, xp: xpGain, overflow: 0, timestamp: Date.now(), detail: 'Daily mission' },
          ...next.activityLog,
        ].slice(0, 30);
        // Class mastery
        const classMastery = { ...(next.classMastery || {}) };
        if (domain === 'health') classMastery.warrior = (classMastery.warrior || 0) + xpGain;
        if (domain === 'career') classMastery.scholar = (classMastery.scholar || 0) + xpGain;
        if (domain === 'relationships') classMastery.guardian = (classMastery.guardian || 0) + xpGain;
        if (domain === 'finance') classMastery.treasurer = (classMastery.treasurer || 0) + xpGain;
        if ((activity.tags || []).some(t => t.toLowerCase() === 'creative')) classMastery.creator = (classMastery.creator || 0) + xpGain;
        next.classMastery = classMastery;
        // Yearly legacy
        const year = String(new Date().getFullYear());
        const yearlyLegacy = { ...(next.yearlyLegacy || {}) };
        const le = { ...(yearlyLegacy[year] || {}) };
        le.xpEarned = (le.xpEarned || 0) + xpGain;
        le.activitiesLogged = (le.activitiesLogged || 0) + 1;
        yearlyLegacy[year] = le;
        next.yearlyLegacy = yearlyLegacy;
        next = checkStreaks(next, next.dailyLogs[today], prev);
        next = checkAchievements(next);
      } else {
        // Unchecking → reverse the XP (can't reverse log entry cleanly, just subtract from totals)
        next.domains = { ...next.domains };
        next.domains[domain] = { ...next.domains[domain], totalXp: Math.max(0, next.domains[domain].totalXp - xpGain) };
        next.dailyLogs = { ...next.dailyLogs };
        next.dailyLogs[today] = { ...(next.dailyLogs[today] || {}) };
        next.dailyLogs[today][domain] = Math.max(0, (next.dailyLogs[today][domain] || 0) - xpGain);
      }

      return next;
    });
    const activity = (state.activities || []).find(a => a.id === activityId);
    const wasComplete = (getTodayQuestPlan(state).completedIds || []).includes(activityId);
    if (activity) showToast(wasComplete ? `${activity.name} unchecked` : `✓ ${activity.name} — XP awarded`);
  }

  // Called once per day, on day-open, for the PREVIOUS day's quest plan (if
  // that day was in quest mode). Decides whether the day counts as a
  // qualifying consistency day, based on final mission completion %.
  // Activities' XP/coins were already awarded live as they were logged
  // (per design: completed work is never retroactively taken away) — this
  // step only ever grants the consistency-streak credit, never revokes XP.
  function finalizeDailyQuest(prevDateStr) {
    setState(prev => {
      const plan = prev.dailyQuestPlans && prev.dailyQuestPlans[prevDateStr];
      if (!plan || plan.activityIds.length === 0) return prev; // no mission that day — nothing to finalize
      if (plan.finalized) return prev; // already processed

      const completionPct = Math.round((plan.completedIds.length / plan.activityIds.length) * 100);
      const hit100 = completionPct >= 100;

      let next = { ...prev };
      next.dailyQuestPlans = { ...prev.dailyQuestPlans };
      next.dailyQuestPlans[prevDateStr] = { ...plan, finalized: true, finalCompletionPct: completionPct };

      if (hit100) {
        next = creditConsistencyDay(next, prevDateStr, yesterdayKeyFor(prevDateStr));
      }

      // Write history snapshot (with type for future analytics)
      const historyEntry = {
        date: prevDateStr,
        type: plan.type || 'routine',
        activitiesPlanned: plan.activityIds.length,
        activitiesCompleted: plan.completedIds.length,
        completionPct,
        countedForStreak: hit100,
      };
      next.dailyQuestHistory = [historyEntry, ...(prev.dailyQuestHistory || [])].slice(0, 365);

      // Update aggregate mission statistics
      next.missionStats = updateMissionStats(prev, plan, completionPct);

      return next;
    });
  }

  function setDailyQuestLockEnabled(enabled) {
    setState(prev => ({ ...prev, dailyQuestLockEnabled: enabled }));
  }

  // ---------- Achievement engine ----------
  // Pure function — takes state, returns state with achievement unlocked.
  // Safe to call multiple times (idempotent).
  function unlockAchievementInState(prev, id) {
    if (prev.achievements && prev.achievements[id]) return prev; // already unlocked
    const def = ACHIEVEMENTS[id];
    const achievements = { ...(prev.achievements || {}), [id]: { unlockedAt: Date.now() } };
    // Store the newly-unlocked achievement id so the popup effect can pick it up
    // We use a simple side-channel: _pendingAchievement is never saved to Firestore
    // (it's stripped by JSON.stringify on the next save since it starts with _).
    // Actually Firestore will save it — use a ref instead.
    if (def) {
      setTimeout(() => {
        setAchievementQueue(q => [...q, { id, ...def }]);
        SoundEngine.play('achievement');
      }, 0);
    }
    return { ...prev, achievements };
  }

  function checkAchievements(next, context = {}) {
    const acts = (next.activityLog || []).length;
    const totalXp = DOMAIN_KEYS.reduce((s, k) => s + (next.domains[k]?.totalXp || 0), 0);
    const streak = next.consistencyStreak || 0;
    const bossCount = Object.keys(next.bossCompletions || {}).length;
    const questsDone = (next.archivedQuests || []).length;

    const checks = [
      ['first_log', acts >= 1],
      ['log_10', acts >= 10],
      ['log_50', acts >= 50],
      ['log_100', acts >= 100],
      ['xp_100', totalXp >= 100],
      ['xp_1000', totalXp >= 1000],
      ['xp_10000', totalXp >= 10000],
      ['streak_7', streak >= 7],
      ['streak_30', streak >= 30],
      ['streak_100', streak >= 100],
      ['first_boss', bossCount >= 1],
      ['boss_5', bossCount >= 5],
      ['first_quest', questsDone >= 1],
      ['quest_5', questsDone >= 5],
      ['quest_10', questsDone >= 10],
    ];

    const prevAchievementCount = Object.keys(next.achievements || {}).length;
    let state = next;
    for (const [id, condition] of checks) {
      if (condition) state = unlockAchievementInState(state, id);
    }

    // Unlock advanced settings at combined rank 10
    const totalRank = DOMAIN_KEYS.reduce((s, k) => s + (state.domains[k]?.rank || 0), 0);
    if (totalRank >= 10 && !state.advancedSettingsUnlocked) {
      state = { ...state, advancedSettingsUnlocked: true };
      setTimeout(() => showToast('🔓 Advanced Settings unlocked — Settings → Advanced'), 800);
    }

    // Mark new achievements for the Character tab notification dot
    const newAchievementCount = Object.keys(state.achievements || {}).length;
    if (newAchievementCount > prevAchievementCount) {
      state = { ...state, newAchievementsSince: Date.now() };
    }

    return state;
  }

  // ---------- Quest archive ----------
  function archiveQuest(questId) {
    setState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest) return prev;
      const quests = prev.quests.filter(q => q.id !== questId);
      const archivedQuests = [
        { ...quest, archivedAt: Date.now() },
        ...(prev.archivedQuests || []),
      ];
      let next = { ...prev, quests, archivedQuests };
      next = checkAchievements(next);
      return next;
    });
  }

  function restoreQuestFromArchive(questId) {
    setState(prev => {
      const quest = (prev.archivedQuests || []).find(q => q.id === questId);
      if (!quest) return prev;
      const archivedQuests = (prev.archivedQuests || []).filter(q => q.id !== questId);
      const { archivedAt, goldEarned, finalCompletionPct, ...restoredQuest } = quest;
      const quests = [...prev.quests, { ...restoredQuest, progress: 0 }];

      // Reverse the XP and coins that were awarded when this quest completed.
      // Without this, restoring a quest becomes a way to farm XP — complete it,
      // restore, complete again infinitely.
      let next = { ...prev, quests, archivedQuests };
      if (quest.xpReward) {
        const dom = quest.domain;
        if (next.domains[dom]) {
          next.domains = { ...next.domains };
          next.domains[dom] = { ...next.domains[dom], totalXp: Math.max(0, next.domains[dom].totalXp - quest.xpReward) };
        }
      }
      const coinRefund = goldEarned || 0;
      if (coinRefund > 0) {
        next.gold = Math.max(0, (next.gold || 0) - coinRefund);
      }

      return next;
    });
    showToast('Quest restored — XP and coins reversed');
  }

  // ---------- Quest chains ----------
  function saveQuestChain(name, questIds) {
    setState(prev => {
      const chains = [...(prev.questChains || [])];
      const existing = chains.findIndex(c => c.questIds.some(id => questIds.includes(id)));
      if (existing >= 0) {
        chains[existing] = { ...chains[existing], name, questIds };
      } else {
        chains.push({ id: uid('chain'), name, questIds, createdAt: Date.now() });
      }
      // Update each quest's chainId and dependsOn
      const quests = prev.quests.map(q => {
        const pos = questIds.indexOf(q.id);
        if (pos < 0) return q;
        return {
          ...q,
          chainId: chains[existing >= 0 ? existing : chains.length - 1]?.id || chains[chains.length - 1].id,
          chainOrder: pos,
          dependsOn: pos > 0 ? questIds[pos - 1] : null,
        };
      });
      return { ...prev, questChains: chains, quests };
    });
    showToast(`Chain "${name}" saved`);
  }

  function removeQuestFromChain(questId) {
    setState(prev => {
      const quests = prev.quests.map(q =>
        q.id === questId ? { ...q, chainId: null, chainOrder: null, dependsOn: null } : q
      );
      // Rebuild dependsOn for remaining chain members
      const quest = prev.quests.find(q => q.id === questId);
      const chainId = quest && quest.chainId;
      if (chainId) {
        const chain = (prev.questChains || []).find(c => c.id === chainId);
        if (chain) {
          const remaining = chain.questIds.filter(id => id !== questId);
          const chains = prev.questChains.map(c =>
            c.id === chainId ? { ...c, questIds: remaining } : c
          );
          const updatedQuests = quests.map(q => {
            const pos = remaining.indexOf(q.id);
            if (pos < 0) return q;
            return { ...q, chainOrder: pos, dependsOn: pos > 0 ? remaining[pos - 1] : null };
          });
          return { ...prev, questChains: chains, quests: updatedQuests };
        }
      }
      return { ...prev, quests };
    });
  }

  // Check if a quest is unlocked (its dependsOn has been archived, or it has no dependency)
  function isQuestUnlocked(quest, state) {
    if (!quest.dependsOn) return true;
    return (state.archivedQuests || []).some(q => q.id === quest.dependsOn);
  }

  // ---------- Mission templates ----------
  function saveMissionTemplate(name, type, activityIds) {
    setState(prev => {
      const existing = (prev.missionTemplates || []).find(t => t.name === name);
      const templates = existing
        ? (prev.missionTemplates || []).map(t => t.name === name ? { ...t, type, activityIds, updatedAt: Date.now() } : t)
        : [...(prev.missionTemplates || []), { id: uid('tmpl'), name, type: type || 'routine', activityIds, createdAt: Date.now() }];
      return { ...prev, missionTemplates: templates };
    });
    showToast(`Template "${name}" saved`);
  }

  function deleteMissionTemplate(id) {
    setState(prev => ({ ...prev, missionTemplates: (prev.missionTemplates || []).filter(t => t.id !== id) }));
  }

  // ---------- Activity favorite toggle ----------
  function toggleActivityFavorite(activityId) {
    setState(prev => ({
      ...prev,
      activities: prev.activities.map(a =>
        a.id === activityId ? { ...a, favorite: !a.favorite } : a
      ),
    }));
  }

  function equipTitle(titleId) {
    setState(prev => ({
      ...prev,
      equippedTitle: prev.equippedTitle === titleId ? null : titleId, // toggle off if same
    }));
  }

  // ---------- Update mission stats on finalize ----------
  function updateMissionStats(prev, plan, completionPct) {
    const stats = { ...(prev.missionStats || {}) };
    stats.totalAttempted = (stats.totalAttempted || 0) + 1;
    if (completionPct >= 100) stats.totalCompleted = (stats.totalCompleted || 0) + 1;

    const type = plan.type || 'routine';
    const byType = { ...(stats.byType || {}) };
    byType[type] = {
      attempted: ((byType[type] || {}).attempted || 0) + 1,
      completed: ((byType[type] || {}).completed || 0) + (completionPct >= 100 ? 1 : 0),
    };
    stats.byType = byType;

    const actCounts = { ...(stats.activityCompletionCounts || {}) };
    (plan.completedIds || []).forEach(id => {
      actCounts[id] = (actCounts[id] || 0) + 1;
    });
    stats.activityCompletionCounts = actCounts;

    // Track mission completion streaks
    if (completionPct >= 100) {
      stats.currentStreak = (stats.currentStreak || 0) + 1;
      stats.longestStreak = Math.max(stats.longestStreak || 0, stats.currentStreak);
    } else {
      stats.currentStreak = 0;
    }

    return stats;
  }

  function saveActivity(activityData) {
    setState(prev => {
      const activities = [...prev.activities];
      const normalised = {
        tags: [],
        favorite: false,
        ...activityData,
      };
      if (normalised.id) {
        const idx = activities.findIndex(a => a.id === normalised.id);
        if (idx >= 0) activities[idx] = normalised;
      } else {
        const newAct = { ...normalised, id: uid('act') };
        activities.push(newAct);
        // Achievement: first activity created
        if (activities.length === 1) {
          return unlockAchievementInState({ ...prev, activities }, 'first_activity');
        }
      }
      return { ...prev, activities };
    });
    setShowActivityForm(false);
    setEditingActivity(null);
  }

  function deleteActivity(id) {
    setState(prev => ({ ...prev, activities: prev.activities.filter(a => a.id !== id) }));
  }

  function deleteLogEntry(logId) {
    setState(prev => {
      const entry = (prev.activityLog || []).find(l => l.id === logId);
      if (!entry) return prev;
      const activityLog = prev.activityLog.filter(l => l.id !== logId);
      // Reverse the XP from the domain total
      const domains = { ...prev.domains };
      if (domains[entry.domain]) {
        domains[entry.domain] = {
          ...domains[entry.domain],
          totalXp: Math.max(0, domains[entry.domain].totalXp - entry.xp),
        };
      }
      // Reverse from today's daily log meter
      const logDate = dateKey(new Date(entry.timestamp));
      const dailyLogs = { ...prev.dailyLogs };
      if (dailyLogs[logDate] && dailyLogs[logDate][entry.domain]) {
        dailyLogs[logDate] = { ...dailyLogs[logDate] };
        dailyLogs[logDate][entry.domain] = Math.max(0, dailyLogs[logDate][entry.domain] - entry.xp);
      }
      return { ...prev, activityLog, domains, dailyLogs };
    });
    showToast('Log entry removed');
  }

  function saveQuest(questData) {
    setState(prev => {
      const quests = [...prev.quests];
      if (questData.id) {
        const idx = quests.findIndex(q => q.id === questData.id);
        if (idx >= 0) quests[idx] = questData;
      } else {
        quests.push({ ...questData, id: uid('quest'), createdAt: Date.now(), progress: 0 });
      }
      return { ...prev, quests };
    });
    setShowQuestForm(false);
  }

  // Shared completion-reward logic: called whenever a quest's progress
  // transitions to 100%, whether via the manual slider or via checkpoints.
  function applyQuestCompletionReward(next, oldQuest, quest) {
    if (quest && quest.progress === 100 && oldQuest.progress < 100) {
      const goldGain = Math.round(quest.xpReward / 3);
      next.domains = { ...next.domains };
      next.domains[quest.domain] = { ...next.domains[quest.domain], totalXp: next.domains[quest.domain].totalXp + quest.xpReward };
      next.gold = next.gold + goldGain;
      next.totalCoinsEarnedAllTime = (next.totalCoinsEarnedAllTime || 0) + goldGain;
      next.goldHistory = { ...(next.goldHistory || {}) };
      next.goldHistory[today] = (next.goldHistory[today] || 0) + goldGain;
      showToast(`Quest complete! +${quest.xpReward} XP, +${goldGain} gold — archived`);
      SoundEngine.play('questComplete');
      // Auto-archive on completion
      next.quests = next.quests.filter(q => q.id !== quest.id);
      next.archivedQuests = [
        { ...quest, archivedAt: Date.now(), goldEarned: goldGain },
        ...(next.archivedQuests || []),
      ];
      // Chain-continues: if completing this quest unlocks the next one in a chain, notify
      const nextInChain = next.quests.find(q => q.dependsOn === quest.id);
      if (nextInChain) {
        // Schedule the toast slightly after the completion toast
        setTimeout(() => showToast(`⛓ Chain continues: "${nextInChain.name}" is now unlocked!`), 1200);
      }
      next = checkAchievements(next);
      // Yearly legacy: quest count and coins
      const _year = String(new Date().getFullYear());
      const _yearlyLegacy = { ...(next.yearlyLegacy || {}) };
      const _le = { ...(_yearlyLegacy[_year] || {}) };
      _le.questsCompleted = (_le.questsCompleted || 0) + 1;
      _le.coinsEarned = (_le.coinsEarned || 0) + goldGain;
      _yearlyLegacy[_year] = _le;
      next.yearlyLegacy = _yearlyLegacy;
      // Queue achievement unlock popup for any newly earned achievements
      const newlyUnlocked = Object.keys(next.achievements || {}).filter(
        id => !(oldQuest._prevAchievements || {})[id]
      );
      if (newlyUnlocked.length > 0) {
        next.pendingAchievementUnlocks = [
          ...(next.pendingAchievementUnlocks || []),
          ...newlyUnlocked.map(id => ({ id, at: Date.now() })),
        ];
      }
    }
    return next;
  }

  function updateQuestProgress(id, progress) {
    setState(prev => {
      const quests = prev.quests.map(q => q.id === id ? { ...q, progress: Math.max(0, Math.min(100, progress)) } : q);
      let next = { ...prev, quests };
      const oldQuest = prev.quests.find(q=>q.id===id);
      const quest = quests.find(q => q.id === id);
      return applyQuestCompletionReward(next, oldQuest, quest);
    });
  }

  // Toggle a single checkpoint's done state, then recompute the quest's
  // overall progress as (checked / total) * 100. Manual slider edits are
  // disabled for quests that have checkpoints — checkmarks are the source
  // of truth, since manual percentages tend to be guesswork.
  function toggleCheckpoint(questId, checkpointId) {
    setState(prev => {
      const oldQuest = prev.quests.find(q => q.id === questId);
      if (!oldQuest) return prev;

      const checkpoints = (oldQuest.checkpoints || []).map(c =>
        c.id === checkpointId ? { ...c, done: !c.done } : c
      );
      const total = checkpoints.length;
      const doneCount = checkpoints.filter(c => c.done).length;
      const progress = total > 0 ? Math.round((doneCount / total) * 100) : oldQuest.progress;

      const updatedQuest = { ...oldQuest, checkpoints, progress };
      const quests = prev.quests.map(q => q.id === questId ? updatedQuest : q);
      let next = { ...prev, quests };
      return applyQuestCompletionReward(next, oldQuest, updatedQuest);
    });
  }

  function deleteQuest(id) {
    setState(prev => {
      const quest = prev.quests.find(q => q.id === id);
      let quests = prev.quests.filter(q => q.id !== id);

      // If the deleted quest was a chain head (dependsOn === null, has a chainId),
      // promote the next quest in the chain (lowest chainOrder among its dependents)
      if (quest && quest.chainId) {
        const nextInChain = quests
          .filter(q => q.chainId === quest.chainId && q.dependsOn === id)
          .sort((a, b) => (a.chainOrder || 0) - (b.chainOrder || 0))[0];
        if (nextInChain) {
          quests = quests.map(q =>
            q.id === nextInChain.id ? { ...q, dependsOn: null } : q
          );
        }
      }
      return { ...prev, quests };
    });
  }

  function completeBoss(domainKey, level, tier) {
    setState(prev => {
      const key = `${domainKey}-${level}`;
      const bossCompletions = { ...prev.bossCompletions, [key]: { tier, completedAt: Date.now() } };
      const isMiniGate = level % 10 !== 0;
      const base = isMiniGate ? eco(prev, 'miniGateCoinBase') : eco(prev, 'bossCoinBase');
      const multipliers = isMiniGate ? eco(prev, 'miniGateTierMultipliers') : eco(prev, 'gateTierMultipliers');
      const mult = (multipliers && multipliers[tier]) || 1.0;
      const goldGain = Math.round(base * mult);
      const goldHistory = { ...(prev.goldHistory || {}) };
      goldHistory[today] = (goldHistory[today] || 0) + goldGain;
      const after = checkAchievements({ ...prev, bossCompletions, gold: prev.gold + goldGain, goldHistory, totalCoinsEarnedAllTime: (prev.totalCoinsEarnedAllTime || 0) + goldGain });
      // Yearly legacy: gate count and coins
      const _year = String(new Date().getFullYear());
      const _yearlyLegacy = { ...(after.yearlyLegacy || {}) };
      const _le = { ...(_yearlyLegacy[_year] || {}) };
      _le.gatesCleared = (_le.gatesCleared || 0) + 1;
      _le.coinsEarned = (_le.coinsEarned || 0) + goldGain;
      _yearlyLegacy[_year] = _le;
      return { ...after, yearlyLegacy: _yearlyLegacy };
    });
    showToast(`Boss defeated! Rank unlocked.`);
    SoundEngine.play('bossDefeated');
    setTimeout(() => SoundEngine.play('levelUp'), 600);
    // #4 Reward proximity hint — show if a reward is now affordable
    setState(prev => {
      const cheapest = (prev.rewards || []).filter(r => r.cost <= prev.gold).sort((a,b) => b.cost - a.cost)[0];
      if (cheapest) setTimeout(() => showToast(`💰 You can now afford: ${cheapest.name} (${cheapest.cost} coins)`), 1500);
      return prev;
    });
    setBossModal(null);
  }

  function buyTicket(reward) {
    setState(prev => {
      if (!canAffordReward(reward, prev)) return prev;
      const ticket = {
        id: uid('tkt'),
        rewardId: reward.id,
        name: reward.name,
        desc: reward.desc || '',
        cost: reward.cost,
        purchasedAt: Date.now(),
        usedAt: null,
      };
      return {
        ...prev,
        gold: prev.gold - (reward.cost || 0),
        tickets: [...(prev.tickets || []), ticket],
      };
    });
    showToast(`Bought ticket: ${reward.name}`);
    SoundEngine.play('coinPurchase');
  }

  function useTicket(id) {
    setState(prev => {
      const tickets = (prev.tickets || []).map(t => t.id === id && !t.usedAt ? { ...t, usedAt: Date.now() } : t);
      return { ...prev, tickets };
    });
    showToast('Ticket used. Enjoy.');
  }

  function sellTicket(id) {
    setState(prev => {
      const t = (prev.tickets || []).find(x => x.id === id);
      if (!t || t.usedAt) return prev;
      const refund = Math.floor(t.cost * SELL_REFUND_RATIO);
      const goldHistory = { ...(prev.goldHistory || {}) };
      // Sales don't count as "earned" gold for estimates — skip goldHistory
      return {
        ...prev,
        gold: prev.gold + refund,
        tickets: (prev.tickets || []).filter(x => x.id !== id),
      };
    });
    showToast('Ticket sold at 50% refund');
  }

  function deleteTicket(id) {
    setState(prev => ({ ...prev, tickets: (prev.tickets || []).filter(t => t.id !== id) }));
  }

  function toggleBossGate(domain, level) {
    setState(prev => {
      const current = activeBossLevelsFor(prev, domain);
      const set = new Set(current);
      if (set.has(level)) {
        // Can't disable a gate that's already been completed (would remove a real achievement)
        // Allow disabling regardless — the completion record stays in bossCompletions; if user re-enables, they keep credit.
        set.delete(level);
      } else {
        set.add(level);
      }
      const next = Array.from(set).sort((a, b) => a - b);
      const enabledBosses = { ...(prev.enabledBosses || {}), [domain]: next };
      return { ...prev, enabledBosses };
    });
  }

  function saveReward(rewardData) {
    setState(prev => {
      const rewards = [...prev.rewards];
      if (rewardData.id) {
        const idx = rewards.findIndex(r => r.id === rewardData.id);
        if (idx >= 0) rewards[idx] = rewardData;
      } else {
        rewards.push({ ...rewardData, id: uid('reward') });
      }
      return { ...prev, rewards };
    });
    setShowRewardForm(false);
  }

  function deleteReward(id) {
    setState(prev => ({ ...prev, rewards: prev.rewards.filter(r => r.id !== id) }));
  }

  function addCustomSubcat(domainKey, name) {
    setState(prev => {
      const customSubcats = { ...prev.customSubcats };
      customSubcats[domainKey] = [...(customSubcats[domainKey] || []), name];
      return { ...prev, customSubcats };
    });
  }

  function resetDomain(domainKey) {
    intentionalChangeUntil.current = Date.now() + 60000;
    setState(prev => {
      // Clear domain XP and level
      const domains = { ...prev.domains };
      domains[domainKey] = { totalXp: 0, level: 0, rank: 0, potentialRank: 0 };

      // Clear ALL daily log entries for this domain (not just today)
      const dailyLogs = {};
      Object.entries(prev.dailyLogs).forEach(([dateKey, log]) => {
        const newLog = { ...log };
        delete newLog[domainKey];
        if (Object.keys(newLog).length > 0) dailyLogs[dateKey] = newLog;
      });

      // Remove all activity log entries belonging to this domain
      const activityLog = (prev.activityLog || []).filter(e => e.domain !== domainKey);

      // Wipe boss completions for this domain
      const bossCompletions = { ...prev.bossCompletions };
      Object.keys(bossCompletions).forEach(k => {
        if (k.startsWith(`${domainKey}-`)) delete bossCompletions[k];
      });

      // Clear custom bosses for this domain
      const customBosses = { ...(prev.customBosses || {}) };
      delete customBosses[domainKey];

      // Clear enabled boss gates for this domain (resets to default)
      const enabledBosses = { ...(prev.enabledBosses || {}) };
      delete enabledBosses[domainKey];

      return { ...prev, domains, dailyLogs, activityLog, bossCompletions, customBosses, enabledBosses, lastResetAt: Date.now() };
    });
    setResetPrompt(null);
    showToast(`${DOMAINS[domainKey].name} reset`);
  }

  function resetAll() {
    intentionalChangeUntil.current = Date.now() + 60000; // 60s window — other devices' old data shouldn't bounce back
    setState(prev => {
      const fresh = buildInitialState();
      // Preserve activity & reward templates and custom config (not progress)
      fresh.activities = prev.activities;
      fresh.rewards = prev.rewards;
      fresh.customSubcats = prev.customSubcats;
      fresh.customBosses = prev.customBosses;
      fresh.lastResetAt = Date.now();
      return fresh;
    });
    setResetPrompt(null);
    showToast('Character reset. Fresh start.');
  }

  function saveCustomBoss(domain, level, challenges) {
    setState(prev => {
      const customBosses = { ...(prev.customBosses || {}) };
      customBosses[domain] = { ...(customBosses[domain] || {}) };
      customBosses[domain][level] = challenges;
      return { ...prev, customBosses };
    });
    setBossEditor(null);
    showToast('Boss challenges saved');
  }

  function saveMissionNote(noteText) {
    setState(prev => {
      const plan = (prev.dailyQuestPlans && prev.dailyQuestPlans[today]) || { activityIds: [], completedIds: [], locked: false };
      return {
        ...prev,
        dailyQuestPlans: {
          ...(prev.dailyQuestPlans || {}),
          [today]: { ...plan, note: noteText },
        },
      };
    });
  }

  function saveEconomy(newEconomy) {
    setState(prev => ({ ...prev, economy: { ...(prev.economy || {}), ...newEconomy } }));
    showToast('Economy settings saved');
  }

  function setDifficultyPreset(preset) {
    const overrides = DIFFICULTY_PRESETS[preset];
    if (!overrides) return;
    setState(prev => ({
      ...prev,
      difficultyPreset: preset,
      economy: { ...DEFAULT_ECONOMY, ...(prev.economy || {}), ...overrides },
    }));
    showToast(`Difficulty: ${preset.charAt(0).toUpperCase() + preset.slice(1)}`);
  }

  function clearNewAchievementDot() {
    setState(prev => ({ ...prev, newAchievementsSince: null }));
  }

  function savePowerValues(values) {
    setState(prev => ({ ...prev, powerValues: values }));
  }

  // Quest benchmark actions
  function saveChallengeLibrary(library) {
    setState(prev => ({ ...prev, challengeLibrary: library }));
  }

  function saveSpawnChance(chance) {
    setState(prev => ({ ...prev, challengeSpawnChance: chance }));
  }

  function completeChallenge() {
    setState(prev => {
      if (!prev.activeChallenge) return prev;
      const ch = prev.activeChallenge;
      const xpGain = ch.xp || 0;
      const coinGain = ch.coins || 0;
      const next = { ...prev };
      next.domains = { ...prev.domains };
      next.domains[ch.domain] = { ...next.domains[ch.domain], totalXp: next.domains[ch.domain].totalXp + xpGain };
      next.gold = next.gold + coinGain;
      next.goldHistory = { ...(next.goldHistory || {}) };
      next.goldHistory[today] = (next.goldHistory[today] || 0) + coinGain;
      next.activeChallenge = { ...ch, completedAt: Date.now(), revealed: true };
      showToast(`Challenge complete! +${xpGain} XP, +${coinGain} coins`);
      return next;
    });
  }

  function dismissChallenge() {
    setState(prev => ({ ...prev, activeChallenge: null }));
  }

  return h('div', { style: styles.app },
    h('style', null, `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
      ${THEMES[state.theme || 'default']?.fonts ? `@import url('${THEMES[state.theme].fonts}');` : ''}
      ${THEMES[state.theme || 'default']?.css || ''}

      :root {
        --bg-void:    #080810;
        --bg-panel:   #0d0d1a;
        --bg-raised:  #12121f;
        --bg-hover:   #1a1a2e;
        --border-dim: rgba(255,255,255,0.055);
        --border-mid: rgba(255,255,255,0.10);
        --border-glow: rgba(167,139,250,0.45);
        --gold:       #c9a84c;
        --gold-dim:   rgba(201,168,76,0.15);
        --gold-glow:  rgba(201,168,76,0.3);
        --accent:     #a78bfa;
        --accent-dim: rgba(167,139,250,0.12);
        --accent-glow:rgba(167,139,250,0.3);
        --text-hi:    #eceaf6;
        --text-mid:   #9896b0;
        --text-lo:    #4a4868;
        --danger:     #e05c5c;
        --success:    #5de8a0;
        --sidebar-w:  260px;
        --sidebar-w-mobile: 0px;
      }

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      html, body {
        background: var(--bg-void);
        color: var(--text-hi);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow-x: hidden;
      }

      /* ── Scanline overlay ──────────────────────────────── */
      body::after {
        content: '';
        position: fixed; inset: 0; z-index: 9999;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.03) 2px,
          rgba(0,0,0,0.03) 4px
        );
        pointer-events: none;
      }

      /* ── Scrollbars ────────────────────────────────────── */
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--text-lo); border-radius: 2px; }
      ::-webkit-scrollbar-thumb:hover { background: var(--text-mid); }

      /* ── Base elements ─────────────────────────────────── */
      input, select, textarea, button { font-family: inherit; }

      input, textarea, select {
        background: var(--bg-void);
        border: 1px solid var(--border-mid);
        border-radius: 4px;
        color: var(--text-hi);
        padding: 9px 12px;
        font-size: 13px;
        width: 100%;
        transition: border-color 0.15s, box-shadow 0.15s;
        outline: none;
      }
      input:focus, textarea:focus, select:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 2px var(--accent-dim);
      }
      input::placeholder, textarea::placeholder { color: var(--text-lo); }

      /* ── Button reset + transitions ────────────────────── */
      button.rpg-btn {
        border: none; background: none; padding: 0;
        cursor: pointer; font-family: inherit;
        transition: all 0.15s ease;
        display: inline-flex; align-items: center;
        -webkit-user-select: none; user-select: none;
      }
      button.rpg-btn:active { transform: scale(0.96); }
      button.rpg-btn:disabled { opacity: 0.4; cursor: not-allowed; }

      /* ── Sidebar nav ────────────────────────────────────── */
      .rpg-sidebar {
        position: fixed; top: 0; left: 0; bottom: 0;
        width: var(--sidebar-w);
        background: var(--bg-panel);
        border-right: 1px solid var(--border-dim);
        display: flex; flex-direction: column;
        z-index: 100;
        transition: transform 0.25s ease;
      }
      .rpg-sidebar-logo {
        padding: 16px 16px 14px;
        border-bottom: 1px solid var(--border-dim);
        display: flex; flex-direction: column; align-items: center;
      }
      .rpg-sidebar-logo-title {
        font-size: 12px; font-weight: 800; letter-spacing: 2.5px;
        text-transform: uppercase; color: var(--gold);
        line-height: 1; text-align: center;
      }
      .rpg-sidebar-logo-sub {
        font-size: 9.5px; color: var(--text-lo); letter-spacing: 1.5px;
        text-transform: uppercase; margin-top: 4px; text-align: center;
      }
      .rpg-nav-list {
        flex: 1; padding: 12px 0; display: flex; flex-direction: column; gap: 2px; overflow-y: auto;
      }
      .rpg-nav-item {
        position: relative;
        display: flex; align-items: center; gap: 14px;
        padding: 14px 28px;
        font-size: 14px; font-weight: 500; letter-spacing: 0.2px;
        color: var(--text-mid);
        cursor: pointer; border: none; background: transparent;
        text-align: left; width: 100%;
        transition: color 0.15s, background 0.15s;
        min-height: 50px;
      }
      .rpg-nav-item::before {
        content: '';
        position: absolute; left: 0; top: 50%; transform: translateY(-50%);
        width: 2px; height: 0;
        background: var(--accent);
        box-shadow: 0 0 8px var(--accent);
        border-radius: 0 2px 2px 0;
        transition: height 0.2s ease;
      }
      .rpg-nav-item:hover { color: var(--text-hi); background: var(--accent-dim); }
      .rpg-nav-item.active {
        color: var(--text-hi);
        background: linear-gradient(90deg, var(--accent-dim) 0%, transparent 100%);
        font-weight: 600;
      }
      .rpg-nav-item.active::before { height: 22px; }
      .rpg-nav-item .nav-icon { flex-shrink: 0; opacity: 0.7; transition: opacity 0.15s; }
      .rpg-nav-item.active .nav-icon,
      .rpg-nav-item:hover .nav-icon { opacity: 1; }
      .rpg-sidebar-footer {
        padding: 16px 20px;
        border-top: 1px solid var(--border-dim);
        display: flex; flex-direction: column; gap: 10px;
      }

      /* ── Main content area ──────────────────────────────── */
      .rpg-main {
        margin-left: var(--sidebar-w);
        min-height: 100vh;
        display: flex; flex-direction: column;
      }
      .rpg-topbar {
        position: sticky; top: 0; z-index: 50;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 32px;
        height: 60px;
        background: rgba(8,8,16,0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border-dim);
      }
      .rpg-topbar-title {
        font-size: 11px; font-weight: 700; letter-spacing: 2px;
        text-transform: uppercase; color: var(--text-lo);
      }
      .rpg-topbar-chips {
        display: flex; align-items: center; gap: 8px;
      }
      .rpg-hud-chip {
        display: flex; align-items: center; gap: 7px;
        padding: 6px 12px;
        background: var(--bg-raised);
        border: 1px solid var(--border-dim);
        border-radius: 4px;
        font-size: 14px; font-weight: 700; color: var(--text-hi);
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s;
      }
      .rpg-hud-chip:hover { border-color: var(--border-mid); background: var(--bg-hover); }
      .rpg-hud-chip.gold-chip { color: var(--gold); }
      .rpg-hud-chip.streak-chip { color: #fb923c; }
      .rpg-hud-chip.power-chip { color: #fbbf24; }
      .rpg-content {
        flex: 1; padding: 28px;
        max-width: 900px; width: 100%;
        margin: 0 auto;
      }

      /* ── Section labels ─────────────────────────────────── */
      .rpg-section-label {
        display: flex; align-items: center; gap: 8px;
        font-size: 10px; font-weight: 700; letter-spacing: 2px;
        text-transform: uppercase; color: var(--text-lo);
        margin-bottom: 12px;
      }
      .rpg-section-label::after {
        content: '';
        flex: 1; height: 1px;
        background: linear-gradient(90deg, var(--border-dim), transparent);
      }

      /* ── Cards ──────────────────────────────────────────── */
      .rpg-card {
        background: var(--bg-raised);
        border: 1px solid var(--border-dim);
        border-radius: 4px;
        padding: 16px;
        transition: border-color 0.2s;
      }
      .rpg-card:hover { border-color: var(--border-mid); }
      .rpg-card.glow { border-color: var(--border-glow); box-shadow: 0 0 20px var(--accent-dim); }

      /* ── XP meter ───────────────────────────────────────── */
      .rpg-meter-track {
        position: relative; height: 8px;
        background: var(--bg-void);
        border: 1px solid var(--border-dim);
        border-radius: 2px; overflow: visible;
      }
      .rpg-meter-fill {
        position: absolute; top: 0; left: 0; bottom: 0;
        border-radius: 2px;
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        animation: barFill 0.7s cubic-bezier(0.4,0,0.2,1);
      }
      .rpg-meter-tick {
        position: absolute; top: -2px; bottom: -2px; width: 1px;
        background: var(--bg-panel); opacity: 0.6;
        pointer-events: none;
      }
      .rpg-meter-overflow { box-shadow: 0 0 12px currentColor; }

      /* ── Stat value display ─────────────────────────────── */
      .rpg-stat-value { font-size: 24px; font-weight: 800; line-height: 1; letter-spacing: -0.5px; }
      .rpg-stat-label { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-lo); margin-top: 2px; }

      /* ── Primary / secondary buttons ───────────────────── */
      .rpg-primary-btn {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 9px 16px; border-radius: 4px;
        background: var(--accent-dim);
        border: 1px solid var(--accent);
        color: var(--accent); font-size: 12px; font-weight: 700;
        letter-spacing: 0.5px; text-transform: uppercase;
        cursor: pointer; transition: all 0.15s;
      }
      .rpg-primary-btn:hover { background: rgba(167,139,250,0.22); box-shadow: 0 0 14px var(--accent-glow); }

      .rpg-secondary-btn {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 8px 14px; border-radius: 4px;
        background: transparent;
        border: 1px solid var(--border-mid);
        color: var(--text-mid); font-size: 12px; font-weight: 600;
        cursor: pointer; transition: all 0.15s;
      }
      .rpg-secondary-btn:hover { border-color: var(--text-mid); color: var(--text-hi); background: var(--bg-hover); }

      .rpg-gold-btn {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 9px 16px; border-radius: 4px;
        background: var(--gold-dim);
        border: 1px solid var(--gold);
        color: var(--gold); font-size: 12px; font-weight: 700;
        letter-spacing: 0.5px; text-transform: uppercase;
        cursor: pointer; transition: all 0.15s;
      }
      .rpg-gold-btn:hover { background: rgba(201,168,76,0.22); box-shadow: 0 0 14px var(--gold-glow); }

      .rpg-icon-btn {
        width: 30px; height: 30px; border-radius: 4px;
        display: inline-flex; align-items: center; justify-content: center;
        background: var(--bg-hover); border: 1px solid var(--border-dim);
        color: var(--text-mid); cursor: pointer; transition: all 0.15s; flex-shrink: 0;
      }
      .rpg-icon-btn:hover { border-color: var(--border-mid); color: var(--text-hi); }
      .rpg-icon-btn.danger:hover { border-color: var(--danger); color: var(--danger); background: rgba(224,92,92,0.1); }

      /* ── Toast ──────────────────────────────────────────── */
      .rpg-toast {
        position: fixed; top: 16px; right: 16px; z-index: 9998;
        background: var(--bg-raised);
        border: 1px solid var(--border-mid);
        border-left: 3px solid var(--accent);
        border-radius: 4px;
        padding: 11px 16px;
        font-size: 13px; font-weight: 500; color: var(--text-hi);
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        animation: toastSlide 0.25s ease;
        max-width: 320px;
      }

      /* ── Modal overlay ──────────────────────────────────── */
      .rpg-modal-overlay {
        position: fixed; inset: 0; z-index: 200;
        background: rgba(4,4,10,0.85);
        backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
      }
      .rpg-modal {
        background: var(--bg-panel);
        border: 1px solid var(--border-mid);
        border-top: 1px solid rgba(167,139,250,0.25);
        border-radius: 4px;
        width: 100%; max-width: 500px;
        max-height: 90vh; overflow-y: auto;
        box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03);
      }
      .rpg-modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 18px 20px 14px;
        border-bottom: 1px solid var(--border-dim);
      }
      .rpg-modal-title {
        font-size: 12px; font-weight: 700; letter-spacing: 2px;
        text-transform: uppercase; color: var(--text-hi);
      }
      .rpg-modal-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

      /* ── FAB ────────────────────────────────────────────── */
      .rpg-fab {
        position: fixed; bottom: 24px; right: 24px; z-index: 90;
        width: 50px; height: 50px; border-radius: 4px;
        background: var(--accent);
        border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 20px rgba(167,139,250,0.4);
        transition: all 0.2s;
      }
      .rpg-fab:hover { transform: scale(1.06); box-shadow: 0 6px 28px rgba(167,139,250,0.55); }
      .rpg-fab:active { transform: scale(0.97); }

      /* ── Mobile overlay nav ─────────────────────────────── */
      .rpg-mobile-nav {
        display: none;
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
        background: var(--bg-panel);
        border-top: 1px solid var(--border-dim);
        padding: 6px 0 env(safe-area-inset-bottom, 6px);
      }
      .rpg-mobile-nav-inner {
        display: flex; justify-content: space-around;
      }
      .rpg-mobile-nav-item {
        display: flex; flex-direction: column; align-items: center; gap: 4px;
        padding: 8px 12px;
        font-size: 10px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase;
        color: var(--text-lo); cursor: pointer; border: none; background: transparent;
        transition: color 0.15s; min-width: 52px; min-height: 52px; justify-content: center;
      }
      .rpg-mobile-nav-item.active { color: var(--accent); }

      /* ── Domain colour vars ─────────────────────────────── */
      .domain-health  { --domain-color: #e24b4a; }
      .domain-relationships { --domain-color: #d4537e; }
      .domain-career  { --domain-color: #378add; }
      .domain-finance { --domain-color: #ef9f27; }

      /* ── Keyframes ──────────────────────────────────────── */
      @keyframes fadeIn    { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      @keyframes fadeInUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      @keyframes barFill   { from { width:0; } }
      @keyframes toastSlide{ from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }
      @keyframes pulseGlow { 0%,100% { box-shadow:0 0 0 0 rgba(167,139,250,0); } 50% { box-shadow:0 0 0 6px rgba(167,139,250,0.12); } }
      @keyframes tutorialPulse { 0%,100% { box-shadow:0 0 0 0 rgba(167,139,250,0.6); } 50% { box-shadow:0 0 0 8px rgba(167,139,250,0); } }
      @keyframes glowPulse { 0%,100% { opacity:0.7; } 50% { opacity:1; } }
      @keyframes shimmer   { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }

      /* ── Responsive ─────────────────────────────────────── */
      @media (max-width: 768px) {
        .rpg-sidebar { transform: translateX(-100%); }
        .rpg-main { margin-left: 0; padding-bottom: 64px; }
        .rpg-content { padding: 16px; }
        .rpg-mobile-nav { display: block; }
        .rpg-topbar { padding: 0 16px; }
      }

      /* ── Filter chips ───────────────────────────────────── */
      .rpg-chip {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 5px 10px; border-radius: 3px;
        font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
        border: 1px solid var(--border-dim); background: transparent;
        color: var(--text-mid); cursor: pointer; transition: all 0.15s;
      }
      .rpg-chip:hover { border-color: var(--border-mid); color: var(--text-hi); }
      .rpg-chip.active { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

      /* ── Progress bar tick marks ────────────────────────── */
      .rpg-meter-wrap { position: relative; }
      .rpg-meter-wrap .tick { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--bg-panel); z-index: 1; }

      /* ── Misc utility ───────────────────────────────────── */
      .rpg-divider { height: 1px; background: var(--border-dim); margin: 4px 0; }
      .text-gold { color: var(--gold); }
      .text-accent { color: var(--accent); }
      .text-dim { color: var(--text-lo); }
      .text-mid { color: var(--text-mid); }
    `),
    toast && h('div', { className: 'rpg-toast' }, toast),

    // ── Sidebar (desktop) ──────────────────────────────────
    h('aside', { className: 'rpg-sidebar' },
      h('div', { className: 'rpg-sidebar-logo' },
        h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 } },
          // RPGLife sword-and-circle logo — viewBox cropped to emblem only (no text area)
          h('svg', {
            width: '200', height: '200',
            viewBox: '140 55 400 415',
            xmlns: 'http://www.w3.org/2000/svg',
            style: { display: 'block' },
          },
            // Outer ring
            h('circle', { cx: '340', cy: '248', r: '168', fill: 'none', stroke: '#a78bfa', strokeWidth: '1.2', opacity: '0.35' }),
            h('circle', { cx: '340', cy: '248', r: '152', fill: 'none', stroke: '#a78bfa', strokeWidth: '0.6', opacity: '0.2' }),
            // Cardinal tick diamonds
            h('polygon', { points: '340,71 344,79 340,87 336,79', fill: 'none', stroke: '#a78bfa', strokeWidth: '1', opacity: '0.5' }),
            h('polygon', { points: '340,409 344,417 340,425 336,417', fill: 'none', stroke: '#a78bfa', strokeWidth: '1', opacity: '0.5' }),
            h('polygon', { points: '163,244 171,248 163,252 155,248', fill: 'none', stroke: '#a78bfa', strokeWidth: '1', opacity: '0.5' }),
            h('polygon', { points: '517,244 525,248 517,252 509,248', fill: 'none', stroke: '#a78bfa', strokeWidth: '1', opacity: '0.5' }),
            // Spark dots
            h('circle', { cx: '261', cy: '110', r: '2', fill: '#a78bfa', opacity: '0.35' }),
            h('circle', { cx: '419', cy: '110', r: '2', fill: '#a78bfa', opacity: '0.35' }),
            h('circle', { cx: '212', cy: '180', r: '1.5', fill: '#a78bfa', opacity: '0.22' }),
            h('circle', { cx: '468', cy: '180', r: '1.5', fill: '#a78bfa', opacity: '0.22' }),
            // Blade
            h('path', { d: 'M335,390 L333,250 L340,88 L347,250 L345,390 Z', fill: '#eceaf6', opacity: '0.92' }),
            h('path', { d: 'M340,88 L340,385', fill: 'none', stroke: '#9896b0', strokeWidth: '1.2', opacity: '0.5' }),
            h('path', { d: 'M333,390 L340,418 L347,390 Z', fill: '#c4c0d8' }),
            // Crossguard
            h('path', { d: 'M296,250 Q300,245 308,246 L332,248 L332,256 L308,258 Q300,259 296,254 Z', fill: '#eceaf6', opacity: '0.9' }),
            h('path', { d: 'M384,250 Q380,245 372,246 L348,248 L348,256 L372,258 Q380,259 384,254 Z', fill: '#eceaf6', opacity: '0.9' }),
            h('ellipse', { cx: '298', cy: '252', rx: '4', ry: '6', fill: '#c4c0d8' }),
            h('ellipse', { cx: '382', cy: '252', rx: '4', ry: '6', fill: '#c4c0d8' }),
            // Guard jewel
            h('polygon', { points: '340,240 348,252 340,264 332,252', fill: '#a78bfa' }),
            h('polygon', { points: '340,243 346,252 340,261 334,252', fill: '#c4b5fd', opacity: '0.5' }),
            h('polygon', { points: '340,229 346,236 340,243 334,236', fill: '#a78bfa', opacity: '0.7' }),
            // Grip
            h('rect', { x: '336', y: '152', width: '8', height: '82', fill: '#c4c0d8', rx: '2' }),
            h('line', { x1: '335', y1: '165', x2: '345', y2: '171', stroke: '#0d0d1a', strokeWidth: '1.5' }),
            h('line', { x1: '335', y1: '180', x2: '345', y2: '186', stroke: '#0d0d1a', strokeWidth: '1.5' }),
            h('line', { x1: '335', y1: '195', x2: '345', y2: '201', stroke: '#0d0d1a', strokeWidth: '1.5' }),
            h('line', { x1: '335', y1: '210', x2: '345', y2: '216', stroke: '#0d0d1a', strokeWidth: '1.5' }),
            h('line', { x1: '335', y1: '225', x2: '345', y2: '231', stroke: '#0d0d1a', strokeWidth: '1.5' }),
            // Pommel
            h('polygon', { points: '340,120 348,136 340,152 332,136', fill: '#eceaf6' }),
            h('polygon', { points: '340,124 345,136 340,148 335,136', fill: '#a78bfa' }),
            h('polygon', { points: '340,108 344,116 340,124 336,116', fill: '#a78bfa', opacity: '0.7' }),
            // Wordmark — only the sword+circle portion is used inline (no text, text shown below in DOM)
          ),
          h('div', { style: { textAlign: 'center', marginTop: 2 } },
            h('div', { className: 'rpg-sidebar-logo-title' }, 'RPGLife'),
            h('div', { className: 'rpg-sidebar-logo-sub' }, 'Live · Grow · Level Up')
          )
        )
      ),
      h('nav', { className: 'rpg-nav-list' },
        [
          { id: 'dashboard',  label: 'Adventure Log', icon: 'scroll'   },
          { id: 'activities', label: 'Activities',     icon: 'zap'      },
          { id: 'quests',     label: 'Quests',         icon: 'target'   },
          { id: 'character',  label: 'Character',      icon: 'shield'   },
          { id: 'rewards',    label: 'Rewards',        icon: 'gift'     },
          { id: 'settings',   label: 'Settings',       icon: 'settings' },
        ].map(tab =>
          h('button', {
            key: tab.id,
            className: `rpg-nav-item rpg-btn${activeTab === tab.id ? ' active' : ''}`,
            onClick: () => { setActiveTab(tab.id); SoundEngine.play('nav'); },
            'data-tutorial-id': `tab-${tab.id}`,
          },
            h('span', { className: 'nav-icon' }, h(Icon, { name: tab.icon, size: 18, color: activeTab === tab.id ? '#a78bfa' : '#9896b0' })),
            tab.label,
            tab.id === 'character' && state.newAchievementsSince && h('span', { style: { width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 6px #a78bfa', marginLeft: 'auto', flexShrink: 0 } })
          )
        )
      ),
      h('div', { className: 'rpg-sidebar-footer' },
        // Sync status
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: syncStatus === 'offline' ? '#9ca3af' : syncStatus === 'syncing' ? '#fbbf24' : '#5de8a0' } },
          h('div', { style: { width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 } }),
          syncStatus === 'offline'
            ? h('button', { className: 'rpg-btn', onClick: attemptResync, style: { color: '#9ca3af', fontSize: 11, textDecoration: 'underline' } }, 'Offline — tap to retry')
            : syncStatus === 'syncing' ? 'Syncing…' : 'Synced'
        ),
        // User + sign out
        h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
          h('div', { style: { fontSize: 11, color: '#4a4868', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 } }, user && user.email),
          h('button', { className: 'rpg-btn', onClick: onSignOut, style: { fontSize: 11, color: '#4a4868', flexShrink: 0, marginLeft: 8 } }, 'Sign out')
        ),
        // Tutorial/guide button — promoted to secondary button style
        h('button', {
          className: 'rpg-btn',
          onClick: () => setTutorialStep(0),
          'data-tutorial-id': 'help-btn',
          style: { ...styles.secondaryBtn, width: '100%', justifyContent: 'center', padding: '8px 0', fontSize: 11.5, gap: 6 },
        }, h(Icon, { name: 'helpCircle', size: 13, color: '#9896b0' }), 'Guide')
      )
    ),

    // ── Main content area ──────────────────────────────────
    h('div', { className: 'rpg-main' },
      // Top bar (contextual — shows HUD stats for current tab)
      h('div', { className: 'rpg-topbar' },
        h('div', { className: 'rpg-topbar-title' },
          { dashboard: 'RPGLife', activities: 'Activities', quests: 'Quests', character: 'Character', rewards: 'Rewards', settings: 'Settings' }[activeTab] || activeTab
        ),
        h('div', { className: 'rpg-topbar-chips' },
          // Pending bonuses bell
          (state.pendingBonuses || []).length > 0 && h('div', { style: { position: 'relative' } },
            h('button', {
              className: 'rpg-hud-chip rpg-btn',
              onClick: () => setBonusOpen && setBonusOpen(v => !v),
              title: 'Bonus earned',
            }, h(Icon, { name: 'coins', size: 13, color: '#fbbf24' }), (state.pendingBonuses || []).length)
          ),
          h('button', { className: 'rpg-hud-chip streak-chip rpg-btn', onClick: () => setStreakCalendar('consistency'), title: 'Consistency streak' },
            h(Icon, { name: 'flame', size: 17, color: '#fb923c' }), state.consistencyStreak
          ),
          h('button', { className: 'rpg-hud-chip power-chip rpg-btn', onClick: () => setStreakCalendar('power'), title: 'Power streak' },
            h(Icon, { name: 'star', size: 17, color: '#fbbf24' }), state.powerStreak
          ),
          h('button', { className: 'rpg-hud-chip gold-chip rpg-btn', onClick: () => setActiveTab('rewards'), title: 'Gold' },
            h(Icon, { name: 'coins', size: 17, color: '#c9a84c' }), state.gold
          ),
          // Power values — clickable, opens popup showing name + description
          (() => {
            const pv = (state.powerValues || []).filter(v => v && v.symbol);
            if (!pv.length) return null;
            return h('button', {
              className: 'rpg-hud-chip rpg-btn',
              onClick: () => setPvPopupOpen(true),
              style: { gap: 5, cursor: 'pointer' },
            },
              h('span', { style: { fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#4a4868' } }, 'P'),
              pv.map((v, i) => h('span', { key: i, title: v.name || '', style: { fontSize: 20 } }, v.symbol))
            );
          })()
        )
      ),

      h('main', { className: 'rpg-content', style: { animation: 'fadeIn 0.2s ease' } },
      activeTab === 'dashboard' && h(Dashboard, {
        state, domainProgress, domainComputed, today, todayLog,
        onLogClick: setLogModal, onBossClick: setBossModal, economy: state.economy,
        onCompleteChallenge: completeChallenge, onDismissChallenge: dismissChallenge,
        onSwitchDayMode: switchDayMode,
        onSetQuestActivities: setTodayQuestActivities,
        onToggleQuestComplete: toggleQuestActivityComplete,
        onSaveTemplate: saveMissionTemplate,
        onDeleteTemplate: deleteMissionTemplate,
        onSaveMissionNote: saveMissionNote,
        onDeleteLogEntry: deleteLogEntry,
        dismissedReminders,
        onDismissReminder: (domain) => setDismissedReminders(d => [...d, domain]),
      }),
      activeTab === 'activities' && h(ActivitiesView, {
        state,
        onLog: setLogModal,
        onEdit: (act) => { setEditingActivity(act); setShowActivityForm(true); },
        onDelete: deleteActivity,
        onAdd: () => { setEditingActivity(null); setShowActivityForm(true); },
        onToggleFavorite: toggleActivityFavorite,
      }),
      activeTab === 'quests' && h(QuestsView, { state, onAdd: () => { setEditingQuest(null); setShowQuestForm(true); }, onEdit: (q) => { setEditingQuest(q); setShowQuestForm(true); }, onUpdateProgress: updateQuestProgress, onToggleCheckpoint: toggleCheckpoint, onDelete: deleteQuest, onArchive: archiveQuest, onRestoreArchive: restoreQuestFromArchive, onSaveChain: saveQuestChain, onRemoveFromChain: removeQuestFromChain, isQuestUnlocked }),
      activeTab === 'character' && h(CharacterView, { state, domainComputed, onBossClick: setBossModal, onAddSubcat: addCustomSubcat, onEquipTitle: equipTitle, onClearAchievementDot: clearNewAchievementDot }),
      activeTab === 'rewards' && h(RewardsView, {
        state,
        onBuy: (r) => setBuyConfirm(r),
        onAdd: () => setShowRewardForm(true),
        onEdit: (r) => setShowRewardForm(r),
        onDelete: deleteReward,
        onUseTicket: useTicket,
        onSellTicket: sellTicket,
        onDeleteTicket: deleteTicket,
      }),
      activeTab === 'settings' && h(SettingsView, {
        state,
        onResetDomain: (k) => setResetPrompt(k),
        onResetAll: () => setResetPrompt('all'),
        onEditBoss: (domain, level) => setBossEditor({ domain, level }),
        onToggleGate: toggleBossGate,
        onSaveEconomy: saveEconomy,
        onSaveChallengeLibrary: saveChallengeLibrary,
        onSaveSpawnChance: saveSpawnChance,
        onSavePowerValues: savePowerValues,
        onSetDailyQuestLock: setDailyQuestLockEnabled,
        onOpenTutorial: () => setTutorialStep(0),
        onSetDifficulty: setDifficultyPreset,
        onSaveSoundSettings: saveSoundSettings,
        onSaveTheme: saveTheme,
      })
      ) // close rpg-content main
      , // mobile nav inside rpg-main
      h('nav', { className: 'rpg-mobile-nav' },
        h('div', { className: 'rpg-mobile-nav-inner' },
          [
            { id: 'dashboard',  label: 'Home',       icon: 'scroll'   },
            { id: 'activities', label: 'Activities',  icon: 'zap'      },
            { id: 'quests',     label: 'Quests',      icon: 'target'   },
            { id: 'character',  label: 'Character',   icon: 'shield'   },
            { id: 'rewards',    label: 'Rewards',     icon: 'gift'     },
            { id: 'settings',   label: 'Settings',    icon: 'settings' },
          ].map(tab =>
            h('button', {
              key: tab.id,
              className: `rpg-mobile-nav-item rpg-btn${activeTab === tab.id ? ' active' : ''}`,
              onClick: () => { setActiveTab(tab.id); SoundEngine.play('nav'); },
            },
              h(Icon, { name: tab.icon, size: 22, color: activeTab === tab.id ? '#a78bfa' : '#4a4868' }),
              tab.label
            )
          )
        )
      )
    ), // close rpg-main
    // ── Modals and overlays (outside layout) ──────────────
    h(FAB, { onClick: () => setShowQuickLog(true) }),
    buyConfirm && h(BuyConfirmModal, {
      reward: buyConfirm,
      canAfford: canAffordReward(buyConfirm, state),
      state,
      onConfirm: () => { buyTicket(buyConfirm); setBuyConfirm(null); },
      onCancel: () => setBuyConfirm(null),
    }),
    showQuickLog && h(QuickLogSheet, {
      activities: state.activities,
      onSelect: (act) => { setShowQuickLog(false); setLogModal(act); },
      onClose: () => setShowQuickLog(false),
    }),
    pvPopupOpen && h(PowerValuesPopup, {
      values: (state.powerValues || []).filter(v => v && v.symbol),
      onClose: () => setPvPopupOpen(false),
      onEdit: () => { setPvPopupOpen(false); setActiveTab('settings'); },
    }),
    streakCalendar && h(StreakCalendarModal, {
      mode: streakCalendar,
      dailyLogs: state.dailyLogs,
      activityLog: state.activityLog || [],
      dailyQuestPlans: state.dailyQuestPlans || {},
      economy: state.economy,
      onClose: () => setStreakCalendar(null),
    }),
    resetPrompt && h(ResetConfirmModal, {
      target: resetPrompt,
      onConfirm: () => { if (resetPrompt === 'all') resetAll(); else resetDomain(resetPrompt); },
      onCancel: () => setResetPrompt(null),
    }),
    bossEditor && h(BossEditorModal, {
      domain: bossEditor.domain,
      level: bossEditor.level,
      existing: (state.customBosses && state.customBosses[bossEditor.domain] && state.customBosses[bossEditor.domain][bossEditor.level]) || null,
      onSave: (challenges) => saveCustomBoss(bossEditor.domain, bossEditor.level, challenges),
      onClose: () => setBossEditor(null),
    }),
    logModal && h(LogActivityModal, {
      activity: logModal,
      onClose: () => setLogModal(null),
      onSubmit: (value) => { logActivity(logModal, value); setLogModal(null); },
    }),
    showActivityForm && h(ActivityFormModal, {
      activity: editingActivity,
      customSubcats: state.customSubcats,
      onClose: () => { setShowActivityForm(false); setEditingActivity(null); },
      onSave: saveActivity,
      onAddSubcat: addCustomSubcat,
    }),
    showQuestForm && h(QuestFormModal, {
      existingQuest: editingQuest,
      onClose: () => { setShowQuestForm(false); setEditingQuest(null); },
      onSave: (data) => { saveQuest(data); setEditingQuest(null); },
    }),
    showRewardForm && h(RewardFormModal, {
      reward: typeof showRewardForm === 'object' ? showRewardForm : null,
      state,
      onClose: () => setShowRewardForm(false),
      onSave: saveReward,
    }),
    bossModal && h(BossModal, {
      domainKey: bossModal.domain,
      level: bossModal.level,
      customBosses: state.customBosses,
      economy: state.economy,
      onClose: () => setBossModal(null),
      onComplete: (tier) => completeBoss(bossModal.domain, bossModal.level, tier),
    }),
    tutorialStep !== null && h(TutorialOverlay, {
      step: tutorialStep,
      onNext: (nextStep, tab) => {
        SoundEngine.play('tutorial');
        if (tab) setActiveTab(tab);
        setTutorialStep(nextStep);
      },
      onClose: () => setTutorialStep(null),
    }),
    achievementQueue.length > 0 && h(AchievementPopup, {
      achievement: achievementQueue[0],
      onClose: () => setAchievementQueue(q => q.slice(1)),
    })
  ); // close app div
}

// ==========================================================
// FEATURE REGISTRY
// ==========================================================
// Every feature in this app is registered here. Adding a new
// feature = adding one object to this array. The tutorial
// system reads this registry automatically — no other changes
// needed for the tutorial to include the new feature.
//
// Each entry:
//   id         — unique string identifier
//   category   — 'core' (shown in main walkthrough)
//              | 'advanced' (shown in the "More" section after core)
//   tab        — which tab to navigate to when this step is active
//   highlight  — data-tutorial-id value of the element to spotlight,
//                or null for a plain card with no spotlight
//   icon / color — for the step card visual
//   title / body — what to show the user
// ==========================================================
const FEATURE_REGISTRY = [

  // ══════════════════════════════════════════════════
  // CORE — the journey every beginner must take
  // ══════════════════════════════════════════════════

  {
    id: 'welcome',
    category: 'core',
    tab: 'dashboard',
    highlight: null,
    icon: 'sword', color: '#a78bfa',
    title: 'Welcome to RPGLife',
    body: 'This app turns your real life into an RPG. Every workout, study session, social call, or financial action earns XP — just like a game. You gain levels, defeat bosses, complete quests, and spend coins on real rewards. The goal: build a life you\'re proud of, one logged action at a time.',
  },

  {
    id: 'four-domains',
    category: 'core',
    tab: 'dashboard',
    highlight: null,
    icon: 'shield', color: '#60a5fa',
    title: 'Your 4 Domains (HRCF)',
    body: 'Your character has 4 domains: Health, Relationships, Career, and Finance. Everything you do belongs to one of them. Health = fitness, sleep, nutrition. Relationships = family, friends, social. Career = work, learning, skills. Finance = budgeting, investing, earning. Each domain has its own XP bar and level — neglect one and it falls behind.',
  },

  {
    id: 'activities-intro',
    category: 'core',
    tab: 'activities',
    highlight: 'tab-activities',
    icon: 'zap', color: '#fbbf24',
    title: 'Activities — your XP sources',
    body: 'Activities are the real-world actions you track. You create them once, then log them whenever you do them. Each activity belongs to a domain and has an XP value. Examples: "Morning Run → Health, 30 XP", "Read 30 min → Career, 15 XP", "Called Mum → Relationships, 20 XP".',
  },

  {
    id: 'activity-types',
    category: 'core',
    tab: 'activities',
    highlight: null,
    icon: 'zap', color: '#fbbf24',
    title: 'Activity Types: Fixed, Duration, Milestone',
    body: 'Fixed: always awards the same XP (e.g. "Meditation = 20 XP" every time). Duration: XP scales with time spent — the longer you go, the more you earn, following a curve you define. Milestone: a one-time event (e.g. "Finished a book = 100 XP"). You choose the type when creating an activity.',
  },

  {
    id: 'activity-tags',
    category: 'core',
    tab: 'activities',
    highlight: null,
    icon: 'zap', color: '#fbbf24',
    title: 'Tags, Favourites & Class Badges',
    body: 'Add tags to activities (e.g. "Fitness", "Creative", "Learning") to power the search filter and class mastery tracking. Mark any activity as a ★ Favourite — favourites always appear first in every list and in the Quick Log strip. The small emoji badge on each card shows which character class it feeds.',
  },

  {
    id: 'quick-log',
    category: 'core',
    tab: 'activities',
    highlight: 'quick-log-fab',
    icon: 'plus', color: '#a78bfa',
    title: 'Logging — the + button',
    body: 'Tap the purple + button (bottom right) from any tab to open the Quick Log. Select an activity, enter a value if it\'s a duration type, then confirm. XP instantly goes into your domain, the daily meter updates, and the log entry appears in today\'s activity feed. This is the action you\'ll use most every day.',
  },

  {
    id: 'daily-meters',
    category: 'core',
    tab: 'dashboard',
    highlight: 'tab-dashboard',
    icon: 'scroll', color: '#60a5fa',
    title: 'Daily Meters & Goals',
    body: 'The dashboard shows today\'s XP per domain as bar charts. Each bar has a daily goal (default 100 XP). The bars reset to 0 at midnight — but the XP still counts toward your level permanently. Think of the bar as "how much did I invest in this domain today", not a cap on earning.',
  },

  {
    id: 'consistency-streak',
    category: 'core',
    tab: 'dashboard',
    highlight: null,
    icon: 'flame', color: '#fb923c',
    title: 'Consistency Streak',
    body: 'Your Consistency Streak increases by 1 every day you hit the minimum XP threshold in ALL four domains (default: 50 XP each). Miss one domain — even by 1 XP — and you don\'t count that day. Miss a full day entirely and the streak resets to 0. It\'s the core habit loop: do something in every area of life, every day.',
  },

  {
    id: 'rest-tokens',
    category: 'core',
    tab: 'dashboard',
    highlight: null,
    icon: 'shield', color: '#34d399',
    title: 'Rest Day Tokens 🛡️',
    body: 'Every 7 consecutive days of hitting your streak, you earn a Rest Day Token. If you miss a day while holding a token, it\'s automatically consumed to protect your streak — no reset. Think of it as a shield earned through consistency. Tokens are shown on your dashboard when you have them.',
  },

  {
    id: 'power-streak',
    category: 'core',
    tab: 'dashboard',
    highlight: null,
    icon: 'star', color: '#fbbf24',
    title: 'Power Streak',
    body: 'After 15 consecutive consistency days, a Power Streak unlocks and begins climbing alongside your main streak. It earns bonus coins at milestones (every 10 power days by default). If you ever break your consistency streak, the power streak resets too — and you need another 15 days to reactivate it. Day 15 unlocks it; Day 16 is Power Streak day 1.',
  },

  {
    id: 'streak-warning',
    category: 'core',
    tab: 'dashboard',
    highlight: null,
    icon: 'flame', color: '#fb923c',
    title: 'Streak at Risk Warning',
    body: 'After 8 PM, if you haven\'t completed your day\'s requirements yet, an amber warning appears at the top of the dashboard. In Standard Mode it fires if any domain is below the minimum. In Daily Quest Mode it fires if your mission is below 100%. It vanishes the moment you\'ve met the day\'s target.',
  },

  {
    id: 'levels-and-xp',
    category: 'core',
    tab: 'character',
    highlight: 'tab-character',
    icon: 'shield', color: '#34d399',
    title: 'Levels, Ranks & Boss Gates',
    body: 'XP accumulates into levels for each domain. Levels are continuous — you never stop earning. Every 10 levels, a Boss Gate appears and locks your rank advancement until you defeat it. Gates are challenges you write for yourself (e.g. "Run 5km without stopping"). Defeat it and choose your tier: B (done), A (exceeded), S (exceptional) — higher tier = more coins.',
  },

  {
    id: 'boss-gate-detail',
    category: 'core',
    tab: 'character',
    highlight: null,
    icon: 'trophy', color: '#fbbf24',
    title: 'How Boss Gates Work',
    body: 'On the Character tab, each domain shows its active boss gates as pills. A glowing pill = gate available to challenge now. Gold = already defeated. Grey = not yet reached. Tap a glowing gate to open the challenge. Read what you set as the challenge, go do it in real life, then return and rate your performance. The rank unlock and coin reward fire immediately.',
  },

  {
    id: 'quests-intro',
    category: 'core',
    tab: 'quests',
    highlight: 'tab-quests',
    icon: 'target', color: '#818cf8',
    title: 'Quests — longer-term goals',
    body: 'Quests are goals with a deadline. Create one by naming it, choosing a domain, setting a deadline (in days), and an XP reward. Progress is tracked with a manual slider or automatic checkpoints. When progress hits 100%, the XP and coins are awarded and the quest moves to your archive. Quests are your campaigns.',
  },

  {
    id: 'quest-deadline-urgency',
    category: 'core',
    tab: 'quests',
    highlight: null,
    icon: 'target', color: '#818cf8',
    title: 'Quest Deadlines & Urgency',
    body: 'Quest cards color-code their deadline: grey means more than 7 days remain, amber means 7 days or fewer, and red with a pulsing border means the quest is overdue. Overdue quests don\'t auto-fail — they stay active until you either complete or delete them. You can also manually archive a quest using the → button.',
  },

  {
    id: 'rewards-intro',
    category: 'core',
    tab: 'rewards',
    highlight: 'tab-rewards',
    icon: 'gift', color: '#f472b6',
    title: 'Rewards — spend your coins',
    body: 'Create rewards with prices you set — a meal out, a game session, a purchase, a day off. When you can afford one, buy it to receive a Ticket. Tickets sit in your wallet until you\'re ready to redeem them. Sell a ticket back for 50% if you change your mind. The Rewards tab also shows your all-time coins earned so spending feels like victory, not loss.',
  },

  // ══════════════════════════════════════════════════
  // ADVANCED — powerful once you know the basics
  // ══════════════════════════════════════════════════

  {
    id: 'daily-quest-mode',
    category: 'advanced',
    tab: 'dashboard',
    highlight: null,
    icon: 'scroll', color: '#a78bfa',
    title: 'Daily Quest Mode',
    body: 'Switch the dashboard from HRCF meters to a mission checklist. Build today\'s mission by adding activities from your library. Checking off an activity immediately awards its XP to the relevant domain — whether or not you finish the full mission. At midnight, if you hit 100%, it counts as a consistency day (just like hitting domain minimums in Standard Mode). Drop below 100% and it doesn\'t count.',
  },

  {
    id: 'daily-quest-lock',
    category: 'advanced',
    tab: 'dashboard',
    highlight: null,
    icon: 'lock', color: '#fb923c',
    title: 'Mission Lock & Templates',
    body: 'Enable "Lock mission after first completion" in Settings to freeze your mission list the moment you check off the first activity — no adding or removing after you\'ve started. Save any mission as a Template (📋 button) so you can reload your "Morning Routine" or "Gym Day" in one tap the next time you want it.',
  },

  {
    id: 'quest-chains',
    category: 'advanced',
    tab: 'quests',
    highlight: null,
    icon: 'target', color: '#818cf8',
    title: 'Quest Chains',
    body: 'Link quests into a campaign where Quest 2 is locked until Quest 1 is completed. When Quest 1 archives, Quest 2 automatically unlocks with a "Chain continues" notification. Create a chain with the ⛓ New chain button, then edit it using the Edit button inside the chain header. Deleting the head quest automatically promotes the next one.',
  },

  {
    id: 'quest-archive',
    category: 'advanced',
    tab: 'quests',
    highlight: null,
    icon: 'trophy', color: '#fbbf24',
    title: 'Quest Archive & Restore',
    body: 'Completed quests move to the Archive instead of disappearing. Tap "Archive (N)" in the Quests tab to see them — each shows completion date, XP earned, and gold earned. You can restore an archived quest to active status if you want to redo it, but the XP and coins from the original completion will be reversed to prevent farming.',
  },

  {
    id: 'achievements',
    category: 'advanced',
    tab: 'character',
    highlight: null,
    icon: 'trophy', color: '#fbbf24',
    title: 'Achievements & Titles',
    body: 'Achievements unlock automatically as you hit milestones: first log, 100 activities, 30-day streak, 5 boss gates, and more. A purple dot appears on the Character tab when new ones unlock. Each achievement can unlock a cosmetic Title — equip one from the Identity section on the Character tab and it displays next to your name.',
  },

  {
    id: 'class-mastery',
    category: 'advanced',
    tab: 'character',
    highlight: null,
    icon: 'shield', color: '#a78bfa',
    title: 'Class Mastery',
    body: 'Five classes accumulate mastery in parallel with your activity logging: Warrior (Health XP), Scholar (Career XP), Guardian (Relationships XP), Treasurer (Finance XP), Creator (any activity tagged "Creative"). Mastery earns cosmetic badges at Bronze (500 XP), Silver (2000 XP), and Gold (5000 XP). No gameplay advantage — purely identity.',
  },

  {
    id: 'yearly-legacy',
    category: 'advanced',
    tab: 'character',
    highlight: null,
    icon: 'calendar', color: '#60a5fa',
    title: 'Yearly Legacy',
    body: 'The Identity section on your Character tab builds a yearly record: XP earned, coins earned, activities logged, quests completed, gates cleared, best streak, and top domain — all per calendar year. It updates in real time as you play. Years from now you\'ll be able to look back and see exactly who you were and what you achieved.',
  },

  {
    id: 'domain-balance',
    category: 'advanced',
    tab: 'dashboard',
    highlight: null,
    icon: 'scroll', color: '#60a5fa',
    title: 'HRCF Balance Indicator',
    body: 'The dashboard shows a 7-day bar chart comparing your XP across all four domains. A "Lopsided" score means one domain is being neglected — which matters because neglected domains level slower and their boss gates stay locked longer. The indicator is purely informational. No penalty, just a mirror.',
  },

  {
    id: 'power-values',
    category: 'advanced',
    tab: 'settings',
    highlight: null,
    icon: 'star', color: '#fbbf24',
    title: 'Power Values',
    body: 'In Settings, set 3 personal values — each gets a name and an emoji. Their symbols stay visible in the top bar at all times. Clicking the icons opens the Power Values editor directly. This is about anchoring your identity in the app: every time you open it, your core values are right there. Pick emojis that resonate deeply, not just look cool.',
  },

  {
    id: 'random-challenges',
    category: 'advanced',
    tab: 'settings',
    highlight: null,
    icon: 'zap', color: '#a78bfa',
    title: 'Random Challenges',
    body: 'Build a library of surprise side-challenges in Settings → Advanced → Random Challenges. Set a daily spawn chance (1%–50%). When one spawns on the dashboard, the reward is hidden until you complete it — a blind incentive for unplanned action. Set a tier (C/B/A/S) on each challenge in your library to scale the reward multiplier.',
  },

  {
    id: 'difficulty-and-advanced',
    category: 'advanced',
    tab: 'settings',
    highlight: null,
    icon: 'settings', color: '#9896b0',
    title: 'Difficulty & Advanced Settings',
    body: 'Settings has a Difficulty preset at the top: Relaxed (lower goals, more forgiving), Balanced (default), or Ambitious (harder targets, longer power streak lock). Advanced Settings unlock at combined rank 10 and give you full control: daily XP goals, consistency minimums, streak coin amounts, gate coin bases, tier multipliers, and challenge reward ranges.',
  },

  {
    id: 'calendar',
    category: 'advanced',
    tab: 'dashboard',
    highlight: null,
    icon: 'calendar', color: '#fb923c',
    title: 'Streak Calendar',
    body: 'Tap the 🔥 or ⭐ chips in the top bar to open your streak calendar. Green days = consistency met. Tap any day to see a breakdown: which domains you hit, how much XP each got, and every individual activity you logged that day with its XP. A permanent record of every active day.',
  },

];

const CORE_STEPS = FEATURE_REGISTRY.filter(f => f.category === 'core');
const ADVANCED_STEPS = FEATURE_REGISTRY.filter(f => f.category === 'advanced');
const ALL_STEPS = [...CORE_STEPS, ...ADVANCED_STEPS];

// ==========================================================
// TUTORIAL OVERLAY
// ==========================================================

function TutorialOverlay({ step, onNext, onClose }) {
  const feature = ALL_STEPS[step];
  const isLast = step >= ALL_STEPS.length - 1;
  const isLastCore = step === CORE_STEPS.length - 1;
  const isAdvanced = step >= CORE_STEPS.length;

  // Spotlight position state
  const [spotRect, setSpotRect] = useState(null);

  useEffect(() => {
    if (!feature || !feature.highlight) {
      setSpotRect(null);
      return;
    }
    function measureTarget() {
      const el = document.querySelector(`[data-tutorial-id="${feature.highlight}"]`);
      if (!el) { setSpotRect(null); return; }
      const r = el.getBoundingClientRect();
      setSpotRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }
    measureTarget();
    // Re-measure after a short delay to let tab switch render settle
    const t = setTimeout(measureTarget, 120);
    return () => clearTimeout(t);
  }, [step, feature && feature.highlight]);

  if (!feature) { onClose(); return null; }

  const PAD = 8; // spotlight padding around the element
  const CARD_WIDTH = 320;

  // Calculate the best position for the tooltip card:
  // prefer below the spotlight, fall back to above if too close to bottom
  function cardPosition() {
    const winH = window.innerHeight || 700;
    const winW = window.innerWidth || 400;
    const sidebarW = winW > 768 ? 220 : 0;
    const usableLeft = sidebarLeft + sidebarW + 8;
    const usableRight = winW - 8;
    const usableW = usableRight - usableLeft;

    if (!spotRect) {
      // No spotlight — centre the card in the usable area
      const left = usableLeft + Math.max(0, (usableW - CARD_WIDTH) / 2);
      return { position: 'fixed', top: Math.max(60, (winH - 280) / 2), left: Math.min(left, winW - CARD_WIDTH - 8) };
    }

    const PAD_EXTRA = 8;
    const cardH = 260; // conservative estimate
    const spotBottom = spotRect.top + spotRect.height + PAD + PAD_EXTRA;
    const spaceBelow = winH - spotBottom;
    let top;
    if (spaceBelow >= cardH + 16) {
      top = spotBottom + 8;
    } else {
      top = Math.max(8, spotRect.top - PAD - cardH - 8);
    }
    // Clamp top so it never goes below viewport
    top = Math.min(top, winH - cardH - 12);
    top = Math.max(8, top);

    const centreX = spotRect.left + spotRect.width / 2;
    const left = Math.max(usableLeft, Math.min(winW - CARD_WIDTH - 8, centreX - CARD_WIDTH / 2));
    return { position: 'fixed', top, left };
  }

  const sidebarLeft = 0; // used in cardPosition

  const progress = `${step + 1} / ${ALL_STEPS.length}`;

  return h('div', { style: { position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: 'none' } },
    // Dark overlay — full screen minus the spotlight cutout
    h('svg', {
      style: { position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'auto' },
      xmlns: 'http://www.w3.org/2000/svg',
      onClick: onClose,
    },
      h('defs', null,
        h('mask', { id: 'tutorial-mask' },
          h('rect', { x: 0, y: 0, width: '100%', height: '100%', fill: 'white' }),
          spotRect && h('rect', {
            x: spotRect.left - PAD,
            y: spotRect.top - PAD,
            width: spotRect.width + PAD * 2,
            height: spotRect.height + PAD * 2,
            rx: 10,
            fill: 'black',
          })
        )
      ),
      h('rect', {
        x: 0, y: 0, width: '100%', height: '100%',
        fill: 'rgba(0,0,0,0.72)',
        mask: 'url(#tutorial-mask)',
      })
    ),

    // Pulsing ring around the highlighted element
    spotRect && h('div', { style: {
      position: 'fixed',
      top: spotRect.top - PAD,
      left: spotRect.left - PAD,
      width: spotRect.width + PAD * 2,
      height: spotRect.height + PAD * 2,
      borderRadius: 10,
      border: '2px solid #a78bfa',
      animation: 'tutorialPulse 1.4s ease-in-out infinite',
      pointerEvents: 'none',
      zIndex: 1001,
    }}),

    // Tooltip card
    h('div', {
      style: {
        ...cardPosition(),
        width: CARD_WIDTH,
        background: '#1a1a2e',
        border: '1px solid rgba(167,139,250,0.4)',
        borderRadius: 14,
        padding: '18px 18px 14px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
        zIndex: 1002,
        pointerEvents: 'auto',
      },
      onClick: e => e.stopPropagation(),
    },
      // Category badge
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 } },
        h('div', { style: {
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
          color: isAdvanced ? '#fbbf24' : '#a78bfa',
          background: isAdvanced ? 'rgba(251,191,36,0.12)' : 'rgba(167,139,250,0.12)',
          border: `1px solid ${isAdvanced ? 'rgba(251,191,36,0.3)' : 'rgba(167,139,250,0.3)'}`,
          borderRadius: 6, padding: '3px 8px',
        }}, isAdvanced ? '★ Advanced' : '● Core'),
        h('div', { style: { fontSize: 11, color: '#7c7c8a' } }, progress)
      ),

      // Icon + title
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 } },
        h('div', { style: {
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          background: hexToRgba(feature.color, 0.15), border: `1px solid ${hexToRgba(feature.color, 0.35)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }},
          h(Icon, { name: feature.icon, size: 17, color: feature.color })
        ),
        h('div', { style: { fontSize: 14, fontWeight: 700, color: '#f4f1ea', lineHeight: 1.3 } }, feature.title)
      ),

      // Body text
      h('div', { style: { fontSize: 12.5, color: '#c4c4ce', lineHeight: 1.6, marginBottom: 14 } }, feature.body),

      // Navigation buttons
      h('div', { style: { display: 'flex', gap: 6 } },
        h('button', {
          className: 'rpg-btn',
          onClick: onClose,
          style: { flex: 1, padding: '8px 0', background: 'transparent', border: '1px solid #2a2a35', borderRadius: 8, color: '#7c7c8a', fontSize: 12, cursor: 'pointer' },
        }, 'Skip'),
        step > 0 && h('button', {
          className: 'rpg-btn',
          onClick: () => onNext(step - 1, ALL_STEPS[step - 1].tab),
          style: { flex: 1, padding: '8px 0', background: 'transparent', border: '1px solid #2a2a35', borderRadius: 8, color: '#9ca3af', fontSize: 12, cursor: 'pointer' },
        }, '← Back'),
        h('button', {
          className: 'rpg-btn',
          onClick: () => isLast ? onClose() : onNext(step + 1, ALL_STEPS[step + 1].tab),
          style: { flex: 2, padding: '8px 0', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.4)', borderRadius: 8, color: '#c4b5fd', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
        }, isLast ? 'Done ✓' : isLastCore ? 'See advanced →' : 'Next →')
      )
    )
  );
}

// ---------- Achievement Popup ----------

function AchievementPopup({ achievement, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [achievement.id]);

  return h('div', {
    style: {
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      zIndex: 2000, pointerEvents: 'auto', animation: 'toastSlide 0.35s ease',
    },
    onClick: onClose,
  },
    h('div', { style: {
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'linear-gradient(135deg, #1a1528, #0e0e14)',
      border: `1px solid ${hexToRgba(achievement.color || '#fbbf24', 0.5)}`,
      borderRadius: 14, padding: '14px 18px',
      boxShadow: `0 0 30px ${hexToRgba(achievement.color || '#fbbf24', 0.25)}, 0 8px 24px rgba(0,0,0,0.6)`,
      minWidth: 260, cursor: 'pointer',
    }},
      h('div', { style: {
        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
        background: hexToRgba(achievement.color || '#fbbf24', 0.15),
        border: `1.5px solid ${hexToRgba(achievement.color || '#fbbf24', 0.4)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
      }}, '🏆'),
      h('div', null,
        h('div', { style: { fontSize: 10.5, fontWeight: 700, color: achievement.color || '#fbbf24', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 } }, '★ Achievement unlocked'),
        h('div', { style: { fontSize: 14, fontWeight: 700, color: '#f4f1ea' } }, achievement.name),
        h('div', { style: { fontSize: 11.5, color: '#9ca3af', marginTop: 2 } }, achievement.desc)
      )
    )
  );
}

// ---------- Achievements Section (shown in Character tab) ----------

const ACHIEVEMENT_CATEGORIES = [
  { id: 'activity', label: 'Activity', ids: ['first_activity', 'first_log', 'log_10', 'log_50', 'log_100'] },
  { id: 'xp', label: 'XP', ids: ['xp_100', 'xp_1000', 'xp_10000'] },
  { id: 'streaks', label: 'Streaks', ids: ['streak_7', 'streak_30', 'streak_100'] },
  { id: 'bosses', label: 'Boss Gates', ids: ['first_boss', 'boss_5'] },
  { id: 'quests', label: 'Quests', ids: ['first_quest', 'quest_5', 'quest_10'] },
];

function AchievementsSection({ achievements }) {
  const unlocked = Object.keys(achievements || {}).length;
  const total = Object.keys(ACHIEVEMENTS).length;

  return h('div', null,
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 } },
      h(SectionLabel, { text: 'Achievements' }),
      h('span', { style: { fontSize: 12, color: '#9ca3af' } }, `${unlocked} / ${total} unlocked`)
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
      ACHIEVEMENT_CATEGORIES.map(cat =>
        h('div', { key: cat.id },
          h('div', { style: { fontSize: 11, fontWeight: 700, color: '#7c7c8a', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 } }, cat.label),
          h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
            cat.ids.map(id => {
              const def = ACHIEVEMENTS[id];
              if (!def) return null;
              const isUnlocked = !!(achievements && achievements[id]);
              const unlockedAt = isUnlocked && achievements[id].unlockedAt;
              return h('div', {
                key: id,
                title: isUnlocked ? `${def.desc}\nUnlocked ${new Date(unlockedAt).toLocaleDateString()}` : def.desc,
                style: {
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  padding: '10px 12px', borderRadius: 10, width: 88, textAlign: 'center',
                  background: isUnlocked ? hexToRgba(def.color, 0.1) : '#0e0e14',
                  border: `1px solid ${isUnlocked ? hexToRgba(def.color, 0.35) : '#2a2a35'}`,
                  opacity: isUnlocked ? 1 : 0.45,
                  transition: 'all 0.2s',
                },
              },
                h('div', { style: { fontSize: 22 } }, isUnlocked ? '🏆' : '🔒'),
                h('div', { style: { fontSize: 10.5, fontWeight: 600, color: isUnlocked ? def.color : '#7c7c8a', lineHeight: 1.3 } }, def.name)
              );
            })
          )
        )
      )
    )
  );
}

// ---------- Header ----------

function Header({ gold, consistencyStreak, powerStreak, user, onSignOut, syncStatus, onGoldClick, onStreakClick, pendingBonuses, onDismissBonus, onRetrySync, powerValues, onOpenTutorial }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bonusOpen, setBonusOpen] = useState(false);

  // Close menus on outside click
  useEffect(() => {
    if (!menuOpen && !bonusOpen) return;
    const handler = () => { setMenuOpen(false); setBonusOpen(false); };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [menuOpen, bonusOpen]);

  const syncDot = syncStatus === 'syncing'
    ? { color: '#fbbf24', label: 'Syncing…' }
    : syncStatus === 'offline'
      ? { color: '#9ca3af', label: 'Offline — tap to retry' }
      : { color: '#86efac', label: 'Synced' };

  const initial = (user && user.email ? user.email[0] : '?').toUpperCase();
  const hasBonuses = pendingBonuses && pendingBonuses.length > 0;

  return h('header', { style: styles.header },
    h('div', { style: styles.headerLeft },
      h('div', { style: styles.logoMark }, h(Icon, { name: 'sword', size: 20, color: '#a78bfa' })),
      h('div', null,
        h('div', { style: styles.title }, 'RPGLife'),
        syncStatus === 'offline'
          ? h('button', {
              className: 'rpg-btn',
              onClick: onRetrySync,
              style: { ...styles.subtitle, display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: '#9ca3af' },
            },
              h('span', { style: { width: 6, height: 6, borderRadius: '50%', background: syncDot.color, display: 'inline-block' } }),
              h('span', { style: { textDecoration: 'underline' } }, syncDot.label)
            )
          : h('div', { style: { ...styles.subtitle, display: 'flex', alignItems: 'center', gap: 6 } },
              h('span', { style: { width: 6, height: 6, borderRadius: '50%', background: syncDot.color, display: 'inline-block' }, title: syncDot.label }),
              h('span', null, syncDot.label)
            )
      )
    ),
    h('div', { style: styles.headerRight },
      // P Values — always visible if any symbols are set
      (() => {
        const pv = (powerValues || []).filter(v => v && v.symbol);
        if (pv.length === 0) return null;
        return h('div', { style: styles.pValuesChip },
          h('div', { style: styles.pValuesLabel }, 'P Values'),
          h('div', { style: styles.pValuesIcons },
            pv.map((v, i) => h('span', { key: i, title: v.name || '', style: { fontSize: 16 } }, v.symbol))
          )
        );
      })(),
      hasBonuses && h('div', { style: { position: 'relative' }, onClick: (e) => e.stopPropagation() },
        h('button', {
          className: 'rpg-btn',
          onClick: () => setBonusOpen(v => !v),
          style: styles.bonusBell,
          title: 'Streak bonus earned!',
        },
          h(Icon, { name: 'coins', size: 16, color: '#fbbf24' }),
          h('span', { style: styles.bonusBadge }, pendingBonuses.length)
        ),
        bonusOpen && h(BonusPopover, { bonuses: pendingBonuses, onDismiss: onDismissBonus })
      ),
      h('button', {
        className: 'rpg-btn',
        onClick: () => onStreakClick && onStreakClick('consistency'),
        style: { ...styles.streakChip, cursor: 'pointer' },
        title: 'View consistency streak calendar',
      },
        h(Icon, { name: 'flame', size: 15, color: '#fb923c' }),
        h('span', { style: styles.streakNum }, consistencyStreak),
        h('span', { style: styles.streakLabel }, 'day streak')
      ),
      h('button', {
        className: 'rpg-btn',
        onClick: () => onStreakClick && onStreakClick('power'),
        style: { ...styles.streakChip, cursor: 'pointer' },
        title: 'View power streak calendar',
      },
        h(Icon, { name: 'star', size: 15, color: '#fbbf24' }),
        h('span', { style: styles.streakNum }, powerStreak),
        h('span', { style: styles.streakLabel }, 'power streak')
      ),
      h('button', {
        className: 'rpg-btn',
        onClick: onGoldClick,
        style: { ...styles.goldChip, cursor: 'pointer' },
        title: 'Open rewards',
      },
        h(Icon, { name: 'coins', size: 15, color: '#fbbf24' }),
        h('span', { style: styles.streakNum }, gold)
      ),
      h('button', {
        className: 'rpg-btn',
        onClick: onOpenTutorial,
        style: { ...styles.accountBtn, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', color: '#c4b5fd', fontSize: 14, fontWeight: 700 },
        title: 'Help & tutorial',
        'data-tutorial-id': 'help-btn',
      }, '?'),
      h('div', { style: { position: 'relative' }, onClick: (e) => e.stopPropagation() },
        h('button', {
          className: 'rpg-btn',
          onClick: () => setMenuOpen(v => !v),
          style: styles.accountBtn,
          title: user && user.email,
        }, initial),
        menuOpen && h('div', { style: styles.accountMenu },
          h('div', { style: styles.accountMenuEmail }, user && user.email),
          h('button', { className: 'rpg-btn', style: styles.accountMenuItem, onClick: () => { setMenuOpen(false); onSignOut(); } },
            'Sign out'
          )
        )
      )
    )
  );
}

// ---------- Bonus notification popover ----------

function BonusPopover({ bonuses, onDismiss }) {
  return h('div', { style: styles.bonusPopover, onClick: (e) => e.stopPropagation() },
    h('div', { style: { fontSize: 12, fontWeight: 700, color: '#f4f1ea', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 } },
      h(Icon, { name: 'flame', size: 13, color: '#fb923c' }), ' Streak bonus!'
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
      bonuses.map(b => h(BonusRow, { key: b.id, bonus: b, onDismiss: () => onDismiss(b.id) }))
    )
  );
}

function BonusRow({ bonus, onDismiss }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf;
    const duration = 700;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(bonus.amount * t));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [bonus.amount]);

  return h('div', { style: styles.bonusRow },
    h('div', { style: { flex: 1 } },
      h('div', { style: { fontSize: 12.5, fontWeight: 600, color: '#e5e7eb' } }, bonus.label),
      h('div', { style: { fontSize: 11, color: '#7c7c8a', marginTop: 2 } }, 'Keep it up!')
    ),
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontWeight: 700, fontSize: 15 } },
      h(Icon, { name: 'coins', size: 14, color: '#fbbf24' }),
      h('span', null, `+${display}`)
    ),
    h('button', { className: 'rpg-btn', style: { ...styles.iconBtn, width: 24, height: 24, marginLeft: 4 }, onClick: onDismiss, title: 'Dismiss' },
      h(Icon, { name: 'x', size: 11 })
    )
  );
}

// ---------- Dashboard ----------

// ---------- Mode switch confirmation ----------

function ModeSwitchConfirmModal({ targetMode, onConfirm, onCancel }) {
  const targetLabel = targetMode === 'quest' ? 'Daily Quest Mode' : 'Standard Mode';
  return h(ModalShell, { title: 'Switch mode?', onClose: onCancel, width: 380 },
    h('div', { style: { fontSize: 13.5, color: '#d1d5db', marginBottom: 18, lineHeight: 1.5 } },
      `Switching to ${targetLabel} will reset today's progress in the current mode. Today's pending rewards in the current mode will be discarded. Historical data is not affected.`
    ),
    h('div', { style: { display: 'flex', gap: 8 } },
      h('button', { className: 'rpg-btn', style: { ...styles.secondaryBtn, flex: 1, justifyContent: 'center', padding: '10px 0' }, onClick: onCancel }, 'Cancel'),
      h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, flex: 1, justifyContent: 'center', padding: '10px 0' }, onClick: onConfirm }, 'Continue')
    )
  );
}

// ---------- Daily Quest Panel ----------

function DailyQuestPanel({ state, today, onSetActivities, onToggleComplete, onSaveTemplate, onDeleteTemplate, onSaveNote }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [saveTemplateType, setSaveTemplateType] = useState('routine');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const plan = (state.dailyQuestPlans && state.dailyQuestPlans[today]) || { activityIds: [], completedIds: [], locked: false };
  const noteText = plan.note || '';
  const templates = state.missionTemplates || [];
  const allActivities = state.activities || [];

  // Favourites appear first in picker
  const sortedActivities = [...allActivities].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return a.name.localeCompare(b.name);
  });

  const missionActivities = plan.activityIds.map(id => allActivities.find(a => a.id === id)).filter(Boolean);
  const availableToAdd = sortedActivities.filter(a => !plan.activityIds.includes(a.id));

  const total = missionActivities.length;
  const doneCount = plan.completedIds.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const isComplete = total > 0 && doneCount === total;

  const MISSION_TYPES = ['routine', 'fitness', 'work', 'learning', 'recovery', 'custom'];

  function addActivity(id) { onSetActivities([...plan.activityIds, id]); }
  function removeActivity(id) { onSetActivities(plan.activityIds.filter(x => x !== id)); }

  function applyTemplate(tmpl) {
    onSetActivities(tmpl.activityIds.filter(id => allActivities.some(a => a.id === id)));
    setTemplatePickerOpen(false);
  }

  function handleSaveTemplate() {
    if (!saveTemplateName.trim()) return;
    onSaveTemplate(saveTemplateName.trim(), saveTemplateType, plan.activityIds);
    setSaveTemplateName('');
    setShowSaveTemplate(false);
  }

  return h('div', { style: styles.questPanelCard },
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 } },
      h('div', null,
        h('div', { style: { fontSize: 15, fontWeight: 700, color: '#f4f1ea' } }, "Today's mission"),
        h('div', { style: { fontSize: 12, color: '#9ca3af', marginTop: 2 } },
          total === 0 ? 'Add activities to build today\'s mission' : `${doneCount} of ${total} complete`
        )
      ),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        // Notes button — 📝 with dot indicator if note exists
        h('button', {
          className: 'rpg-btn',
          onClick: () => setNoteOpen(o => !o),
          title: 'Mission notes',
          style: { ...styles.iconBtn, position: 'relative', background: noteOpen ? 'rgba(167,139,250,0.15)' : undefined, borderColor: noteOpen ? '#a78bfa' : undefined },
        },
          h(Icon, { name: 'scroll', size: 13, color: noteOpen ? '#a78bfa' : '#9896b0' }),
          noteText && h('span', { style: { position: 'absolute', top: -3, right: -3, width: 7, height: 7, borderRadius: '50%', background: '#a78bfa' } })
        ),
        h('div', { style: { textAlign: 'right' } },
          h('div', { style: { fontSize: 22, fontWeight: 800, color: isComplete ? '#fbbf24' : '#a78bfa' } }, `${pct}%`),
          isComplete && h('div', { style: { fontSize: 10.5, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: 0.5 } }, 'Pending validation')
        )
      )
    ),

    h('div', { style: { ...styles.meterTrack, height: 10, marginBottom: noteOpen ? 12 : 16 } },
      h('div', { style: { ...styles.meterFill, width: `${pct}%`, background: isComplete ? '#fbbf24' : '#a78bfa' } })
    ),

    // Inline note editor — stays open until dismissed
    noteOpen && h('div', { style: { marginBottom: 14 } },
      h('textarea', {
        value: noteText,
        onChange: e => onSaveNote && onSaveNote(e.target.value),
        placeholder: 'Notes for today\'s mission — intentions, how you feel, what you want to focus on…',
        style: { ...styles.input, minHeight: 72, resize: 'vertical', fontSize: 12.5, lineHeight: 1.5 },
        autoFocus: true,
      })
    ),

    // Template actions row
    h('div', { style: { display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' } },
      templates.length > 0 && h('div', { style: { position: 'relative' } },
        h('button', { className: 'rpg-btn', style: { ...styles.secondaryBtn, fontSize: 12, padding: '6px 10px' }, onClick: () => setTemplatePickerOpen(v => !v) },
          '📋 Use template'
        ),
        templatePickerOpen && h('div', { style: { position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: 260, zIndex: 50, background: C.panel, border: '1px solid ' + C.borderMid, borderRadius: 4, maxHeight: 240, overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' } },
          h('div', { style: { fontSize: 10, color: C.textLo, padding: '8px 12px 4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 } }, 'Mission templates'),
          templates.map(tmpl => h('div', { key: tmpl.id, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid ' + C.borderDim } },
            h('button', { className: 'rpg-btn', onClick: () => applyTemplate(tmpl), style: { flex: 1, background: 'transparent', border: 'none', textAlign: 'left', color: C.textHi, fontSize: 13, cursor: 'pointer', padding: 0 } },
              h('div', { style: { fontWeight: 600 } }, tmpl.name),
              h('div', { style: { fontSize: 10, color: C.textMid, marginTop: 2 } }, `${tmpl.activityIds.length} activities · ${tmpl.type}`)
            ),
            h('button', { className: 'rpg-btn', style: styles.iconBtnDanger, onClick: () => { onDeleteTemplate(tmpl.id); if (templates.length <= 1) setTemplatePickerOpen(false); } }, h(Icon, { name: 'x', size: 11 }))
          ))
        )
      ),
      total > 0 && !plan.locked && h('button', { className: 'rpg-btn', style: { ...styles.secondaryBtn, fontSize: 12, padding: '6px 10px' }, onClick: () => setShowSaveTemplate(v => !v) },
        '💾 Save as template'
      )
    ),

    // Save template form
    showSaveTemplate && h('div', { style: { background: '#0e0e14', borderRadius: 8, padding: '10px 12px', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 } },
      h('input', { value: saveTemplateName, onChange: e => setSaveTemplateName(e.target.value), placeholder: 'Template name (e.g. Morning Routine)', style: styles.input }),
      h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
        MISSION_TYPES.map(t => h('button', { key: t, className: 'rpg-btn', onClick: () => setSaveTemplateType(t),
          style: { ...styles.filterChip, ...(saveTemplateType === t ? { background: 'rgba(167,139,250,0.18)', borderColor: '#a78bfa', color: '#c4b5fd' } : {}) }
        }, t))
      ),
      h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, justifyContent: 'center' }, onClick: handleSaveTemplate }, 'Save template')
    ),

    total === 0
      ? h('div', { style: { fontSize: 12.5, color: '#7c7c8a', marginBottom: 14, textAlign: 'center', padding: '12px 0' } },
          'No activities selected yet for today\'s mission.'
        )
      : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 } },
          missionActivities.map(act => {
            const d = DOMAINS[act.domain];
            const isDone = plan.completedIds.includes(act.id);
            return h('div', { key: act.id, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#0e0e14', borderRadius: 8 } },
              h('button', {
                className: 'rpg-btn',
                onClick: () => onToggleComplete(act.id),
                style: { width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `2px solid ${isDone ? d.color : '#3a3a4a'}`, background: isDone ? hexToRgba(d.color, 0.2) : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
              }, isDone && h(Icon, { name: 'check', size: 13, color: d.color })),
              h(Icon, { name: d.icon, size: 13, color: d.color }),
              h('span', { style: { flex: 1, fontSize: 13, color: isDone ? '#7c7c8a' : '#e5e7eb', textDecoration: isDone ? 'line-through' : 'none' } }, act.name),
              act.favorite && h('span', { style: { color: '#fbbf24', fontSize: 12 } }, '★'),
              !plan.locked && h('button', { className: 'rpg-btn', style: styles.iconBtnDanger, onClick: () => removeActivity(act.id) }, h(Icon, { name: 'x', size: 11 }))
            );
          })
        ),

    plan.locked && h('div', { style: { fontSize: 11.5, color: '#fbbf24', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 } },
      h(Icon, { name: 'lock', size: 12, color: '#fbbf24' }), 'Mission locked'
    ),

    !plan.locked && h('div', { style: { position: 'relative' } },
      h('button', { className: 'rpg-btn', onClick: () => setPickerOpen(v => !v), style: { ...styles.secondaryBtn, width: '100%', justifyContent: 'center', padding: '9px 0' } },
        h(Icon, { name: 'plus', size: 14 }), ' Add activity to mission'),
      pickerOpen && h('div', { style: styles.questPickerDropdown },
        availableToAdd.length === 0
          ? h('div', { style: { fontSize: 12, color: '#7c7c8a', padding: '10px 12px' } }, 'All activities are in today\'s mission.')
          : availableToAdd.map(act => {
              const d = DOMAINS[act.domain];
              return h('button', {
                key: act.id, className: 'rpg-btn',
                onClick: () => { addActivity(act.id); setPickerOpen(false); },
                style: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#e5e7eb', fontSize: 13 },
              }, h(Icon, { name: d.icon, size: 13, color: d.color }), act.name, act.favorite && h('span', { style: { color: '#fbbf24', fontSize: 12, marginLeft: 4 } }, '★'));
            })
      )
    )
  );
}

function Dashboard({ state, domainProgress, domainComputed, today, todayLog, onLogClick, onBossClick, economy, onCompleteChallenge, onDismissChallenge, onSwitchDayMode, onSetQuestActivities, onToggleQuestComplete, onSaveTemplate, onDeleteTemplate, onSaveMissionNote, onDeleteLogEntry, dismissedReminders, onDismissReminder }) {
  const dailyGoal = eco({ economy }, 'dailyGoal');
  const consistencyMin = eco({ economy }, 'consistencyMin');
  const dayMode = state.dayMode || 'standard';
  const [switchConfirm, setSwitchConfirm] = useState(null);
  const [dayCompleteShown, setDayCompleteShown] = useState(false);

  // #2 Day complete detection
  const allDomainsComplete = DOMAIN_KEYS.every(k => (todayLog[k] || 0) >= dailyGoal);
  // Show day complete flash once per session when all domains hit goal
  const [dayCompleteCelebrated, setDayCompleteCelebrated] = useState(false);
  useEffect(() => {
    if (allDomainsComplete && !dayCompleteCelebrated) {
      setDayCompleteCelebrated(true);
      setDayCompleteShown(true);
      SoundEngine.play('dayComplete');
      setTimeout(() => setDayCompleteShown(false), 3000);
    }
  }, [allDomainsComplete]);

  // #3 Streak-at-risk: hour >= 20 and day not yet "done"
  // In Standard mode: done = all domains hit consistency minimum
  // In Quest mode: done = mission completion is 100% (pending validation)
  // The warning disappears the moment the threshold is reached and reappears
  // if the user adds a new activity (dropping pct below 100%) or unchecks one.
  const currentHour = new Date().getHours();
  const todayPlan = (state.dailyQuestPlans && state.dailyQuestPlans[today]) || { activityIds: [], completedIds: [] };
  const questPct = todayPlan.activityIds.length > 0
    ? Math.round((todayPlan.completedIds.length / todayPlan.activityIds.length) * 100)
    : 0;
  const dayDoneForStreak = dayMode === 'quest'
    ? questPct >= 100
    : DOMAIN_KEYS.every(k => (todayLog[k] || 0) >= consistencyMin);
  const streakAtRisk = state.consistencyStreak > 0 && currentHour >= 20 && !dayDoneForStreak;

  const streakRiskSoundedRef = React.useRef(false);
  useEffect(() => {
    if (streakAtRisk && !streakRiskSoundedRef.current) {
      streakRiskSoundedRef.current = true;
      SoundEngine.play('streakRisk');
    }
    if (!streakAtRisk) streakRiskSoundedRef.current = false;
  }, [streakAtRisk]);

  function requestModeSwitch(target) {
    if (target === dayMode) return;
    setSwitchConfirm(target);
  }
  function confirmModeSwitch() {
    onSwitchDayMode(switchConfirm);
    setSwitchConfirm(null);
  }

  const availableBosses = [];
  DOMAIN_KEYS.forEach(k => {
    const comp = domainComputed[k];
    const gates = activeBossLevelsFor(state, k);
    gates.forEach(bl => {
      const key = `${k}-${bl}`;
      if (comp.potentialRank > bl && comp.rank <= bl && !state.bossCompletions[key]) {
        availableBosses.push({ domain: k, level: bl });
      }
    });
  });

  const activeQuests = state.quests.filter(q => q.progress < 100);

  // #5 Today's activity log — last 8 logs from today
  const todayActLog = (state.activityLog || []).filter(l => {
    const d = new Date(l.timestamp);
    return dateKey(d) === today;
  }).slice(0, 8);

  // #1 First-session "Start here" banner
  const hasActivities = (state.activities || []).length > 0;
  const hasQuests = (state.quests || []).length > 0;
  const hasLoggedOnce = (state.activityLog || []).length > 0;
  const showStartBanner = !hasActivities && !hasLoggedOnce;

  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.3s ease' } },

    // #2 Day complete celebration flash
    dayCompleteShown && h('div', { style: { padding: '14px 18px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.5)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeIn 0.3s ease' } },
      h('span', { style: { fontSize: 20 } }, '✦'),
      h('div', null,
        h('div', { style: { fontSize: 13, fontWeight: 700, color: '#c4b5fd' } }, 'Day complete — all domains cleared'),
        h('div', { style: { fontSize: 11.5, color: '#9896b0', marginTop: 1 } }, `Consistency streak: ${state.consistencyStreak} day${state.consistencyStreak !== 1 ? 's' : ''}`)
      )
    ),

    // #3 Streak-at-risk warning
    streakAtRisk && h('div', { style: { padding: '10px 14px', background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8 } },
      h(Icon, { name: 'flame', size: 14, color: '#fb923c' }),
      h('span', { style: { fontSize: 12.5, color: '#fb923c' } }, `Streak at risk — hit your minimums before midnight to protect your ${state.consistencyStreak}-day streak`)
    ),

    // #1 Start here banner for new users
    showStartBanner && h('div', { style: { padding: '16px 18px', background: 'rgba(167,139,250,0.07)', border: '1px dashed rgba(167,139,250,0.3)', borderRadius: 4 } },
      h('div', { style: { fontSize: 13, fontWeight: 700, color: '#c4b5fd', marginBottom: 10 } }, 'Where to begin'),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
        h('div', { style: { fontSize: 12, color: '#9896b0' } }, '① Create activities in the Activities tab — these are the things you do daily that earn XP'),
        h('div', { style: { fontSize: 12, color: '#9896b0' } }, '② Log an activity using the + button — XP flows into your domain meters above'),
        h('div', { style: { fontSize: 12, color: '#9896b0' } }, '③ Set a quest in the Quests tab — a longer-term goal with a deadline and reward'),
      )
    ),

    h('section', null,
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 } },
        h(SectionLabel, { text: "Today's progress" }),
        h('div', { style: styles.modeToggle },
          h('button', {
            className: 'rpg-btn',
            onClick: () => requestModeSwitch('standard'),
            style: { ...styles.modeToggleBtn, ...(dayMode === 'standard' ? styles.modeToggleBtnActive : {}) },
          }, 'Standard'),
          h('button', {
            className: 'rpg-btn',
            onClick: () => requestModeSwitch('quest'),
            style: { ...styles.modeToggleBtn, ...(dayMode === 'quest' ? styles.modeToggleBtnActive : {}) },
          }, 'Daily Quest')
        )
      ),

      switchConfirm && h(ModeSwitchConfirmModal, {
        targetMode: switchConfirm,
        onConfirm: confirmModeSwitch,
        onCancel: () => setSwitchConfirm(null),
      }),

      dayMode === 'quest'
        ? h(DailyQuestPanel, {
            state, today,
            onSetActivities: onSetQuestActivities,
            onToggleComplete: onToggleQuestComplete,
            onSaveTemplate,
            onDeleteTemplate,
            onSaveNote: onSaveMissionNote,
          })
        : h('div', { style: styles.bigMetersGrid },
        DOMAIN_KEYS.map(k => {
          const d = DOMAINS[k];
          const earned = todayLog[k] || 0;
          const pct = Math.round((earned / dailyGoal) * 100);
          const overflow = Math.max(0, earned - dailyGoal);
          const isOverflow = overflow > 0;
          return h('div', { key: k, style: styles.bigMeterCard },
            h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 } },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                h('div', { style: { ...styles.bigMeterIcon, background: hexToRgba(d.color, 0.14) } }, h(Icon, { name: d.icon, size: 20, color: d.color })),
                h('div', null,
                  h('div', { style: styles.bigMeterName }, d.name),
                  h('div', { style: styles.bigMeterSubName },
                    earned >= consistencyMin
                      ? h('span', { style: { color: '#86efac' } }, isOverflow ? 'Overachieving today' : 'Minimum met')
                      : h('span', null, `${consistencyMin - earned} XP to minimum`)
                  )
                )
              ),
              h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 6 } },
                h('span', { style: { ...styles.bigMeterValue, color: d.color } }, earned),
                h('span', { style: { fontSize: 13, color: '#7c7c8a', fontWeight: 600 } }, `/ ${dailyGoal}`),
                isOverflow && h('span', { style: { ...styles.overflowBadge, color: d.color, borderColor: hexToRgba(d.color, 0.45), background: hexToRgba(d.color, 0.12), marginLeft: 4 } }, `+${overflow}`)
              )
            ),
            h('div', { style: { ...styles.meterTrack, height: 10, boxShadow: isOverflow ? `0 0 0 1px ${hexToRgba(d.color, 0.5)}, 0 0 14px ${hexToRgba(d.color, 0.4)}` : 'none', transition: 'box-shadow 0.4s ease' } },
              h('div', { style: { ...styles.meterFill, width: `${Math.min(pct,100)}%`, background: d.color, animation: 'barFill 0.6s ease-out' } }),
              h('div', { style: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.15)' } })
            )
          );
        })
      )
    ),

    availableBosses.length > 0 && h('section', null,
      h(SectionLabel, { text: 'Boss battles available', icon: 'trophy', accent: '#fbbf24' }),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        availableBosses.map(b =>
          h('div', { key: `${b.domain}-${b.level}`, style: styles.bossRow, onClick: () => onBossClick(b) },
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
              h('div', { style: { ...styles.bossIcon, background: DOMAINS[b.domain].dark900, borderColor: DOMAINS[b.domain].dark600 } },
                h(Icon, { name: 'trophy', size: 14, color: '#fbbf24' })
              ),
              h('div', null,
                h('div', { style: styles.bossTitle }, `${DOMAINS[b.domain].name} — Level ${b.level} gate`),
                h('div', { style: styles.bossSub }, `Defeat to unlock rank ${b.level} and beyond`)
              )
            ),
            h(Icon, { name: 'chevronRight', size: 16, color: '#6b7280' })
          )
        )
      )
    ),

    // Active random challenge (#10)
    state.activeChallenge && h(ActiveChallengeCard, {
      challenge: state.activeChallenge,
      onComplete: onCompleteChallenge,
      onDismiss: onDismissChallenge,
    }),

    activeQuests.length > 0 && h('section', null,
      h(SectionLabel, { text: 'Active quests' }),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        activeQuests.slice(0,3).map(q => {
          const chain = (state.questChains || []).find(c => c.questIds.includes(q.id));
          const chainPos = chain ? chain.questIds.indexOf(q.id) + 1 : null;
          return h('div', { key: q.id },
            chain && h('div', { style: { fontSize: 10, color: '#a78bfa', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 } },
              '⛓', `${chain.name} — step ${chainPos} of ${chain.questIds.length}`
            ),
            h(QuestRow, { quest: q, compact: true })
          );
        })
      )
    ),

    h(NeglectedDomainsReminder, { state, economy, dismissedReminders: dismissedReminders || [], onDismiss: onDismissReminder }),
    h(DomainBalanceIndicator, { state, economy }),

    // #6 Power Streak visibility — show when active
    state.powerStreak > 0 && h('div', { style: { padding: '12px 16px', background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        h(Icon, { name: 'star', size: 15, color: '#c9a84c' }),
        h('div', null,
          h('div', { style: { fontSize: 12.5, fontWeight: 700, color: '#c9a84c' } }, `Power Streak active — day ${state.powerStreak}`),
          h('div', { style: { fontSize: 11, color: '#7c6a3a' } },
            eco({ economy }, 'powerStreakCoinsEvery') - (state.powerStreak % eco({ economy }, 'powerStreakCoinsEvery')) > 0
              ? `${eco({ economy }, 'powerStreakCoinsEvery') - (state.powerStreak % eco({ economy }, 'powerStreakCoinsEvery'))} days to next bonus`
              : 'Milestone reached!'
          )
        )
      ),
      h('div', { style: { fontSize: 22, fontWeight: 800, color: '#c9a84c' } }, state.powerStreak)
    ),

    // #19 Rest day tokens display
    state.restDayTokens > 0 && h('div', { style: { fontSize: 11.5, color: '#7c7c8a', display: 'flex', alignItems: 'center', gap: 5 } },
      h('span', null, '🛡️'),
      `${state.restDayTokens} rest day token${state.restDayTokens !== 1 ? 's' : ''} — miss a day without losing your streak`
    ),

    h('section', null,
      h(SectionLabel, { text: 'Today\'s activity' }),
      todayActLog.length === 0
        ? h(EmptyState, { text: 'Nothing logged yet today. Tap + to log your first activity.' })
        : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
            todayActLog.map(log => {
              const d = DOMAINS[log.domain];
              return h('div', { key: log.id, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: '#12121f', borderRadius: 4 } },
                h('div', { style: { width: 4, height: 4, borderRadius: '50%', background: d.color, flexShrink: 0 } }),
                h('span', { style: { flex: 1, fontSize: 12.5, color: '#eceaf6' } }, log.activityName),
                log.detail && h('span', { style: { fontSize: 11, color: '#4a4868' } }, log.detail),
                h('span', { style: { fontSize: 12, fontWeight: 700, color: d.color } }, `+${log.xp}`),
                onDeleteLogEntry && h('button', {
                  className: 'rpg-btn',
                  onClick: () => onDeleteLogEntry(log.id),
                  title: 'Remove this log entry and reverse its XP',
                  style: { width: 22, height: 22, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#3a3850', cursor: 'pointer', flexShrink: 0, transition: 'color 0.15s' },
                  onMouseEnter: e => e.currentTarget.style.color = '#e05c5c',
                  onMouseLeave: e => e.currentTarget.style.color = '#3a3850',
                }, h(Icon, { name: 'x', size: 11 }))
              );
            })
          )
    )
  );
}

// ---------- Section Label ----------

function SectionLabel({ text, icon, accent }) {
  return h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 } },
    icon && h(Icon, { name: icon, size: 12, color: accent || '#4a4868' }),
    h('span', { style: { fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: accent || '#4a4868' } }, text),
    h('div', { style: { flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent)', marginLeft: 4 } })
  );
}

function EmptyState({ text }) {
  return h('div', { style: { padding: '32px 20px', textAlign: 'center', color: '#4a4868', fontSize: 12, letterSpacing: 0.3, border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 4 } }, text);
}

// ---------- Activities View ----------

function ActivitiesView({ state, onLog, onEdit, onDelete, onAdd, onToggleFavorite }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const allActivities = state.activities || [];

  // #9 Most-logged activities for quick access
  const logCounts = {};
  (state.activityLog || []).forEach(l => { logCounts[l.activityName] = (logCounts[l.activityName] || 0) + 1; });
  const recentIds = new Set((state.activityLog || []).slice(0, 10).map(l =>
    allActivities.find(a => a.name === l.activityName)?.id).filter(Boolean));
  const quickLog = allActivities
    .filter(a => a.favorite || recentIds.has(a.id))
    .sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0))
    .slice(0, 4);

  // Sort: favorites first, then alphabetical
  const sorted = [...allActivities].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return a.name.localeCompare(b.name);
  });

  const filtered = sorted.filter(a => {
    if (filter !== 'all' && a.domain !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      (a.subcat || '').toLowerCase().includes(q) ||
      (a.desc || '').toLowerCase().includes(q) ||
      (a.tags || []).some(t => t.toLowerCase().includes(q))
    );
  });

  return h('div', { style: { animation: 'fadeIn 0.3s ease' } },

    // Quick log strip — favorites + recently logged, one tap
    quickLog.length > 0 && h('div', { style: { marginBottom: 16 } },
      h(SectionLabel, { text: 'Quick log' }),
      h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
        quickLog.map(act => {
          const d = DOMAINS[act.domain];
          return h('button', {
            key: act.id, className: 'rpg-btn',
            onClick: () => onLog(act),
            style: { display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', background: '#12121f', border: `1px solid ${hexToRgba(d.color, 0.3)}`, borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s' },
          },
            h('div', { style: { width: 5, height: 5, borderRadius: '50%', background: d.color, flexShrink: 0 } }),
            h('span', { style: { fontSize: 12.5, fontWeight: 600, color: '#eceaf6' } }, act.name),
            act.favorite && h('span', { style: { color: '#c9a84c', fontSize: 11 } }, '★')
          );
        })
      )
    ),
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 } },
      h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
        h(FilterChip, { label: 'All', active: filter==='all', onClick: () => setFilter('all') }),
        DOMAIN_KEYS.map(k => h(FilterChip, { key: k, label: DOMAINS[k].name, active: filter===k, onClick: () => setFilter(k), color: DOMAINS[k].color }))
      ),
      h('button', { className: 'rpg-btn', style: styles.primaryBtn, onClick: onAdd },
        h(Icon, { name: 'plus', size: 14 }), ' New activity'
      )
    ),
    h('input', {
      value: search,
      onChange: e => setSearch(e.target.value),
      placeholder: 'Search by name, category, tag, or description…',
      style: { ...styles.input, marginBottom: 10 },
    }),
    filtered.length === 0
      ? h(EmptyState, { text: search ? `No activities match "${search}"` : 'No activities in this domain yet. Create one to start tracking.' })
      : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          filtered.map(act => {
            const d = DOMAINS[act.domain];
            return h('div', { key: act.id, style: styles.activityCard },
              h('div', { style: { ...styles.quickLogDot, background: d.color } }),
              h('div', { style: { flex: 1, minWidth: 0 } },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                  h('span', { style: styles.activityCardName }, act.name),
                  act.favorite && h('span', { title: 'Favourite', style: { color: '#fbbf24', fontSize: 13 } }, '★'),
                  // #12 Class badge — shows which class this activity feeds
                  (() => {
                    const cls = CLASS_DEFINITIONS.find(c =>
                      c.domain === act.domain ||
                      (c.id === 'creator' && (act.tags || []).some(t => t.toLowerCase() === 'creative' || t.toLowerCase() === 'creativity'))
                    );
                    return cls ? h('span', { title: `${cls.name} class`, style: { fontSize: 12, opacity: 0.7 } }, cls.badge) : null;
                  })()
                ),
                h('div', { style: styles.activityCardMeta }, `${d.name} · ${act.subcat} · ${scoringLabel(act)}`),
                act.desc && h('div', { style: styles.activityCardDesc }, act.desc),
                (act.tags || []).length > 0 && h('div', { style: { display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 } },
                  (act.tags || []).map((tag, i) =>
                    h('span', { key: i, style: { fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 5, background: hexToRgba(d.color, 0.12), color: d.color, border: `1px solid ${hexToRgba(d.color, 0.3)}` } }, tag)
                  )
                )
              ),
              h('div', { style: { display: 'flex', gap: 6, flexShrink: 0 } },
                h('button', {
                  className: 'rpg-btn',
                  style: { ...styles.iconBtn, color: act.favorite ? '#fbbf24' : '#7c7c8a' },
                  onClick: () => onToggleFavorite(act.id),
                  title: act.favorite ? 'Remove from favourites' : 'Mark as favourite',
                }, '★'),
                h('button', { className: 'rpg-btn', style: styles.iconBtn, onClick: () => onLog(act), title: 'Log activity' }, h(Icon, { name: 'plus', size: 14 })),
                h('button', { className: 'rpg-btn', style: styles.iconBtn, onClick: () => onEdit(act), title: 'Edit' }, h(Icon, { name: 'edit2', size: 13 })),
                h('button', { className: 'rpg-btn', style: styles.iconBtnDanger, onClick: () => onDelete(act.id), title: 'Delete' }, h(Icon, { name: 'trash2', size: 13 }))
              )
            );
          })
        )
  );
}

function scoringLabel(act) {
  if (act.type === 'fixed') return `${act.xp} XP fixed`;
  if (act.type === 'milestone') return `${act.xp} XP milestone`;
  if (act.type === 'duration') return 'Scales with duration';
  return '';
}

function FilterChip({ label, active, onClick, color }) {
  return h('button', {
    className: 'rpg-btn',
    onClick,
    style: { ...styles.filterChip, ...(active ? { background: color ? hexToRgba(color, 0.18) : 'rgba(167,139,250,0.18)', borderColor: color || '#a78bfa', color: color || '#c4b5fd' } : {}) },
  }, label);
}

// ---------- Quests View ----------

function QuestsView({ state, onAdd, onEdit, onUpdateProgress, onToggleCheckpoint, onDelete, onArchive, onRestoreArchive, onSaveChain, onRemoveFromChain, isQuestUnlocked }) {
  const [showArchive, setShowArchive] = useState(false);
  const [showChainEditor, setShowChainEditor] = useState(false);
  const [editingChain, setEditingChain] = useState(null);
  const active = (state.quests || []).filter(q => q.progress < 100);
  const archived = state.archivedQuests || [];
  const chains = state.questChains || [];

  // Group active quests: chain-ordered first, then standalone
  const chainedIds = new Set(chains.flatMap(c => c.questIds));
  const standaloneQuests = active.filter(q => !chainedIds.has(q.id));
  const chainGroups = chains.map(chain => ({
    ...chain,
    quests: chain.questIds.map(id => active.find(q => q.id === id)).filter(Boolean),
  })).filter(c => c.quests.length > 0);

  return h('div', { style: { animation: 'fadeIn 0.3s ease' } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      h(SectionLabel, { text: `Active quests (${active.length})` }),
      h('div', { style: { display: 'flex', gap: 8 } },
        archived.length > 0 && h('button', {
          className: 'rpg-btn',
          style: { ...styles.secondaryBtn, fontSize: 12 },
          onClick: () => setShowArchive(v => !v),
        }, showArchive ? 'Hide archive' : `Archive (${archived.length})`),
        active.length >= 2 && h('button', {
          className: 'rpg-btn',
          style: { ...styles.secondaryBtn, fontSize: 12 },
          onClick: () => { setEditingChain(null); setShowChainEditor(true); },
        }, '⛓ New chain'),
        h('button', { className: 'rpg-btn', style: styles.primaryBtn, onClick: onAdd }, h(Icon, { name: 'plus', size: 14 }), ' New quest')
      )
    ),

    showChainEditor && h(QuestChainEditorModal, {
      quests: active,
      chains: chains,
      prefillChain: editingChain,
      onSave: (name, questIds) => { onSaveChain(name, questIds); setShowChainEditor(false); setEditingChain(null); },
      onClose: () => { setShowChainEditor(false); setEditingChain(null); },
    }),

    active.length === 0
      ? h(EmptyState, { text: 'No active quests. Create a time-bound quest to chart a longer journey.' })
      : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
          // Render chain groups first
          chainGroups.map(chain =>
            h('div', { key: chain.id, style: { background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 12, padding: '12px 14px' } },
              h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 } },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                  h('div', { style: { fontSize: 11, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 0.8 } }, '⛓ Chain:'),
                  h('div', { style: { fontSize: 13, fontWeight: 600, color: '#e5e7eb' } }, chain.name)
                ),
                h('button', {
                  className: 'rpg-btn',
                  style: { ...styles.iconBtn, width: 'auto', padding: '4px 10px', fontSize: 11, gap: 4 },
                  onClick: () => { setEditingChain(chain); setShowChainEditor(true); },
                  title: 'Edit this chain',
                }, h(Icon, { name: 'edit2', size: 11, color: '#9896b0' }), 'Edit')
              ),
              h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
                chain.quests.map((q, i) => {
                  const unlocked = isQuestUnlocked ? isQuestUnlocked(q, state) : true;
                  return h('div', { key: q.id, style: { display: 'flex', alignItems: 'flex-start', gap: 8 } },
                    h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14, flexShrink: 0 } },
                      h('div', { style: { width: 10, height: 10, borderRadius: '50%', background: unlocked ? '#a78bfa' : '#3a3a4a', border: `2px solid ${unlocked ? '#a78bfa' : '#2a2a35'}` } }),
                      i < chain.quests.length - 1 && h('div', { style: { width: 2, height: 24, background: '#2a2a35', marginTop: 2 } })
                    ),
                    h('div', { style: { flex: 1, opacity: unlocked ? 1 : 0.5 } },
                      !unlocked && h('div', { style: { fontSize: 11, color: '#7c7c8a', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 } },
                        '🔒', `Requires: ${(state.quests || []).find(x => x.id === q.dependsOn)?.name || 'previous quest'}`
                      ),
                      h(QuestRow, { quest: q, onUpdateProgress: unlocked ? onUpdateProgress : null, onToggleCheckpoint: unlocked ? onToggleCheckpoint : null, onDelete, onEdit: unlocked ? onEdit : null, onArchive: unlocked ? onArchive : null, onRemoveFromChain: () => onRemoveFromChain && onRemoveFromChain(q.id) })
                    )
                  );
                })
              )
            )
          ),
          // Standalone quests
          standaloneQuests.length > 0 && h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
            standaloneQuests.map(q => h(QuestRow, { key: q.id, quest: q, onUpdateProgress, onToggleCheckpoint, onDelete, onEdit, onArchive }))
          )
        ),

    showArchive && archived.length > 0 && h('div', { style: { marginTop: 24 } },
      h(SectionLabel, { text: `Quest archive (${archived.length})`, icon: 'trophy', accent: '#fbbf24' }),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        archived.map(q => h('div', { key: q.id, style: { ...styles.questCard, opacity: 0.8 } },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
            h('div', { style: { flex: 1 } },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                h(Icon, { name: DOMAINS[q.domain].icon, size: 13, color: DOMAINS[q.domain].color }),
                h('span', { style: { ...styles.questName, color: '#9ca3af' } }, q.name),
                h(Icon, { name: 'trophy', size: 13, color: '#fbbf24' })
              ),
              h('div', { style: { ...styles.questMeta, marginTop: 4 } },
                `Completed ${new Date(q.archivedAt).toLocaleDateString()} · +${q.xpReward} XP · +${q.goldEarned || 0} coins`
              )
            ),
            h('button', {
              className: 'rpg-btn',
              style: { ...styles.secondaryBtn, fontSize: 11, padding: '4px 10px' },
              onClick: () => onRestoreArchive(q.id),
              title: 'Restore to active quests',
            }, 'Restore')
          )
        ))
      )
    )
  );
}

// ---------- Quest Chain Editor ----------

function QuestChainEditorModal({ quests, chains, prefillChain, onSave, onClose }) {
  const [chainName, setChainName] = useState(prefillChain ? prefillChain.name : '');
  const [selectedIds, setSelectedIds] = useState(prefillChain ? prefillChain.questIds.filter(id => quests.some(q => q.id === id)) : []);

  // Sort quests so currently-chained ones show their chain name
  const questsWithChain = quests.map(q => {
    const chain = chains.find(c => c.questIds.includes(q.id));
    return { ...q, _chainName: chain ? chain.name : null };
  });

  function toggle(id) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  // Reorder: drag the order by moving items up/down
  function moveUp(idx) {
    if (idx === 0) return;
    const arr = [...selectedIds];
    [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
    setSelectedIds(arr);
  }
  function moveDown(idx) {
    if (idx === selectedIds.length - 1) return;
    const arr = [...selectedIds];
    [arr[idx], arr[idx+1]] = [arr[idx+1], arr[idx]];
    setSelectedIds(arr);
  }

  const selectedQuests = selectedIds.map(id => quests.find(q => q.id === id)).filter(Boolean);
  const canSave = chainName.trim() && selectedIds.length >= 2;

  return h(ModalShell, { title: 'Create quest chain', onClose, width: 480 },
    h('div', { style: { fontSize: 13, color: '#9ca3af', marginBottom: 14 } },
      'Link quests into a progression chain. Quest N+1 stays locked until Quest N is completed and archived.'
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      h('div', null,
        h('label', { style: styles.label }, 'Chain name'),
        h('input', { value: chainName, onChange: e => setChainName(e.target.value), style: styles.input, placeholder: 'e.g. Health Mastery Journey' })
      ),

      h('div', null,
        h('label', { style: styles.label }, 'Select quests (in order)'),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 } },
          questsWithChain.map(q => {
            const d = DOMAINS[q.domain];
            const isSelected = selectedIds.includes(q.id);
            return h('button', {
              key: q.id,
              className: 'rpg-btn',
              onClick: () => toggle(q.id),
              style: {
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                background: isSelected ? hexToRgba(d.color, 0.12) : '#0e0e14',
                border: `1.5px solid ${isSelected ? d.color : '#2a2a35'}`,
                borderRadius: 8, cursor: 'pointer', textAlign: 'left',
              },
            },
              h('div', { style: { width: 16, height: 16, borderRadius: 4, border: `2px solid ${isSelected ? d.color : '#3a3a4a'}`, background: isSelected ? hexToRgba(d.color, 0.2) : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                isSelected && h(Icon, { name: 'check', size: 10, color: d.color })
              ),
              h(Icon, { name: d.icon, size: 13, color: d.color }),
              h('span', { style: { fontSize: 13, color: '#e5e7eb', flex: 1 } }, q.name),
              q._chainName && h('span', { style: { fontSize: 10, color: '#7c7c8a' } }, `(in: ${q._chainName})`)
            );
          })
        )
      ),

      selectedIds.length >= 2 && h('div', null,
        h('div', { style: { ...styles.label, marginBottom: 8 } }, 'Chain order (drag to reorder using ↑↓)'),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
          selectedQuests.map((q, i) => {
            const d = DOMAINS[q.domain];
            return h('div', { key: q.id, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#0e0e14', borderRadius: 7 } },
              h('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
                h('button', { className: 'rpg-btn', style: { ...styles.iconBtn, padding: '2px 4px', height: 'auto', opacity: i===0?0.3:1 }, onClick: () => moveUp(i) }, '↑'),
                h('button', { className: 'rpg-btn', style: { ...styles.iconBtn, padding: '2px 4px', height: 'auto', opacity: i===selectedIds.length-1?0.3:1 }, onClick: () => moveDown(i) }, '↓')
              ),
              h('div', { style: { width: 20, height: 20, borderRadius: '50%', background: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#0e0e14', flexShrink: 0 } }, i+1),
              h(Icon, { name: d.icon, size: 13, color: d.color }),
              h('span', { style: { fontSize: 12.5, color: '#e5e7eb' } }, q.name),
              i < selectedQuests.length-1 && h('span', { style: { fontSize: 10, color: '#7c7c8a', marginLeft: 'auto' } }, '→ unlocks next')
            );
          })
        )
      ),

      h('button', {
        className: 'rpg-btn',
        disabled: !canSave,
        onClick: () => canSave && onSave(chainName.trim(), selectedIds),
        style: { ...styles.primaryBtn, justifyContent: 'center', padding: '10px 0', opacity: canSave ? 1 : 0.5, cursor: canSave ? 'pointer' : 'not-allowed' },
      }, h(Icon, { name: 'check', size: 14 }), ' Create chain')
    )
  );
}

function QuestRow({ quest, onUpdateProgress, onToggleCheckpoint, onDelete, onArchive, onEdit, compact }) {
  const d = DOMAINS[quest.domain];
  const daysLeft = quest.days - Math.floor((Date.now() - quest.createdAt) / (1000*60*60*24));
  const isComplete = quest.progress >= 100;
  const checkpoints = quest.checkpoints || [];
  const hasCheckpoints = checkpoints.length > 0;

  // #7 Deadline urgency
  const deadlineColor = daysLeft < 0 ? '#e05c5c' : daysLeft <= 7 ? '#fb923c' : '#4a4868';
  const deadlineLabel = daysLeft < 0 ? 'overdue' : `${daysLeft}d left`;
  const deadlinePulse = daysLeft < 0 ? { animation: 'pulseGlow 2s infinite' } : {};

  return h('div', { style: { ...styles.questCard, ...(daysLeft < 0 ? { borderColor: 'rgba(224,92,92,0.3)', ...deadlinePulse } : daysLeft <= 7 ? { borderColor: 'rgba(251,146,60,0.25)' } : {}) } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 } },
      h('div', { style: { flex: 1, minWidth: 0 } },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h(Icon, { name: d.icon, size: 14, color: d.color }),
          h('span', { style: styles.questName }, quest.name),
          isComplete && h(Icon, { name: 'trophy', size: 13, color: '#fbbf24' })
        ),
        !compact && quest.desc && h('div', { style: styles.questDesc }, quest.desc),
        h('div', { style: { ...styles.questMeta, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
          `${d.name} · ${quest.xpReward} XP`,
          !isComplete && h('span', { style: { color: deadlineColor, fontWeight: daysLeft <= 7 ? 600 : 400 } }, `· ${deadlineLabel}`)
        )
      ),
      h('div', { style: { textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 } },
        h('span', { style: { fontSize: 18, fontWeight: 700, color: isComplete ? '#fbbf24' : d.color } }, `${quest.progress}%`),
        onDelete && h('button', { className: 'rpg-btn', style: styles.iconBtnDanger, onClick: () => onDelete(quest.id) }, h(Icon, { name: 'trash2', size: 12 })),
        onEdit && h('button', { className: 'rpg-btn', style: styles.iconBtn, onClick: () => onEdit(quest), title: 'Edit quest' }, h(Icon, { name: 'edit2', size: 12 })),
        onArchive && h('button', { className: 'rpg-btn', style: { ...styles.iconBtn, fontSize: 11, padding: '4px 8px', height: 'auto' }, onClick: () => onArchive(quest.id), title: 'Archive quest' }, '→')
      )
    ),
    h('div', { style: { ...styles.meterTrack, marginTop: 8 } },
      h('div', { style: { ...styles.meterFill, width: `${quest.progress}%`, background: isComplete ? '#fbbf24' : d.color } })
    ),
    // Checkpoints — primary progress method when present
    !compact && hasCheckpoints && h('div', { style: { marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 } },
      checkpoints.map(cp =>
        h('button', {
          key: cp.id,
          className: 'rpg-btn',
          onClick: () => onToggleCheckpoint && !isComplete && onToggleCheckpoint(quest.id, cp.id),
          style: {
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'transparent', border: 'none', padding: '4px 0',
            cursor: isComplete ? 'default' : 'pointer', textAlign: 'left',
          },
        },
          h('div', { style: {
            width: 18, height: 18, borderRadius: 5, flexShrink: 0,
            border: `2px solid ${cp.done ? d.color : '#3a3a4a'}`,
            background: cp.done ? hexToRgba(d.color, 0.2) : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }},
            cp.done && h(Icon, { name: 'check', size: 11, color: d.color })
          ),
          h('span', { style: { fontSize: 13, color: cp.done ? '#7c7c8a' : '#e5e7eb', textDecoration: cp.done ? 'line-through' : 'none' } },
            cp.name
          ),
          cp.estimatedDays && h('span', { style: { fontSize: 11, color: '#5e5e6b', marginLeft: 'auto' } },
            `~${cp.estimatedDays}d`
          )
        )
      )
    ),
    // Manual slider — only shown when no checkpoints
    !compact && !hasCheckpoints && onUpdateProgress && !isComplete && h('input', {
      type: 'range', min: 0, max: 100, value: quest.progress,
      onChange: (e) => onUpdateProgress(quest.id, parseInt(e.target.value)),
      style: { width: '100%', marginTop: 8, accentColor: d.color },
    })
  );
}

// ---------- Character View ----------

function CharacterView({ state, domainComputed, onBossClick, onAddSubcat, onEquipTitle, onClearAchievementDot }) {
  const totalLevel = DOMAIN_KEYS.reduce((sum,k) => sum + domainComputed[k].rank, 0);
  const totalXp = DOMAIN_KEYS.reduce((sum,k) => sum + state.domains[k].totalXp, 0);
  const equippedTitleDef = state.equippedTitle ? TITLES[state.equippedTitle] : null;
  const [identityOpen, setIdentityOpen] = useState(false);

  // Clear achievement dot when user opens this tab
  useEffect(() => { if (onClearAchievementDot) onClearAchievementDot(); }, []);

  return h('div', { style: { animation: 'fadeIn 0.3s ease' } },
    h('div', { style: styles.charSummary },
      h('div', { style: styles.charAvatar }, h(Icon, { name: 'shield', size: 28, color: '#a78bfa' })),
      h('div', null,
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h('div', { style: { fontSize: 18, fontWeight: 700, color: '#f4f1ea' } }, 'Adventurer'),
          equippedTitleDef && h('span', { style: { fontSize: 13, fontWeight: 600, color: equippedTitleDef.color, background: hexToRgba(equippedTitleDef.color, 0.12), border: `1px solid ${hexToRgba(equippedTitleDef.color, 0.35)}`, borderRadius: 6, padding: '2px 8px' } }, equippedTitleDef.name)
        ),
        h('div', { style: { fontSize: 13, color: '#9ca3af' } }, `Combined level ${totalLevel} · ${totalXp.toLocaleString()} total XP`)
      )
    ),

    // ── PROGRESSION group (domain meters + boss gates) ──
    h('div', { style: { marginTop: 20 } },
      h(SectionLabel, { text: 'Progression' }),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
        DOMAIN_KEYS.map(k => {
          const d = DOMAINS[k];
          const comp = domainComputed[k];
          const allSubcats = [...d.subcats, ...(state.customSubcats[k] || [])];
          const pct = Math.round((comp.currentLevelXp / comp.currentLevelReq) * 100);

          return h('div', { key: k, style: styles.charDomainCard },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 } },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                h('div', { style: { ...styles.charDomainIcon, background: hexToRgba(d.color, 0.15) } }, h(Icon, { name: d.icon, size: 18, color: d.color })),
                h('div', null,
                  h('div', { style: { fontWeight: 700, fontSize: 15, color: '#f4f1ea' } }, d.name),
                  h('div', { style: { fontSize: 12, color: '#9ca3af' } }, `${state.domains[k].totalXp.toLocaleString()} total XP`)
                )
              ),
              h('div', { style: { textAlign: 'right' } },
                h('div', { style: { fontSize: 22, fontWeight: 700, color: d.color } }, `Level ${comp.rank}`),
                h('div', { style: { fontSize: 12, color: '#9ca3af' } }, `${comp.currentLevelXp} / ${comp.currentLevelReq} XP`)
              )
            ),
            h('div', { style: { ...styles.meterTrack, height: 8, marginBottom: 10 } },
              h('div', { style: { ...styles.meterFill, width: `${pct}%`, background: d.color } })
            ),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' } },
              h(AddSubcatButton, { domain: k, color: d.color, onAdd: (sub) => onAddSubcat(k, sub) }),
              allSubcats.map(s => h('span', { key: s, style: { fontSize: 11, padding: '2px 8px', borderRadius: 3, background: hexToRgba(d.color, 0.1), color: d.color, border: `1px solid ${hexToRgba(d.color, 0.2)}` } }, s))
            ),
            h('div', { style: { marginTop: 12 } },
              h('div', { style: { fontSize: 12, color: '#7c7c8a', marginBottom: 6 } }, 'Boss gates'),
              h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
                activeBossLevelsFor(state, k).map(bl => {
                  const key = `${k}-${bl}`;
                  const completed = state.bossCompletions[key];
                  const reached = comp.potentialRank > bl;
                  const isGate = comp.rank <= bl && reached;
                  return h('button', {
                    key: bl,
                    className: 'rpg-btn',
                    onClick: () => (isGate && !completed) ? onBossClick({ domain: k, level: bl }) : null,
                    style: {
                      ...styles.bossPill,
                      ...(completed ? { background: hexToRgba('#fbbf24',0.15), borderColor: '#fbbf24', color: '#fbbf24' } :
                          isGate ? { background: hexToRgba(d.color,0.12), borderColor: d.color, color: d.color, cursor: 'pointer', animation: 'pulseGlow 2s infinite' } :
                          { opacity: 0.4 }),
                    },
                  },
                    h(Icon, { name: completed ? 'trophy' : 'shield', size: 11 }),
                    ` Lv ${bl}`
                  );
                })
              )
            )
          );
        })
      )
    ),

    // ── IDENTITY group (achievements, titles, class, legacy) ── collapsible
    h('div', { style: { marginTop: 28 } },
      h('button', {
        className: 'rpg-btn',
        onClick: () => setIdentityOpen(o => !o),
        style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#12121f', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 4, color: '#eceaf6' },
      },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h(Icon, { name: 'award', size: 15, color: '#a78bfa' }),
          h('span', { style: { fontSize: 12.5, fontWeight: 600 } }, 'Identity'),
          h('span', { style: { fontSize: 11, color: '#4a4868' } }, '— achievements, titles, class mastery, legacy'),
          state.newAchievementsSince && h('span', { style: { width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', marginLeft: 4, display: 'inline-block' } })
        ),
        h('div', { style: { transform: identityOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' } },
          h(Icon, { name: 'chevronRight', size: 14, color: '#4a4868' })
        )
      ),
      identityOpen && h('div', { style: { display: 'flex', flexDirection: 'column', gap: 24, marginTop: 16 } },
        h(AchievementsSection, { achievements: state.achievements || {} }),
        h(TitleSection, { achievements: state.achievements || {}, equippedTitle: state.equippedTitle, onEquip: onEquipTitle }),
        h(ClassMasterySection, { classMastery: state.classMastery || {} }),
        h(YearlyLegacySection, { yearlyLegacy: state.yearlyLegacy || {} })
      )
    )
  );
}


// ---------- Title System ----------

function TitleSection({ achievements, equippedTitle, onEquip }) {
  const unlockedTitles = Object.entries(TITLES).filter(([id, t]) =>
    achievements && achievements[t.requiredAchievement]
  );

  if (unlockedTitles.length === 0) {
    return h('div', null,
      h(SectionLabel, { text: 'Titles' }),
      h('div', { style: { fontSize: 12.5, color: '#7c7c8a', padding: '8px 0' } },
        'Titles are unlocked through achievements. Earn your first achievement to unlock a title.'
      )
    );
  }

  return h('div', null,
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 } },
      h(SectionLabel, { text: 'Titles' }),
      h('span', { style: { fontSize: 11.5, color: '#7c7c8a' } }, `${unlockedTitles.length} unlocked`)
    ),
    h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
      unlockedTitles.map(([id, t]) => {
        const isEquipped = equippedTitle === id;
        return h('button', {
          key: id,
          className: 'rpg-btn',
          onClick: () => onEquip(id),
          title: t.desc,
          style: {
            padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
            background: isEquipped ? hexToRgba(t.color, 0.18) : '#0e0e14',
            border: `2px solid ${isEquipped ? t.color : '#2a2a35'}`,
            color: isEquipped ? t.color : '#9ca3af',
            fontSize: 13, fontWeight: isEquipped ? 700 : 500,
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 6,
          },
        },
          isEquipped && h('span', { style: { fontSize: 11 } }, '✓'),
          t.name
        );
      })
    ),
    h('div', { style: { fontSize: 11, color: '#7c7c8a', marginTop: 8 } },
      equippedTitle ? `Equipped: ${TITLES[equippedTitle]?.name || ''} — click again to unequip` : 'Click a title to equip it. Equipped title shows next to your name.'
    )
  );
}

// ---------- Class Progression ----------

function ClassMasterySection({ classMastery }) {
  return h('div', null,
    h(SectionLabel, { text: 'Class mastery' }),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
      CLASS_DEFINITIONS.map(cls => {
        const xp = (classMastery && classMastery[cls.id]) || 0;
        const highestTier = [...CLASS_MASTERY_THRESHOLDS].reverse().find(t => xp >= t.xp);
        const nextTier = CLASS_MASTERY_THRESHOLDS.find(t => xp < t.xp);
        const progressPct = nextTier
          ? Math.round(((xp - (highestTier ? highestTier.xp : 0)) / (nextTier.xp - (highestTier ? highestTier.xp : 0))) * 100)
          : 100;

        return h('div', { key: cls.id, style: { background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 10, padding: '12px 14px' } },
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 } },
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
              h('span', { style: { fontSize: 18 } }, cls.badge),
              h('div', null,
                h('div', { style: { fontSize: 13, fontWeight: 700, color: '#e5e7eb' } }, cls.name),
                h('div', { style: { fontSize: 11, color: '#7c7c8a' } }, cls.desc)
              )
            ),
            h('div', { style: { textAlign: 'right' } },
              highestTier && h('div', { style: { fontSize: 12, fontWeight: 700, color: highestTier.color } }, highestTier.label),
              h('div', { style: { fontSize: 11, color: '#7c7c8a' } }, `${xp.toLocaleString()} XP`)
            )
          ),
          h('div', { style: { ...styles.meterTrack, height: 6 } },
            h('div', { style: { ...styles.meterFill, width: `${Math.min(progressPct, 100)}%`, background: highestTier ? highestTier.color : cls.color } })
          ),
          nextTier && h('div', { style: { fontSize: 10.5, color: '#7c7c8a', marginTop: 4 } },
            `${(nextTier.xp - xp).toLocaleString()} XP to ${nextTier.label}`
          ),
          !nextTier && h('div', { style: { fontSize: 10.5, color: '#fbbf24', marginTop: 4 } }, '✦ Maximum mastery reached')
        );
      })
    )
  );
}

// ---------- Yearly Legacy ----------

function YearlyLegacySection({ yearlyLegacy }) {
  const years = Object.keys(yearlyLegacy).sort((a, b) => Number(b) - Number(a));
  if (years.length === 0) {
    return h('div', null,
      h(SectionLabel, { text: 'Yearly legacy' }),
      h('div', { style: { fontSize: 12.5, color: '#7c7c8a', padding: '8px 0' } },
        'Your yearly character sheet will appear here after you start logging activities. Each year becomes a permanent record of your growth.'
      )
    );
  }

  const DOMAIN_NAMES = { health: 'Health', relationships: 'Relationships', career: 'Career', finance: 'Finance' };

  return h('div', null,
    h(SectionLabel, { text: 'Yearly legacy' }),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      years.map(year => {
        const entry = yearlyLegacy[year] || {};
        const topDomain = entry.topDomain;
        const topDomainColor = topDomain && DOMAINS[topDomain] ? DOMAINS[topDomain].color : '#a78bfa';
        const isCurrentYear = year === String(new Date().getFullYear());

        return h('div', { key: year, style: { background: '#1a1a24', border: `1px solid ${isCurrentYear ? 'rgba(167,139,250,0.35)' : '#2a2a35'}`, borderRadius: 12, padding: '14px 16px' } },
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 } },
            h('div', { style: { fontSize: 16, fontWeight: 800, color: '#f4f1ea' } }, year),
            isCurrentYear && h('span', { style: { fontSize: 10, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 0.8, background: 'rgba(167,139,250,0.12)', padding: '2px 8px', borderRadius: 5 } }, 'This year')
          ),
          h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 } },
            [
              { label: 'XP Earned', value: (entry.xpEarned || 0).toLocaleString(), color: '#a78bfa' },
              { label: 'Coins', value: (entry.coinsEarned || 0).toLocaleString(), color: '#fbbf24' },
              { label: 'Activities', value: (entry.activitiesLogged || 0).toLocaleString(), color: '#60a5fa' },
              { label: 'Quests Done', value: (entry.questsCompleted || 0).toLocaleString(), color: '#34d399' },
              { label: 'Gates Cleared', value: (entry.gatesCleared || 0).toLocaleString(), color: '#f59e0b' },
              { label: 'Best Streak', value: `${entry.highestStreak || 0}d`, color: '#fb923c' },
            ].map(stat =>
              h('div', { key: stat.label, style: { background: '#0e0e14', borderRadius: 8, padding: '8px 10px', textAlign: 'center' } },
                h('div', { style: { fontSize: 16, fontWeight: 800, color: stat.color } }, stat.value),
                h('div', { style: { fontSize: 10, color: '#7c7c8a', marginTop: 2 } }, stat.label)
              )
            )
          ),
          topDomain && h('div', { style: { marginTop: 8, fontSize: 11.5, color: '#9ca3af' } },
            'Top domain: ',
            h('span', { style: { color: topDomainColor, fontWeight: 600 } }, DOMAIN_NAMES[topDomain] || topDomain)
          )
        );
      })
    )
  );
}

function AddSubcatButton({ domain, onAdd, color }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  if (!open) {
    return h('button', { className: 'rpg-btn', onClick: () => setOpen(true), style: { ...styles.subcatPill, borderStyle: 'dashed', color: '#7c7c8a', borderColor: 'rgba(255,255,255,0.15)' } },
      h(Icon, { name: 'plus', size: 11 }), ' Add'
    );
  }

  return h('div', { style: { display: 'flex', gap: 4 } },
    h('input', {
      autoFocus: true,
      value,
      onChange: e => setValue(e.target.value),
      onKeyDown: e => { if (e.key === 'Enter' && value.trim()) { onAdd(domain, value.trim()); setValue(''); setOpen(false); } if (e.key === 'Escape') setOpen(false); },
      placeholder: 'Subcategory name',
      style: { ...styles.input, height: 28, fontSize: 12, width: 140 },
    }),
    h('button', { className: 'rpg-btn', style: { ...styles.iconBtn, height: 28, width: 28 }, onClick: () => { if (value.trim()) { onAdd(domain, value.trim()); setValue(''); } setOpen(false); } },
      h(Icon, { name: 'check', size: 12 })
    )
  );
}

// ---------- Rewards View ----------

function RewardsView({ state, onBuy, onAdd, onEdit, onDelete, onUseTicket, onSellTicket, onDeleteTicket }) {
  const avgPerDay = computeDailyGoldAverage(state);
  const haveEstimate = avgPerDay > 0;

  const allTickets = state.tickets || [];
  const activeTickets = allTickets.filter(t => !t.usedAt);
  const usedTickets = allTickets.filter(t => t.usedAt);

  return h('div', { style: { animation: 'fadeIn 0.3s ease' } },
    h('div', { style: styles.goldBanner },
      h('div', { style: { flex: 1 } },
        h('div', { style: { fontSize: 12, color: '#9ca3af', marginBottom: 2 } }, 'Reward currency'),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h(Icon, { name: 'coins', size: 22, color: '#fbbf24' }),
          h('span', { style: { fontSize: 28, fontWeight: 700, color: '#fbbf24' } }, state.gold),
          h('span', { style: { fontSize: 13, color: '#9ca3af' } }, 'gold')
        ),
        haveEstimate
          ? h('div', { style: { fontSize: 11, color: '#7c7c8a', marginTop: 4 } }, `Current pace: ~${avgPerDay.toFixed(1)} gold/day`)
          : h('div', { style: { fontSize: 11, color: '#7c7c8a', marginTop: 4 } }, 'No earning history yet — estimates will appear after you earn some gold.')
      ),
      (state.totalCoinsEarnedAllTime || 0) > 0 && h('div', { style: { textAlign: 'right', paddingLeft: 16, borderLeft: '1px solid rgba(255,255,255,0.06)' } },
        h('div', { style: { fontSize: 10, color: '#4a4868', textTransform: 'uppercase', letterSpacing: 1 } }, 'All-time earned'),
        h('div', { style: { fontSize: 22, fontWeight: 700, color: '#c9a84c' } }, (state.totalCoinsEarnedAllTime || 0).toLocaleString()),
        h('div', { style: { fontSize: 10, color: '#4a4868' } }, 'coins total')
      )
    ),

    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '18px 0 12px' } },
      h(SectionLabel, { text: 'Reward catalog' }),
      h('button', { className: 'rpg-btn', style: styles.primaryBtn, onClick: onAdd }, h(Icon, { name: 'plus', size: 14 }), ' New reward')
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
      state.rewards.map(r => {
        const estimate = haveEstimate ? formatEstimate(Math.max(0, r.cost - state.gold), avgPerDay) : null;
        const canAfford = canAffordReward(r, state);
        const reqs = r.requirements || [];
        const hasReqs = reqs.length > 0 || (r.cost || 0) > 0;
        return h('div', { key: r.id, style: { ...styles.rewardCard, flexDirection: 'column', alignItems: 'stretch', gap: 10 } },
          h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 12 } },
            h('div', { style: { flex: 1, minWidth: 0 } },
              h('div', { style: { fontWeight: 700, fontSize: 14, color: '#f4f1ea' } }, r.name),
              r.desc && h('div', { style: { fontSize: 12, color: '#9ca3af', marginTop: 2 } }, r.desc),
              canAfford
                ? h('div', { style: { fontSize: 11.5, color: '#5de8a0', marginTop: 4 } }, '✓ All requirements met')
                : estimate && h('div', { style: { fontSize: 11.5, color: '#a78bfa', marginTop: 4 } }, `Est. ${estimate}`)
            ),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 } },
              h('button', {
                className: 'rpg-btn',
                style: { ...styles.primaryBtn, opacity: !canAfford ? 0.4 : 1, cursor: !canAfford ? 'not-allowed' : 'pointer' },
                disabled: !canAfford,
                onClick: () => onBuy(r),
              }, 'Buy ticket'),
              h('button', { className: 'rpg-btn', style: styles.iconBtn, onClick: () => onEdit(r) }, h(Icon, { name: 'edit2', size: 12 })),
              h('button', { className: 'rpg-btn', style: styles.iconBtnDanger, onClick: () => onDelete(r.id) }, h(Icon, { name: 'trash2', size: 12 }))
            )
          ),
          // Requirements breakdown chips
          hasReqs && h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
            (r.cost || 0) > 0 && h('div', { style: { fontSize: 11, padding: '3px 8px', borderRadius: 3, background: (state.gold || 0) >= (r.cost || 0) ? 'rgba(93,232,160,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${(state.gold || 0) >= (r.cost || 0) ? 'rgba(93,232,160,0.3)' : 'rgba(255,255,255,0.08)'}`, color: (state.gold || 0) >= (r.cost || 0) ? '#5de8a0' : '#9896b0' } },
              `🪙 ${r.cost} gold`
            ),
            reqs.map((req, i) => {
              let met = false, label = '';
              if (req.type === 'activity') {
                const actExists = (state.activities || []).some(a => a.id === req.activityId);
                if (!actExists) { met = true; label = `${req.activityName} (removed)`; }
                else { const cnt = (state.activityLog || []).filter(l => l.activityName === req.activityName).length; met = cnt >= req.count; label = `🏃 ${req.count}× ${req.activityName}`; }
              } else if (req.type === 'streak') {
                met = (state.consistencyStreak || 0) >= req.days; label = `🔥 ${req.days}-day streak`;
              } else if (req.type === 'quest') {
                const qExists = (state.quests || []).some(q => q.id === req.questId) || (state.archivedQuests || []).some(q => q.id === req.questId);
                if (!qExists) { met = true; label = `${req.questName} (removed)`; }
                else { met = (state.archivedQuests || []).some(q => q.id === req.questId); label = `🎯 ${req.questName}`; }
              }
              return h('div', { key: i, style: { fontSize: 11, padding: '3px 8px', borderRadius: 3, background: met ? 'rgba(93,232,160,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${met ? 'rgba(93,232,160,0.3)' : 'rgba(255,255,255,0.08)'}`, color: met ? '#5de8a0' : '#9896b0' } },
                `${label}${met ? ' ✓' : ''}`
              );
            })
          )
        );
      })
    ),

    // Purchased tickets section — active tickets first, used tickets below faded
    (allTickets.length > 0) && h('div', { style: { marginTop: 24 } },
      h(SectionLabel, { text: `Purchased tickets (${activeTickets.length})`, icon: 'gift', accent: '#a78bfa' }),
      activeTickets.length === 0
        ? h(EmptyState, { text: "No active tickets right now. Buy one from the catalog above when you've earned enough." })
        : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
            activeTickets.map(t => {
              const refund = Math.floor(t.cost * SELL_REFUND_RATIO);
              return h('div', { key: t.id, style: styles.ticketCard },
                h('div', { style: { flex: 1, minWidth: 0 } },
                  h('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                    h(Icon, { name: 'gift', size: 13, color: '#a78bfa' }),
                    h('span', { style: { fontWeight: 700, fontSize: 13.5, color: '#f4f1ea' } }, t.name)
                  ),
                  t.desc && h('div', { style: { fontSize: 11.5, color: '#9ca3af', marginTop: 2 } }, t.desc),
                  h('div', { style: { fontSize: 11, color: '#7c7c8a', marginTop: 4 } }, `Paid ${t.cost} · sell for ${refund}`)
                ),
                h('div', { style: { display: 'flex', gap: 6 } },
                  h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, padding: '6px 12px' }, onClick: () => onUseTicket(t.id) },
                    h(Icon, { name: 'check', size: 13 }), ' Use'
                  ),
                  h('button', { className: 'rpg-btn', style: { ...styles.secondaryBtn, padding: '6px 12px' }, onClick: () => onSellTicket(t.id), title: `Refunds ${refund} gold (50%)` },
                    h(Icon, { name: 'coins', size: 13 }), ' Sell'
                  )
                )
              );
            })
          ),

      usedTickets.length > 0 && h('div', { style: { marginTop: 20 } },
        h(SectionLabel, { text: `Used (${usedTickets.length})` }),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
          usedTickets.slice().sort((a,b) => b.usedAt - a.usedAt).map(t => {
            const usedDate = new Date(t.usedAt).toLocaleDateString();
            return h('div', { key: t.id, style: { ...styles.ticketCard, opacity: 0.55 } },
              h('div', { style: { flex: 1, minWidth: 0 } },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                  h(Icon, { name: 'check', size: 12, color: '#86efac' }),
                  h('span', { style: { fontWeight: 600, fontSize: 13, color: '#d1d5db', textDecoration: 'line-through' } }, t.name)
                ),
                h('div', { style: { fontSize: 11, color: '#7c7c8a', marginTop: 3 } }, `Used ${usedDate} · cost ${t.cost} gold`)
              ),
              h('button', { className: 'rpg-btn', style: styles.iconBtnDanger, onClick: () => onDeleteTicket(t.id), title: 'Delete from history' },
                h(Icon, { name: 'trash2', size: 12 })
              )
            );
          })
        )
      )
    )
  );
}

// ---------- Modals ----------

function ModalShell({ title, onClose, children, width = 420 }) {
  return h('div', { style: styles.modalOverlay, onClick: onClose },
    h('div', { style: { ...styles.modal, maxWidth: width, width: '100%' }, onClick: e => e.stopPropagation() },
      h('div', { style: styles.modalHeader },
        h('span', { style: styles.modalTitle }, title),
        h('button', { className: 'rpg-btn', style: styles.iconBtn, onClick: onClose }, h(Icon, { name: 'x', size: 14 }))
      ),
      h('div', { style: { padding: '16px 20px 20px' } }, children)
    )
  );
}

function LogActivityModal({ activity, onClose, onSubmit }) {
  const d = DOMAINS[activity.domain];
  const [duration, setDuration] = useState(activity.curve ? activity.curve[0][0] : 15);
  const previewXp = activity.type === 'duration' ? computeDurationXp(activity.curve, duration) : activity.xp;

  return h(ModalShell, { title: `Log: ${activity.name}`, onClose },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 } },
      h(Icon, { name: d.icon, size: 16, color: d.color }),
      h('span', { style: { fontSize: 13, color: '#9ca3af' } }, `${d.name} · ${activity.subcat}`)
    ),
    activity.type === 'duration'
      ? h('div', null,
          h('label', { style: styles.label }, 'Duration (minutes)'),
          h('input', { type: 'number', value: duration, min: 1, onChange: e => setDuration(Math.max(1, parseInt(e.target.value)||1)), style: styles.input }),
          h('div', { style: { marginTop: 8, fontSize: 12, color: '#7c7c8a' } }, `Scaling curve: ${activity.curve.map(([m,x]) => `${m}m=${x}XP`).join(', ')}`)
        )
      : h('div', { style: { fontSize: 13, color: '#9ca3af' } }, 'This activity awards a fixed amount of XP.'),
    h('div', { style: styles.xpPreview },
      h(Icon, { name: 'zap', size: 16, color: d.color }),
      h('span', { style: { fontSize: 20, fontWeight: 700, color: d.color } }, `+${previewXp} XP`),
      h('span', { style: { fontSize: 12, color: '#7c7c8a' } }, `to ${d.name}`)
    ),
    h('button', {
      className: 'rpg-btn',
      style: { ...styles.primaryBtn, width: '100%', justifyContent: 'center', marginTop: 16, padding: '10px 0' },
      onClick: () => onSubmit(activity.type === 'duration' ? duration : null),
    }, h(Icon, { name: 'check', size: 14 }), ' Confirm')
  );
}

function ActivityFormModal({ activity, customSubcats, onClose, onSave, onAddSubcat }) {
  const [name, setName] = useState(activity ? activity.name : '');
  const [domain, setDomain] = useState(activity ? activity.domain : 'health');
  const [subcat, setSubcat] = useState(activity ? activity.subcat : DOMAINS[(activity && activity.domain) || 'health'].subcats[0]);
  const [type, setType] = useState(activity ? activity.type : 'fixed');
  const [xp, setXp] = useState(activity && activity.xp ? activity.xp : 25);
  const [desc, setDesc] = useState(activity && activity.desc ? activity.desc : '');
  const [curve, setCurve] = useState(activity && activity.curve ? activity.curve : [[5,5],[15,15],[30,25],[60,35]]);
  const [tags, setTags] = useState(activity && activity.tags ? activity.tags : []);
  const [tagInput, setTagInput] = useState('');
  const [favorite, setFavorite] = useState(activity ? !!activity.favorite : false);

  const SUGGESTED_TAGS = ['Fitness', 'Recovery', 'Learning', 'Family', 'Business', 'Creative', 'Social', 'Finance', 'Health', 'Mindfulness'];

  function addTag(tag) {
    const t = tag.trim();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput('');
  }

  function removeTag(tag) {
    setTags(tags.filter(t => t !== tag));
  }

  const allSubcats = [...DOMAINS[domain].subcats, ...(customSubcats[domain] || [])];

  function updateCurvePoint(idx, field, val) {
    const newCurve = curve.map((p,i) => i===idx ? (field===0 ? [parseInt(val)||0, p[1]] : [p[0], parseInt(val)||0]) : p);
    setCurve(newCurve);
  }

  function addCurvePoint() {
    setCurve([...curve, [curve[curve.length-1][0]+15, curve[curve.length-1][1]+10]]);
  }

  function removeCurvePoint(idx) {
    if (curve.length > 1) setCurve(curve.filter((_,i) => i!==idx));
  }

  function handleSave() {
    if (!name.trim()) return;
    const data = { id: activity ? activity.id : undefined, name: name.trim(), domain, subcat, type, desc: desc.trim(), tags, favorite };
    if (type === 'fixed' || type === 'milestone') data.xp = xp;
    if (type === 'duration') data.curve = curve;
    onSave(data);
  }

  return h(ModalShell, { title: activity ? 'Edit activity' : 'New activity', onClose, width: 460 },
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      h('div', null,
        h('label', { style: styles.label }, 'Activity name'),
        h('input', { value: name, onChange: e => setName(e.target.value), style: styles.input, placeholder: 'e.g. Morning workout' })
      ),
      h('div', { style: { display: 'flex', gap: 10 } },
        h('div', { style: { flex: 1 } },
          h('label', { style: styles.label }, 'Domain'),
          h('select', { value: domain, onChange: e => { setDomain(e.target.value); setSubcat(DOMAINS[e.target.value].subcats[0]); }, style: styles.input },
            DOMAIN_KEYS.map(k => h('option', { key: k, value: k }, DOMAINS[k].name))
          )
        ),
        h('div', { style: { flex: 1 } },
          h('label', { style: styles.label }, 'Subcategory'),
          h('select', { value: subcat, onChange: e => setSubcat(e.target.value), style: styles.input },
            allSubcats.map(s => h('option', { key: s, value: s }, s))
          )
        )
      ),
      h('div', null,
        h('label', { style: styles.label }, 'Scoring type'),
        h('div', { style: { display: 'flex', gap: 6 } },
          [['fixed','Fixed XP'],['duration','Duration XP'],['milestone','Milestone XP']].map(([val,lab]) =>
            h('button', {
              key: val, className: 'rpg-btn', onClick: () => setType(val),
              style: { ...styles.filterChip, flex: 1, justifyContent: 'center', ...(type===val ? { background: 'rgba(167,139,250,0.18)', borderColor: '#a78bfa', color: '#c4b5fd' } : {}) },
            }, lab)
          )
        )
      ),
      (type === 'fixed' || type === 'milestone') && h('div', null,
        h('label', { style: styles.label }, 'XP value'),
        h('input', { type: 'number', value: xp, min: 1, onChange: e => setXp(parseInt(e.target.value)||0), style: styles.input })
      ),
      type === 'duration' && h('div', null,
        h('label', { style: styles.label }, 'Duration → XP curve'),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
          curve.map((p,i) => h('div', { key: i, style: { display: 'flex', gap: 6, alignItems: 'center' } },
            h('input', { type: 'number', value: p[0], onChange: e => updateCurvePoint(i,0,e.target.value), style: { ...styles.input, flex: 1 }, placeholder: 'min' }),
            h('span', { style: { color: '#7c7c8a', fontSize: 12 } }, 'min ='),
            h('input', { type: 'number', value: p[1], onChange: e => updateCurvePoint(i,1,e.target.value), style: { ...styles.input, flex: 1 }, placeholder: 'XP' }),
            h('span', { style: { color: '#7c7c8a', fontSize: 12 } }, 'XP'),
            h('button', { className: 'rpg-btn', style: styles.iconBtnDanger, onClick: () => removeCurvePoint(i) }, h(Icon, { name: 'x', size: 12 }))
          )),
          h('button', { className: 'rpg-btn', style: { ...styles.filterChip, justifyContent: 'center' }, onClick: addCurvePoint }, h(Icon, { name: 'plus', size: 12 }), ' Add point')
        )
      ),
      h('div', null,
        h('label', { style: styles.label }, 'Description (optional)'),
        h('textarea', { value: desc, onChange: e => setDesc(e.target.value), style: { ...styles.input, minHeight: 60, resize: 'vertical' } })
      ),

      h('div', null,
        h('label', { style: styles.label }, 'Tags (optional)'),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 } },
          tags.map(tag => h('span', { key: tag, style: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'rgba(167,139,250,0.15)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.3)' } },
            tag,
            h('button', { className: 'rpg-btn', onClick: () => removeTag(tag), style: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0, fontSize: 12, lineHeight: 1 } }, '×')
          ))
        ),
        h('div', { style: { display: 'flex', gap: 6 } },
          h('input', { value: tagInput, onChange: e => setTagInput(e.target.value), onKeyDown: e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); } }, style: { ...styles.input, flex: 1 }, placeholder: 'Add a tag…' }),
          h('button', { className: 'rpg-btn', style: styles.iconBtn, onClick: () => addTag(tagInput) }, h(Icon, { name: 'plus', size: 13 }))
        ),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 } },
          SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(t =>
            h('button', { key: t, className: 'rpg-btn', onClick: () => addTag(t), style: { ...styles.filterChip, fontSize: 11 } }, '+ ', t)
          )
        )
      ),

      h('button', {
        className: 'rpg-btn',
        onClick: () => setFavorite(v => !v),
        style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: favorite ? 'rgba(251,191,36,0.12)' : '#0e0e14', border: `1px solid ${favorite ? '#fbbf24' : '#2a2a35'}`, borderRadius: 8, color: favorite ? '#fbbf24' : '#7c7c8a', cursor: 'pointer', fontSize: 13 },
      }, h('span', { style: { fontSize: 16 } }, favorite ? '★' : '☆'), favorite ? 'Marked as favourite' : 'Mark as favourite'),

      h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, justifyContent: 'center', padding: '10px 0' }, onClick: handleSave }, h(Icon, { name: 'check', size: 14 }), ' Save activity')
    )
  );
}

function QuestFormModal({ onClose, onSave, existingQuest }) {
  const [name, setName] = useState(existingQuest ? existingQuest.name : '');
  const [desc, setDesc] = useState(existingQuest ? (existingQuest.desc || '') : '');
  const [domain, setDomain] = useState(existingQuest ? existingQuest.domain : 'health');
  const [days, setDays] = useState(existingQuest ? String(existingQuest.days) : '30');
  const [xpReward, setXpReward] = useState(existingQuest ? existingQuest.xpReward : 100);
  const [checkpoints, setCheckpoints] = useState(existingQuest ? (existingQuest.checkpoints || []) : []);
  const [newCpName, setNewCpName] = useState('');
  const [newCpDays, setNewCpDays] = useState('');

  const daysNum = parseInt(days, 10);
  const daysValid = !isNaN(daysNum) && daysNum >= 1;
  const canSave = name.trim() && daysValid;

  function addCheckpoint() {
    if (!newCpName.trim()) return;
    setCheckpoints(prev => [...prev, {
      id: `cp_${Date.now()}`,
      name: newCpName.trim(),
      estimatedDays: parseInt(newCpDays) || null,
      done: false,
    }]);
    setNewCpName('');
    setNewCpDays('');
  }

  function removeCheckpoint(id) {
    setCheckpoints(prev => prev.filter(c => c.id !== id));
  }

  function handleSave() {
    if (!canSave) return;
    onSave({
      ...(existingQuest || {}),
      name: name.trim(),
      desc: desc.trim(),
      domain,
      days: daysNum,
      xpReward,
      checkpoints: checkpoints.length > 0 ? checkpoints : [],
    });
  }

  return h(ModalShell, { title: existingQuest ? 'Edit quest' : 'New quest', onClose, width: 480 },
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      h('div', null,
        h('label', { style: styles.label }, 'Quest name'),
        h('input', { value: name, onChange: e => setName(e.target.value), style: styles.input, placeholder: 'e.g. Finish RPG Maker course' })
      ),
      h('div', null,
        h('label', { style: styles.label }, 'Description'),
        h('textarea', { value: desc, onChange: e => setDesc(e.target.value), style: { ...styles.input, minHeight: 50 } })
      ),
      h('div', { style: { display: 'flex', gap: 10 } },
        h('div', { style: { flex: 1 } },
          h('label', { style: styles.label }, 'Domain'),
          h('select', { value: domain, onChange: e => setDomain(e.target.value), style: styles.input },
            DOMAIN_KEYS.map(k => h('option', { key: k, value: k }, DOMAINS[k].name))
          )
        ),
        h('div', { style: { flex: 1 } },
          h('label', { style: styles.label }, 'Deadline (days)'),
          h('input', {
            // #2 fix: text input + inputMode so backspace works naturally on mobile
            type: 'text',
            inputMode: 'numeric',
            value: days,
            onChange: e => setDays(e.target.value.replace(/[^0-9]/g, '')),
            style: { ...styles.input, ...(days !== '' && !daysValid ? { borderColor: 'rgba(226,75,74,0.5)' } : {}) },
            placeholder: 'e.g. 30',
          }),
          days !== '' && !daysValid && h('div', { style: { fontSize: 11, color: '#f09595', marginTop: 4 } }, 'Enter at least 1 day')
        )
      ),
      h('div', null,
        h('label', { style: styles.label }, 'XP reward on completion'),
        h('input', { type: 'number', value: xpReward, min: 0, onChange: e => setXpReward(parseInt(e.target.value)||0), style: styles.input })
      ),

      // Checkpoints (#5/#6) — optional; if none are added, manual slider is used
      h('div', null,
        h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 } },
          h('label', { style: styles.label }, `Milestones / checkpoints (optional)`),
          checkpoints.length > 0 && h('span', { style: { fontSize: 11, color: '#7c7c8a' } }, 'Progress driven by checkmarks')
        ),
        checkpoints.length === 0 && h('div', { style: { fontSize: 11.5, color: '#7c7c8a', marginBottom: 8 } },
          'Add checkpoints for structured quests. Leave empty to use a manual % slider.'
        ),
        checkpoints.length > 0 && h('div', { style: { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 } },
          checkpoints.map((cp, i) =>
            h('div', { key: cp.id, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#0e0e14', borderRadius: 8 } },
              h('span', { style: { fontSize: 12.5, color: '#d1d5db', flex: 1 } }, cp.name),
              cp.estimatedDays && h('span', { style: { fontSize: 11, color: '#7c7c8a' } }, `~${cp.estimatedDays}d`),
              h('button', { className: 'rpg-btn', style: styles.iconBtnDanger, onClick: () => removeCheckpoint(cp.id) }, h(Icon, { name: 'x', size: 11 }))
            )
          )
        ),
        h('div', { style: { display: 'flex', gap: 6 } },
          h('input', {
            value: newCpName, onChange: e => setNewCpName(e.target.value),
            onKeyDown: e => { if (e.key === 'Enter') { e.preventDefault(); addCheckpoint(); } },
            style: { ...styles.input, flex: 2 }, placeholder: 'Checkpoint name',
          }),
          h('input', {
            value: newCpDays, onChange: e => setNewCpDays(e.target.value.replace(/[^0-9]/g, '')),
            style: { ...styles.input, flex: 1 }, placeholder: 'Days',
            inputMode: 'numeric', type: 'text',
          }),
          h('button', { className: 'rpg-btn', style: { ...styles.iconBtn, flexShrink: 0 }, onClick: addCheckpoint, title: 'Add checkpoint' },
            h(Icon, { name: 'plus', size: 14 })
          )
        )
      ),

      h('button', {
        className: 'rpg-btn',
        disabled: !canSave,
        style: { ...styles.primaryBtn, justifyContent: 'center', padding: '10px 0', opacity: !canSave ? 0.5 : 1, cursor: !canSave ? 'not-allowed' : 'pointer' },
        onClick: handleSave,
      }, h(Icon, { name: 'check', size: 14 }), ' Create quest')
    )
  );
}

function RewardFormModal({ reward, state, onClose, onSave }) {
  const [name, setName] = useState(reward ? reward.name : '');
  const [cost, setCost] = useState(reward ? (reward.cost || 0) : 50);
  const [desc, setDesc] = useState(reward ? (reward.desc || '') : '');
  const [reqs, setReqs] = useState(reward ? (reward.requirements || []) : []);
  const [addingReq, setAddingReq] = useState(null); // 'activity' | 'streak' | 'quest' | null

  // For activity picker
  const [reqActivity, setReqActivity] = useState('');
  const [reqActivityCount, setReqActivityCount] = useState(10);
  // For streak picker
  const [reqStreakDays, setReqStreakDays] = useState(7);
  // For quest picker
  const [reqQuest, setReqQuest] = useState('');

  const activities = state ? (state.activities || []) : [];
  const quests = [
    ...(state ? (state.quests || []) : []),
    ...(state ? (state.archivedQuests || []) : []),
  ];

  function addReq() {
    if (addingReq === 'activity') {
      const act = activities.find(a => a.id === reqActivity);
      if (!act) return;
      setReqs(r => [...r, { type: 'activity', activityId: act.id, activityName: act.name, count: reqActivityCount }]);
    } else if (addingReq === 'streak') {
      setReqs(r => [...r, { type: 'streak', days: reqStreakDays }]);
    } else if (addingReq === 'quest') {
      const q = quests.find(q => q.id === reqQuest);
      if (!q) return;
      setReqs(r => [...r, { type: 'quest', questId: q.id, questName: q.name }]);
    }
    setAddingReq(null);
    setReqActivity(''); setReqQuest('');
  }

  function removeReq(i) { setReqs(r => r.filter((_, idx) => idx !== i)); }

  function handleSave() {
    if (!name.trim()) return;
    onSave({ id: reward ? reward.id : undefined, name: name.trim(), cost, desc: desc.trim(), requirements: reqs });
  }

  const REQ_LABELS = {
    activity: '🏃 Activity count',
    streak: '🔥 Streak days',
    quest: '🎯 Quest completed',
  };

  return h(ModalShell, { title: reward ? 'Edit reward' : 'New reward', onClose, width: 500 },
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
      h('div', null,
        h('label', { style: styles.label }, 'Reward name'),
        h('input', { value: name, onChange: e => setName(e.target.value), style: styles.input, placeholder: 'e.g. New TV' })
      ),
      h('div', null,
        h('label', { style: styles.label }, 'Description (optional)'),
        h('textarea', { value: desc, onChange: e => setDesc(e.target.value), style: { ...styles.input, minHeight: 48 }, placeholder: 'What does this reward mean to you?' })
      ),

      // Requirements section
      h('div', null,
        h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 } },
          h('label', { style: { ...styles.label, marginBottom: 0 } }, 'Requirements to unlock'),
          h('div', { style: { fontSize: 11, color: '#4a4868' } }, 'Any combination — all must be met')
        ),

        // Gold cost (always shown, can be 0)
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#0d0d1a', borderRadius: 4, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 6 } },
          h('span', { style: { fontSize: 13 } }, '🪙'),
          h('span', { style: { fontSize: 12, color: '#9896b0', flex: 1 } }, 'Gold coins'),
          h('input', { type: 'number', min: 0, value: cost, onChange: e => setCost(parseInt(e.target.value) || 0), style: { ...styles.input, width: 80, textAlign: 'right', padding: '4px 8px', fontSize: 13 } })
        ),

        // Existing additional requirements
        reqs.map((req, i) =>
          h('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#0d0d1a', borderRadius: 4, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 6 } },
            h('span', { style: { fontSize: 12, flex: 1, color: '#9896b0' } },
              req.type === 'activity' ? `🏃 ${req.count}× ${req.activityName}` :
              req.type === 'streak'   ? `🔥 ${req.days}-day streak` :
              req.type === 'quest'    ? `🎯 Complete: ${req.questName}` : ''
            ),
            h('button', { className: 'rpg-btn', style: { ...styles.iconBtn, width: 24, height: 24 }, onClick: () => removeReq(i) }, h(Icon, { name: 'x', size: 10 }))
          )
        ),

        // Add requirement buttons
        !addingReq && h('div', { style: { display: 'flex', gap: 6, marginTop: 6 } },
          ['activity', 'streak', 'quest'].map(type =>
            h('button', { key: type, className: 'rpg-btn', onClick: () => setAddingReq(type), style: { ...styles.secondaryBtn, flex: 1, justifyContent: 'center', fontSize: 11, padding: '6px 0' } },
              `+ ${REQ_LABELS[type]}`
            )
          )
        ),

        // Inline requirement builder
        addingReq === 'activity' && h('div', { style: { marginTop: 8, padding: '10px', background: '#0d0d1a', borderRadius: 4, border: '1px solid rgba(167,139,250,0.2)', display: 'flex', flexDirection: 'column', gap: 8 } },
          h('select', { value: reqActivity, onChange: e => setReqActivity(e.target.value), style: styles.input },
            h('option', { value: '' }, '— Choose activity —'),
            activities.map(a => h('option', { key: a.id, value: a.id }, a.name))
          ),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            h('span', { style: { fontSize: 12, color: '#9896b0' } }, 'Times logged:'),
            h('input', { type: 'number', min: 1, value: reqActivityCount, onChange: e => setReqActivityCount(parseInt(e.target.value) || 1), style: { ...styles.input, width: 80 } })
          ),
          h('div', { style: { display: 'flex', gap: 6 } },
            h('button', { className: 'rpg-btn', style: { ...styles.secondaryBtn, flex: 1, justifyContent: 'center' }, onClick: () => setAddingReq(null) }, 'Cancel'),
            h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, flex: 1, justifyContent: 'center' }, onClick: addReq, disabled: !reqActivity }, 'Add')
          )
        ),

        addingReq === 'streak' && h('div', { style: { marginTop: 8, padding: '10px', background: '#0d0d1a', borderRadius: 4, border: '1px solid rgba(251,146,60,0.2)', display: 'flex', flexDirection: 'column', gap: 8 } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            h('span', { style: { fontSize: 12, color: '#9896b0' } }, 'Consistency streak (days):'),
            h('input', { type: 'number', min: 1, value: reqStreakDays, onChange: e => setReqStreakDays(parseInt(e.target.value) || 1), style: { ...styles.input, width: 80 } })
          ),
          h('div', { style: { display: 'flex', gap: 6 } },
            h('button', { className: 'rpg-btn', style: { ...styles.secondaryBtn, flex: 1, justifyContent: 'center' }, onClick: () => setAddingReq(null) }, 'Cancel'),
            h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, flex: 1, justifyContent: 'center' }, onClick: addReq }, 'Add')
          )
        ),

        addingReq === 'quest' && h('div', { style: { marginTop: 8, padding: '10px', background: '#0d0d1a', borderRadius: 4, border: '1px solid rgba(129,140,248,0.2)', display: 'flex', flexDirection: 'column', gap: 8 } },
          h('select', { value: reqQuest, onChange: e => setReqQuest(e.target.value), style: styles.input },
            h('option', { value: '' }, '— Choose quest —'),
            quests.map(q => h('option', { key: q.id, value: q.id }, q.name + (q.archivedAt ? ' ✓' : '')))
          ),
          h('div', { style: { display: 'flex', gap: 6 } },
            h('button', { className: 'rpg-btn', style: { ...styles.secondaryBtn, flex: 1, justifyContent: 'center' }, onClick: () => setAddingReq(null) }, 'Cancel'),
            h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, flex: 1, justifyContent: 'center' }, onClick: addReq, disabled: !reqQuest }, 'Add')
          )
        )
      ),

      h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, justifyContent: 'center', padding: '10px 0' }, onClick: handleSave }, h(Icon, { name: 'check', size: 14 }), ' Save reward')
    )
  );
}

// Helper: normalize challenges to [{name, tier}] format. Handles:
// - Old format: ['string', 'string', 'string'] → assigns default tiers
// - New format: [{name, tier}, ...] → passes through
// - DEFAULT_BOSSES (string arrays) → assigns default tiers
function normalizeChallenges(raw, isMiniGate) {
  const defaultTiers = isMiniGate ? ['C', 'B', 'A'] : ['B', 'A', 'S'];
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map((c, i) => {
    if (typeof c === 'string') {
      return { name: c, tier: defaultTiers[i] || defaultTiers[defaultTiers.length - 1] };
    }
    if (c && typeof c === 'object' && c.name) {
      return { name: c.name, tier: c.tier || defaultTiers[i] || 'B' };
    }
    return { name: '', tier: defaultTiers[i] || 'B' };
  }).filter(c => c.name && c.name.trim());
}

function BossModal({ domainKey, level, customBosses, economy, onClose, onComplete }) {
  const d = DOMAINS[domainKey];
  const isMiniGate = level % 10 !== 0;

  // Get custom or default challenges, normalized to [{name, tier}]
  const custom = customBosses && customBosses[domainKey] && customBosses[domainKey][level];
  const defaultRaw = (DEFAULT_BOSSES[domainKey] && DEFAULT_BOSSES[domainKey][level]) || ['Complete a milestone challenge'];
  const challenges = custom && custom.length > 0
    ? normalizeChallenges(custom, isMiniGate)
    : normalizeChallenges(defaultRaw, isMiniGate);

  const base = isMiniGate
    ? eco({ economy }, 'miniGateCoinBase')
    : eco({ economy }, 'bossCoinBase');

  const multipliers = isMiniGate
    ? (economy && economy.miniGateTierMultipliers) || DEFAULT_ECONOMY.miniGateTierMultipliers
    : (economy && economy.gateTierMultipliers) || DEFAULT_ECONOMY.gateTierMultipliers;

  const tierColors = { S: '#fbbf24', A: '#34d399', B: '#60a5fa', C: '#9ca3af' };
  const [selectedIdx, setSelectedIdx] = useState(null);

  return h(ModalShell, { title: `${d.name} — ${isMiniGate ? 'mini gate' : 'boss battle'}: level ${level}`, onClose, width: 460 },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 } },
      h('div', { style: { ...styles.bossIcon, background: d.dark900, borderColor: d.dark600, width: 40, height: 40 } },
        h(Icon, { name: 'trophy', size: 20, color: '#fbbf24' })
      ),
      h('div', { style: { fontSize: 13, color: '#9ca3af' } },
        'Pick which challenge you completed. The tier and coin reward are shown on each.'
      )
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 } },
      challenges.map((ch, i) => {
        const mult = (multipliers && multipliers[ch.tier]) || 1.0;
        const coinReward = Math.round(base * mult);
        const color = tierColors[ch.tier] || '#9ca3af';
        const isSelected = selectedIdx === i;
        return h('button', {
          key: i,
          className: 'rpg-btn',
          onClick: () => setSelectedIdx(i),
          style: {
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
            background: isSelected ? hexToRgba(color, 0.12) : '#0e0e14',
            border: `2px solid ${isSelected ? color : '#2a2a35'}`,
            borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
            textAlign: 'left',
          },
        },
          h('div', { style: {
            fontWeight: 800, fontSize: 15, color, minWidth: 28,
            background: hexToRgba(color, 0.15), borderRadius: 6, padding: '4px 8px', textAlign: 'center',
          }}, ch.tier),
          h('div', { style: { flex: 1 } },
            h('div', { style: { fontSize: 13.5, fontWeight: 600, color: '#e5e7eb' } }, ch.name)
          ),
          h('div', { style: { fontSize: 13, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 } },
            h(Icon, { name: 'coins', size: 13, color: '#fbbf24' }),
            ` ${coinReward}`
          )
        );
      })
    ),
    h('button', {
      className: 'rpg-btn',
      disabled: selectedIdx === null,
      style: {
        ...styles.primaryBtn, width: '100%', justifyContent: 'center', padding: '11px 0',
        background: selectedIdx !== null ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
        borderColor: selectedIdx !== null ? '#fbbf24' : '#2a2a35',
        color: selectedIdx !== null ? '#fbbf24' : '#5e5e6b',
        cursor: selectedIdx !== null ? 'pointer' : 'not-allowed',
        opacity: selectedIdx !== null ? 1 : 0.6,
      },
      onClick: () => {
        if (selectedIdx !== null) {
          onComplete(challenges[selectedIdx].tier);
        }
      },
    },
      h(Icon, { name: 'trophy', size: 14 }),
      selectedIdx !== null
        ? ` Complete — ${challenges[selectedIdx].tier} tier`
        : ' Select a challenge first'
    )
  );
}

// ---------- Smart Reminders ----------

function NeglectedDomainsReminder({ state, economy, dismissedReminders, onDismiss }) {
  const thresholdDays = eco({ economy }, 'reminderThresholdDays');
  if (!thresholdDays || thresholdDays <= 0) return null;

  const now = Date.now();
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;

  const neglected = DOMAIN_KEYS.filter(k => {
    if (dismissedReminders.includes(k)) return false;
    // Find the most recent day this domain had any XP
    const logs = state.dailyLogs || {};
    const lastActive = Object.entries(logs)
      .filter(([, log]) => (log[k] || 0) > 0)
      .map(([dateStr]) => new Date(dateStr).getTime())
      .sort((a, b) => b - a)[0];
    if (!lastActive) {
      // Never active — only remind if account has been around for threshold days
      const accountAge = now - (state.createdAt || now);
      return accountAge > thresholdMs;
    }
    return (now - lastActive) > thresholdMs;
  });

  if (neglected.length === 0) return null;

  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 4 } },
    neglected.map(k => {
      const d = DOMAINS[k];
      return h('div', { key: k, style: {
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        background: hexToRgba(d.color, 0.06), border: `1px solid ${hexToRgba(d.color, 0.25)}`,
        borderRadius: 10,
      }},
        h(Icon, { name: d.icon, size: 14, color: d.color }),
        h('span', { style: { flex: 1, fontSize: 12.5, color: '#c4c4ce' } },
          `${d.name} hasn't received any XP in ${thresholdDays}+ days.`
        ),
        h('button', {
          className: 'rpg-btn',
          onClick: () => onDismiss && onDismiss(k),
          style: { background: 'none', border: 'none', color: '#7c7c8a', cursor: 'pointer', fontSize: 16, padding: '0 4px' },
          title: 'Dismiss for this session',
        }, '×')
      );
    })
  );
}

// ---------- Domain Balance Indicator ----------

function DomainBalanceIndicator({ state, economy }) {
  const dailyGoal = eco({ economy }, 'dailyGoal');
  // Use last 7 days of data to measure balance
  const today = todayKey();
  const last7 = [];
  const d = new Date();
  for (let i = 0; i < 7; i++) {
    last7.push(dateKey(new Date(d.getTime() - i * 86400000)));
  }

  const totals = {};
  DOMAIN_KEYS.forEach(k => { totals[k] = 0; });
  last7.forEach(dk => {
    const log = state.dailyLogs[dk];
    if (!log) return;
    DOMAIN_KEYS.forEach(k => { totals[k] += log[k] || 0; });
  });

  const values = DOMAIN_KEYS.map(k => totals[k]);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values);
  const spread = maxVal - minVal;
  const avgVal = values.reduce((a, b) => a + b, 0) / values.length || 0;
  const hasActivity = values.some(v => v > 0);

  // Balance score: lower spread relative to average = more balanced
  const balanceRatio = avgVal > 0 ? spread / avgVal : 0;
  const label = balanceRatio < 0.4 ? 'Highly balanced' : balanceRatio < 1.0 ? 'Balanced' : balanceRatio < 2.0 ? 'Somewhat lopsided' : 'Lopsided';
  const labelColor = balanceRatio < 0.4 ? '#86efac' : balanceRatio < 1.0 ? '#fbbf24' : balanceRatio < 2.0 ? '#fb923c' : '#f09595';

  if (!hasActivity) return null; // don't show if no data yet

  const consequenceText = balanceRatio < 0.4
    ? 'Your character is developing evenly across all domains.'
    : balanceRatio < 1.0
    ? 'Slightly uneven — keep an eye on your weaker domains.'
    : 'Neglected domains level slower and boss gates stay locked longer.';

  return h('section', null,
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 } },
      h(SectionLabel, { text: 'HRCF Balance (7 days)' }),
      h('div', null,
        h('span', { style: { fontSize: 12, fontWeight: 700, color: labelColor } }, label),
      )
    ),
    h('div', { style: { display: 'flex', gap: 8 } },
      DOMAIN_KEYS.map(k => {
        const dom = DOMAINS[k];
        const val = totals[k];
        const pct = Math.round((val / maxVal) * 100);
        return h('div', { key: k, style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 } },
          h('div', { style: { width: '100%', height: 56, background: '#0e0e14', borderRadius: 8, position: 'relative', overflow: 'hidden' } },
            h('div', { style: { position: 'absolute', bottom: 0, left: 0, right: 0, height: `${Math.max(pct, 4)}%`, background: hexToRgba(dom.color, 0.5), borderRadius: '8px 8px 0 0', transition: 'height 0.4s ease' } })
          ),
          h(Icon, { name: dom.icon, size: 13, color: dom.color }),
          h('div', { style: { fontSize: 10, color: '#7c7c8a' } }, dom.name.slice(0, 3))
        );
      })
    ),
    h('div', { style: { fontSize: 11.5, color: '#4a4868', marginTop: 8 } }, consequenceText)
  );
}

// ---------- Active Challenge Card (#10) ----------

function ActiveChallengeCard({ challenge, onComplete, onDismiss }) {
  const d = DOMAINS[challenge.domain] || DOMAINS.health;
  const isCompleted = !!challenge.completedAt;
  const isRevealed = !!challenge.revealed;
  const tier = challenge.tier || 'B';
  const tierColors = { S: '#fbbf24', A: '#34d399', B: '#60a5fa', C: '#9ca3af' };
  const tc = tierColors[tier] || '#9ca3af';

  // #11 Hours remaining in the day
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const hoursLeft = Math.round((endOfDay - now) / (1000 * 60 * 60));
  const isUrgent = hoursLeft <= 4;

  return h('section', null,
    h('div', { style: {
      background: `linear-gradient(135deg, ${hexToRgba(d.color, 0.12)}, ${hexToRgba(d.color, 0.04)})`,
      border: `1px solid ${isUrgent ? 'rgba(201,168,76,0.5)' : hexToRgba(d.color, 0.35)}`,
      borderRadius: 12, padding: '14px 16px', position: 'relative',
      ...(isUrgent ? { boxShadow: '0 0 12px rgba(201,168,76,0.1)' } : {}),
    }},
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 } },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h(Icon, { name: 'zap', size: 14, color: d.color }),
          h('span', { style: { fontSize: 11, fontWeight: 700, color: d.color, textTransform: 'uppercase', letterSpacing: 1 } },
            isCompleted ? 'Challenge complete!' : 'Daily challenge'
          ),
          h('span', { style: { fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: hexToRgba(tc, 0.15), color: tc, border: `1px solid ${hexToRgba(tc, 0.4)}` } }, `Tier ${tier}`)
        ),
        !isCompleted && h('div', { style: { fontSize: 11, fontWeight: 600, color: isUrgent ? '#c9a84c' : '#4a4868', display: 'flex', alignItems: 'center', gap: 4 } },
          isUrgent && h(Icon, { name: 'flame', size: 12, color: '#c9a84c' }),
          `${hoursLeft}h left`
        )
      ),
      h('div', { style: { fontSize: 15, fontWeight: 700, color: '#f4f1ea', marginBottom: 4 } }, challenge.name),
      challenge.desc && h('div', { style: { fontSize: 13, color: '#9ca3af', marginBottom: 10 } }, challenge.desc),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
        isCompleted && isRevealed
          ? h('div', { style: { display: 'flex', gap: 16, alignItems: 'center' } },
              h('div', { style: { fontSize: 13, fontWeight: 700, color: d.color } }, `+${challenge.xp} XP`),
              h('div', { style: { fontSize: 13, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 } },
                h(Icon, { name: 'coins', size: 13, color: '#fbbf24' }), ` +${challenge.coins}`
              ),
              h('button', { className: 'rpg-btn', style: styles.iconBtnDanger, onClick: onDismiss, title: 'Dismiss' },
                h(Icon, { name: 'x', size: 12 })
              )
            )
          : h('div', { style: { display: 'flex', gap: 8, alignItems: 'center', width: '100%' } },
              h('div', { style: { fontSize: 12, color: '#7c7c8a' } }, 'Reward: '),
              h('div', { style: { fontSize: 13, fontWeight: 700, color: '#7c7c8a' } }, '??? XP + ??? coins'),
              h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, marginLeft: 'auto', padding: '6px 14px', background: hexToRgba(d.color, 0.15), borderColor: d.color, color: d.color }, onClick: onComplete },
                h(Icon, { name: 'check', size: 13 }), ' Complete'
              )
            )
      )
    )
  );
}

// ---------- Floating action button (quick log) ----------

function FAB({ onClick }) {
  return h('button', {
    className: 'rpg-btn',
    onClick: () => { SoundEngine.play('click'); onClick(); },
    style: styles.fab,
    title: 'Quick log',
    'aria-label': 'Quick log',
    'data-tutorial-id': 'quick-log-fab',
  }, h(Icon, { name: 'plus', size: 26, color: 'white' }));
}

function QuickLogSheet({ activities, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const sorted = [...activities]
    .sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return a.name.localeCompare(b.name);
    })
    .filter(a => !search.trim() || a.name.toLowerCase().includes(search.toLowerCase()) || (a.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase())));

  return h('div', { style: styles.modalOverlay, onClick: onClose },
    h('div', { style: styles.bottomSheet, onClick: e => e.stopPropagation() },
      h('div', { style: styles.modalHeader },
        h('span', { style: styles.modalTitle }, 'Quick log'),
        h('button', { className: 'rpg-btn', style: styles.iconBtn, onClick: onClose }, h(Icon, { name: 'x', size: 14 }))
      ),
      h('div', { style: { padding: '10px 12px 4px' } },
        h('input', { value: search, onChange: e => setSearch(e.target.value), placeholder: 'Search activities…', style: styles.input })
      ),
      h('div', { style: { padding: '8px 12px 12px', maxHeight: '55vh', overflowY: 'auto' } },
        sorted.length === 0
          ? h(EmptyState, { text: activities.length === 0 ? 'No activities yet. Create one in the Activities tab first.' : 'No activities match that search.' })
          : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
              sorted.map(act => {
                const d = DOMAINS[act.domain];
                return h('button', {
                  key: act.id,
                  className: 'rpg-btn',
                  onClick: () => onSelect(act),
                  style: {
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 12px', borderRadius: 4,
                    background: 'transparent', border: '1px solid transparent',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.12s, border-color 0.12s',
                  },
                  onMouseEnter: e => { e.currentTarget.style.background = '#1a1a2e'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; },
                  onMouseLeave: e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; },
                },
                  h('div', { style: { width: 4, height: 4, borderRadius: '50%', background: d.color, flexShrink: 0 } }),
                  h('div', { style: { flex: 1 } },
                    h('div', { style: { fontSize: 13, fontWeight: 600, color: '#eceaf6' } },
                      act.name,
                      act.favorite && h('span', { style: { color: '#c9a84c', marginLeft: 5, fontSize: 11 } }, '★')
                    ),
                    h('div', { style: { fontSize: 11, color: '#9896b0', marginTop: 1 } }, `${d.name} · ${act.subcat}`)
                  ),
                  h(Icon, { name: 'plus', size: 14, color: '#4a4868' })
                );
              })
            )
      )
    )
  );
}

// ---------- Streak calendar ----------

function PowerValuesPopup({ values, onClose, onEdit }) {
  return h(ModalShell, { title: 'Power Values', onClose, width: 380 },
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
      h('div', { style: { fontSize: 12, color: C.textMid, marginBottom: 4 } },
        'Your three highest personal values — the principles that anchor every decision.'
      ),
      values.map((v, i) =>
        h('div', { key: i, style: { display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 14px', background: C.void, borderRadius: 4, border: '1px solid ' + C.borderDim } },
          h('div', { style: { fontSize: 32, lineHeight: 1, flexShrink: 0 } }, v.symbol),
          h('div', { style: { flex: 1 } },
            h('div', { style: { fontSize: 14, fontWeight: 700, color: C.textHi, marginBottom: v.desc ? 4 : 0 } }, v.name || '—'),
            v.desc && h('div', { style: { fontSize: 12.5, color: C.textMid, lineHeight: 1.5 } }, v.desc)
          )
        )
      ),
      h('button', {
        className: 'rpg-btn',
        onClick: onEdit,
        style: { ...styles.secondaryBtn, width: '100%', justifyContent: 'center', padding: '8px 0', marginTop: 4 },
      }, h(Icon, { name: 'edit2', size: 12 }), ' Edit values')
    )
  );
}

function StreakCalendarModal({ mode, dailyLogs, activityLog, dailyQuestPlans, economy, onClose }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null); // 'YYYY-MM-DD' | null
  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = viewDate.getDay();
  const todayKeyStr = dateKey(now);
  const dailyGoal = eco({ economy }, 'dailyGoal');
  const consistencyMin = eco({ economy }, 'consistencyMin');

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const log = dailyLogs[key];
    const status = dayStatus(log, dailyGoal, consistencyMin);
    cells.push({ day: d, status, key, isToday: key === todayKeyStr, hasData: !!log });
  }

  function cellColor(status, isToday) {
    if (mode === 'power') {
      if (status === 'power') return { bg: '#fbbf24', fg: '#13131a', border: '#fbbf24' };
      if (status === 'consistency') return { bg: 'rgba(251,191,36,0.15)', fg: '#fbbf24', border: 'rgba(251,191,36,0.3)' };
      if (status === 'partial') return { bg: 'rgba(156,163,175,0.1)', fg: '#9ca3af', border: '#2a2a35' };
      return { bg: 'transparent', fg: '#5e5e6b', border: '#22222e' };
    }
    if (status === 'consistency' || status === 'power') return { bg: '#22c55e', fg: '#13131a', border: '#22c55e' };
    if (status === 'partial') return { bg: 'rgba(156,163,175,0.1)', fg: '#9ca3af', border: '#2a2a35' };
    return { bg: 'transparent', fg: '#5e5e6b', border: '#22222e' };
  }

  // Build day detail from dailyLogs + activityLog entries for that day
  const selectedLog = selectedDay ? (dailyLogs[selectedDay] || null) : null;
  const selectedActivities = selectedDay
    ? (activityLog || []).filter(l => {
        const d = new Date(l.timestamp);
        return dateKey(d) === selectedDay;
      })
    : [];

  const dayLabels = ['S','M','T','W','T','F','S'];
  const title = mode === 'power' ? 'Power streak' : 'Day streak';

  return h(ModalShell, { title, onClose, width: 680 },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      h('button', { className: 'rpg-btn', style: styles.iconBtn, onClick: () => { setMonthOffset(o => o - 1); setSelectedDay(null); } },
        h(Icon, { name: 'chevronLeft', size: 14 })
      ),
      h('span', { style: { fontSize: 14, fontWeight: 600, color: '#f4f1ea' } }, monthName),
      h('button', {
        className: 'rpg-btn',
        style: { ...styles.iconBtn, opacity: monthOffset >= 0 ? 0.3 : 1, cursor: monthOffset >= 0 ? 'not-allowed' : 'pointer' },
        disabled: monthOffset >= 0,
        onClick: () => { setMonthOffset(o => Math.min(0, o + 1)); setSelectedDay(null); },
      },
        h(Icon, { name: 'chevronRight', size: 14 })
      )
    ),
    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 } },
      dayLabels.map((d, i) => h('div', { key: i, style: { textAlign: 'center', fontSize: 10, color: '#7c7c8a', fontWeight: 600, padding: '4px 0' } }, d))
    ),
    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 } },
      cells.map((c, i) => {
        if (!c) return h('div', { key: `e${i}` });
        const colors = cellColor(c.status, c.isToday);
        const isSelected = selectedDay === c.key;
        return h('button', {
          key: c.key,
          className: 'rpg-btn',
          onClick: () => setSelectedDay(isSelected ? null : c.key),
          style: {
            aspectRatio: '1', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600,
            background: isSelected ? 'rgba(167,139,250,0.25)' : colors.bg,
            color: isSelected ? '#c4b5fd' : colors.fg,
            border: `1px solid ${isSelected ? '#a78bfa' : colors.border}`,
            borderRadius: 8,
            outline: c.isToday ? '2px solid #a78bfa' : 'none',
            outlineOffset: -2,
            cursor: c.hasData ? 'pointer' : 'default',
          },
        }, c.day);
      })
    ),

    // Day detail panel — shown when a day is selected
    selectedDay && h('div', { style: { marginTop: 16, background: '#0d0d1a', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 6, padding: '14px 16px' } },
      h('div', { style: { fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#a78bfa', marginBottom: 10 } },
        new Date(selectedDay + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
      ),
      selectedLog
        ? h('div', null,
            // Mission note for this day (if one was written)
            (() => {
              const plan = dailyQuestPlans && dailyQuestPlans[selectedDay];
              const note = plan && plan.note;
              if (!note) return null;
              return h('div', { style: { marginBottom: 12, padding: '8px 10px', background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 4 } },
                h('div', { style: { fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#a78bfa', marginBottom: 4 } }, '📝 Mission note'),
                h('div', { style: { fontSize: 12, color: '#9896b0', lineHeight: 1.5, whiteSpace: 'pre-wrap' } }, note)
              );
            })(),
            // Domain XP breakdown
            h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: selectedActivities.length > 0 ? 12 : 0 } },
              DOMAIN_KEYS.map(k => {
                const d = DOMAINS[k];
                const xp = selectedLog[k] || 0;
                if (xp === 0) return null;
                const pct = Math.min(100, Math.round((xp / dailyGoal) * 100));
                return h('div', { key: k },
                  h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 3 } },
                    h('span', { style: { fontSize: 11.5, color: d.color, fontWeight: 600 } }, d.name),
                    h('span', { style: { fontSize: 11.5, color: '#9896b0' } },
                      xp >= consistencyMin
                        ? h('span', { style: { color: '#5de8a0' } }, `${xp} XP ✓`)
                        : `${xp} XP`
                    )
                  ),
                  h('div', { style: { height: 4, background: '#0e0e14', borderRadius: 2, overflow: 'hidden' } },
                    h('div', { style: { height: '100%', width: `${pct}%`, background: d.color, borderRadius: 2 } })
                  )
                );
              })
            ),
            // Individual activity log entries for this day
            selectedActivities.length > 0 && h('div', null,
              h('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#4a4868', marginBottom: 6 } }, 'Activities logged'),
              h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
                selectedActivities.map(l =>
                  h('div', { key: l.id, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' } },
                    h('div', { style: { width: 4, height: 4, borderRadius: '50%', background: DOMAINS[l.domain]?.color || '#a78bfa', flexShrink: 0 } }),
                    h('span', { style: { flex: 1, fontSize: 12, color: '#eceaf6' } }, l.activityName),
                    l.detail && h('span', { style: { fontSize: 11, color: '#4a4868' } }, l.detail),
                    h('span', { style: { fontSize: 12, fontWeight: 700, color: DOMAINS[l.domain]?.color || '#a78bfa' } }, `+${l.xp}`)
                  )
                )
              )
            )
          )
        : h('div', { style: { fontSize: 12, color: '#4a4868', textAlign: 'center', padding: '8px 0' } },
            'No activity logged on this day.'
          )
    ),

    h('div', { style: { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5, color: '#9ca3af' } },
      mode === 'power'
        ? [
            h('div', { key: 1, style: { display: 'flex', alignItems: 'center', gap: 6 } }, h('span', { style: { width: 10, height: 10, background: '#fbbf24', borderRadius: 3, display: 'inline-block' } }), 'Power day'),
            h('div', { key: 2, style: { display: 'flex', alignItems: 'center', gap: 6 } }, h('span', { style: { width: 10, height: 10, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 3, display: 'inline-block' } }), 'Consistency day'),
            h('div', { key: 3, style: { display: 'flex', alignItems: 'center', gap: 6 } }, h('span', { style: { width: 10, height: 10, background: 'rgba(156,163,175,0.1)', border: '1px solid #2a2a35', borderRadius: 3, display: 'inline-block' } }), 'Some activity'),
          ]
        : [
            h('div', { key: 1, style: { display: 'flex', alignItems: 'center', gap: 6 } }, h('span', { style: { width: 10, height: 10, background: '#22c55e', borderRadius: 3, display: 'inline-block' } }), `Consistency met (all 4 ≥ ${consistencyMin} XP)`),
            h('div', { key: 2, style: { display: 'flex', alignItems: 'center', gap: 6 } }, h('span', { style: { width: 10, height: 10, background: 'rgba(156,163,175,0.1)', border: '1px solid #2a2a35', borderRadius: 3, display: 'inline-block' } }), 'Some activity'),
          ],
      h('div', { key: 'tap', style: { fontSize: 10.5, color: '#4a4868', marginTop: 2 } }, 'Tap any day to see what you logged')
    )
  );
}

// ---------- Reset confirmation ----------

function ResetConfirmModal({ target, onConfirm, onCancel }) {
  const isAll = target === 'all';
  const [typed, setTyped] = useState('');

  const domainName = isAll ? null : DOMAINS[target].name;
  const canConfirm = isAll ? typed.trim().toUpperCase() === 'RESET' : true;

  return h(ModalShell, {
    title: isAll ? 'Reset entire character?' : `Reset ${domainName}?`,
    onClose: onCancel,
    width: 420,
  },
    h('div', { style: { fontSize: 13, color: '#d1d5db', lineHeight: 1.6, marginBottom: 14 } },
      isAll
        ? 'This will permanently erase all your XP, levels, gold, streaks, completed bosses, and quest progress. Your activity templates, rewards, and custom bosses will be kept.'
        : `${domainName}'s XP and level will go back to 0. Boss completions and today's progress for this domain will be cleared. Other domains aren't affected.`
    ),
    h('div', { style: { fontSize: 12, color: '#f09595', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.25)', borderRadius: 8, padding: '10px 12px', marginBottom: 14 } },
      'This cannot be undone.'
    ),
    isAll && h('div', { style: { marginBottom: 14 } },
      h('label', { style: styles.label }, 'Type RESET to confirm'),
      h('input', {
        value: typed,
        onChange: e => setTyped(e.target.value),
        style: styles.input,
        autoFocus: true,
        placeholder: 'RESET',
      })
    ),
    h('div', { style: { display: 'flex', gap: 8 } },
      h('button', { className: 'rpg-btn', style: { ...styles.secondaryBtn, flex: 1, justifyContent: 'center', padding: '10px 0' }, onClick: onCancel }, 'Cancel'),
      h('button', {
        className: 'rpg-btn',
        disabled: !canConfirm,
        style: { ...styles.dangerBtn, flex: 1, justifyContent: 'center', padding: '10px 0', opacity: canConfirm ? 1 : 0.4, cursor: canConfirm ? 'pointer' : 'not-allowed' },
        onClick: () => { if (canConfirm) onConfirm(); },
      }, isAll ? 'Reset everything' : 'Reset')
    )
  );
}

// ---------- Boss editor ----------

function BossEditorModal({ domain, level, existing, onSave, onClose }) {
  const d = DOMAINS[domain];
  const isMiniGate = level % 10 !== 0;
  const allTiers = ['C', 'B', 'A', 'S'];
  const defaultTiers = isMiniGate ? ['C', 'B', 'A'] : ['B', 'A', 'S'];
  const defaultNames = (DEFAULT_BOSSES[domain] && DEFAULT_BOSSES[domain][level]) || ['', '', ''];
  const tierColors = { S: '#fbbf24', A: '#34d399', B: '#60a5fa', C: '#9ca3af' };

  // Parse existing data — handle both old string[] and new {name, tier}[] formats
  function parseInitial() {
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      return [0, 1, 2].map(i => ({ name: defaultNames[i] || '', tier: defaultTiers[i] || 'B' }));
    }
    return [0, 1, 2].map(i => {
      const item = existing[i];
      if (!item) return { name: defaultNames[i] || '', tier: defaultTiers[i] || 'B' };
      if (typeof item === 'string') return { name: item, tier: defaultTiers[i] || 'B' };
      return { name: item.name || '', tier: item.tier || defaultTiers[i] || 'B' };
    });
  }

  const [challenges, setChallenges] = useState(parseInitial);

  function updateName(i, val) {
    setChallenges(c => c.map((x, idx) => idx === i ? { ...x, name: val } : x));
  }

  function updateTier(i, tier) {
    setChallenges(c => c.map((x, idx) => idx === i ? { ...x, tier } : x));
  }

  function resetToDefaults() {
    setChallenges([0, 1, 2].map(i => ({ name: defaultNames[i] || '', tier: defaultTiers[i] || 'B' })));
  }

  return h(ModalShell, { title: `${d.name} — Level ${level} boss`, onClose, width: 500 },
    h('div', { style: { fontSize: 13, color: '#9ca3af', marginBottom: 14 } },
      'Define up to 3 challenges for this gate. Each challenge has its own tier — the tier determines the coin reward when that challenge is completed.'
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 } },
      challenges.map((ch, i) => {
        const color = tierColors[ch.tier] || '#9ca3af';
        return h('div', { key: i, style: { background: '#0e0e14', border: '1px solid #2a2a35', borderRadius: 10, padding: '12px 14px' } },
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 } },
            h('label', { style: { ...styles.label, margin: 0 } }, `Challenge ${i + 1}`),
            h('div', { style: { display: 'flex', gap: 4 } },
              allTiers.map(t => {
                const tc = tierColors[t];
                const isActive = ch.tier === t;
                return h('button', {
                  key: t,
                  className: 'rpg-btn',
                  onClick: () => updateTier(i, t),
                  style: {
                    width: 32, height: 28, borderRadius: 6,
                    fontSize: 12, fontWeight: 800,
                    border: `2px solid ${isActive ? tc : '#2a2a35'}`,
                    background: isActive ? hexToRgba(tc, 0.18) : 'transparent',
                    color: isActive ? tc : '#5e5e6b',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  },
                }, t);
              })
            )
          ),
          h('input', {
            value: ch.name,
            onChange: e => updateName(i, e.target.value),
            style: styles.input,
            placeholder: defaultNames[i] || 'Enter a challenge…',
          })
        );
      })
    ),
    h('div', { style: { display: 'flex', gap: 8 } },
      h('button', { className: 'rpg-btn', style: { ...styles.secondaryBtn, flex: 1, justifyContent: 'center', padding: '10px 0' }, onClick: resetToDefaults }, 'Reset to defaults'),
      h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, flex: 1, justifyContent: 'center', padding: '10px 0' }, onClick: () => onSave(challenges) },
        h(Icon, { name: 'check', size: 14 }), ' Save'
      )
    )
  );
}

// ---------- Settings view ----------

function BuyConfirmModal({ reward, canAfford, state, onConfirm, onCancel }) {
  const reqs = reward.requirements || [];

  function reqStatus(req) {
    if (!state) return { met: false, label: '…' };
    if (req.type === 'activity') {
      const activityExists = (state.activities || []).some(a => a.id === req.activityId);
      if (!activityExists) return { met: true, label: `${req.activityName} (removed from library)`, skipped: true };
      const count = (state.activityLog || []).filter(l => l.activityName === req.activityName).length;
      return { met: count >= req.count, label: `🏃 ${req.activityName}: ${count} / ${req.count} times` };
    }
    if (req.type === 'streak') {
      const current = state.consistencyStreak || 0;
      return { met: current >= req.days, label: `🔥 Streak: ${current} / ${req.days} days` };
    }
    if (req.type === 'quest') {
      const questExists = (state.quests || []).some(q => q.id === req.questId) || (state.archivedQuests || []).some(q => q.id === req.questId);
      if (!questExists) return { met: true, label: `${req.questName} (removed)`, skipped: true };
      const completed = (state.archivedQuests || []).some(q => q.id === req.questId);
      return { met: completed, label: `🎯 ${req.questName}: ${completed ? 'completed ✓' : 'not yet done'}` };
    }
    return { met: true, label: '' };
  }

  return h(ModalShell, { title: 'Buy ticket?', onClose: onCancel, width: 420 },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 } },
      h('div', { style: { ...styles.bossIcon, background: 'rgba(167,139,250,0.15)', borderColor: 'rgba(167,139,250,0.35)', width: 40, height: 40 } }, h(Icon, { name: 'gift', size: 18, color: '#a78bfa' })),
      h('div', { style: { flex: 1, minWidth: 0 } },
        h('div', { style: { fontWeight: 700, fontSize: 14, color: '#f4f1ea' } }, reward.name),
        reward.desc && h('div', { style: { fontSize: 12, color: '#9ca3af', marginTop: 2 } }, reward.desc)
      )
    ),

    // Requirements breakdown
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 } },
      // Gold cost row
      (reward.cost || 0) > 0 && h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#0d0d1a', borderRadius: 4 } },
        h('span', { style: { fontSize: 12, color: '#9ca3af' } }, `🪙 ${reward.cost} gold`),
        h('span', { style: { fontSize: 12, fontWeight: 700, color: (state.gold || 0) >= (reward.cost || 0) ? '#5de8a0' : '#e05c5c' } },
          `${state.gold || 0} available ${(state.gold || 0) >= (reward.cost || 0) ? '✓' : '✗'}`
        )
      ),
      // Other requirements
      reqs.map((req, i) => {
        const { met, label, skipped } = reqStatus(req);
        return h('div', { key: i, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#0d0d1a', borderRadius: 4, opacity: skipped ? 0.5 : 1 } },
          h('span', { style: { fontSize: 12, color: '#9ca3af' } }, label),
          h('span', { style: { fontSize: 13, color: met ? '#5de8a0' : '#e05c5c' } }, met ? '✓' : '✗')
        );
      }),
      reqs.length === 0 && (reward.cost || 0) === 0 && h('div', { style: { fontSize: 12, color: '#4a4868', padding: '6px 0' } }, 'No requirements — free to claim')
    ),

    !canAfford && h('div', { style: { fontSize: 12, color: '#f09595', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.25)', borderRadius: 4, padding: '8px 12px', marginBottom: 12 } },
      'Requirements not yet met.'
    ),
    h('div', { style: { display: 'flex', gap: 8 } },
      h('button', { className: 'rpg-btn', style: { ...styles.secondaryBtn, flex: 1, justifyContent: 'center', padding: '10px 0' }, onClick: onCancel }, 'Cancel'),
      h('button', {
        className: 'rpg-btn',
        disabled: !canAfford,
        style: { ...styles.primaryBtn, flex: 1, justifyContent: 'center', padding: '10px 0', opacity: canAfford ? 1 : 0.4, cursor: canAfford ? 'pointer' : 'not-allowed' },
        onClick: () => canAfford && onConfirm(),
      }, h(Icon, { name: 'check', size: 14 }), ' Confirm')
    )
  );
}

function SettingsView({ state, onResetDomain, onResetAll, onEditBoss, onToggleGate, onSaveEconomy, onSaveChallengeLibrary, onSaveSpawnChance, onSavePowerValues, onSetDailyQuestLock, onOpenTutorial, onSetDifficulty, onSaveSoundSettings, onSaveTheme }) {
  const [expandedDomain, setExpandedDomain] = useState(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const ss = state.soundSettings || { enabled: true, volume: 0.6, style: 'fantasy' };

  const PRESETS = [
    { id: 'easy',      label: 'Relaxed',   desc: 'Lower daily goals, more forgiving streak rules', icon: '🌿' },
    { id: 'balanced',  label: 'Balanced',  desc: 'Default settings, good for most people', icon: '⚖️' },
    { id: 'ambitious', label: 'Ambitious', desc: 'Harder goals, longer streak lock, fewer coins', icon: '⚔️' },
  ];

  const pv = (state.powerValues || []).filter(v => v && v.name);
  const pvSummary = pv.length > 0
    ? pv.map(v => `${v.symbol} ${v.name}`).join(' · ')
    : 'Not set yet';

  return h('div', { style: { animation: 'fadeIn 0.3s ease' } },

    // ── Help ──────────────────────────────────────────────
    h('section', { style: { marginBottom: 20 } },
      h(SectionLabel, { text: 'Help' }),
      h('button', {
        className: 'rpg-btn',
        onClick: onOpenTutorial,
        'data-tutorial-id': 'settings-tutorial-btn',
        style: { ...styles.secondaryBtn, width: '100%', justifyContent: 'center', padding: '11px 0' },
      }, '? Replay guide')
    ),

    // ── Difficulty ────────────────────────────────────────
    h('section', { style: { marginBottom: 20 } },
      h(SectionLabel, { text: 'Difficulty' }),
      h('div', { style: { display: 'flex', gap: 8 } },
        PRESETS.map(p =>
          h('button', {
            key: p.id, className: 'rpg-btn',
            onClick: () => onSetDifficulty(p.id),
            style: {
              flex: 1, padding: '12px 10px', borderRadius: 4, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, textAlign: 'center',
              background: (state.difficultyPreset || 'balanced') === p.id ? C.accentDim : C.raised,
              border: `1px solid ${(state.difficultyPreset || 'balanced') === p.id ? C.accent : C.borderDim}`,
              transition: 'all 0.15s',
            },
          },
            h('span', { style: { fontSize: 20 } }, p.icon),
            h('span', { style: { fontSize: 12, fontWeight: 700, color: (state.difficultyPreset || 'balanced') === p.id ? C.accent : C.textHi } }, p.label),
            h('span', { style: { fontSize: 10, color: C.textLo, lineHeight: 1.3 } }, p.desc)
          )
        )
      )
    ),

    // ── Power Values — collapsible with glanceable summary ─
    h(PowerValuesSection, {
      state, onSave: onSavePowerValues,
      headerExtra: h('span', { style: { fontSize: 11, color: C.textLo, marginLeft: 6, fontStyle: 'italic' } }, pvSummary)
    }),

    // ── SFX on/off — compact row with speaker icon ───────
    h('section', { style: { marginBottom: 20 } },
      h('label', { style: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', background: C.raised, border: '1px solid ' + C.borderDim, borderRadius: 4 } },
        h('span', { style: { fontSize: 16, lineHeight: 1, flexShrink: 0 } }, '🔊'),
        h('span', { style: { flex: 1, fontSize: 12.5, color: C.textMid } }, 'Sound effects'),
        h('input', {
          type: 'checkbox',
          checked: ss.enabled !== false,
          onChange: e => onSaveSoundSettings({ enabled: e.target.checked }),
          style: { width: 15, height: 15, accentColor: C.accent, cursor: 'pointer', flexShrink: 0 },
        })
      )
    ),

    // ── Advanced Settings (paywall zone) ─────────────────
    h('section', { style: { marginBottom: 24 } },
      h('button', {
        className: 'rpg-btn',
        onClick: () => setAdvancedOpen(o => !o),
        style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: C.raised, border: `1px solid ${state.advancedSettingsUnlocked ? 'rgba(167,139,250,0.3)' : C.borderDim}`, borderRadius: 4, color: C.textHi },
      },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h('span', null, state.advancedSettingsUnlocked ? '🔓' : '🔒'),
          h('span', { style: { fontSize: 13, fontWeight: 600 } }, 'Advanced Settings'),
          !state.advancedSettingsUnlocked && h('span', { style: { fontSize: 10, color: C.textLo } }, '— unlocks at combined rank 10')
        ),
        h('div', { style: { transform: advancedOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' } },
          h(Icon, { name: 'chevronRight', size: 14, color: C.textLo })
        )
      ),
      advancedOpen && h('div', { style: { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 } },
        !state.advancedSettingsUnlocked && h('div', { style: { fontSize: 12, color: C.textLo, padding: '8px 12px', background: C.void, borderRadius: 4, border: '1px solid ' + C.borderDim } },
          'Preview mode — these settings unlock permanently at combined rank 10.'
        ),

        // Theme
        h('div', null,
          h(SectionLabel, { text: 'Theme' }),
          h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 } },
            Object.entries(THEMES).map(([id, t]) => {
              const active = (state.theme || 'default') === id;
              return h('button', {
                key: id, className: 'rpg-btn',
                onClick: () => onSaveTheme(id),
                style: { padding: '10px 8px', borderRadius: 4, cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: active ? C.accentDim : C.void, border: `1px solid ${active ? C.accent : C.borderDim}`, transition: 'all 0.15s' },
              },
                h('span', { style: { fontSize: 20 } }, t.icon),
                h('div', { style: { fontSize: 11.5, fontWeight: 700, color: active ? C.accent : C.textHi } }, t.label),
                h('div', { style: { fontSize: 10, color: C.textLo, lineHeight: 1.3 } }, t.desc),
                active && h('div', { style: { fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.accent, marginTop: 1 } }, '✓ Active')
              );
            })
          )
        ),

        // Sound style + volume (full panel, minus the on/off toggle)
        h(SoundSettingsSection, { state, onSave: onSaveSoundSettings }),

        // Level gates
        h('div', null,
          h(SectionLabel, { text: 'Level gates & boss battles' }),
          h('div', { style: { fontSize: 12, color: C.textMid, marginBottom: 10 } },
            'Boss gates lock rank advancement every 10 levels. Enable optional in-between gates for tighter progression.'
          ),
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
            DOMAIN_KEYS.map(k => {
              const d = DOMAINS[k];
              const isOpen = expandedDomain === k;
              const customCount = state.customBosses && state.customBosses[k]
                ? Object.keys(state.customBosses[k]).filter(lvl => { const ch = state.customBosses[k][lvl]; return ch && ch.filter(c => c && c.trim()).length > 0; }).length
                : 0;
              const enabled = activeBossLevelsFor(state, k);
              return h('div', { key: k, style: { background: C.void, border: '1px solid ' + C.borderDim, borderRadius: 4, overflow: 'hidden' } },
                h('button', {
                  className: 'rpg-btn',
                  onClick: () => setExpandedDomain(isOpen ? null : k),
                  style: { width: '100%', padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', color: C.textHi },
                },
                  h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                    h(Icon, { name: d.icon, size: 15, color: d.color }),
                    h('span', { style: { fontSize: 13, fontWeight: 600 } }, d.name),
                    h('span', { style: { fontSize: 11, color: C.textMid } }, `· ${enabled.length} gates${customCount > 0 ? `, ${customCount} custom` : ''}`)
                  ),
                  h('div', { style: { transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' } },
                    h(Icon, { name: 'chevronRight', size: 13, color: C.textLo })
                  )
                ),
                isOpen && h('div', { style: { padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: 6 } },
                  BOSS_LEVELS_ALL.map(bl => {
                    const isDefault = BOSS_LEVELS_DEFAULT.indexOf(bl) >= 0;
                    const isEnabled = enabled.indexOf(bl) >= 0;
                    const custom = state.customBosses && state.customBosses[k] && state.customBosses[k][bl];
                    const isCustom = custom && custom.filter(c => c && c.trim()).length > 0;
                    return h('div', { key: bl, style: { ...styles.bossLevelRow, borderColor: isEnabled ? (isCustom ? hexToRgba(d.color, 0.3) : C.borderDim) : 'transparent', opacity: isEnabled ? 1 : 0.5 } },
                      h('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: 8 } },
                        h('span', { style: { fontSize: 12.5, color: C.textHi, fontWeight: 600 } }, `Level ${bl}`),
                        h('span', { style: { fontSize: 10, color: C.textMid, textTransform: 'uppercase', letterSpacing: 0.5 } }, isDefault ? 'Default' : 'Optional'),
                        isCustom && h('span', { style: { fontSize: 10, color: d.color, textTransform: 'uppercase', letterSpacing: 0.5 } }, 'Custom')
                      ),
                      h('button', {
                        className: 'rpg-btn',
                        onClick: () => onToggleGate(k, bl),
                        style: { ...styles.toggleSwitch, background: isEnabled ? d.color : C.borderDim },
                        title: isEnabled ? 'Disable gate' : 'Enable gate',
                      }, h('span', { style: { ...styles.toggleKnob, left: isEnabled ? 18 : 2 } })),
                      h('button', {
                        className: 'rpg-btn',
                        onClick: () => onEditBoss(k, bl),
                        style: { ...styles.iconBtn, opacity: isEnabled ? 1 : 0.5 },
                        title: 'Edit challenges',
                      }, h(Icon, { name: 'edit2', size: 12 }))
                    );
                  })
                )
              );
            })
          )
        ),

        h(DailyQuestSettingsSection, { state, onSetLock: onSetDailyQuestLock }),
        h(EconomySettingsSection, { state, onSave: onSaveEconomy }),
        h(ChallengeLibrarySection, { state, onSaveLibrary: onSaveChallengeLibrary, onSaveSpawnChance })
      )
    ),

    // ── Reset Progress — bottom of settings ──────────────
    h('section', { style: { marginBottom: 8 } },
      h('button', {
        className: 'rpg-btn',
        onClick: () => setResetOpen(o => !o),
        style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: C.raised, border: '1px solid rgba(224,92,92,0.2)', borderRadius: 4, color: C.textHi, transition: 'border-color 0.15s' },
      },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h(Icon, { name: 'trash2', size: 14, color: C.danger }),
          h('span', { style: { fontSize: 12.5, fontWeight: 600 } }, 'Reset Progress'),
          h('span', { style: { fontSize: 11, color: C.textLo } }, '— erase XP, levels, completions')
        ),
        h('div', { style: { transform: resetOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' } },
          h(Icon, { name: 'chevronRight', size: 14, color: C.textLo })
        )
      ),
      resetOpen && h('div', { style: { background: C.raised, border: '1px solid rgba(224,92,92,0.15)', borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '14px' } },
        h('div', { style: { fontSize: 12, color: C.textMid, marginBottom: 12 } },
          'Resets erase XP, levels, and boss completions. Activity templates and rewards are kept.'
        ),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 } },
          DOMAIN_KEYS.map(k => {
            const d = DOMAINS[k];
            const totalXp = state.domains[k] ? state.domains[k].totalXp : 0;
            return h('div', { key: k, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: C.void, borderRadius: 4 } },
              h(Icon, { name: d.icon, size: 14, color: d.color }),
              h('div', { style: { flex: 1 } },
                h('div', { style: { fontSize: 12.5, fontWeight: 600, color: C.textHi } }, d.name),
                h('div', { style: { fontSize: 11, color: C.textMid } }, `${totalXp.toLocaleString()} XP`)
              ),
              h('button', { className: 'rpg-btn', style: styles.dangerBtnSmall, onClick: () => onResetDomain(k) }, 'Reset')
            );
          })
        ),
        h('button', {
          className: 'rpg-btn',
          style: { ...styles.dangerBtn, width: '100%', justifyContent: 'center', padding: '11px 0', fontSize: 13 },
          onClick: onResetAll,
        }, h(Icon, { name: 'trash2', size: 13 }), ' Reset entire character')
      )
    )
  );
}

// ---------- Power Values (#new) ----------

function SoundSettingsSection({ state, onSave }) {
  const ss = state.soundSettings || { enabled: true, volume: 0.6, style: 'fantasy' };
  const [open, setOpen] = React.useState(false);

  const STYLES = [
    { id: 'fantasy',     label: 'Fantasy',     desc: 'Chimes, bells, resonant tones',    icon: '⚔️' },
    { id: 'digital',     label: 'Digital',      desc: 'Blips, pulses, synth bleeps',       icon: '⚡' },
    { id: 'atmospheric', label: 'Atmospheric',  desc: 'Drones, pads, ethereal textures',   icon: '🌑' },
  ];

  const PROMINENCE = [
    { label: 'Subtle',   volume: 0.25 },
    { label: 'Moderate', volume: 0.6  },
    { label: 'Bold',     volume: 1.0  },
  ];

  function previewStyle(styleId) {
    SoundEngine.setSettings({ ...ss, style: styleId, enabled: true });
    SoundEngine.play('logActivity');
    // Restore
    setTimeout(() => SoundEngine.setSettings({ ...ss, style: styleId }), 600);
    onSave({ style: styleId });
  }

  function previewEvent(event) {
    SoundEngine.setSettings({ ...ss, enabled: true });
    SoundEngine.play(event);
  }

  const EVENTS = [
    { id: 'click',          label: 'Button click'    },
    { id: 'logActivity',    label: 'Log activity'    },
    { id: 'levelUp',        label: 'Level up'        },
    { id: 'bossDefeated',   label: 'Boss defeated'   },
    { id: 'questComplete',  label: 'Quest complete'  },
    { id: 'achievement',    label: 'Achievement'     },
    { id: 'streakMilestone',label: 'Streak bonus'    },
    { id: 'coinPurchase',   label: 'Purchase'        },
    { id: 'dayComplete',    label: 'Day complete'    },
    { id: 'streakRisk',     label: 'Streak at risk'  },
  ];

  return h('section', { style: { marginBottom: 24 } },
    h('button', {
      className: 'rpg-btn',
      onClick: () => setOpen(o => !o),
      style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: C.raised, border: '1px solid ' + C.borderDim, borderRadius: 4, color: C.textHi },
    },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        h('span', { style: { fontSize: 15 } }, '🔊'),
        h('span', { style: { fontSize: 12.5, fontWeight: 600 } }, 'Sound Effects'),
        h('span', { style: { fontSize: 11, color: C.textLo } },
          ss.enabled ? `— ${STYLES.find(s => s.id === ss.style)?.label || 'Fantasy'}, ${PROMINENCE.find(p => Math.abs(p.volume - ss.volume) < 0.2)?.label || 'Moderate'}` : '— Disabled'
        )
      ),
      h('div', { style: { transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' } },
        h(Icon, { name: 'chevronRight', size: 14, color: C.textLo })
      )
    ),

    open && h('div', { style: { background: C.raised, border: '1px solid ' + C.borderDim, borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 18 } },

      // Volume + prominence
      h('div', null,
        h('div', { style: { fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.textLo, marginBottom: 10 } }, 'Prominence'),
        h('div', { style: { display: 'flex', gap: 6, marginBottom: 10 } },
          PROMINENCE.map(p =>
            h('button', {
              key: p.label, className: 'rpg-btn',
              onClick: () => onSave({ volume: p.volume }),
              style: { flex: 1, padding: '8px 0', borderRadius: 4, border: `1px solid ${Math.abs(ss.volume - p.volume) < 0.2 ? C.accent : C.borderDim}`, background: Math.abs(ss.volume - p.volume) < 0.2 ? C.accentDim : 'transparent', color: Math.abs(ss.volume - p.volume) < 0.2 ? C.accent : C.textMid, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s' },
            }, p.label)
          )
        ),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
          h('span', { style: { fontSize: 11, color: C.textLo } }, '🔈'),
          h('input', {
            type: 'range', min: 0, max: 1, step: 0.05,
            value: ss.volume,
            onChange: e => onSave({ volume: parseFloat(e.target.value) }),
            style: { flex: 1, accentColor: C.accent },
          }),
          h('span', { style: { fontSize: 11, color: C.textLo } }, '🔊'),
          h('span', { style: { fontSize: 11, fontWeight: 700, color: C.textMid, minWidth: 30, textAlign: 'right' } }, `${Math.round(ss.volume * 100)}%`)
        )
      ),

      // Style selector
      h('div', null,
        h('div', { style: { fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.textLo, marginBottom: 10 } }, 'Sound Style'),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
          STYLES.map(s =>
            h('button', {
              key: s.id, className: 'rpg-btn',
              onClick: () => previewStyle(s.id),
              style: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 4, border: `1px solid ${ss.style === s.id ? C.accent : C.borderDim}`, background: ss.style === s.id ? C.accentDim : 'transparent', cursor: 'pointer', transition: 'all 0.12s', textAlign: 'left' },
            },
              h('span', { style: { fontSize: 18, flexShrink: 0 } }, s.icon),
              h('div', { style: { flex: 1 } },
                h('div', { style: { fontSize: 12.5, fontWeight: 700, color: ss.style === s.id ? C.accent : C.textHi } }, s.label),
                h('div', { style: { fontSize: 11, color: C.textLo, marginTop: 1 } }, s.desc)
              ),
              ss.style === s.id && h('span', { style: { fontSize: 10, color: C.accent, fontWeight: 700 } }, 'Active — tap to preview')
            )
          )
        )
      ),

      // Per-event preview
      h('div', null,
        h('div', { style: { fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.textLo, marginBottom: 10 } }, 'Preview sounds'),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
          EVENTS.map(ev =>
            h('button', {
              key: ev.id, className: 'rpg-btn',
              onClick: () => previewEvent(ev.id),
              style: { padding: '6px 12px', borderRadius: 4, border: '1px solid ' + C.borderDim, background: 'transparent', color: C.textMid, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s' },
            }, ev.label)
          )
        )
      )
    )
  );
}

function PowerValuesSection({ state, onSave, headerExtra }) {
  const [open, setOpen] = useState(false);
  const initial = (state.powerValues && state.powerValues.length === 3)
    ? state.powerValues.map(v => ({ name: '', symbol: '', desc: '', ...v }))
    : [{ name: '', symbol: '', desc: '' }, { name: '', symbol: '', desc: '' }, { name: '', symbol: '', desc: '' }];
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(false);

  // Mature, refined emoji — thematically varied for representing personal values.
  // Organised by life domain: strength/discipline, wisdom/growth, relationships,
  // creative/craft, legacy/honour, health, finance, spirit/purpose.
  const EMOJI_OPTIONS = [
    // Strength & Discipline
    '⚔️','🛡️','🏹','🗡️','⚡','🔱','🦅','🐉',
    // Wisdom & Growth
    '📜','🔬','🧭','💡','🌿','🌲','🏔️','🌊',
    // Honour & Legacy
    '👑','🏆','💎','🔑','⚖️','🌟','🕯️','🪬',
    // Craft & Creation
    '🔧','⚙️','🎯','🏗️','🎻','✒️','🗺️','🔭',
    // Connection & Relationships
    '🤝','🌐','🕊️','🔮','🌙','☀️','🧿','🪐',
    // Vitality & Health
    '🫀','🦾','🌱','💠','🫶','🧘','🌅','🌿',
  ];

  function update(i, field, val) {
    setValues(v => v.map((x, idx) => idx === i ? { ...x, [field]: val } : x));
    setSaved(false);
  }

  function handleSave() {
    onSave(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return h('section', { style: { marginBottom: 24 } },
    h('button', {
      className: 'rpg-btn',
      onClick: () => setOpen(o => !o),
      style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: C.raised, border: '1px solid ' + C.borderDim, borderRadius: 4, color: C.textHi },
    },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, overflow: 'hidden' } },
        h(Icon, { name: 'star', size: 15, color: '#c9a84c' }),
        h('span', { style: { fontSize: 12.5, fontWeight: 600, flexShrink: 0 } }, 'Power Values'),
        headerExtra || null
      ),
      h('div', { style: { transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' } },
        h(Icon, { name: 'chevronRight', size: 14, color: C.textLo })
      )
    ),
    open && h('div', { style: { background: C.raised, border: '1px solid ' + C.borderDim, borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 } },
      h('div', { style: { fontSize: 12, color: C.textMid, marginBottom: 4 } },
        'Your 3 highest personal values. Their symbols stay visible in the top bar as a constant reminder.'
      ),
      values.map((v, i) =>
        h('div', { key: i, style: { background: C.void, border: '1px solid ' + C.borderDim, borderRadius: 4, padding: '12px 14px' } },
          h('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.textLo, marginBottom: 8 } }, `Value ${i + 1}`),
          h('div', { style: { display: 'flex', gap: 8, marginBottom: 10 } },
            h('div', { style: { width: 46, height: 40, borderRadius: 4, background: C.panel, border: '1px solid ' + C.borderMid, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 } },
              v.symbol || '·'
            ),
            h('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 } },
              h('input', {
                value: v.name,
                onChange: e => update(i, 'name', e.target.value),
                style: { ...styles.input, flex: 1 },
                placeholder: `Name (e.g. Discipline)`,
              }),
              h('input', {
                value: v.desc || '',
                onChange: e => update(i, 'desc', e.target.value),
                style: { ...styles.input, fontSize: 12 },
                placeholder: `What this value means to you…`,
              })
            )
          ),
          h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 4 } },
            EMOJI_OPTIONS.map(emoji =>
              h('button', {
                key: emoji, className: 'rpg-btn',
                onClick: () => update(i, 'symbol', emoji),
                style: {
                  fontSize: 18, padding: '5px 7px', borderRadius: 4,
                  border: `1px solid ${v.symbol === emoji ? C.accent : C.borderDim}`,
                  background: v.symbol === emoji ? C.accentDim : 'transparent',
                  cursor: 'pointer', transition: 'all 0.12s',
                },
              }, emoji)
            )
          )
        )
      ),
      h('button', {
        className: 'rpg-btn',
        style: { ...styles.primaryBtn, justifyContent: 'center', padding: '9px 0' },
        onClick: handleSave,
      }, saved ? '✓ Saved' : 'Save values')
    )
  );
}

// ---------- Economy Settings (#7) ----------

// ---------- Daily Quest Mode settings ----------

function DailyQuestSettingsSection({ state, onSetLock }) {
  const [open, setOpen] = useState(false);
  const lockEnabled = !!state.dailyQuestLockEnabled;
  const history = (state.dailyQuestHistory || []).slice(0, 14);

  return h('section', { style: { marginBottom: 24 } },
    h('button', {
      className: 'rpg-btn',
      onClick: () => setOpen(o => !o),
      style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 10, color: '#e5e7eb' },
    },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        h(Icon, { name: 'target', size: 16, color: '#a78bfa' }),
        h('span', { style: { fontSize: 13.5, fontWeight: 600 } }, 'Daily Quest Mode')
      ),
      h('div', { style: { transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' } }, h(Icon, { name: 'chevronRight', size: 14, color: '#7c7c8a' }))
    ),
    open && h('div', { style: { background: '#1a1a24', border: '1px solid #2a2a35', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 } },

      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h('div', null,
          h('div', { style: { fontSize: 13, fontWeight: 600, color: '#e5e7eb' } }, 'Lock mission after first completion'),
          h('div', { style: { fontSize: 11.5, color: '#7c7c8a', marginTop: 2 } }, 'Once enabled, the activity list can\'t be changed once a day\'s mission starts')
        ),
        h('button', {
          className: 'rpg-btn',
          onClick: () => onSetLock(!lockEnabled),
          style: {
            width: 44, height: 26, borderRadius: 999, flexShrink: 0,
            background: lockEnabled ? 'rgba(167,139,250,0.3)' : '#2a2a35',
            border: `1px solid ${lockEnabled ? '#a78bfa' : '#3a3a4a'}`,
            position: 'relative', cursor: 'pointer',
          },
        },
          h('div', { style: {
            width: 18, height: 18, borderRadius: '50%', background: lockEnabled ? '#c4b5fd' : '#7c7c8a',
            position: 'absolute', top: 3, left: lockEnabled ? 23 : 3, transition: 'left 0.15s ease',
          }})
        )
      ),

      h('div', null,
        h('div', { style: { ...styles.label, marginBottom: 8 } }, 'Recent mission history'),
        history.length === 0
          ? h('div', { style: { fontSize: 12, color: '#7c7c8a' } }, 'No completed Daily Quest missions yet.')
          : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
              history.map(h_ => h('div', { key: h_.date, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#0e0e14', borderRadius: 8 } },
                h('div', { style: { fontSize: 12, color: '#9ca3af', minWidth: 78 } }, h_.date),
                h('div', { style: { fontSize: 12, color: '#e5e7eb', flex: 1 } }, `${h_.activitiesCompleted}/${h_.activitiesPlanned} complete`),
                h('div', { style: { fontSize: 12, fontWeight: 700, color: h_.completionPct >= 100 ? '#86efac' : '#9ca3af' } }, `${h_.completionPct}%`),
                h_.countedForStreak && h(Icon, { name: 'flame', size: 13, color: '#fb923c' })
              ))
            )
      )
    )
  );
}

function EconomySettingsSection({ state, onSave }) {
  const e = state.economy || DEFAULT_ECONOMY;
  const [vals, setVals] = useState({ ...DEFAULT_ECONOMY, ...e });
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key, val) { setVals(v => ({ ...v, [key]: val })); setSaved(false); }
  function setMult(tier, group, val) {
    setVals(v => ({ ...v, [group]: { ...(v[group] || {}), [tier]: parseFloat(val) || 0 } }));
    setSaved(false);
  }
  function setNum(key, val) { set(key, parseFloat(val) || 0); }

  function handleSave() {
    onSave(vals);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return h('section', { style: { marginBottom: 24 } },
    h('button', {
      className: 'rpg-btn',
      onClick: () => setOpen(o => !o),
      style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 10, color: '#e5e7eb' },
    },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        h(Icon, { name: 'coins', size: 16, color: '#fbbf24' }),
        h('span', { style: { fontSize: 13.5, fontWeight: 600 } }, 'Economy & rewards config')
      ),
      h('div', { style: { transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' } }, h(Icon, { name: 'chevronRight', size: 14, color: '#7c7c8a' }))
    ),
    open && h('div', { style: { background: '#1a1a24', border: '1px solid #2a2a35', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 } },

      h(EcoGroup, { label: 'Daily progression' },
        h(EcoField, { label: 'Daily XP goal per domain', value: vals.dailyGoal, onChange: v => setNum('dailyGoal', v) }),
        h(EcoField, { label: 'Consistency minimum XP', value: vals.consistencyMin, onChange: v => setNum('consistencyMin', v) })
      ),

      h(EcoGroup, { label: 'Streak bonuses' },
        h(EcoField, { label: 'Award coins every N consistency days', value: vals.streakCoinsEvery, onChange: v => setNum('streakCoinsEvery', v) }),
        h(EcoField, { label: 'Coins per consistency milestone', value: vals.streakCoinsAmount, onChange: v => setNum('streakCoinsAmount', v) }),
        h(EcoField, { label: 'Consistency days to unlock Power Streak', value: vals.powerStreakUnlockDays, onChange: v => setNum('powerStreakUnlockDays', v) }),
        h(EcoField, { label: 'Award coins every N power days', value: vals.powerStreakCoinsEvery, onChange: v => setNum('powerStreakCoinsEvery', v) }),
        h(EcoField, { label: 'Coins per power streak milestone', value: vals.powerStreakCoinsAmount, onChange: v => setNum('powerStreakCoinsAmount', v) })
      ),

      h(EcoGroup, { label: 'Quest & boss rewards' },
        h(EcoField, { label: 'Quest coin ratio (coins = XP × ratio)', value: vals.questCoinRatio, onChange: v => setNum('questCoinRatio', v), step: 0.01 }),
        h(EcoField, { label: 'Normal gate base coins (×10, 20, 30…)', value: vals.bossCoinBase, onChange: v => setNum('bossCoinBase', v) }),
        h(EcoField, { label: 'Mini gate base coins (×5, 15, 25…)', value: vals.miniGateCoinBase, onChange: v => setNum('miniGateCoinBase', v) })
      ),

      h(EcoGroup, { label: 'Normal gate tier multipliers (B / A / S)' },
        h('div', { style: { display: 'flex', gap: 8 } },
          ['B', 'A', 'S'].map(t =>
            h('div', { key: t, style: { flex: 1 } },
              h('label', { style: { ...styles.label, color: { B: '#60a5fa', A: '#34d399', S: '#fbbf24' }[t] } }, `${t} ×`),
              h('input', { type: 'number', step: 0.1, value: (vals.gateTierMultipliers || {})[t] || '', onChange: e => setMult(t, 'gateTierMultipliers', e.target.value), style: styles.input })
            )
          )
        )
      ),

      h(EcoGroup, { label: 'Mini gate tier multipliers (C / B / A)' },
        h('div', { style: { display: 'flex', gap: 8 } },
          ['C', 'B', 'A'].map(t =>
            h('div', { key: t, style: { flex: 1 } },
              h('label', { style: { ...styles.label, color: { C: '#9ca3af', B: '#60a5fa', A: '#34d399' }[t] } }, `${t} ×`),
              h('input', { type: 'number', step: 0.1, value: (vals.miniGateTierMultipliers || {})[t] || '', onChange: e => setMult(t, 'miniGateTierMultipliers', e.target.value), style: styles.input })
            )
          )
        )
      ),

      h(EcoGroup, { label: 'Random challenge reward ranges' },
        h('div', { style: { display: 'flex', gap: 8 } },
          h('div', { style: { flex: 1 } },
            h('label', { style: styles.label }, 'XP min'),
            h('input', { type: 'number', value: vals.challengeXpMin, onChange: e => setNum('challengeXpMin', e.target.value), style: styles.input })
          ),
          h('div', { style: { flex: 1 } },
            h('label', { style: styles.label }, 'XP max'),
            h('input', { type: 'number', value: vals.challengeXpMax, onChange: e => setNum('challengeXpMax', e.target.value), style: styles.input })
          ),
          h('div', { style: { flex: 1 } },
            h('label', { style: styles.label }, 'Coin min'),
            h('input', { type: 'number', value: vals.challengeCoinMin, onChange: e => setNum('challengeCoinMin', e.target.value), style: styles.input })
          ),
          h('div', { style: { flex: 1 } },
            h('label', { style: styles.label }, 'Coin max'),
            h('input', { type: 'number', value: vals.challengeCoinMax, onChange: e => setNum('challengeCoinMax', e.target.value), style: styles.input })
          )
        )
      ),

      h(EcoGroup, { label: 'Smart reminders' },
        h(EcoField, { label: 'Remind after N days without domain XP (0 = off)', value: vals.reminderThresholdDays, onChange: v => setNum('reminderThresholdDays', v) })
      ),

      h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, justifyContent: 'center', padding: '10px 0' }, onClick: handleSave },
        h(Icon, { name: 'check', size: 14 }), saved ? ' Saved!' : ' Save economy settings'
      )
    )
  );
}

function EcoGroup({ label, children }) {
  return h('div', null,
    h('div', { style: { fontSize: 11.5, color: '#7c7c8a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 } }, label),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } }, children)
  );
}

function EcoField({ label, value, onChange, step }) {
  return h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
    h('label', { style: { ...styles.label, flex: 1, margin: 0, color: '#9ca3af' } }, label),
    h('input', { type: 'number', step: step || 1, value, onChange: e => onChange(e.target.value), style: { ...styles.input, width: 80, flex: 'none', textAlign: 'right' } })
  );
}

// ---------- Challenge Library (#10) ----------

function ChallengeLibrarySection({ state, onSaveLibrary, onSaveSpawnChance }) {
  const [open, setOpen] = useState(false);
  const [library, setLibrary] = useState(state.challengeLibrary || []);
  const [spawnChance, setSpawnChance] = useState(state.challengeSpawnChance || 10);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDomain, setNewDomain] = useState('health');
  const [newTier, setNewTier] = useState('B');

  const allTiers = ['C', 'B', 'A', 'S'];
  const tierColors = { S: '#fbbf24', A: '#34d399', B: '#60a5fa', C: '#9ca3af' };

  function addChallenge() {
    if (!newName.trim()) return;
    const updated = [...library, { id: uid('chal'), name: newName.trim(), desc: newDesc.trim(), domain: newDomain, tier: newTier }];
    setLibrary(updated);
    onSaveLibrary(updated);
    setNewName(''); setNewDesc(''); setNewTier('B');
  }

  function removeChallenge(id) {
    const updated = library.filter(c => c.id !== id);
    setLibrary(updated);
    onSaveLibrary(updated);
  }

  function updateChallengeTier(id, tier) {
    const updated = library.map(c => c.id === id ? { ...c, tier } : c);
    setLibrary(updated);
    onSaveLibrary(updated);
  }

  return h('section', { style: { marginBottom: 24 } },
    h('button', {
      className: 'rpg-btn',
      onClick: () => setOpen(o => !o),
      style: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 10, color: '#e5e7eb' },
    },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        h(Icon, { name: 'zap', size: 16, color: '#a78bfa' }),
        h('span', { style: { fontSize: 13.5, fontWeight: 600 } }, 'Random challenges'),
        h('span', { style: { fontSize: 11, color: '#7c7c8a' } }, `· ${library.length} in library`)
      ),
      h('div', { style: { transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' } }, h(Icon, { name: 'chevronRight', size: 14, color: '#7c7c8a' }))
    ),
    open && h('div', { style: { background: '#1a1a24', border: '1px solid #2a2a35', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 } },

      h('div', null,
        h('label', { style: styles.label }, 'Daily spawn chance'),
        h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
          [1, 5, 10, 25, 50].map(pct =>
            h('button', { key: pct, className: 'rpg-btn', onClick: () => { setSpawnChance(pct); onSaveSpawnChance(pct); },
              style: { ...styles.filterChip, ...(spawnChance === pct ? { background: 'rgba(167,139,250,0.18)', borderColor: '#a78bfa', color: '#c4b5fd' } : {}) }
            }, `${pct}%`)
          )
        ),
        h('div', { style: { fontSize: 11, color: '#7c7c8a', marginTop: 6 } },
          'The tier of a challenge multiplies its base XP and coin reward (C=0.75×, B=1×, A=1.5×, S=2×).'
        )
      ),

      h('div', null,
        h('div', { style: { ...styles.label, marginBottom: 8 } }, `Challenge library (${library.length})`),
        library.length === 0
          ? h('div', { style: { fontSize: 12, color: '#7c7c8a', marginBottom: 8 } }, 'No challenges yet. Add some below.')
          : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 } },
              library.map(c => {
                const d = DOMAINS[c.domain];
                const ct = c.tier || 'B';
                const tc = tierColors[ct] || '#9ca3af';
                return h('div', { key: c.id, style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#0e0e14', borderRadius: 8 } },
                  h(Icon, { name: d.icon, size: 13, color: d.color }),
                  h('div', { style: { flex: 1, minWidth: 0 } },
                    h('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                      h('span', { style: { fontSize: 13, color: '#e5e7eb' } }, c.name),
                      h('span', { style: { fontWeight: 800, fontSize: 10, color: tc, background: hexToRgba(tc, 0.15), border: `1px solid ${hexToRgba(tc, 0.4)}`, borderRadius: 4, padding: '1px 5px' } }, ct)
                    ),
                    c.desc && h('div', { style: { fontSize: 11, color: '#7c7c8a' } }, c.desc)
                  ),
                  // Tier selector for existing challenges
                  h('div', { style: { display: 'flex', gap: 3, flexShrink: 0 } },
                    allTiers.map(t => {
                      const isActive = ct === t;
                      const ttc = tierColors[t];
                      return h('button', {
                        key: t, className: 'rpg-btn',
                        onClick: () => updateChallengeTier(c.id, t),
                        style: {
                          width: 24, height: 22, borderRadius: 4, fontSize: 10, fontWeight: 800,
                          border: `1.5px solid ${isActive ? ttc : '#2a2a35'}`,
                          background: isActive ? hexToRgba(ttc, 0.18) : 'transparent',
                          color: isActive ? ttc : '#5e5e6b',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        },
                      }, t);
                    })
                  ),
                  h('button', { className: 'rpg-btn', style: styles.iconBtnDanger, onClick: () => removeChallenge(c.id) }, h(Icon, { name: 'trash2', size: 12 }))
                );
              })
            ),

        // Add new challenge form
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, padding: '10px', background: '#0e0e14', borderRadius: 8 } },
          h('input', { value: newName, onChange: e => setNewName(e.target.value), style: styles.input, placeholder: 'Challenge name (e.g. Call an old friend)' }),
          h('textarea', { value: newDesc, onChange: e => setNewDesc(e.target.value), style: { ...styles.input, minHeight: 44, resize: 'vertical' }, placeholder: 'Description (optional)' }),
          h('div', { style: { display: 'flex', gap: 8 } },
            h('select', { value: newDomain, onChange: e => setNewDomain(e.target.value), style: { ...styles.input, flex: 1 } },
              DOMAIN_KEYS.map(k => h('option', { key: k, value: k }, DOMAINS[k].name))
            ),
            h('div', { style: { display: 'flex', gap: 3, alignItems: 'center' } },
              allTiers.map(t => {
                const isActive = newTier === t;
                const ttc = tierColors[t];
                return h('button', {
                  key: t, className: 'rpg-btn',
                  onClick: () => setNewTier(t),
                  style: {
                    width: 30, height: 28, borderRadius: 5, fontSize: 11, fontWeight: 800,
                    border: `2px solid ${isActive ? ttc : '#2a2a35'}`,
                    background: isActive ? hexToRgba(ttc, 0.18) : 'transparent',
                    color: isActive ? ttc : '#5e5e6b',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  },
                }, t);
              })
            )
          ),
          h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, justifyContent: 'center', padding: '8px 0' }, onClick: addChallenge },
            h(Icon, { name: 'plus', size: 14 }), ' Add challenge'
          )
        )
      )
    )
  );
}

// ---------- Auth components ----------

function ConfigErrorScreen({ error }) {
  return h('div', { style: styles.authScreen },
    h('div', { style: { ...styles.authCard, maxWidth: 460 } },
      h('div', { style: { ...styles.logoMark, marginBottom: 14 } }, h(Icon, { name: 'sword', size: 22, color: '#a78bfa' })),
      h('div', { style: styles.authTitle }, 'Almost there'),
      h('div', { style: { ...styles.authSubtitle, marginBottom: 14 } },
        error
          ? 'Firebase couldn\'t connect. Double-check your config values.'
          : 'This app needs a Firebase project to sync your data.'
      ),
      h('div', { style: { fontSize: 12.5, color: '#9ca3af', lineHeight: 1.6, background: '#0e0e14', border: '1px solid #2a2a35', borderRadius: 10, padding: '12px 14px' } },
        h('div', { style: { fontWeight: 600, color: '#e5e7eb', marginBottom: 6 } }, 'Setup steps:'),
        h('ol', { style: { margin: 0, paddingLeft: 18 } },
          h('li', null, 'Read ', h('code', null, 'SETUP.md'), ' in the app folder.'),
          h('li', null, 'Create a free Firebase project at console.firebase.google.com'),
          h('li', null, 'Paste your project\'s config values into ', h('code', null, 'firebase-config.js')),
          h('li', null, 'Re-upload the files and reload this page.')
        )
      ),
      error && h('div', { style: { marginTop: 12, fontSize: 11.5, color: '#f09595', fontFamily: 'monospace' } }, error)
    )
  );
}

function LoginScreen({ onSignedIn }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    if (!email.trim() || !password) {
      setError('Email and password required.');
      return;
    }
    setBusy(true);
    setError(null);
    const result = mode === 'signin'
      ? await window.RPGLifeSync.signIn(email.trim(), password)
      : await window.RPGLifeSync.signUp(email.trim(), password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
    } else if (result.user) {
      onSignedIn(result.user);
    }
  }

  return h('div', { style: styles.authScreen },
    h('div', { style: styles.authCard },
      h('div', { style: { ...styles.logoMark, marginBottom: 14 } }, h(Icon, { name: 'sword', size: 22, color: '#a78bfa' })),
      h('div', { style: styles.authTitle }, mode === 'signin' ? 'Welcome back, adventurer' : 'Begin your journey'),
      h('div', { style: styles.authSubtitle },
        mode === 'signin' ? 'Sign in to continue your run.' : 'Create an account to start tracking.'
      ),

      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 } },
        h('div', null,
          h('label', { style: styles.label }, 'Email'),
          h('input', {
            type: 'email',
            autoComplete: 'email',
            value: email,
            onChange: e => setEmail(e.target.value),
            onKeyDown: e => { if (e.key === 'Enter') submit(); },
            style: styles.input,
            placeholder: 'you@example.com',
          })
        ),
        h('div', null,
          h('label', { style: styles.label }, 'Password'),
          h('input', {
            type: 'password',
            autoComplete: mode === 'signin' ? 'current-password' : 'new-password',
            value: password,
            onChange: e => setPassword(e.target.value),
            onKeyDown: e => { if (e.key === 'Enter') submit(); },
            style: styles.input,
            placeholder: mode === 'signin' ? '' : 'at least 6 characters',
          })
        ),
        error && h('div', { style: styles.authError }, error),
        h('button', {
          className: 'rpg-btn',
          onClick: submit,
          disabled: busy,
          style: { ...styles.primaryBtn, justifyContent: 'center', padding: '11px 0', opacity: busy ? 0.6 : 1 },
        }, busy ? '...' : (mode === 'signin' ? 'Sign in' : 'Create account'))
      ),

      h('div', { style: { marginTop: 16, fontSize: 13, color: '#9ca3af', textAlign: 'center' } },
        mode === 'signin'
          ? h('span', null, 'No account yet? ', h('a', { href: '#', onClick: (e) => { e.preventDefault(); setMode('signup'); setError(null); }, style: styles.authLink }, 'Create one'))
          : h('span', null, 'Already have an account? ', h('a', { href: '#', onClick: (e) => { e.preventDefault(); setMode('signin'); setError(null); }, style: styles.authLink }, 'Sign in'))
      )
    )
  );
}

function AuthGate() {
  const [user, setUser] = useState(undefined); // undefined = checking, null = signed out
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function init() {
      setReady(true);
      if (!window.RPGLifeSync || !window.RPGLifeSync.isConfigured()) {
        setUser(null);
        return;
      }
      const unsub = window.RPGLifeSync.onAuthChange((u) => {
        setUser(u || null);
      });
      return unsub;
    }
    if (window.RPGLifeSync) {
      return init();
    }
    const handler = () => init();
    window.addEventListener('rpglife-sync-ready', handler, { once: true });
    return () => window.removeEventListener('rpglife-sync-ready', handler);
  }, []);

  if (!ready || !window.RPGLifeSync) {
    return h('div', { style: styles.loadingScreen }, h('div', { style: styles.loadingText }, 'Loading...'));
  }

  if (!window.RPGLifeSync.isConfigured()) {
    return h(ConfigErrorScreen, { error: window.RPGLifeSync.configError() });
  }

  if (user === undefined) {
    return h('div', { style: styles.loadingScreen }, h('div', { style: styles.loadingText }, 'Loading...'));
  }

  if (user === null) {
    return h(LoginScreen, { onSignedIn: () => { /* onAuthChange will pick it up */ } });
  }

  return h(RPGLife, {
    user,
    onSignOut: async () => {
      await window.RPGLifeSync.signOut();
    },
  });
}

// ---------- Styles ----------
// CSS-variable-backed design token system.
const C = {
  void:       '#080810',
  panel:      '#0d0d1a',
  raised:     '#12121f',
  hover:      '#1a1a2e',
  borderDim:  'rgba(255,255,255,0.055)',
  borderMid:  'rgba(255,255,255,0.10)',
  borderGlow: 'rgba(167,139,250,0.45)',
  accent:     '#a78bfa',
  accentDim:  'rgba(167,139,250,0.12)',
  accentGlow: 'rgba(167,139,250,0.3)',
  gold:       '#c9a84c',
  goldDim:    'rgba(201,168,76,0.15)',
  textHi:     '#eceaf6',
  textMid:    '#9896b0',
  textLo:     '#4a4868',
  danger:     '#e05c5c',
  success:    '#5de8a0',
};

const styles = {
  app: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: C.void, color: C.textHi,
    minHeight: '100vh', overflow: 'hidden', width: '100%', position: 'relative',
  },
  loadingScreen: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: C.void, color: C.textMid, gap: 12,
  },
  loadingText: { fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.6 },

  // Domain meters
  bigMetersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 },
  bigMeterCard: { background: C.raised, border: '1px solid ' + C.borderDim, borderRadius: 4, padding: '14px 16px', transition: 'border-color 0.2s' },
  bigMeterIcon: { width: 32, height: 32, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bigMeterName: { fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: C.textHi },
  bigMeterSubName: { fontSize: 10.5, color: C.textMid, marginTop: 1 },
  bigMeterValue: { fontSize: 22, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1 },
  meterTrack: { position: 'relative', height: 7, background: C.void, border: '1px solid ' + C.borderDim, borderRadius: 2, overflow: 'hidden' },
  meterFill: { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: 2, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)', animation: 'barFill 0.7s cubic-bezier(0.4,0,0.2,1)' },
  overflowBadge: { fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3, border: '1px solid', letterSpacing: 0.5 },

  // Activity cards
  activityCard: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: C.raised, border: '1px solid ' + C.borderDim, borderRadius: 4, transition: 'border-color 0.15s' },
  quickLogDot: { width: 3, height: 3, borderRadius: '50%', flexShrink: 0, marginTop: 7 },
  activityCardName: { fontSize: 13, fontWeight: 600, color: C.textHi },
  activityCardMeta: { fontSize: 11, color: C.textMid, marginTop: 2 },
  activityCardDesc: { fontSize: 11.5, color: C.textMid, marginTop: 3, lineHeight: 1.4 },

  // Quest cards
  questCard: { background: C.raised, border: '1px solid ' + C.borderDim, borderRadius: 4, padding: '14px 16px', transition: 'border-color 0.2s' },
  questName: { fontSize: 13, fontWeight: 700, color: C.textHi },
  questMeta: { fontSize: 11, color: C.textMid },
  questProgressText: { fontSize: 11.5, fontWeight: 700 },

  // Modals
  modalOverlay: { position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(4,4,10,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { background: C.panel, border: '1px solid ' + C.borderMid, borderTop: '1px solid rgba(167,139,250,0.25)', borderRadius: 4, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid ' + C.borderDim },
  modalTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: C.textHi },
  modalBody: { padding: 20, display: 'flex', flexDirection: 'column', gap: 14 },

  // Inputs
  label: { display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.textLo, marginBottom: 6 },
  input: { background: C.void, border: '1px solid ' + C.borderMid, borderRadius: 4, color: C.textHi, padding: '9px 12px', fontSize: 13, width: '100%', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' },

  // Buttons
  primaryBtn: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 4, background: C.accentDim, border: '1px solid ' + C.accent, color: C.accent, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s' },
  secondaryBtn: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderRadius: 4, background: 'transparent', border: '1px solid ' + C.borderMid, color: C.textMid, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' },
  iconBtn: { width: 30, height: 30, borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: C.hover, border: '1px solid ' + C.borderDim, color: C.textMid, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 },
  iconBtnDanger: { width: 30, height: 30, borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: C.hover, border: '1px solid ' + C.borderDim, color: C.textMid, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 },

  // FAB
  fab: { position: 'fixed', bottom: 24, right: 24, zIndex: 90, width: 50, height: 50, borderRadius: 4, background: C.accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(167,139,250,0.4)', transition: 'all 0.2s' },

  // Toast
  toast: { position: 'fixed', top: 16, right: 16, zIndex: 9998, background: C.raised, border: '1px solid ' + C.borderMid, borderLeft: '3px solid ' + C.accent, borderRadius: 4, padding: '10px 16px', fontSize: 13, fontWeight: 500, color: C.textHi, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', animation: 'toastSlide 0.25s ease', maxWidth: 320 },

  // Filter chips
  filterChip: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 3, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, border: '1px solid ' + C.borderDim, background: 'transparent', color: C.textMid, cursor: 'pointer', transition: 'all 0.15s' },

  // Character view
  charSummary: { display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0 24px', borderBottom: '1px solid ' + C.borderDim, marginBottom: 24 },
  charAvatar: { width: 52, height: 52, borderRadius: 4, flexShrink: 0, background: C.accentDim, border: '1px solid ' + C.borderGlow, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(167,139,250,0.2)' },
  domainCard: { background: C.raised, border: '1px solid ' + C.borderDim, borderRadius: 4, padding: '14px 16px', marginBottom: 10 },
  bossPill: { padding: '5px 10px', borderRadius: 3, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, border: '1px solid', cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' },

  // Rewards
  rewardCard: { background: C.raised, border: '1px solid ' + C.borderDim, borderRadius: 4, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.15s' },
  ticketCard: { background: C.raised, border: '1px solid ' + C.borderDim, borderRadius: 4, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 },

  // Boss modal
  tierBtn: { flex: 1, padding: '14px 10px', borderRadius: 4, border: '1px solid', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'transparent', transition: 'all 0.15s' },

  // Auth
  authScreen: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: C.void, padding: 20 },
  authCard: { background: C.panel, border: '1px solid ' + C.borderMid, borderRadius: 4, padding: '32px', width: '100%', maxWidth: 400, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' },
  authTitle: { fontSize: 18, fontWeight: 800, color: C.textHi, marginBottom: 4 },
  authSub: { fontSize: 13, color: C.textMid, marginBottom: 24 },

  // Quick log
  bottomSheet: { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, background: C.panel, border: '1px solid ' + C.borderMid, borderBottom: 'none', borderRadius: '4px 4px 0 0', padding: 20, boxShadow: '0 -8px 40px rgba(0,0,0,0.5)', maxHeight: '80vh', overflowY: 'auto' },

  // Settings
  settingCard: { background: C.raised, border: '1px solid ' + C.borderDim, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  settingRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: '1px solid ' + C.borderDim },

  // Economy
  ecoGroup: { background: C.raised, border: '1px solid ' + C.borderDim, borderRadius: 4, padding: '14px 16px', marginBottom: 10 },
  ecoGroupLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.textLo, marginBottom: 10 },
  ecoField: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  ecoLabel: { flex: 1, fontSize: 12, color: C.textMid },
  ecoInput: { width: 72, background: C.void, border: '1px solid ' + C.borderMid, borderRadius: 3, color: C.textHi, padding: '5px 8px', fontSize: 12, textAlign: 'right', outline: 'none' },

  // Account (kept for auth screens, hidden in main UI)
  accountBtn: { width: 30, height: 30, borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: C.hover, border: '1px solid ' + C.borderDim, color: C.textMid, cursor: 'pointer', fontSize: 12, fontWeight: 700 },
  accountMenu: { position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: C.panel, border: '1px solid ' + C.borderMid, borderRadius: 4, minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden' },
  accountMenuEmail: { padding: '10px 14px', fontSize: 11, color: C.textMid, borderBottom: '1px solid ' + C.borderDim },
  accountMenuItem: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: 'transparent', border: 'none', color: C.textMid, fontSize: 12, cursor: 'pointer', transition: 'background 0.12s, color 0.12s' },

  // Streak calendar
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 },
  calendarDay: { width: '100%', aspectRatio: '1', borderRadius: 2, cursor: 'default' },
  calendarLegend: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8, flexWrap: 'wrap' },
  calendarLegendItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: C.textMid },

  // Legacy stubs (sidebar now handles nav — these are hidden)
  header: { display: 'none' },
  headerLeft: { display: 'none' },
  headerRight: { display: 'none' },
  logoMark: { width: 32, height: 32, borderRadius: 4, background: C.accentDim, border: '1px solid ' + C.borderGlow, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 13, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: C.gold },
  subtitle: { fontSize: 10, color: C.textLo },
  nav: { display: 'none' },
  navBtn: { display: 'none' },
  navBtnActive: { display: 'none' },
  main: { flex: 1 },
  streakChip: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 3, background: C.raised, border: '1px solid ' + C.borderDim, fontSize: 12, fontWeight: 700 },
  streakNum: { fontSize: 13, fontWeight: 800, lineHeight: 1 },
  streakLabel: { fontSize: 10, color: C.textMid },
  goldChip: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 3, background: C.raised, border: '1px solid ' + C.borderDim, color: C.gold, fontSize: 12, fontWeight: 700 },
  bonusBell: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 3, background: C.raised, border: '1px solid ' + C.borderDim, color: C.textMid, fontSize: 12, fontWeight: 600, position: 'relative', cursor: 'pointer' },
  bonusBadge: { position: 'absolute', top: -5, right: -5, background: C.accent, color: 'white', fontSize: 9, fontWeight: 700, lineHeight: 1, padding: '2px 4px', borderRadius: 3, minWidth: 14, textAlign: 'center' },
  pValuesChip: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 3, background: C.raised, border: '1px solid ' + C.borderDim },
  pValuesLabel: { fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textLo },
  pValuesIcons: { display: 'flex', gap: 2 },

  // Daily quest
  modeToggle: { display: 'flex', gap: 2, padding: 3, background: C.void, border: '1px solid ' + C.borderDim, borderRadius: 4 },
  modeToggleBtn: { padding: '5px 12px', borderRadius: 3, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', background: 'transparent', border: 'none', color: C.textMid, cursor: 'pointer' },
  modeToggleBtnActive: { background: C.accentDim, color: C.accent },
  questPanelCard: { background: C.raised, border: '1px solid ' + C.borderDim, borderRadius: 4, padding: '16px 18px' },
  questPickerDropdown: { position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 30, background: C.panel, border: '1px solid ' + C.borderMid, borderRadius: 4, maxHeight: 220, overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' },

  // Quick log
  quickLogGrid: { display: 'flex', flexDirection: 'column', gap: 4 },
  quickLogBtn: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 4, background: C.raised, border: '1px solid ' + C.borderDim, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.12s' },
  quickLogName: { fontSize: 13, fontWeight: 600, color: C.textHi },
  quickLogMeta: { fontSize: 11, color: C.textMid, marginTop: 1 },

  // Danger buttons
  dangerBtnSmall: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 4, background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.3)', color: C.danger, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' },
};

// ---------- Render ----------

// sync.js loads as an ES module (deferred) while app.js is a classic script
// (runs immediately). We must not call createRoot until sync.js has finished
// initialising and dispatched 'rpglife-sync-ready'. If it already fired
// (unlikely but possible), RPGLifeSync will already be on window.
function startApp() {
  try {
    if (window.__rpgHideFallback) window.__rpgHideFallback();
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(h(AuthGate));
  } catch (e) {
    console.error('startApp failed:', e);
    var errEl = document.getElementById('load-error');
    if (errEl) { errEl.style.display = 'block'; errEl.textContent = 'Startup error: ' + (e.message || e); }
  }
}

if (window.RPGLifeSync) {
  startApp();
} else {
  // Wait for sync.js to signal ready
  window.addEventListener('rpglife-sync-ready', function onReady() {
    window.removeEventListener('rpglife-sync-ready', onReady);
    startApp();
  });
  // Safety: if sync.js never fires (CDN blocked, network error, etc.),
  // start anyway after 5 seconds so the user sees an error screen, not darkness.
  setTimeout(function() {
    if (!window.__rpglife_started__) {
      window.__rpglife_started__ = true;
      console.warn('sync.js did not signal ready within 5s — starting app anyway');
      startApp();
    }
  }, 5000);
  // Mark as started when the event fires to prevent the timeout from double-starting
  window.addEventListener('rpglife-sync-ready', function() { window.__rpglife_started__ = true; }, { once: true });
}
