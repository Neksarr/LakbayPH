(() => {
  const root = document.documentElement;
  let theme = 'light';
  try { if (localStorage.getItem('lakbayTheme') === 'dark') theme = 'dark'; } catch (_) {}
  root.dataset.theme = theme;
  function updateButton() {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;
    const dark = root.dataset.theme === 'dark';
    const label = `Switch to ${dark ? 'light' : 'dark'} mode`;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.querySelector('img').src = dark ? 'dark.png' : 'light.png';
    button.querySelector('img').alt = '';
  }
  document.addEventListener('DOMContentLoaded', () => {
    updateButton();
    document.querySelector('.theme-toggle')?.addEventListener('click', () => {
      theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = theme;
      try { localStorage.setItem('lakbayTheme', theme); } catch (_) {}
      updateButton();
    });
  });
  window.addEventListener('storage', event => {
    if (event.key === 'lakbayTheme') {
      root.dataset.theme = event.newValue === 'dark' ? 'dark' : 'light';
      updateButton();
    }
  });
})();
