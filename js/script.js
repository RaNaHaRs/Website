document.addEventListener('DOMContentLoaded', () => {
  const roleStudentBtn = document.getElementById('role-student');
  const roleTeacherBtn = document.getElementById('role-teacher');
  const roleInput = document.getElementById('role');
  const form = document.getElementById('loginForm');
  const signupBtn = document.getElementById('signupBtn');

  function setRole(role) {
    roleInput.value = role;
    if (role === 'student') {
      document.body.classList.remove('teacher-selected');
      roleStudentBtn.classList.add('active');
      roleStudentBtn.setAttribute('aria-selected', 'true');
      roleTeacherBtn.classList.remove('active');
      roleTeacherBtn.setAttribute('aria-selected', 'false');
    } else {
      document.body.classList.add('teacher-selected');
      roleTeacherBtn.classList.add('active');
      roleTeacherBtn.setAttribute('aria-selected', 'true');
      roleStudentBtn.classList.remove('active');
      roleStudentBtn.setAttribute('aria-selected', 'false');
    }
  }

  roleStudentBtn.addEventListener('click', () => setRole('student'));
  roleTeacherBtn.addEventListener('click', () => setRole('teacher'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const role = roleInput.value;
    const email = (document.getElementById('email') || {}).value || '';
    try { localStorage.setItem('current_user', JSON.stringify({ role, email })); } catch {}
    // In real app, validate credentials and handle auth.
    if (role === 'student') {
      window.location.href = 'student-dashboard.html';
    } else {
      window.location.href = 'teacher-dashboard.html';
    }
  });

  signupBtn.addEventListener('click', () => {
    const role = roleInput.value;
    if (role === 'student') {
      window.location.href = 'student-signup.html';
    } else {
      window.location.href = 'teacher-signup.html';
    }
  });
});


