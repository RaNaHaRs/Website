(function(){
  const KEYS = {
    infoReads: 'info_reads', // [{email, articleId, completedAt}]
    quizResults: 'info_quiz_results', // [{email, articleId, correct, answeredAt}]
    timeTrack: 'time_tracking', // { [email]: { totalMs, lastStartMs|null } }
  };

  const ARTICLE_IDS = ['cyclone','heatwave','tsunami','landslide','chemical','nuclear','biological'];

  const QUIZZES = {
    cyclone: {
      prompt: 'A cyclone warning is issued for your coastal town. What should you do first?',
      options: [
        'Go to the beach to film the waves',
        'Follow official advisories and prepare to evacuate if instructed',
        'Ignore it; storms usually weaken',
        'Drive around to check damage before landfall'
      ],
      correctIndex: 1,
    },
    heatwave: {
      prompt: 'It is an extreme heat day in your city. What is the safest choice?',
      options: [
        'Play outdoor sports at noon',
        'Stay hydrated, avoid peak heat, and check on vulnerable people',
        'Wear dark heavy clothes to sweat more',
        'Turn off fans and close all windows all day'
      ],
      correctIndex: 1,
    },
    tsunami: {
      prompt: 'After strong shaking near the coast, what should you do immediately?',
      options: [
        'Wait for an official press conference',
        'Go to the shore to watch the sea',
        'Move to higher ground and away from the coast',
        'Start driving along the shoreline'
      ],
      correctIndex: 2,
    },
    landslide: {
      prompt: 'During heavy rain on a steep slope, you notice cracks appearing. What is safest?',
      options: [
        'Stand near the cracks to observe',
        'Move to a safer area and alert authorities/others',
        'Dig at the base to relieve pressure',
        'Ignore and continue staying in the same spot'
      ],
      correctIndex: 1,
    },
    chemical: {
      prompt: 'There is a chemical leak nearby. Officials advise shelter-in-place. What should you do?',
      options: [
        'Open windows for fresh air',
        'Seal doors/windows, turn off ventilation, and listen for updates',
        'Go outside to smell the air',
        'Drive toward the source to learn more'
      ],
      correctIndex: 1,
    },
    nuclear: {
      prompt: 'A radiological emergency is announced. What is most appropriate?',
      options: [
        'Go outdoors to watch the event',
        'Follow evacuation or shelter-in-place orders to limit exposure',
        'Eat locally grown fresh produce immediately',
        'Swim in open water to decontaminate'
      ],
      correctIndex: 1,
    },
    biological: {
      prompt: 'There is a biological outbreak. What is a good protective action?',
      options: [
        'Share unverified remedies online',
        'Follow public health guidance on hygiene and vaccination',
        'Avoid handwashing to build immunity',
        'Ignore symptoms and attend crowded events'
      ],
      correctIndex: 1,
    },
  };

  function read(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  // Info reads
  function getReads(email) {
    const e = (email||'').toLowerCase();
    return read(KEYS.infoReads, []).filter(r => r.email === e);
  }
  function markRead({ email, articleId, completed }) {
    const e = (email||'').toLowerCase();
    const all = read(KEYS.infoReads, []);
    const idx = all.findIndex(r => r.email === e && r.articleId === articleId);
    if (completed) {
      const rec = { email: e, articleId, completedAt: Date.now() };
      if (idx >= 0) all[idx] = rec; else all.push(rec);
    } else {
      if (idx >= 0) all.splice(idx, 1);
    }
    write(KEYS.infoReads, all);
  }

  // Quizzes
  function getQuiz(articleId) { return QUIZZES[articleId] || null; }
  function saveQuizResult({ email, articleId, correct }) {
    const e = (email||'').toLowerCase();
    const all = read(KEYS.quizResults, []);
    const rec = { email: e, articleId, correct: !!correct, answeredAt: Date.now() };
    all.push(rec);
    write(KEYS.quizResults, all);
  }
  function getQuizResults(email) {
    const e = (email||'').toLowerCase();
    return read(KEYS.quizResults, []).filter(r => r.email === e);
  }

  // Time tracking
  function _getTimeState() { return read(KEYS.timeTrack, {}); }
  function _setTimeState(state) { write(KEYS.timeTrack, state); }
  function startTimer(email) {
    const e = (email||'').toLowerCase();
    const s = _getTimeState();
    const cur = s[e] || { totalMs: 0, lastStartMs: null };
    if (cur.lastStartMs == null) { cur.lastStartMs = Date.now(); }
    s[e] = cur; _setTimeState(s);
  }
  function stopTimer(email) {
    const e = (email||'').toLowerCase();
    const s = _getTimeState();
    const cur = s[e];
    if (!cur) return;
    if (cur.lastStartMs != null) {
      cur.totalMs += Math.max(0, Date.now() - cur.lastStartMs);
      cur.lastStartMs = null;
      s[e] = cur; _setTimeState(s);
    }
  }
  function getTime(email) {
    const e = (email||'').toLowerCase();
    const s = _getTimeState();
    const cur = s[e] || { totalMs: 0, lastStartMs: null };
    let total = cur.totalMs;
    if (cur.lastStartMs != null) total += Math.max(0, Date.now() - cur.lastStartMs);
    return total;
  }
  function formatMs(ms) {
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n) => n.toString().padStart(2,'0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  window.progressStore = {
    ARTICLE_IDS,
    getReads,
    markRead,
    getQuiz,
    saveQuizResult,
    getQuizResults,
    startTimer,
    stopTimer,
    getTime,
    formatMs,
  };
})();


