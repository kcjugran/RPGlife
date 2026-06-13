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

const DAILY_GOAL = 100;
const CONSISTENCY_MIN = 50;

const BOSS_LEVELS_ALL = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const BOSS_LEVELS_DEFAULT = [10, 20, 30, 40, 50];
const BOSS_LEVELS = BOSS_LEVELS_ALL; // back-compat alias for existing UI references

const SELL_REFUND_RATIO = 0.5; // tickets sell back for 50% of cost — hardcoded

const STREAK_BONUS_CONSISTENCY = 10; // gold awarded every 10 days of consistency streak
const STREAK_BONUS_POWER = 30;       // gold awarded every 10 days of power streak

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

const DEFAULT_REWARDS = [
  { id: 'r1', name: 'Special meal', cost: 50, desc: 'Treat yourself to a meal out' },
  { id: 'r2', name: 'Day off', cost: 200, desc: 'A guilt-free rest day' },
  { id: 'r3', name: 'Hobby purchase', cost: 100, desc: 'Buy something for a hobby' },
  { id: 'r4', name: 'Entertainment', cost: 60, desc: 'Movie, game, or show night' },
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
    activities: STARTER_ACTIVITIES,
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
    lastResetAt: 0,           // bumped whenever Settings > Reset is used; lets sync recognize intentional wipes
    pendingBonuses: [],       // [{id, label, amount, at}] — queued streak-bonus notifications not yet shown
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
function dayStatus(log) {
  if (!log) return 'none';
  const hasAny = DOMAIN_KEYS.some(k => (log[k] || 0) > 0);
  if (!hasAny) return 'none';
  const allMin = DOMAIN_KEYS.every(k => (log[k] || 0) >= CONSISTENCY_MIN);
  const allFull = DOMAIN_KEYS.every(k => (log[k] || 0) >= DAILY_GOAL);
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
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [toast, setToast] = useState(null);
  const [bossModal, setBossModal] = useState(null);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [streakCalendar, setStreakCalendar] = useState(null); // 'consistency' | 'power' | null
  const [resetPrompt, setResetPrompt] = useState(null); // 'all' | domainKey | null
  const [bossEditor, setBossEditor] = useState(null); // { domain, level } | null
  const [buyConfirm, setBuyConfirm] = useState(null); // reward object | null
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
        const fresh = buildInitialState();
        setState(fresh);
        lastSavedJson.current = JSON.stringify(fresh);
        const result = await window.RPGLifeSync.saveState(user.uid, fresh);
        if (result.ok) remoteUpdatedAt.current = Date.now();
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
    // Update lastSavedJson immediately so any snapshot that arrives before
    // the async write completes is recognised as "our own echo" via content match
    lastSavedJson.current = json;
    setSyncStatus('syncing');

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      saveTimer.current = null;
      const currentJson = JSON.stringify(latestStateRef.current);
      // Mark our write as in-flight BEFORE the async call
      writeInFlight.current = true;
      if (writeSettleTimer.current) clearTimeout(writeSettleTimer.current);

      const result = await window.RPGLifeSync.saveState(user.uid, latestStateRef.current);
      remoteUpdatedAt.current = Date.now();
      // Keep the in-flight flag active for 3 seconds after the write resolves
      // to cover the round-trip time for the echo snapshot to arrive
      writeSettleTimer.current = setTimeout(() => {
        writeInFlight.current = false;
      }, 3000);

      if (result.ok) {
        lastSavedJson.current = currentJson;
        setSyncStatus('idle');
      } else {
        setSyncStatus('offline');
        if (result.error) showToast(`Save failed: ${result.error}`);
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

  if (!loaded || !state) {
    return h('div', { style: styles.loadingScreen },
      h('div', { style: styles.loadingText }, 'Loading character data...'),
      h('div', { style: { ...styles.loadingText, fontSize: 11, marginTop: 6, opacity: 0.5 } }, `Signed in as ${user.email}`)
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

  function checkStreaks(next, dayLog) {
    const allMinMet = DOMAIN_KEYS.every(k => (dayLog[k] || 0) >= CONSISTENCY_MIN);
    const allFullMet = DOMAIN_KEYS.every(k => (dayLog[k] || 0) >= DAILY_GOAL);

    const bonuses = []; // { label, amount }

    if (allMinMet && next.lastConsistencyDate !== today) {
      if (next.lastConsistencyDate === yesterdayKey()) {
        next.consistencyStreak = next.consistencyStreak + 1;
      } else if (next.lastConsistencyDate === null) {
        next.consistencyStreak = next.consistencyStreak === 0 ? 1 : next.consistencyStreak;
      } else {
        next.consistencyStreak = 1;
      }
      next.lastConsistencyDate = today;

      if (next.consistencyStreak > 0 && next.consistencyStreak % 10 === 0) {
        bonuses.push({ label: `${next.consistencyStreak}-day streak`, amount: STREAK_BONUS_CONSISTENCY });
      }
    }

    if (allFullMet && next.lastPowerDate !== today) {
      if (next.lastPowerDate === yesterdayKey()) {
        next.powerStreak = next.powerStreak + 1;
      } else {
        next.powerStreak = 1;
      }
      next.lastPowerDate = today;

      if (next.powerStreak > 0 && next.powerStreak % 10 === 0) {
        bonuses.push({ label: `${next.powerStreak}-day power streak`, amount: STREAK_BONUS_POWER });
      }
    }

    if (bonuses.length > 0) {
      const totalBonus = bonuses.reduce((sum, b) => sum + b.amount, 0);
      next.gold = (next.gold || 0) + totalBonus;
      next.goldHistory = { ...(next.goldHistory || {}) };
      next.goldHistory[today] = (next.goldHistory[today] || 0) + totalBonus;
      // Queue for the coin notification UI — picked up by an effect that shows
      // the popup and lets the user click through to watch the count animate up.
      next.pendingBonuses = [...(next.pendingBonuses || []), ...bonuses.map(b => ({ ...b, id: uid('bonus'), at: Date.now() }))];
    }

    return next;
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
      const oldDayLog = (prev.dailyLogs[today] && prev.dailyLogs[today][activity.domain]) || 0;
      // Only the portion of xpGain that keeps the daily meter ≤ DAILY_GOAL counts toward total/levels.
      // The rest is "overflow" — visible in the meter as e.g. 127/100 but not stored as total XP.
      const xpToTotal = Math.max(0, Math.min(xpGain, DAILY_GOAL - oldDayLog));
      const xpOverflow = xpGain - xpToTotal;

      const next = { ...prev };
      next.domains = { ...prev.domains };
      next.domains[activity.domain] = {
        ...next.domains[activity.domain],
        totalXp: next.domains[activity.domain].totalXp + xpToTotal,
      };

      next.dailyLogs = { ...prev.dailyLogs };
      const dayLog = { ...(next.dailyLogs[today] || {}) };
      dayLog[activity.domain] = oldDayLog + xpGain;
      next.dailyLogs[today] = dayLog;

      next.activityLog = [
        { id: uid('log'), activityName: activity.name, domain: activity.domain, xp: xpGain, overflow: xpOverflow, timestamp: Date.now(), detail: activity.type === 'duration' ? `${value} min` : null },
        ...prev.activityLog,
      ].slice(0, 30);

      return checkStreaks(next, dayLog);
    });

    showToast(`+${xpGain} XP — ${activity.name}`);
  }

  function saveActivity(activityData) {
    setState(prev => {
      const activities = [...prev.activities];
      if (activityData.id) {
        const idx = activities.findIndex(a => a.id === activityData.id);
        if (idx >= 0) activities[idx] = activityData;
      } else {
        activities.push({ ...activityData, id: uid('act') });
      }
      return { ...prev, activities };
    });
    setShowActivityForm(false);
    setEditingActivity(null);
  }

  function deleteActivity(id) {
    setState(prev => ({ ...prev, activities: prev.activities.filter(a => a.id !== id) }));
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
      next.goldHistory = { ...(next.goldHistory || {}) };
      next.goldHistory[today] = (next.goldHistory[today] || 0) + goldGain;
      showToast(`Quest complete! +${quest.xpReward} XP, +${goldGain} gold`);
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
    setState(prev => ({ ...prev, quests: prev.quests.filter(q => q.id !== id) }));
  }

  function completeBoss(domainKey, level) {
    setState(prev => {
      const key = `${domainKey}-${level}`;
      const bossCompletions = { ...prev.bossCompletions, [key]: true };
      const gold = prev.gold + 75;
      const goldHistory = { ...(prev.goldHistory || {}) };
      goldHistory[today] = (goldHistory[today] || 0) + 75;
      return { ...prev, bossCompletions, gold, goldHistory };
    });
    showToast(`Boss defeated! Rank unlocked. +75 gold`);
    setBossModal(null);
  }

  function buyTicket(reward) {
    setState(prev => {
      if (prev.gold < reward.cost) return prev;
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
        gold: prev.gold - reward.cost,
        tickets: [...(prev.tickets || []), ticket],
      };
    });
    showToast(`Bought ticket: ${reward.name}`);
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
    intentionalChangeUntil.current = Date.now() + 60000; // 60s window — other devices' old data shouldn't bounce back
    setState(prev => {
      const domains = { ...prev.domains };
      domains[domainKey] = { totalXp: 0, level: 0, rank: 0, potentialRank: 0 };
      // Clear today's daily log for this domain too, so the meter reads 0
      const dailyLogs = { ...prev.dailyLogs };
      if (dailyLogs[today]) {
        const day = { ...dailyLogs[today] };
        delete day[domainKey];
        dailyLogs[today] = day;
      }
      // Wipe boss completions for this domain
      const bossCompletions = { ...prev.bossCompletions };
      Object.keys(bossCompletions).forEach(k => {
        if (k.startsWith(`${domainKey}-`)) delete bossCompletions[k];
      });
      return { ...prev, domains, dailyLogs, bossCompletions, lastResetAt: Date.now() };
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

  return h('div', { style: styles.app },
    h('style', null, `
      @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes barFill { from { width: 0%; } }
      @keyframes toastSlide { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.0); } 50% { box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.08); } }
      .rpg-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
      .rpg-scroll::-webkit-scrollbar-thumb { background: #3a3a4a; border-radius: 3px; }
      .rpg-scroll::-webkit-scrollbar-track { background: transparent; }
      button.rpg-btn { font-family: inherit; cursor: pointer; transition: all 0.15s ease; }
      button.rpg-btn:active { transform: scale(0.97); }
      input, select, textarea { font-family: inherit; }
      * { box-sizing: border-box; }
    `),
    toast && h('div', { style: styles.toast }, toast),
    h(Header, {
      gold: state.gold,
      consistencyStreak: state.consistencyStreak,
      powerStreak: state.powerStreak,
      user, onSignOut, syncStatus,
      onGoldClick: () => setActiveTab('rewards'),
      onStreakClick: (mode) => setStreakCalendar(mode),
      pendingBonuses: state.pendingBonuses || [],
      onDismissBonus: dismissBonus,
      onRetrySync: attemptResync,
    }),
    h('nav', { style: styles.nav },
      [
        { id: 'dashboard', label: 'Adventure log', icon: 'scroll' },
        { id: 'activities', label: 'Activities', icon: 'zap' },
        { id: 'quests', label: 'Quests', icon: 'target' },
        { id: 'character', label: 'Level', icon: 'shield' },
        { id: 'rewards', label: 'Rewards', icon: 'gift' },
        { id: 'settings', label: 'Settings', icon: 'settings' },
      ].map(tab =>
        h('button', {
          key: tab.id,
          className: 'rpg-btn',
          onClick: () => setActiveTab(tab.id),
          style: { ...styles.navBtn, ...(activeTab === tab.id ? styles.navBtnActive : {}) },
        },
          h(Icon, { name: tab.icon, size: 16 }),
          h('span', null, tab.label)
        )
      )
    ),
    h('main', { style: styles.main },
      activeTab === 'dashboard' && h(Dashboard, { state, domainProgress, domainComputed, today, todayLog, onLogClick: setLogModal, onBossClick: setBossModal }),
      activeTab === 'activities' && h(ActivitiesView, {
        state,
        onLog: setLogModal,
        onEdit: (act) => { setEditingActivity(act); setShowActivityForm(true); },
        onDelete: deleteActivity,
        onAdd: () => { setEditingActivity(null); setShowActivityForm(true); },
      }),
      activeTab === 'quests' && h(QuestsView, { state, onAdd: () => setShowQuestForm(true), onUpdateProgress: updateQuestProgress, onToggleCheckpoint: toggleCheckpoint, onDelete: deleteQuest }),
      activeTab === 'character' && h(CharacterView, { state, domainComputed, onBossClick: setBossModal, onAddSubcat: addCustomSubcat }),
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
      })
    ),
    buyConfirm && h(BuyConfirmModal, {
      reward: buyConfirm,
      canAfford: state.gold >= buyConfirm.cost,
      onConfirm: () => { buyTicket(buyConfirm); setBuyConfirm(null); },
      onCancel: () => setBuyConfirm(null),
    }),
    // Floating "+" button — only when not on auth screens
    h(FAB, { onClick: () => setShowQuickLog(true) }),
    showQuickLog && h(QuickLogSheet, {
      activities: state.activities,
      onSelect: (act) => { setShowQuickLog(false); setLogModal(act); },
      onClose: () => setShowQuickLog(false),
    }),
    streakCalendar && h(StreakCalendarModal, {
      mode: streakCalendar,
      dailyLogs: state.dailyLogs,
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
    showQuestForm && h(QuestFormModal, { onClose: () => setShowQuestForm(false), onSave: saveQuest }),
    showRewardForm && h(RewardFormModal, {
      reward: typeof showRewardForm === 'object' ? showRewardForm : null,
      onClose: () => setShowRewardForm(false),
      onSave: saveReward,
    }),
    bossModal && h(BossModal, {
      domainKey: bossModal.domain,
      level: bossModal.level,
      customBosses: state.customBosses,
      onClose: () => setBossModal(null),
      onComplete: () => completeBoss(bossModal.domain, bossModal.level),
    })
  );
}

// ---------- Header ----------

function Header({ gold, consistencyStreak, powerStreak, user, onSignOut, syncStatus, onGoldClick, onStreakClick, pendingBonuses, onDismissBonus, onRetrySync }) {
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
        h('div', { style: styles.title }, 'Adventure log'),
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

function Dashboard({ state, domainProgress, domainComputed, today, todayLog, onLogClick, onBossClick }) {
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

  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.3s ease' } },

    h('section', null,
      h(SectionLabel, { text: "Today's progress" }),
      h('div', { style: styles.bigMetersGrid },
        DOMAIN_KEYS.map(k => {
          const d = DOMAINS[k];
          const earned = todayLog[k] || 0;
          const pct = Math.round((earned / DAILY_GOAL) * 100);
          const overflow = Math.max(0, earned - DAILY_GOAL);
          const isOverflow = overflow > 0;
          return h('div', { key: k, style: styles.bigMeterCard },
            h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 } },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                h('div', { style: { ...styles.bigMeterIcon, background: hexToRgba(d.color, 0.14) } }, h(Icon, { name: d.icon, size: 20, color: d.color })),
                h('div', null,
                  h('div', { style: styles.bigMeterName }, d.name),
                  h('div', { style: styles.bigMeterSubName },
                    earned >= CONSISTENCY_MIN
                      ? h('span', { style: { color: '#86efac' } }, isOverflow ? 'Overachieving today' : 'Minimum met')
                      : h('span', null, `${CONSISTENCY_MIN - earned} XP to minimum`)
                  )
                )
              ),
              h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 6 } },
                h('span', { style: { ...styles.bigMeterValue, color: d.color } }, earned),
                h('span', { style: { fontSize: 13, color: '#7c7c8a', fontWeight: 600 } }, `/ ${DAILY_GOAL}`),
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

    h('section', null,
      h(SectionLabel, { text: 'Quick log' }),
      h('div', { style: styles.quickLogGrid },
        state.activities.map(act => {
          const d = DOMAINS[act.domain];
          return h('button', { key: act.id, className: 'rpg-btn', style: { ...styles.quickLogBtn, borderColor: 'rgba(255,255,255,0.08)' }, onClick: () => onLogClick(act) },
            h('div', { style: { ...styles.quickLogDot, background: d.color } }),
            h('div', { style: { flex: 1, textAlign: 'left' } },
              h('div', { style: styles.quickLogName }, act.name),
              h('div', { style: styles.quickLogMeta }, `${d.name} · ${act.subcat}`)
            ),
            h(Icon, { name: 'plus', size: 15, color: '#9ca3af' })
          );
        })
      )
    ),

    activeQuests.length > 0 && h('section', null,
      h(SectionLabel, { text: 'Active quests' }),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        activeQuests.slice(0,3).map(q => h(QuestRow, { key: q.id, quest: q, compact: true }))
      )
    ),

    h('section', null,
      h(SectionLabel, { text: 'Recent activity' }),
      state.activityLog.length === 0
        ? h(EmptyState, { text: 'No activity yet. Log something from Quick log above to start your run.' })
        : h('div', { style: styles.activityFeed },
            state.activityLog.slice(0, 8).map(log => {
              const d = DOMAINS[log.domain];
              return h('div', { key: log.id, style: styles.activityRow },
                h('div', { style: { ...styles.activityDot, background: d.color } }),
                h('div', { style: { flex: 1 } },
                  h('span', { style: styles.activityName }, log.activityName),
                  log.detail && h('span', { style: styles.activityDetail }, ` · ${log.detail}`)
                ),
                h('span', { style: { ...styles.activityXp, color: d.color } }, `+${log.xp} XP`),
                h('span', { style: styles.activityTime }, relativeTime(log.timestamp))
              );
            })
          )
    )
  );
}

// ---------- Section Label ----------

function SectionLabel({ text, icon, accent }) {
  return h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 } },
    icon && h(Icon, { name: icon, size: 13, color: accent || '#7c7c8a' }),
    h('span', { style: styles.sectionLabel }, text)
  );
}

