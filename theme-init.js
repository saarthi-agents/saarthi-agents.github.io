/* Run before CSS to avoid a flash of the wrong light/dark theme. */
(() => {
  'use strict';
  const key = 'saarthi-color-theme';
  const allowed = new Set(['auto', 'light', 'dark']);
  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  const read = () => {
    try {
      const stored = window.localStorage.getItem(key);
      return allowed.has(stored) ? stored : 'auto';
    } catch {
      return 'auto';
    }
  };
  let choice = read();
  const resolve = () => choice === 'auto'
    ? (media?.matches ? 'dark' : 'light')
    : choice;
  const apply = () => {
    const resolved = resolve();
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = choice;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', resolved === 'dark' ? '#121019' : '#f6f3f1');
    window.dispatchEvent(new CustomEvent('saarthi-theme-change', {
      detail: { preference: choice, resolved },
    }));
  };
  const setChoice = value => {
    if (!allowed.has(value)) return false;
    choice = value;
    try {
      if (value === 'auto') window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch {
      // Private browsing/disabled storage: still switch for this tab.
    }
    apply();
    return true;
  };
  media?.addEventListener?.('change', () => {
    if (choice === 'auto') apply();
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      choice = read();
      apply();
    }
  });
  window.__saarthiTheme = Object.freeze({
    setChoice,
    getChoice: () => choice,
    getResolved: resolve,
  });
  apply();
})();
