(function(){
  const KEYS = {
    modules: 'content_modules',//bla bla 
    completions: 'content_completions', // [{email, moduleId, completedAt}]
  };

  function read(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  function seedModules() {
    if (read(KEYS.modules)) return;
    const modules = [
      { id: 'm1', title: 'Introduction to Disaster Management', type: 'video', durationMin: 8 },
      { id: 'm2', title: 'Creating an Emergency Kit', type: 'article', durationMin: 5 },
      { id: 'm3', title: 'Evacuation Routes and Safety', type: 'video', durationMin: 10 },
    ];
    write(KEYS.modules, modules);
  }

  function getModules() { seedModules(); return read(KEYS.modules, []); }

  function getCompletions() { return read(KEYS.completions, []); }
  function setCompletion({ email, moduleId, completed }) {
    const e = (email||'').toLowerCase();
    const all = getCompletions();
    const idx = all.findIndex(c => c.email === e && c.moduleId === moduleId);
    if (completed) {
      const rec = { email: e, moduleId, completedAt: Date.now() };
      if (idx >= 0) all[idx] = rec; else all.push(rec);
    } else {
      if (idx >= 0) all.splice(idx, 1);
    }
    write(KEYS.completions, all);
  }
  function getUserCompletions(email) {
    const e = (email||'').toLowerCase();
    return getCompletions().filter(c => c.email === e);
  }

  window.contentStore = { getModules, setCompletion, getUserCompletions };
})();