function EmptyState({ text }) {
  return h('div', { style: styles.emptyState }, text);
}

// ---------- Activities View ----------

function ActivitiesView({ state, onLog, onEdit, onDelete, onAdd }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? state.activities : state.activities.filter(a => a.domain === filter);

  return h('div', { style: { animation: 'fadeIn 0.3s ease' } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 } },
      h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
        h(FilterChip, { label: 'All', active: filter==='all', onClick: () => setFilter('all') }),
        DOMAIN_KEYS.map(k => h(FilterChip, { key: k, label: DOMAINS[k].name, active: filter===k, onClick: () => setFilter(k), color: DOMAINS[k].color }))
      ),
      h('button', { className: 'rpg-btn', style: styles.primaryBtn, onClick: onAdd },
        h(Icon, { name: 'plus', size: 14 }), ' New activity'
      )
    ),
    filtered.length === 0
      ? h(EmptyState, { text: 'No activities in this domain yet. Create one to start tracking.' })
      : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          filtered.map(act => {
            const d = DOMAINS[act.domain];
            return h('div', { key: act.id, style: styles.activityCard },
              h('div', { style: { ...styles.quickLogDot, background: d.color } }),
              h('div', { style: { flex: 1, minWidth: 0 } },
                h('div', { style: styles.activityCardName }, act.name),
                h('div', { style: styles.activityCardMeta }, `${d.name} · ${act.subcat} · ${scoringLabel(act)}`),
                act.desc && h('div', { style: styles.activityCardDesc }, act.desc)
              ),
              h('div', { style: { display: 'flex', gap: 6 } },
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

function QuestsView({ state, onAdd, onUpdateProgress, onToggleCheckpoint, onDelete }) {
  const active = state.quests.filter(q => q.progress < 100);
  const completed = state.quests.filter(q => q.progress >= 100);

  return h('div', { style: { animation: 'fadeIn 0.3s ease' } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      h(SectionLabel, { text: `Active quests (${active.length})` }),
      h('button', { className: 'rpg-btn', style: styles.primaryBtn, onClick: onAdd }, h(Icon, { name: 'plus', size: 14 }), ' New quest')
    ),
    active.length === 0
      ? h(EmptyState, { text: 'No active quests. Create a time-bound quest to chart a longer journey.' })
      : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
          active.map(q => h(QuestRow, { key: q.id, quest: q, onUpdateProgress, onToggleCheckpoint, onDelete }))
        ),
    completed.length > 0 && h('div', { style: { marginTop: 24 } },
      h(SectionLabel, { text: `Completed (${completed.length})`, icon: 'trophy', accent: '#fbbf24' }),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        completed.map(q => h(QuestRow, { key: q.id, quest: q, onToggleCheckpoint, onDelete, compact: true }))
      )
    )
  );
}

function QuestRow({ quest, onUpdateProgress, onDelete, compact }) {
  const d = DOMAINS[quest.domain];
  const daysLeft = quest.days - Math.floor((Date.now() - quest.createdAt) / (1000*60*60*24));
  const isComplete = quest.progress >= 100;

  return h('div', { style: styles.questCard },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 } },
      h('div', { style: { flex: 1, minWidth: 0 } },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h(Icon, { name: d.icon, size: 14, color: d.color }),
          h('span', { style: styles.questName }, quest.name),
          isComplete && h(Icon, { name: 'trophy', size: 13, color: '#fbbf24' })
        ),
        !compact && quest.desc && h('div', { style: styles.questDesc }, quest.desc),
        h('div', { style: styles.questMeta },
          `${d.name} · ${quest.xpReward} XP reward`,
          !isComplete && (daysLeft >= 0 ? ` · ${daysLeft}d left` : ' · overdue')
        )
      ),
      h('div', { style: { textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 } },
        h('span', { style: { fontSize: 18, fontWeight: 700, color: isComplete ? '#fbbf24' : d.color } }, `${quest.progress}%`),
        onDelete && h('button', { className: 'rpg-btn', style: styles.iconBtnDanger, onClick: () => onDelete(quest.id) }, h(Icon, { name: 'trash2', size: 12 }))
      )
    ),
    h('div', { style: { ...styles.meterTrack, marginTop: 8 } },
      h('div', { style: { ...styles.meterFill, width: `${quest.progress}%`, background: isComplete ? '#fbbf24' : d.color } })
    ),
    onUpdateProgress && !isComplete && h('input', {
      type: 'range', min: 0, max: 100, value: quest.progress,
      onChange: (e) => onUpdateProgress(quest.id, parseInt(e.target.value)),
      style: { width: '100%', marginTop: 8, accentColor: d.color },
    })
  );
}

