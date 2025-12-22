// Simple quiz data and storage helpers using localStorage
(function(){
  const KEYS = {
    quizzes: 'quizzes',
    submissions: 'quiz_submissions',
    grades: 'quiz_grades',
    currentUser: 'current_user'
  };

  function read(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
  }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  function seedQuizzes() {
    if (read(KEYS.quizzes)) return;
    const quizzes = [
      { id: 'q1', title: 'Disaster Basics Quiz', questions: [
        { id: 'q1-1', prompt: 'Name one type of natural disaster.' },
        { id: 'q1-2', prompt: 'What number do you dial in emergencies?' }
      ]},
      { id: 'q2', title: 'Preparedness Quiz', questions: [
        { id: 'q2-1', prompt: 'List one item for an emergency kit.' },
        { id: 'q2-2', prompt: 'Where is your nearest shelter location?' }
      ]}
    ];
    write(KEYS.quizzes, quizzes);
  }

  function getQuizzes() { seedQuizzes(); return read(KEYS.quizzes, []); }

  function getCurrentUser() { return read(KEYS.currentUser, null); }
  function setCurrentUser(user) { write(KEYS.currentUser, user); }

  function getSubmissions() { return read(KEYS.submissions, []); }
  function saveSubmission(submission) {
    const all = getSubmissions();
    const idx = all.findIndex(s => s.quizId === submission.quizId && s.studentEmail === submission.studentEmail);
    if (idx >= 0) all[idx] = submission; else all.push(submission);
    write(KEYS.submissions, all);
  }
  function findSubmission(quizId, studentEmail) {
    return getSubmissions().find(s => s.quizId === quizId && s.studentEmail === studentEmail) || null;
  }

  function getGrades() { return read(KEYS.grades, []); }
  function saveGrade(grade) {
    const all = getGrades();
    const idx = all.findIndex(g => g.quizId === grade.quizId && g.studentEmail === grade.studentEmail);
    if (idx >= 0) all[idx] = grade; else all.push(grade);
    write(KEYS.grades, all);
  }
  function findGrade(quizId, studentEmail) {
    return getGrades().find(g => g.quizId === quizId && g.studentEmail === studentEmail) || null;
  }

  window.quizStore = {
    getQuizzes,
    getCurrentUser,
    setCurrentUser,
    getSubmissions,
    saveSubmission,
    findSubmission,
    getGrades,
    saveGrade,
    findGrade,
  };
})();


