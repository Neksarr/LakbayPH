(() => {
  const islands = ['All', 'Luzon', 'Visayas', 'Mindanao'];
  const categories = ['All', 'Beach', 'Mountain', 'Waterfall', 'Island', 'Historical', 'Cultural', 'Natural Landmark'];
  const searchInput = document.getElementById('destinationSearch');
  const cards = document.getElementById('destinationCards');
  const pagination = document.getElementById('pagination');
  const state = { island: 'All', category: 'All', search: '', page: 1 };
  const perPage = 8;
  function readUrl() {
    const params = new URLSearchParams(window.location.search);
    for (const [key, values] of [['island', islands], ['category', categories]]) {
      state[key] = values.find(value => value.toLowerCase() === (params.get(key) || '').toLowerCase()) || 'All';
    }
    state.search = (params.get('search') || '').trim();
    state.page = Math.max(1, parseInt(params.get('page'), 10) || 1);
    searchInput.value = state.search;
  }
  function updateUrl() {
    const params = new URLSearchParams();
    if (state.island !== 'All') params.set('island', state.island);
    if (state.category !== 'All') params.set('category', state.category);
    if (state.search) params.set('search', state.search);
    if (state.page > 1) params.set('page', state.page);
    const query = params.toString();
    try { history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash); } catch (_) {}
  }
  function buildFilters(id, key, values) {
    const list = document.getElementById(id);
    values.forEach(value => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = value;
      button.dataset.filter = key; button.dataset.value = value;
      button.addEventListener('click', () => { state[key] = value; state.page = 1; render(); });
      item.append(button); list.append(item);
    });
  }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className; node.textContent = text; return node;
  }
  function render() {
    const query = state.search.toLowerCase();
    const matches = destinations.filter(destination =>
      (state.island === 'All' || destination.island === state.island) &&
      (state.category === 'All' || destination.category === state.category) &&
      [destination.name, destination.province, destination.location, destination.island, destination.category].join(' ').toLowerCase().includes(query)
    );
    const pageCount = Math.ceil(matches.length / perPage);
    state.page = Math.min(state.page, Math.max(1, pageCount));
    document.querySelectorAll('[data-filter]').forEach(button => {
      const active = state[button.dataset.filter] === button.dataset.value;
      button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
    });
    cards.replaceChildren();
    const start = (state.page - 1) * perPage;
    document.getElementById('resultCount').textContent = matches.length
      ? `${matches.length} destination${matches.length === 1 ? '' : 's'} · Showing ${start + 1}–${Math.min(start + perPage, matches.length)}`
      : 'No destinations match your search. Try another search or clear the filters.';
    matches.slice(start, start + perPage).forEach(destination => {
      const card = element('a', 'card destination-card', '');
      const detailParams = new URLSearchParams({ id: destination.id });
      // Carry the current catalog state in the link so Back also works in a new tab.
      const returnParams = new URLSearchParams();
      if (state.island !== 'All') returnParams.set('island', state.island);
      if (state.category !== 'All') returnParams.set('category', state.category);
      if (state.search) returnParams.set('search', state.search);
      if (state.page > 1) returnParams.set('page', state.page);
      if (returnParams.size) detailParams.set('from', returnParams.toString());
      card.href = `destination-detail.html?${detailParams}`;
      card.setAttribute('aria-label', `Explore ${destination.name}`);
      const photo = document.createElement('img');
      photo.src = destination.cardImage; photo.alt = destination.name; photo.loading = 'lazy';
      card.append(photo, element('h4', '', destination.name),
        element('p', '', `${destination.province}, ${destination.island}`),
        element('p', 'category', destination.category),
        element('span', 'rating', destination.rating === null ? 'Not yet rated' : `★ ${destination.rating.toFixed(1)}`));
      cards.append(card);
    });
    pagination.replaceChildren();
    pagination.hidden = pageCount <= 1;
    if (pageCount > 1) for (let page = 1; page <= pageCount; page++) {
      const button = element('button', 'page-btn', String(page)); button.type = 'button';
      button.setAttribute('aria-label', `Page ${page}`);
      if (page === state.page) { button.classList.add('active'); button.setAttribute('aria-current', 'page'); }
      button.addEventListener('click', () => {
        state.page = page; render();
        pagination.querySelector('[aria-current="page"]').focus({ preventScroll: true });
        document.getElementById('resultCount').scrollIntoView({ block: 'nearest' });
      });
      pagination.append(button);
    }
    updateUrl();
  }
  buildFilters('islandFilters', 'island', islands);
  buildFilters('categoryFilters', 'category', categories);
  searchInput.addEventListener('input', () => { state.search = searchInput.value.trim(); state.page = 1; render(); });
  document.getElementById('clearFilters').addEventListener('click', () => {
    Object.assign(state, { island: 'All', category: 'All', search: '', page: 1 });
    searchInput.value = ''; render();
  });
  window.addEventListener('popstate', () => { readUrl(); render(); });
  readUrl(); render();
})();