// ---------- Character View ----------

function CharacterView({ state, domainComputed, onBossClick, onAddSubcat }) {
  const totalLevel = DOMAIN_KEYS.reduce((sum,k) => sum + domainComputed[k].rank, 0);
  const totalXp = DOMAIN_KEYS.reduce((sum,k) => sum + state.domains[k].totalXp, 0);

  return h('div', { style: { animation: 'fadeIn 0.3s ease' } },
    h('div', { style: styles.charSummary },
      h('div', { style: styles.charAvatar }, h(Icon, { name: 'shield', size: 28, color: '#a78bfa' })),
      h('div', null,
        h('div', { style: { fontSize: 18, fontWeight: 700, color: '#f4f1ea' } }, 'Adventurer'),
        h('div', { style: { fontSize: 13, color: '#9ca3af' } }, `Combined level ${totalLevel} · ${totalXp.toLocaleString()} total XP`)
      )
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 } },
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
              comp.potentialRank > comp.rank && h('div', { style: { fontSize: 11, color: '#fbbf24' } }, `Potential: ${comp.potentialRank}`)
            )
          ),
          h('div', { style: styles.meterTrack }, h('div', { style: { ...styles.meterFill, width: `${pct}%`, background: d.color } })),
          h('div', { style: styles.meterSub }, `${comp.currentLevelXp} / ${comp.currentLevelReq} XP to next level`),
          h('div', { style: { marginTop: 12 } },
            h('div', { style: { fontSize: 12, color: '#7c7c8a', marginBottom: 6 } }, 'Subcategories'),
            h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
              allSubcats.map(s => h('span', { key: s, style: { ...styles.subcatPill, borderColor: hexToRgba(d.color,0.3), color: d.color } }, s)),
              h(AddSubcatButton, { domain: k, onAdd: onAddSubcat, color: d.color })
            )
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
      h('div', null,
        h('div', { style: { fontSize: 12, color: '#9ca3af', marginBottom: 2 } }, 'Reward currency'),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h(Icon, { name: 'coins', size: 22, color: '#fbbf24' }),
          h('span', { style: { fontSize: 28, fontWeight: 700, color: '#fbbf24' } }, state.gold),
          h('span', { style: { fontSize: 13, color: '#9ca3af' } }, 'gold')
        ),
        haveEstimate
          ? h('div', { style: { fontSize: 11, color: '#7c7c8a', marginTop: 4 } }, `Current pace: ~${avgPerDay.toFixed(1)} gold/day`)
          : h('div', { style: { fontSize: 11, color: '#7c7c8a', marginTop: 4 } }, 'No earning history yet — estimates will appear after you earn some gold.')
      )
    ),

    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '18px 0 12px' } },
      h(SectionLabel, { text: 'Reward catalog' }),
      h('button', { className: 'rpg-btn', style: styles.primaryBtn, onClick: onAdd }, h(Icon, { name: 'plus', size: 14 }), ' New reward')
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
      state.rewards.map(r => {
        const estimate = haveEstimate ? formatEstimate(Math.max(0, r.cost - state.gold), avgPerDay) : null;
        const canAfford = state.gold >= r.cost;
        return h('div', { key: r.id, style: styles.rewardCard },
          h('div', { style: { flex: 1, minWidth: 0 } },
            h('div', { style: { fontWeight: 700, fontSize: 14, color: '#f4f1ea' } }, r.name),
            r.desc && h('div', { style: { fontSize: 12, color: '#9ca3af', marginTop: 2 } }, r.desc),
            estimate && !canAfford && h('div', { style: { fontSize: 11.5, color: '#a78bfa', marginTop: 4 } }, `Est. ${estimate}`),
            canAfford && h('div', { style: { fontSize: 11.5, color: '#86efac', marginTop: 4 } }, '✓ Affordable')
          ),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            h('span', { style: { fontSize: 13, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 } },
              h(Icon, { name: 'coins', size: 13 }), ` ${r.cost}`
            ),
            h('button', {
              className: 'rpg-btn',
              style: { ...styles.primaryBtn, opacity: !canAfford ? 0.4 : 1, cursor: !canAfford ? 'not-allowed' : 'pointer' },
              disabled: !canAfford,
              onClick: () => onBuy(r),
            }, 'Buy ticket'),
            h('button', { className: 'rpg-btn', style: styles.iconBtn, onClick: () => onEdit(r) }, h(Icon, { name: 'edit2', size: 12 })),
            h('button', { className: 'rpg-btn', style: styles.iconBtnDanger, onClick: () => onDelete(r.id) }, h(Icon, { name: 'trash2', size: 12 }))
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
    h('div', { style: { ...styles.modalCard, maxWidth: width }, onClick: e => e.stopPropagation() },
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
    const data = { id: activity ? activity.id : undefined, name: name.trim(), domain, subcat, type, desc: desc.trim() };
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
      h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, justifyContent: 'center', padding: '10px 0' }, onClick: handleSave }, h(Icon, { name: 'check', size: 14 }), ' Save activity')
    )
  );
}

function QuestFormModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [domain, setDomain] = useState('health');
  const [days, setDays] = useState('30');
  const [xpReward, setXpReward] = useState(100);

  const daysNum = parseInt(days, 10);
  const daysValid = !isNaN(daysNum) && daysNum >= 1;

  function handleSave() {
    if (!name.trim() || !daysValid) return;
    onSave({ name: name.trim(), desc: desc.trim(), domain, days: daysNum, xpReward });
  }

  return h(ModalShell, { title: 'New quest', onClose },
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      h('div', null,
        h('label', { style: styles.label }, 'Quest name'),
        h('input', { value: name, onChange: e => setName(e.target.value), style: styles.input, placeholder: 'e.g. Finish anatomy course' })
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
            type: 'number', value: days, min: 1,
            onChange: e => setDays(e.target.value),
            style: { ...styles.input, ...(daysValid ? {} : { borderColor: 'rgba(226,75,74,0.5)' }) },
            placeholder: 'e.g. 30',
          }),
          !daysValid && h('div', { style: { fontSize: 11, color: '#f09595', marginTop: 4 } }, 'Enter at least 1 day')
        )
      ),
      h('div', null,
        h('label', { style: styles.label }, 'XP reward on completion'),
        h('input', { type: 'number', value: xpReward, min: 0, onChange: e => setXpReward(parseInt(e.target.value)||0), style: styles.input })
      ),
      h('button', {
        className: 'rpg-btn',
        disabled: !name.trim() || !daysValid,
        style: { ...styles.primaryBtn, justifyContent: 'center', padding: '10px 0', opacity: (!name.trim() || !daysValid) ? 0.5 : 1, cursor: (!name.trim() || !daysValid) ? 'not-allowed' : 'pointer' },
        onClick: handleSave,
      }, h(Icon, { name: 'check', size: 14 }), ' Create quest')
    )
  );
}

