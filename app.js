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

const BOSS_LEVELS = [10, 20, 30, 40, 50];

const DEFAULT_BOSSES = {
  health: {
    10: ['Run a 5K', 'Complete a 2-week sleep reset', 'Hit a strength PR'],
    20: ['Complete a 30-day mobility challenge', '10,000 steps for 14 days straight', 'Cut a habit for 30 days'],
    30: ['Run a 10K', 'Complete a fitness milestone', 'Finish a structured training block'],
    40: ['Complete a half-marathon', 'Reach a body composition goal', 'Master a new physical skill'],
    50: ['Complete a major endurance event', 'Reach peak physical milestone', 'Year-long consistency badge'],
  },
  relationships: {
    10: ['Plan a meaningful experience', 'Have a difficult conversation', 'Reconnect with an old friend'],
    20: ['Complete a communication challenge', 'Plan a trip with someone close', 'Resolve a lingering conflict'],
    30: ['Plan a meaningful experience', 'Complete a communication challenge', 'Reach a relationship milestone'],
    40: ['Deepen a key relationship', 'Host a gathering', 'Mentor someone'],
    50: ['Major relationship milestone', 'Build a lasting tradition', 'Community contribution'],
  },
  career: {
    10: ['Finish an intro course', 'Ship a small project', 'Complete a skill assessment'],
    20: ['Build a portfolio piece', 'Get feedback from a mentor', 'Complete an intermediate course'],
    30: ['Finish RPG Maker course', 'Release a playable prototype', 'Complete a creative project'],
    40: ['Launch a product or service', 'Land a major opportunity', 'Complete an advanced certification'],
    50: ['Major career milestone', 'Establish recurring income stream', 'Master-level project complete'],
  },
  finance: {
    10: ['Track spending for 30 days', 'Set up a budget system', 'Pay off a small debt'],
    20: ['Build a starter emergency fund', 'Automate savings', 'Complete a financial literacy course'],
    30: ['Create an investment plan', 'Build a full emergency fund', 'Complete a financial milestone'],
    40: ['Reach a net worth milestone', 'Diversify income streams', 'Optimize tax strategy'],
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
      totalXp: 320 + Math.floor(Math.random()*400),
      level: 0,
      rank: 0,
      potentialRank: 0,
    };
  });

  return {
    activities: STARTER_ACTIVITIES,
    quests: STARTER_QUESTS,
    dailyLogs: {},
    activityLog: [],
    domains: domainState,
    consistencyStreak: 4,
    powerStreak: 1,
    lastConsistencyDate: null,
    lastPowerDate: null,
    gold: 240,
    rewards: DEFAULT_REWARDS,
    customSubcats: {},
    bossCompletions: {},
  };
}

