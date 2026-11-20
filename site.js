(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav-links');
  const closeNav = () => {
    nav?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Open navigation');
  };
  navToggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('open') ?? false;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeNav();
  });
  document.addEventListener('click', e => {
    if (nav?.classList.contains('open') && e.target instanceof Node &&
      !nav.contains(e.target) && !navToggle?.contains(e.target)) closeNav();
  });
  const blocks = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -15px 0px' });
    blocks.forEach(block => observer.observe(block));
  } else {
    blocks.forEach(block => block.classList.add('visible'));
  }
  reduced.addEventListener?.('change', e => {
    if (e.matches) blocks.forEach(block => block.classList.add('visible'));
  });
  const progress = document.querySelector('.progress');
  let scheduled = false;
  const updateScroll = () => {
    scheduled = false;
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 100) + '%';
  };
  const scheduleScroll = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateScroll);
  };
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  scheduleScroll();

  const filters = [...document.querySelectorAll('.filter')];
  const cards = [...document.querySelectorAll('.role-card')];
  filters.forEach(filter => filter.addEventListener('click', () => {
    const group = filter.dataset.filter;
    filters.forEach(button => {
      const active = button === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    cards.forEach(card => {
      card.hidden = group !== 'all' && card.dataset.group !== group;
    });
  }));
  // Keep a real, keyboard-accessible three-way preference:
  // device (auto), explicit light and explicit dark.
  const theme = window.__saarthiTheme;
  const themeButtons = [...document.querySelectorAll('[data-theme-choice]')];
  const syncThemeControls = () => {
    const selected = theme?.getChoice?.() ?? 'auto';
    for (const button of themeButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === selected));
    }
  };
  for (const button of themeButtons) {
    button.addEventListener('click', () => {
      if (theme?.setChoice?.(button.dataset.themeChoice)) syncThemeControls();
    });
  }
  window.addEventListener('saarthi-theme-change', syncThemeControls);
  syncThemeControls();
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