function RewardFormModal({ reward, onClose, onSave }) {
  const [name, setName] = useState(reward ? reward.name : '');
  const [cost, setCost] = useState(reward ? reward.cost : 50);
  const [desc, setDesc] = useState(reward ? reward.desc : '');

  function handleSave() {
    if (!name.trim()) return;
    onSave({ id: reward ? reward.id : undefined, name: name.trim(), cost, desc: desc.trim() });
  }

  return h(ModalShell, { title: reward ? 'Edit reward' : 'New reward', onClose },
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      h('div', null,
        h('label', { style: styles.label }, 'Reward name'),
        h('input', { value: name, onChange: e => setName(e.target.value), style: styles.input, placeholder: 'e.g. Movie night' })
      ),
      h('div', null,
        h('label', { style: styles.label }, 'Gold cost'),
        h('input', { type: 'number', value: cost, min: 1, onChange: e => setCost(parseInt(e.target.value)||0), style: styles.input })
      ),
      h('div', null,
        h('label', { style: styles.label }, 'Description (optional)'),
        h('textarea', { value: desc, onChange: e => setDesc(e.target.value), style: { ...styles.input, minHeight: 50 } })
      ),
      h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, justifyContent: 'center', padding: '10px 0' }, onClick: handleSave }, h(Icon, { name: 'check', size: 14 }), ' Save reward')
    )
  );
}

function BossModal({ domainKey, level, customBosses, onClose, onComplete }) {
  const d = DOMAINS[domainKey];
  const custom = customBosses && customBosses[domainKey] && customBosses[domainKey][level];
  const bosses = (custom && custom.filter(c => c && c.trim()).length > 0)
    ? custom.filter(c => c && c.trim())
    : ((DEFAULT_BOSSES[domainKey] && DEFAULT_BOSSES[domainKey][level]) || ['Complete a milestone challenge']);

  return h(ModalShell, { title: `${d.name} — boss battle: level ${level}`, onClose, width: 440 },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 } },
      h('div', { style: { ...styles.bossIcon, background: d.dark900, borderColor: d.dark600, width: 40, height: 40 } }, h(Icon, { name: 'trophy', size: 20, color: '#fbbf24' })),
      h('div', { style: { fontSize: 13, color: '#9ca3af' } }, "Your XP is high enough for the next rank, but it's gated until you defeat one of these challenges.")
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 } },
      bosses.map((b,i) => h('div', { key: i, style: styles.bossChallenge },
        h(Icon, { name: 'target', size: 14, color: d.color }),
        h('span', { style: { fontSize: 13, color: '#d1d5db' } }, b)
      ))
    ),
    custom && h('div', { style: { fontSize: 11, color: '#7c7c8a', marginBottom: 10, textAlign: 'center' } }, 'Your custom challenges'),
    h('button', {
      className: 'rpg-btn',
      style: { ...styles.primaryBtn, width: '100%', justifyContent: 'center', padding: '10px 0', background: 'rgba(251,191,36,0.15)', borderColor: '#fbbf24', color: '#fbbf24' },
      onClick: onComplete,
    }, h(Icon, { name: 'trophy', size: 14 }), ' Mark boss defeated')
  );
}

// ---------- Floating action button (quick log) ----------

function FAB({ onClick }) {
  return h('button', {
    className: 'rpg-btn',
    onClick,
    style: styles.fab,
    title: 'Quick log',
    'aria-label': 'Quick log',
  }, h(Icon, { name: 'plus', size: 26, color: 'white' }));
}

function QuickLogSheet({ activities, onSelect, onClose }) {
  return h('div', { style: styles.modalOverlay, onClick: onClose },
    h('div', { style: styles.bottomSheet, onClick: e => e.stopPropagation() },
      h('div', { style: styles.modalHeader },
        h('span', { style: styles.modalTitle }, 'Quick log'),
        h('button', { className: 'rpg-btn', style: styles.iconBtn, onClick: onClose }, h(Icon, { name: 'x', size: 14 }))
      ),
      h('div', { style: { padding: 12, maxHeight: '60vh', overflowY: 'auto' }, className: 'rpg-scroll' },
        activities.length === 0
          ? h(EmptyState, { text: 'No activities yet. Create one in the Activities tab first.' })
          : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
              activities.map(act => {
                const d = DOMAINS[act.domain];
                return h('button', {
                  key: act.id,
                  className: 'rpg-btn',
                  onClick: () => onSelect(act),
                  style: styles.quickLogBtn,
                },
                  h('div', { style: { ...styles.quickLogDot, background: d.color } }),
                  h('div', { style: { flex: 1, textAlign: 'left' } },
                    h('div', { style: styles.quickLogName }, act.name),
                    h('div', { style: styles.quickLogMeta }, `${d.name} · ${act.subcat}`)
                  ),
                  h(Icon, { name: 'plus', size: 15, color: '#9ca3af' })
                );
              })
            )
      )
    )
  );
}

// ---------- Streak calendar ----------

