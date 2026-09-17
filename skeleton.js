(() => {
  const startedAt = performance.now();
  document.documentElement.classList.add('skeleton-loading');

  const blocks = (count, className) => Array.from({ length: count }, () => `<div class="${className}"></div>`).join('');
  const destinationCards = count => blocks(count, 'sk-destination-card')
    .replaceAll('<div class="sk-destination-card"></div>', '<div class="sk-destination-card"><span class="sk sk-card-image"></span><span class="sk sk-card-text"></span><span class="sk sk-card-text short"></span></div>');
  const page = location.pathname.split('/').pop().toLowerCase();
  const showSearch = page === '' || page === 'index.html';
  const commonNav = `<div class="skeleton-nav"><div class="skeleton-brand"><span class="sk sk-circle sk-logo"></span><span class="sk sk-pill sk-brand-name"></span></div><div class="skeleton-links">${blocks(4, 'sk sk-pill sk-nav-link')}</div><div class="skeleton-controls">${showSearch ? '<span class="sk sk-pill sk-search"></span>' : ''}<span class="sk sk-circle sk-theme"></span></div></div>`;
  const tourismSections = `<section class="skeleton-section"><span class="sk sk-pill sk-section-title"></span><div class="skeleton-grid three">${blocks(3, 'sk sk-card')}</div></section><section class="skeleton-section"><span class="sk sk-pill sk-section-title"></span><div class="skeleton-grid five">${destinationCards(5)}</div></section>`;

  function homeLayout() {
    return `<div class="skeleton-hero"><div class="skeleton-hero-copy"><span class="sk sk-round sk-title"></span><span class="sk sk-round sk-title"></span><span class="sk sk-round sk-title short"></span><span class="sk sk-pill sk-line"></span><span class="sk sk-pill sk-line"></span><span class="sk sk-button"></span></div></div><main class="skeleton-main">${tourismSections}</main>`;
  }
  function quizLayout() {
    return `<div class="skeleton-hero"><div class="skeleton-hero-copy"><span class="sk sk-round sk-title"></span><span class="sk sk-round sk-title short"></span><span class="sk sk-pill sk-line"></span><span class="sk sk-button"></span></div></div><main class="skeleton-main">${tourismSections}</main>`;
  }
  function catalogLayout() {
    return `<main class="skeleton-main"><div class="skeleton-catalog-head"><span class="sk sk-pill sk-title"></span><span class="sk sk-pill sk-line sk-subtitle"></span><span class="sk sk-pill sk-page-search"></span></div><div class="skeleton-catalog-layout"><aside class="skeleton-sidebar"><span class="sk sk-pill sk-line"></span>${blocks(7, 'sk sk-pill sk-line')}</aside><section class="skeleton-results"><span class="sk sk-pill sk-line"></span><div class="skeleton-grid four">${destinationCards(8)}</div></section></div></main>`;
  }
  function aboutLayout() {
    return `<main class="skeleton-main"><div class="skeleton-about-head"><span class="sk sk-pill sk-section-title"></span><span class="sk sk-pill sk-title"></span><span class="sk sk-pill sk-line"></span></div>${blocks(3, 'skeleton-panel').replaceAll('<div class="skeleton-panel"></div>', '<div class="skeleton-panel"><span class="sk sk-pill sk-line short"></span><span class="sk sk-pill sk-line"></span><span class="sk sk-pill sk-line"></span></div>')}<section class="skeleton-section"><span class="sk sk-pill sk-section-title"></span><div class="skeleton-grid three">${blocks(3, 'sk sk-card')}</div></section></main>`;
  }
  function detailLayout() {
    return `<main class="skeleton-main"><article class="skeleton-detail-card"><span class="sk sk-pill sk-nav-link"></span><div class="skeleton-detail-top"><section><span class="sk sk-pill sk-title"></span><span class="sk sk-pill sk-line"></span><span class="sk sk-pill sk-line"></span><span class="sk sk-pill sk-line"></span><span class="sk sk-pill sk-line"></span></section><span class="sk skeleton-detail-image"></span><aside class="skeleton-rating"><span class="sk sk-pill sk-section-title"></span>${blocks(6, 'sk sk-pill sk-line')}</aside></div><div class="skeleton-detail-bottom"><section>${blocks(5, 'sk sk-pill sk-line')}</section><section>${blocks(4, 'sk sk-pill sk-line')}</section></div></article></main>`;
  }

  const layout = page === 'destination.html' ? catalogLayout()
    : page === 'destination-detail.html' ? detailLayout()
    : page === 'about.html' ? aboutLayout()
    : page === 'quiz.html' ? quizLayout()
    : homeLayout();

  function mount() {
    if (!document.body || document.querySelector('.skeleton-loader')) return;
    const loader = document.createElement('div');
    loader.className = 'skeleton-loader';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-label', 'Loading page');
    loader.innerHTML = `<div class="skeleton-wrap">${commonNav}${layout}</div>`;
    document.body.prepend(loader);
  }

  function finish() {
    const elapsed = performance.now() - startedAt;
    setTimeout(() => {
      const loader = document.querySelector('.skeleton-loader');
      if (!loader) {
        document.documentElement.classList.remove('skeleton-loading');
        return;
      }
      loader.classList.add('is-leaving');
      setTimeout(() => {
        loader.remove();
        document.documentElement.classList.remove('skeleton-loading');
      }, 230);
    }, Math.max(0, 450 - elapsed));
  }

  document.addEventListener('DOMContentLoaded', mount, { once: true });
  window.addEventListener('load', finish, { once: true });
  setTimeout(finish, 8000);
})();
