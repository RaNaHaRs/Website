(function(){
  const KEYS = {
    users: 'auth_users', // [{email, role:'student'|'teacher', password?, provider?}]
    session: 'auth_session', // {email, role}
  };

  function read(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
  }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  function getUsers() { return read(KEYS.users, []); }
  function setUsers(users) { write(KEYS.users, users); }

  function findUserByEmail(email) {
    const e = (email || '').trim().toLowerCase();
    return getUsers().filter(u => u.email === e);
  }

  function registerUser({ email, password, role, provider }) {
    const e = (email || '').trim().toLowerCase();
    if (!e || !role) throw new Error('Email and role are required');
    const existing = findUserByEmail(e);
    if (existing.some(u => u.role === role)) throw new Error('This email is already registered for this role');
    if (existing.length > 0 && existing[0].role !== role) throw new Error('This email is already registered with a different role');
    const users = getUsers();
    users.push({ email: e, password: password || null, role, provider: provider || null });
    setUsers(users);
    setSession({ email: e, role });
    return { email: e, role };
  }

  function loginWithPassword({ email, password }) {
    const e = (email || '').trim().toLowerCase();
    const users = findUserByEmail(e);
    if (users.length === 0) throw new Error('No account found for this email');
    const match = users.find(u => u.password === password);
    if (!match) throw new Error('Incorrect password');
    setSession({ email: e, role: match.role });
    return { email: e, role: match.role };
  }

  // Simulated provider login: prompt for email, auto-login if exists, otherwise return { pending: true, email }
  function loginWithProvider(provider) {
    const email = (window.prompt && window.prompt(`Enter your ${provider} email to continue:`)) || '';
    const e = (email || '').trim().toLowerCase();
    if (!e) throw new Error('Email is required');
    const users = findUserByEmail(e);
    if (users.length > 0) {
      // If multiple roles existed (we forbid), pick the first
      setSession({ email: e, role: users[0].role });
      return { email: e, role: users[0].role };
    }
    return { pending: true, email: e, provider };
  }

  function setSession(session) { write(KEYS.session, session); }
  function getSession() { return read(KEYS.session, null); }
  function clearSession() { localStorage.removeItem(KEYS.session); }

  function requireRole(role) {
    const s = getSession();
    if (!s || s.role !== role) return false;
    return true;
  }

  window.authStore = {
    registerUser,
    loginWithPassword,
    loginWithProvider,
    getSession,
    setSession,
    clearSession,
    requireRole,
  };
})();