function StreakCalendarModal({ mode, dailyLogs, onClose }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = viewDate.getDay();
  const todayKeyStr = dateKey(now);

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const log = dailyLogs[key];
    const status = dayStatus(log);
    cells.push({ day: d, status, key, isToday: key === todayKeyStr });
  }

  // Color logic
  function cellColor(status, isToday) {
    if (mode === 'power') {
      if (status === 'power') return { bg: '#fbbf24', fg: '#13131a', border: '#fbbf24' };
      if (status === 'consistency') return { bg: 'rgba(251,191,36,0.15)', fg: '#fbbf24', border: 'rgba(251,191,36,0.3)' };
      if (status === 'partial') return { bg: 'rgba(156,163,175,0.1)', fg: '#9ca3af', border: '#2a2a35' };
      return { bg: 'transparent', fg: '#5e5e6b', border: '#22222e' };
    }
    // consistency mode
    if (status === 'consistency' || status === 'power') return { bg: '#22c55e', fg: '#13131a', border: '#22c55e' };
    if (status === 'partial') return { bg: 'rgba(156,163,175,0.1)', fg: '#9ca3af', border: '#2a2a35' };
    return { bg: 'transparent', fg: '#5e5e6b', border: '#22222e' };
  }

  const dayLabels = ['S','M','T','W','T','F','S'];
  const title = mode === 'power' ? 'Power streak' : 'Day streak';

  return h(ModalShell, { title, onClose, width: 380 },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      h('button', { className: 'rpg-btn', style: styles.iconBtn, onClick: () => setMonthOffset(o => o - 1) },
        h(Icon, { name: 'chevronLeft', size: 14 })
      ),
      h('span', { style: { fontSize: 14, fontWeight: 600, color: '#f4f1ea' } }, monthName),
      h('button', {
        className: 'rpg-btn',
        style: { ...styles.iconBtn, opacity: monthOffset >= 0 ? 0.3 : 1, cursor: monthOffset >= 0 ? 'not-allowed' : 'pointer' },
        disabled: monthOffset >= 0,
        onClick: () => setMonthOffset(o => Math.min(0, o + 1)),
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
        return h('div', {
          key: c.key,
          style: {
            aspectRatio: '1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600,
            background: colors.bg,
            color: colors.fg,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            outline: c.isToday ? '2px solid #a78bfa' : 'none',
            outlineOffset: -2,
          },
          title: `${c.key} — ${c.status}`,
        }, c.day);
      })
    ),
    h('div', { style: { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5, color: '#9ca3af' } },
      mode === 'power'
        ? [
            h('div', { key: 1, style: { display: 'flex', alignItems: 'center', gap: 6 } }, h('span', { style: { width: 10, height: 10, background: '#fbbf24', borderRadius: 3, display: 'inline-block' } }), 'Power day (all 4 hit 100/100)'),
            h('div', { key: 2, style: { display: 'flex', alignItems: 'center', gap: 6 } }, h('span', { style: { width: 10, height: 10, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 3, display: 'inline-block' } }), 'Consistency day only'),
            h('div', { key: 3, style: { display: 'flex', alignItems: 'center', gap: 6 } }, h('span', { style: { width: 10, height: 10, background: 'rgba(156,163,175,0.1)', border: '1px solid #2a2a35', borderRadius: 3, display: 'inline-block' } }), 'Some activity, below threshold'),
          ]
        : [
            h('div', { key: 1, style: { display: 'flex', alignItems: 'center', gap: 6 } }, h('span', { style: { width: 10, height: 10, background: '#22c55e', borderRadius: 3, display: 'inline-block' } }), 'Consistency met (all 4 ≥ 50 XP)'),
            h('div', { key: 2, style: { display: 'flex', alignItems: 'center', gap: 6 } }, h('span', { style: { width: 10, height: 10, background: 'rgba(156,163,175,0.1)', border: '1px solid #2a2a35', borderRadius: 3, display: 'inline-block' } }), 'Some activity, below threshold'),
          ]
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
  const defaults = (DEFAULT_BOSSES[domain] && DEFAULT_BOSSES[domain][level]) || ['', '', ''];
  const initial = existing && existing.length === 3 ? existing : [defaults[0] || '', defaults[1] || '', defaults[2] || ''];
  const [challenges, setChallenges] = useState(initial);

  function updateChallenge(i, val) {
    setChallenges(c => c.map((x, idx) => idx === i ? val : x));
  }

  function resetToDefaults() {
    setChallenges([defaults[0] || '', defaults[1] || '', defaults[2] || '']);
  }

  return h(ModalShell, { title: `${d.name} — Level ${level} boss`, onClose, width: 460 },
    h('div', { style: { fontSize: 13, color: '#9ca3af', marginBottom: 14 } },
      'Define the 3 challenges you can choose from at this boss gate. Leave blank to skip a slot.'
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 } },
      challenges.map((c, i) => h('div', { key: i },
        h('label', { style: styles.label }, `Challenge ${i + 1}`),
        h('input', {
          value: c,
          onChange: e => updateChallenge(i, e.target.value),
          style: styles.input,
          placeholder: defaults[i] || 'Enter a challenge…',
        })
      ))
    ),
    h('div', { style: { display: 'flex', gap: 8 } },
      h('button', { className: 'rpg-btn', style: { ...styles.secondaryBtn, flex: 1, justifyContent: 'center', padding: '10px 0' }, onClick: resetToDefaults }, 'Reset to suggested'),
      h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, flex: 1, justifyContent: 'center', padding: '10px 0' }, onClick: () => onSave(challenges) },
        h(Icon, { name: 'check', size: 14 }), ' Save'
      )
    )
  );
}

// ---------- Settings view ----------

function BuyConfirmModal({ reward, canAfford, onConfirm, onCancel }) {
  return h(ModalShell, { title: 'Buy ticket?', onClose: onCancel, width: 380 },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 } },
      h('div', { style: { ...styles.bossIcon, background: 'rgba(167,139,250,0.15)', borderColor: 'rgba(167,139,250,0.35)', width: 40, height: 40 } }, h(Icon, { name: 'gift', size: 18, color: '#a78bfa' })),
      h('div', { style: { flex: 1, minWidth: 0 } },
        h('div', { style: { fontWeight: 700, fontSize: 14, color: '#f4f1ea' } }, reward.name),
        reward.desc && h('div', { style: { fontSize: 12, color: '#9ca3af', marginTop: 2 } }, reward.desc)
      )
    ),
    h('div', { style: { fontSize: 13, color: '#d1d5db', lineHeight: 1.6, marginBottom: 14 } },
      `Buy a ticket for `, h('span', { style: { fontWeight: 700, color: '#fbbf24' } }, `${reward.cost} gold`),
      `? You can use the ticket whenever you're ready, or sell it later for `, h('span', { style: { fontWeight: 700, color: '#fbbf24' } }, `${Math.floor(reward.cost * SELL_REFUND_RATIO)} gold`),
      ` (50% refund — pick wisely).`
    ),
    !canAfford && h('div', { style: { fontSize: 12, color: '#f09595', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.25)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 } },
      'Not enough gold yet.'
    ),
    h('div', { style: { display: 'flex', gap: 8 } },
      h('button', { className: 'rpg-btn', style: { ...styles.secondaryBtn, flex: 1, justifyContent: 'center', padding: '10px 0' }, onClick: onCancel }, 'Cancel'),
      h('button', {
        className: 'rpg-btn',
        disabled: !canAfford,
        style: { ...styles.primaryBtn, flex: 1, justifyContent: 'center', padding: '10px 0', opacity: canAfford ? 1 : 0.4, cursor: canAfford ? 'pointer' : 'not-allowed' },
        onClick: () => canAfford && onConfirm(),
      }, h(Icon, { name: 'check', size: 14 }), ' Confirm buy')
    )
  );
}