function computeProgression(totalXp, bossCompletions, domainKey) {
  let level = 1;
  let remaining = totalXp;
  let req = levelXpRequirement(level);
  while (remaining >= req) {
    remaining -= req;
    level += 1;
    req = levelXpRequirement(level);
  }
  const potentialRank = level;

  let rank = level;
  for (const bossLevel of BOSS_LEVELS) {
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
  const [migrationPrompt, setMigrationPrompt] = useState(null); // { localState }
  const toastTimer = useRef(null);
  const saveTimer = useRef(null);
  const lastSavedJson = useRef(null);
  const remoteUpdatedAt = useRef(0);

  // Load: subscribe to Firestore for this user. The first snapshot gives us
  // the initial state; subsequent snapshots are realtime updates from other
  // devices.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let unsub = null;

    (async () => {
      const remote = await window.RPGLifeSync.loadState(user.uid);
      if (cancelled) return;

      if (remote) {
        setState(remote);
        lastSavedJson.current = JSON.stringify(remote);
      } else {
        // No remote state yet. Check if there's local state to migrate.
        let localRaw = null;
        try { localRaw = localStorage.getItem('rpglife-state'); } catch (e) {}
        if (localRaw) {
          try {
            const localState = JSON.parse(localRaw);
            setMigrationPrompt({ localState });
            // wait for user choice before setting state
            return;
          } catch (e) {}
        }
        const fresh = buildInitialState();
        setState(fresh);
        lastSavedJson.current = JSON.stringify(fresh);
        // seed Firestore so subsequent loads/devices see the same starting point
        await window.RPGLifeSync.saveState(user.uid, fresh);
      }
      setLoaded(true);

      // Now subscribe to ongoing changes from other devices.
      unsub = window.RPGLifeSync.subscribeToState(user.uid, (snapState, updatedAt) => {
        if (!snapState) return;
        // Ignore snapshots older than what we already have (echo of our own writes)
        if (updatedAt <= remoteUpdatedAt.current) return;
        remoteUpdatedAt.current = updatedAt;
        const snapJson = JSON.stringify(snapState);
        if (snapJson === lastSavedJson.current) return; // no actual change
        lastSavedJson.current = snapJson;
        setState(snapState);
      });
    })();

    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [user]);

  // Save: debounced write to Firestore on state change. Skip the initial set
  // (where lastSavedJson already matches).
  useEffect(() => {
    if (!loaded || !state || !user) return;
    const json = JSON.stringify(state);
    if (json === lastSavedJson.current) return;
    lastSavedJson.current = json;
    setSyncStatus('syncing');

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const ok = await window.RPGLifeSync.saveState(user.uid, state);
      remoteUpdatedAt.current = Date.now();
      setSyncStatus(ok ? 'idle' : 'offline');
    }, 800);
  }, [state, loaded, user]);

  function acceptMigration() {
    const local = migrationPrompt.localState;
    setState(local);
    lastSavedJson.current = JSON.stringify(local);
    setMigrationPrompt(null);
    setLoaded(true);
    // Save to Firestore immediately so other devices get it
    window.RPGLifeSync.saveState(user.uid, local).then(() => {
      remoteUpdatedAt.current = Date.now();
    });
  }

  function declineMigration() {
    const fresh = buildInitialState();
    setState(fresh);
    lastSavedJson.current = JSON.stringify(fresh);
    setMigrationPrompt(null);
    setLoaded(true);
    window.RPGLifeSync.saveState(user.uid, fresh).then(() => {
      remoteUpdatedAt.current = Date.now();
    });
  }

  function showToast(msg) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  if (migrationPrompt) {
    return h(MigrationPrompt, {
      onAccept: acceptMigration,
      onDecline: declineMigration,
    });
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
    domainProgress[k] = Math.min(earned, DAILY_GOAL);
  });

  const domainComputed = {};
  DOMAIN_KEYS.forEach(k => {
    domainComputed[k] = computeProgression(state.domains[k].totalXp, state.bossCompletions, k);
  });

  function checkStreaks(next, dayLog) {
    const allMinMet = DOMAIN_KEYS.every(k => (dayLog[k] || 0) >= CONSISTENCY_MIN);
    const allFullMet = DOMAIN_KEYS.every(k => (dayLog[k] || 0) >= DAILY_GOAL);

    if (allMinMet && next.lastConsistencyDate !== today) {
      if (next.lastConsistencyDate === yesterdayKey()) {
        next.consistencyStreak = next.consistencyStreak + 1;
      } else if (next.lastConsistencyDate === null) {
        next.consistencyStreak = next.consistencyStreak === 0 ? 1 : next.consistencyStreak;
      } else {
        next.consistencyStreak = 1;
      }
      next.lastConsistencyDate = today;
    }

    if (allFullMet && next.lastPowerDate !== today) {
      if (next.lastPowerDate === yesterdayKey()) {
        next.powerStreak = next.powerStreak + 1;
      } else {
        next.powerStreak = 1;
      }
      next.lastPowerDate = today;
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
      const next = { ...prev };
      next.domains = { ...prev.domains };
      next.domains[activity.domain] = {
        ...next.domains[activity.domain],
        totalXp: next.domains[activity.domain].totalXp + xpGain,
      };

      next.dailyLogs = { ...prev.dailyLogs };
      const dayLog = { ...(next.dailyLogs[today] || {}) };
      dayLog[activity.domain] = (dayLog[activity.domain] || 0) + xpGain;
      next.dailyLogs[today] = dayLog;

      next.activityLog = [
        { id: uid('log'), activityName: activity.name, domain: activity.domain, xp: xpGain, timestamp: Date.now(), detail: activity.type === 'duration' ? `${value} min` : null },
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

  function updateQuestProgress(id, progress) {
    setState(prev => {
      const quests = prev.quests.map(q => q.id === id ? { ...q, progress: Math.max(0, Math.min(100, progress)) } : q);
      let next = { ...prev, quests };
      const oldQuest = prev.quests.find(q=>q.id===id);
      const quest = quests.find(q => q.id === id);
      if (quest && quest.progress === 100 && oldQuest.progress < 100) {
        next.domains = { ...next.domains };
        next.domains[quest.domain] = { ...next.domains[quest.domain], totalXp: next.domains[quest.domain].totalXp + quest.xpReward };
        next.gold = next.gold + Math.round(quest.xpReward / 3);
        showToast(`Quest complete! +${quest.xpReward} XP, +${Math.round(quest.xpReward/3)} gold`);
      }
      return next;
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
      return { ...prev, bossCompletions, gold };
    });
    showToast(`Boss defeated! Rank unlocked. +75 gold`);
    setBossModal(null);
  }

  function spendGold(reward) {
    setState(prev => {
      if (prev.gold < reward.cost) return prev;
      return { ...prev, gold: prev.gold - reward.cost };
    });
    showToast(`Redeemed: ${reward.name}`);
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
    h(Header, { gold: state.gold, consistencyStreak: state.consistencyStreak, powerStreak: state.powerStreak, user, onSignOut, syncStatus }),
    h('nav', { style: styles.nav },
      [
        { id: 'dashboard', label: 'Adventure log', icon: 'scroll' },
        { id: 'activities', label: 'Activities', icon: 'zap' },
        { id: 'quests', label: 'Quests', icon: 'target' },
        { id: 'character', label: 'Character', icon: 'shield' },
        { id: 'rewards', label: 'Rewards', icon: 'gift' },
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
      activeTab === 'quests' && h(QuestsView, { state, onAdd: () => setShowQuestForm(true), onUpdateProgress: updateQuestProgress, onDelete: deleteQuest }),
      activeTab === 'character' && h(CharacterView, { state, domainComputed, onBossClick: setBossModal, onAddSubcat: addCustomSubcat }),
      activeTab === 'rewards' && h(RewardsView, { state, onSpend: spendGold, onAdd: () => setShowRewardForm(true), onEdit: (r) => setShowRewardForm(r), onDelete: deleteReward })
    ),
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
      onClose: () => setBossModal(null),
      onComplete: () => completeBoss(bossModal.domain, bossModal.level),
    })
  );
}

// ---------- Header ----------

function Header({ gold, consistencyStreak, powerStreak, user, onSignOut, syncStatus }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [menuOpen]);

  const syncDot = syncStatus === 'syncing'
    ? { color: '#fbbf24', label: 'Syncing…' }
    : syncStatus === 'offline'
      ? { color: '#9ca3af', label: 'Offline — will sync later' }
      : { color: '#86efac', label: 'Synced' };

  const initial = (user && user.email ? user.email[0] : '?').toUpperCase();

  return h('header', { style: styles.header },
    h('div', { style: styles.headerLeft },
      h('div', { style: styles.logoMark }, h(Icon, { name: 'sword', size: 20, color: '#a78bfa' })),
      h('div', null,
        h('div', { style: styles.title }, 'Adventure log'),
        h('div', { style: { ...styles.subtitle, display: 'flex', alignItems: 'center', gap: 6 } },
          h('span', { style: { width: 6, height: 6, borderRadius: '50%', background: syncDot.color, display: 'inline-block' }, title: syncDot.label }),
          h('span', null, syncDot.label)
        )
      )
    ),
    h('div', { style: styles.headerRight },
      h('div', { style: styles.streakChip },
        h(Icon, { name: 'flame', size: 15, color: '#fb923c' }),
        h('span', { style: styles.streakNum }, consistencyStreak),
        h('span', { style: styles.streakLabel }, 'day streak')
      ),
      h('div', { style: styles.streakChip },
        h(Icon, { name: 'star', size: 15, color: '#fbbf24' }),
        h('span', { style: styles.streakNum }, powerStreak),
        h('span', { style: styles.streakLabel }, 'power streak')
      ),
      h('div', { style: styles.goldChip },
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

// ---------- Dashboard ----------

function Dashboard({ state, domainProgress, domainComputed, today, todayLog, onLogClick, onBossClick }) {
  const availableBosses = [];
  DOMAIN_KEYS.forEach(k => {
    const comp = domainComputed[k];
    BOSS_LEVELS.forEach(bl => {
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
      h('div', { style: styles.metersGrid },
        DOMAIN_KEYS.map(k => {
          const d = DOMAINS[k];
          const pct = Math.round((domainProgress[k] / DAILY_GOAL) * 100);
          const earned = todayLog[k] || 0;
          return h('div', { key: k, style: styles.meterCard },
            h('div', { style: styles.meterTop },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                h(Icon, { name: d.icon, size: 16, color: d.color }),
                h('span', { style: styles.meterName }, d.name)
              ),
              h('span', { style: { ...styles.meterValue, color: d.color } }, `${earned}/${DAILY_GOAL}`)
            ),
            h('div', { style: styles.meterTrack },
              h('div', { style: { ...styles.meterFill, width: `${Math.min(pct,100)}%`, background: d.color, animation: 'barFill 0.6s ease-out' } }),
              h('div', { style: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.15)' } })
            ),
            h('div', { style: styles.meterSub },
              earned >= CONSISTENCY_MIN
                ? h('span', { style: { color: '#86efac' } }, h(Icon, { name: 'check', size: 11, style: { verticalAlign: -1, marginRight: 4 } }), 'Minimum met')
                : h('span', { style: { color: '#9ca3af' } }, `${CONSISTENCY_MIN - earned} XP to minimum`)
            )
          );
        })
      )
    ),

    h('section', null,
      h(SectionLabel, { text: 'Current levels' }),
      h('div', { style: styles.metersGrid },
        DOMAIN_KEYS.map(k => {
          const d = DOMAINS[k];
          const comp = domainComputed[k];
          const pct = Math.round((comp.currentLevelXp / comp.currentLevelReq) * 100);
          return h('div', { key: k, style: styles.levelCard },
            h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 } },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                h(Icon, { name: d.icon, size: 16, color: d.color }),
                h('span', { style: styles.meterName }, d.name)
              ),
              h('span', { style: { fontSize: 18, fontWeight: 700, color: d.color } }, `Lv ${comp.rank}`)
            ),
            h('div', { style: styles.meterTrack },
              h('div', { style: { ...styles.meterFill, width: `${pct}%`, background: d.color } })
            ),
            h('div', { style: styles.meterSub },
              `${comp.currentLevelXp} / ${comp.currentLevelReq} XP to level ${comp.rank + 1}`,
              comp.potentialRank > comp.rank && h('span', { style: { color: '#fbbf24', marginLeft: 6 } }, `· Rank ${comp.potentialRank} locked`)
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

function QuestsView({ state, onAdd, onUpdateProgress, onDelete }) {
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
          active.map(q => h(QuestRow, { key: q.id, quest: q, onUpdateProgress, onDelete }))
        ),
    completed.length > 0 && h('div', { style: { marginTop: 24 } },
      h(SectionLabel, { text: `Completed (${completed.length})`, icon: 'trophy', accent: '#fbbf24' }),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        completed.map(q => h(QuestRow, { key: q.id, quest: q, onDelete, compact: true }))
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
              BOSS_LEVELS.map(bl => {
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

function RewardsView({ state, onSpend, onAdd, onEdit, onDelete }) {
  return h('div', { style: { animation: 'fadeIn 0.3s ease' } },
    h('div', { style: styles.goldBanner },
      h('div', null,
        h('div', { style: { fontSize: 12, color: '#9ca3af', marginBottom: 2 } }, 'Reward currency'),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h(Icon, { name: 'coins', size: 22, color: '#fbbf24' }),
          h('span', { style: { fontSize: 28, fontWeight: 700, color: '#fbbf24' } }, state.gold),
          h('span', { style: { fontSize: 13, color: '#9ca3af' } }, 'gold')
        )
      )
    ),
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '18px 0 12px' } },
      h(SectionLabel, { text: 'Redeem rewards' }),
      h('button', { className: 'rpg-btn', style: styles.primaryBtn, onClick: onAdd }, h(Icon, { name: 'plus', size: 14 }), ' New reward')
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
      state.rewards.map(r => h('div', { key: r.id, style: styles.rewardCard },
        h('div', { style: { flex: 1 } },
          h('div', { style: { fontWeight: 700, fontSize: 14, color: '#f4f1ea' } }, r.name),
          r.desc && h('div', { style: { fontSize: 12, color: '#9ca3af', marginTop: 2 } }, r.desc)
        ),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h('span', { style: { fontSize: 13, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 } },
            h(Icon, { name: 'coins', size: 13 }), ` ${r.cost}`
          ),
          h('button', {
            className: 'rpg-btn',
            style: { ...styles.primaryBtn, opacity: state.gold < r.cost ? 0.4 : 1, cursor: state.gold < r.cost ? 'not-allowed' : 'pointer' },
            disabled: state.gold < r.cost,
            onClick: () => onSpend(r),
          }, 'Redeem'),
          h('button', { className: 'rpg-btn', style: styles.iconBtn, onClick: () => onEdit(r) }, h(Icon, { name: 'edit2', size: 12 })),
          h('button', { className: 'rpg-btn', style: styles.iconBtnDanger, onClick: () => onDelete(r.id) }, h(Icon, { name: 'trash2', size: 12 }))
        )
      ))
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
  const [days, setDays] = useState(30);
  const [xpReward, setXpReward] = useState(100);

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), desc: desc.trim(), domain, days, xpReward });
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
          h('input', { type: 'number', value: days, min: 1, onChange: e => setDays(parseInt(e.target.value)||1), style: styles.input })
        )
      ),
      h('div', null,
        h('label', { style: styles.label }, 'XP reward on completion'),
        h('input', { type: 'number', value: xpReward, min: 0, onChange: e => setXpReward(parseInt(e.target.value)||0), style: styles.input })
      ),
      h('button', { className: 'rpg-btn', style: { ...styles.primaryBtn, justifyContent: 'center', padding: '10px 0' }, onClick: handleSave }, h(Icon, { name: 'check', size: 14 }), ' Create quest')
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

function BossModal({ domainKey, level, onClose, onComplete }) {
  const d = DOMAINS[domainKey];
  const bosses = (DEFAULT_BOSSES[domainKey] && DEFAULT_BOSSES[domainKey][level]) || ['Complete a milestone challenge'];

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
    h('button', {
      className: 'rpg-btn',
      style: { ...styles.primaryBtn, width: '100%', justifyContent: 'center', padding: '10px 0', background: 'rgba(251,191,36,0.15)', borderColor: '#fbbf24', color: '#fbbf24' },
      onClick: onComplete,
    }, h(Icon, { name: 'trophy', size: 14 }), ' Mark boss defeated')
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

function MigrationPrompt({ onAccept, onDecline }) {
  return h('div', { style: styles.authScreen },
    h('div', { style: styles.authCard },
      h('div', { style: { ...styles.logoMark, marginBottom: 14 } }, h(Icon, { name: 'scroll', size: 22, color: '#a78bfa' })),
      h('div', { style: styles.authTitle }, 'Existing progress found'),
      h('div', { style: { ...styles.authSubtitle, marginBottom: 18 } },
        'You have RPG Life data saved locally on this device from before signing in. Would you like to import it into your account?'
      ),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        h('button', { className: 'rpg-btn', onClick: onAccept, style: { ...styles.primaryBtn, justifyContent: 'center', padding: '11px 0' } },
          h(Icon, { name: 'check', size: 14 }), ' Import my progress'
        ),
        h('button', { className: 'rpg-btn', onClick: onDecline, style: { ...styles.secondaryBtn, justifyContent: 'center', padding: '11px 0' } },
          'Start fresh'
        )
      ),
      h('div', { style: { fontSize: 11.5, color: '#7c7c8a', marginTop: 12, textAlign: 'center' } },
        'You can only do this once. Choose carefully.'
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
};

// ---------- Render ----------

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(h(AuthGate));
