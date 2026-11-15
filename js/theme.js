// THEME — runs first to prevent flash
const ICONS = {
  sun: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.6 6.6 0 0 0 9.7 9.7z"/></svg>'
};
const html = document.documentElement;
const savedTheme = localStorage.getItem('vd-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('vd-theme', theme);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
  const nav = document.getElementById('nav');
  if (nav) {
    nav.style.background = window.scrollY > 40
      ? (theme === 'dark' ? 'rgba(11,10,8,0.97)' : 'rgba(255,255,255,0.98)')
      : (theme === 'dark' ? 'rgba(11,10,8,0.8)'  : 'rgba(255,255,255,0.85)');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.innerHTML = savedTheme === 'dark' ? ICONS.sun : ICONS.moon;
  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
});