function SettingsView({ state, onResetDomain, onResetAll, onEditBoss, onToggleGate }) {
  const [expandedDomain, setExpandedDomain] = useState(null);

  return h('div', { style: { animation: 'fadeIn 0.3s ease' } },

    h('section', { style: { marginBottom: 24 } },
      h(SectionLabel, { text: 'Level gates & boss battles' }),
      h('div', { style: { fontSize: 12, color: '#9ca3af', marginBottom: 12 } },
        'Boss gates lock your rank advancement every 10 levels by default. You can enable the in-between gates (5, 15, 25, 35, 45) to create tighter challenges.'
      ),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        DOMAIN_KEYS.map(k => {
          const d = DOMAINS[k];
          const isOpen = expandedDomain === k;
          const customCount = state.customBosses && state.customBosses[k]
            ? Object.keys(state.customBosses[k]).filter(lvl => {
                const ch = state.customBosses[k][lvl];
                return ch && ch.filter(c => c && c.trim()).length > 0;
              }).length
            : 0;
          const enabled = activeBossLevelsFor(state, k);
          return h('div', { key: k, style: { background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 10, overflow: 'hidden' } },
            h('button', {
              className: 'rpg-btn',
              onClick: () => setExpandedDomain(isOpen ? null : k),
              style: { width: '100%', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', color: '#e5e7eb' },
            },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                h(Icon, { name: d.icon, size: 16, color: d.color }),
                h('span', { style: { fontSize: 13.5, fontWeight: 600 } }, d.name),
                h('span', { style: { fontSize: 11, color: '#7c7c8a' } },
                  `· ${enabled.length} gate${enabled.length === 1 ? '' : 's'} active`,
                  customCount > 0 ? `, ${customCount} customized` : ''
                )
              ),
              h('div', { style: { transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' } },
                h(Icon, { name: 'chevronRight', size: 14, color: '#7c7c8a' })
              )
            ),
            isOpen && h('div', { style: { padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: 6 } },
              BOSS_LEVELS_ALL.map(bl => {
                const isDefault = BOSS_LEVELS_DEFAULT.indexOf(bl) >= 0; // mults of 10
                const isEnabled = enabled.indexOf(bl) >= 0;
                const custom = state.customBosses && state.customBosses[k] && state.customBosses[k][bl];
                const isCustom = custom && custom.filter(c => c && c.trim()).length > 0;
                return h('div', { key: bl, style: { ...styles.bossLevelRow, borderColor: isEnabled ? (isCustom ? hexToRgba(d.color, 0.3) : '#2a2a35') : '#22222e', opacity: isEnabled ? 1 : 0.55 } },
                  h('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: 8 } },
                    h('span', { style: { fontSize: 13, color: '#e5e7eb', fontWeight: 600 } }, `Level ${bl}`),
                    isDefault
                      ? h('span', { style: { fontSize: 10, color: '#7c7c8a', textTransform: 'uppercase', letterSpacing: 0.5 } }, 'Default')
                      : h('span', { style: { fontSize: 10, color: '#7c7c8a', textTransform: 'uppercase', letterSpacing: 0.5 } }, 'Optional'),
                    isCustom && h('span', { style: { fontSize: 10, color: d.color, textTransform: 'uppercase', letterSpacing: 0.5 } }, 'Custom')
                  ),
                  // Toggle: default gates can be turned off too (user choice).
                  h('button', {
                    className: 'rpg-btn',
                    onClick: () => onToggleGate(k, bl),
                    style: { ...styles.toggleSwitch, background: isEnabled ? d.color : '#2a2a35' },
                    title: isEnabled ? 'Disable this gate' : 'Enable this gate',
                  },
                    h('span', { style: { ...styles.toggleKnob, left: isEnabled ? 18 : 2 } })
                  ),
                  h('button', {
                    className: 'rpg-btn',
                    onClick: () => onEditBoss(k, bl),
                    style: { ...styles.iconBtn, opacity: isEnabled ? 1 : 0.5 },
                    title: 'Edit challenges',
                  },
                    h(Icon, { name: 'edit2', size: 12 })
                  )
                );
              })
            )
          );
        })
      )
    ),

    h('section', { style: { marginBottom: 24 } },
      h(SectionLabel, { text: 'Reset progress' }),
      h('div', { style: { fontSize: 12, color: '#9ca3af', marginBottom: 12 } },
        'Resets erase XP, levels, and boss completions for the chosen scope. Activity templates and rewards are kept.'
      ),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        DOMAIN_KEYS.map(k => {
          const d = DOMAINS[k];
          const totalXp = state.domains[k] ? state.domains[k].totalXp : 0;
          return h('div', { key: k, style: { ...styles.rewardCard } },
            h('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: 10 } },
              h(Icon, { name: d.icon, size: 16, color: d.color }),
              h('div', null,
                h('div', { style: { fontSize: 13, fontWeight: 600, color: '#f4f1ea' } }, `Reset ${d.name}`),
                h('div', { style: { fontSize: 11, color: '#7c7c8a' } }, `Currently ${totalXp.toLocaleString()} total XP`)
              )
            ),
            h('button', { className: 'rpg-btn', style: styles.dangerBtnSmall, onClick: () => onResetDomain(k) }, 'Reset')
          );
        })
      )
    ),

    h('section', null,
      h(SectionLabel, { text: 'Danger zone' }),
      h('div', { style: { fontSize: 12, color: '#9ca3af', marginBottom: 12 } },
        'Wipes everything except your saved activity templates, rewards, and custom bosses. Requires typing RESET to confirm.'
      ),
      h('button', {
        className: 'rpg-btn',
        style: { ...styles.dangerBtn, width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: 13 },
        onClick: onResetAll,
      }, h(Icon, { name: 'trash2', size: 14 }), ' Reset entire character')
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

const styles = {
  app: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: '#13131a',
    color: '#e5e7eb',
    minHeight: '100vh',
    borderRadius: 0,
    overflow: 'hidden',
    width: '100%',
  },
  loadingScreen: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: '#13131a', color: '#9ca3af',
    fontFamily: "'Inter', sans-serif", fontSize: 13,
  },
  loadingText: { opacity: 0.7 },
  toast: {
    position: 'fixed', top: 12, right: 12, zIndex: 50,
    background: '#1f1f2b', border: '1px solid #3a3a4a', borderRadius: 8,
    padding: '8px 14px', fontSize: 13, color: '#e5e7eb',
    animation: 'toastSlide 0.25s ease', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', borderBottom: '1px solid #22222e',
    background: 'linear-gradient(180deg, #1a1a24 0%, #15151e 100%)',
    flexWrap: 'wrap', gap: 12,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  logoMark: {
    width: 38, height: 38, borderRadius: 10, background: 'rgba(167,139,250,0.12)',
    border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: 700, color: '#f4f1ea', letterSpacing: 0.2 },
  subtitle: { fontSize: 11.5, color: '#7c7c8a', marginTop: 1 },
  headerRight: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  streakChip: {
    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px',
    background: '#1f1f2b', border: '1px solid #2e2e3a', borderRadius: 999, fontSize: 12,
  },
  goldChip: {
    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px',
    background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 999, fontSize: 12,
  },
  streakNum: { fontWeight: 700, color: '#f4f1ea', fontSize: 13 },
  streakLabel: { color: '#7c7c8a', fontSize: 11 },
  nav: {
    display: 'flex', gap: 4, padding: '10px 16px', borderBottom: '1px solid #22222e',
    overflowX: 'auto', background: '#15151e',
  },
  navBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    background: 'transparent', border: '1px solid transparent', borderRadius: 8,
    color: '#9ca3af', fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap',
  },
  navBtnActive: {
    background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', color: '#c4b5fd',
  },
  main: { padding: '18px 20px 28px', maxWidth: 900, margin: '0 auto' },
  sectionLabel: { fontSize: 11.5, fontWeight: 700, color: '#7c7c8a', textTransform: 'uppercase', letterSpacing: 0.8 },
  metersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 },
  bigMetersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 },
  bigMeterCard: {
    background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 14, padding: '16px 18px',
  },
  bigMeterIcon: {
    width: 38, height: 38, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  bigMeterName: { fontSize: 15, fontWeight: 700, color: '#f4f1ea' },
  bigMeterSubName: { fontSize: 11.5, color: '#9ca3af', marginTop: 2 },
  bigMeterValue: { fontSize: 30, fontWeight: 700, lineHeight: 1 },
  meterCard: { background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 10, padding: '12px 14px' },
  levelCard: { background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 10, padding: '12px 14px' },
  meterTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  meterName: { fontSize: 13, fontWeight: 600, color: '#e5e7eb' },
  meterValue: { fontSize: 13, fontWeight: 700 },
  meterTrack: { height: 8, background: '#0e0e14', borderRadius: 999, overflow: 'hidden', position: 'relative' },
  meterFill: { height: '100%', borderRadius: 999, transition: 'width 0.4s ease' },
  meterSub: { fontSize: 11, color: '#7c7c8a', marginTop: 6 },
  bossRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#1a1a24', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 10,
    padding: '10px 14px', cursor: 'pointer',
  },
  bossIcon: { width: 32, height: 32, borderRadius: 8, border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bossTitle: { fontSize: 13, fontWeight: 600, color: '#f4f1ea' },
  bossSub: { fontSize: 11, color: '#9ca3af', marginTop: 1 },
  quickLogGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 },
  quickLogBtn: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 10, color: '#e5e7eb',
  },
  quickLogDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  quickLogName: { fontSize: 13, fontWeight: 600 },
  quickLogMeta: { fontSize: 11, color: '#7c7c8a', marginTop: 1 },
  activityFeed: { display: 'flex', flexDirection: 'column', gap: 6 },
  activityRow: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
    background: '#1a1a24', border: '1px solid #25252f', borderRadius: 8,
  },
  activityDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  activityName: { fontSize: 12.5, fontWeight: 500, color: '#e5e7eb' },
  activityDetail: { fontSize: 11.5, color: '#7c7c8a' },
  activityXp: { fontSize: 12.5, fontWeight: 700 },
  activityTime: { fontSize: 11, color: '#5e5e6b', minWidth: 44, textAlign: 'right' },
  emptyState: {
    padding: '24px 16px', textAlign: 'center', color: '#5e5e6b', fontSize: 13,
    background: '#1a1a24', border: '1px dashed #2a2a35', borderRadius: 10,
  },
  primaryBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
    background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', borderRadius: 8,
    color: '#c4b5fd', fontSize: 12.5, fontWeight: 600,
  },
  iconBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30,
    background: '#1f1f2b', border: '1px solid #2e2e3a', borderRadius: 8, color: '#9ca3af',
  },
  iconBtnDanger: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30,
    background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.25)', borderRadius: 8, color: '#f09595',
  },
  filterChip: {
    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
    background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 999, color: '#9ca3af', fontSize: 12, fontWeight: 500,
  },
  activityCard: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
    background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 10,
  },
  activityCardName: { fontSize: 13.5, fontWeight: 600, color: '#f4f1ea' },
  activityCardMeta: { fontSize: 11.5, color: '#7c7c8a', marginTop: 2 },
  activityCardDesc: { fontSize: 11.5, color: '#9ca3af', marginTop: 4 },
  questCard: { background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 10, padding: '12px 14px' },
  questName: { fontSize: 13.5, fontWeight: 600, color: '#f4f1ea' },
  questDesc: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  questMeta: { fontSize: 11, color: '#7c7c8a', marginTop: 4 },
  charSummary: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
    background: 'linear-gradient(135deg, rgba(167,139,250,0.1), rgba(167,139,250,0.02))',
    border: '1px solid rgba(167,139,250,0.2)', borderRadius: 12,
  },
  charAvatar: {
    width: 50, height: 50, borderRadius: 12, background: 'rgba(167,139,250,0.15)',
    border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  charDomainCard: { background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 12, padding: '14px 16px' },
  charDomainIcon: { width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  subcatPill: {
    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999,
    border: '1px solid', fontSize: 11.5, fontWeight: 500, background: 'transparent',
  },
  bossPill: {
    display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 999,
    border: '1px solid #2a2a35', fontSize: 11.5, fontWeight: 600, background: 'transparent', color: '#5e5e6b',
  },
  bossChallenge: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
    background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 8,
  },
  goldBanner: {
    background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(251,191,36,0.02))',
    border: '1px solid rgba(251,191,36,0.25)', borderRadius: 12, padding: '14px 18px',
  },
  rewardCard: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
    background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 10,
  },
  ticketCard: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
    background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 10,
    transition: 'opacity 0.2s ease',
  },
  toggleSwitch: {
    width: 36, height: 20, borderRadius: 999, position: 'relative',
    border: 'none', cursor: 'pointer', transition: 'background 0.2s ease',
    flexShrink: 0,
  },
  toggleKnob: {
    position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%',
    background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    transition: 'left 0.2s ease',
  },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16,
  },
  modalCard: {
    background: '#1a1a24', border: '1px solid #2e2e3a', borderRadius: 14, width: '100%',
    maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #25252f' },
  modalTitle: { fontSize: 14, fontWeight: 700, color: '#f4f1ea' },
  label: { display: 'block', fontSize: 11.5, color: '#9ca3af', marginBottom: 5, fontWeight: 600 },
  input: {
    width: '100%', padding: '8px 10px', background: '#0e0e14', border: '1px solid #2a2a35',
    borderRadius: 8, color: '#e5e7eb', fontSize: 13, outline: 'none',
  },
  xpPreview: {
    display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '10px 14px',
    background: '#0e0e14', border: '1px solid #2a2a35', borderRadius: 10,
  },
  accountBtn: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)',
    color: '#c4b5fd', fontSize: 13, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  accountMenu: {
    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
    background: '#1f1f2b', border: '1px solid #2e2e3a', borderRadius: 10,
    minWidth: 200, zIndex: 90, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  accountMenuEmail: {
    padding: '10px 14px', borderBottom: '1px solid #2e2e3a',
    fontSize: 12, color: '#9ca3af', wordBreak: 'break-all',
  },
  accountMenuItem: {
    width: '100%', textAlign: 'left', padding: '10px 14px',
    background: 'transparent', border: 'none', color: '#e5e7eb', fontSize: 13,
    cursor: 'pointer',
  },
  bonusBell: {
    position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 34, borderRadius: '50%',
    background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)',
    animation: 'pulseGlow 1.6s infinite',
  },
  bonusBadge: {
    position: 'absolute', top: -4, right: -4,
    background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 700,
    minWidth: 16, height: 16, borderRadius: 999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 3px',
  },
  bonusPopover: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: '#1f1f2b', border: '1px solid #2e2e3a', borderRadius: 12,
    minWidth: 240, zIndex: 95, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    padding: '12px 14px',
  },
  bonusRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 10px', background: 'rgba(251,191,36,0.06)',
    border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8,
  },
  authScreen: {
    minHeight: '100vh', minHeight: '100dvh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20, background: '#13131a',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  authCard: {
    width: '100%', maxWidth: 380,
    background: '#1a1a24', border: '1px solid #2e2e3a', borderRadius: 14,
    padding: '28px 24px', boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
  },
  authTitle: { fontSize: 18, fontWeight: 700, color: '#f4f1ea', marginBottom: 4 },
  authSubtitle: { fontSize: 13, color: '#9ca3af' },
  authError: {
    background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)',
    color: '#f09595', fontSize: 12.5, padding: '8px 12px', borderRadius: 8,
  },
  authLink: {
    color: '#c4b5fd', textDecoration: 'none', fontWeight: 600,
  },
  secondaryBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    background: 'transparent', border: '1px solid #2e2e3a', borderRadius: 8,
    color: '#9ca3af', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
  },
  dangerBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    background: 'rgba(226,75,74,0.12)', border: '1px solid rgba(226,75,74,0.4)', borderRadius: 8,
    color: '#f09595', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
  },
  dangerBtnSmall: {
    padding: '6px 12px',
    background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)', borderRadius: 8,
    color: '#f09595', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  fab: {
    position: 'fixed',
    bottom: 'calc(env(safe-area-inset-bottom) + 20px)',
    right: 20,
    width: 56, height: 56, borderRadius: '50%',
    background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    border: 'none',
    color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 6px 24px rgba(124,58,237,0.45), 0 2px 6px rgba(0,0,0,0.3)',
    zIndex: 80,
    cursor: 'pointer',
  },
  bottomSheet: {
    background: '#1a1a24',
    border: '1px solid #2e2e3a',
    borderRadius: 14,
    width: '100%',
    maxWidth: 440,
    maxHeight: '80vh',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
  },
  overflowBadge: {
    fontSize: 11, fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 999,
    border: '1px solid',
  },
  bossLevelRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.02)', border: '1px solid #2a2a35', borderRadius: 8,
    cursor: 'pointer',
  },
};

// ---------- Render ----------

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(h(AuthGate));
