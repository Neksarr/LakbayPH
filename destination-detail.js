(() => {
  const params = new URLSearchParams(location.search);
  const destination = destinations.find(place => place.id === params.get('id'));

  // Only restore known query fields; never accept a return URL or an external host.
  const previous = new URLSearchParams(params.get('from') || '');
  const returnParams = new URLSearchParams();
  for (const key of ['island', 'category', 'search', 'page']) {
    const value = previous.get(key);
    if (value) returnParams.set(key, value);
  }
  const backUrl = 'destination.html' + (returnParams.size ? `?${returnParams}` : '');
  document.querySelectorAll('[data-back-link]').forEach(link => { link.href = backUrl; });

  if (!destination) {
    document.title = 'Destination Not Found | LakbayPH';
    document.getElementById('destinationNotFound').hidden = false;
    return;
  }

  const text = (id, value) => { document.getElementById(id).textContent = value; };
  const rating = Number.isFinite(destination.rating) ? Math.max(0, Math.min(5, destination.rating)) : null;
  const reviews = Number.isInteger(destination.reviews) && destination.reviews >= 0
    ? `${destination.reviews.toLocaleString()} review${destination.reviews === 1 ? '' : 's'}`
    : 'Review count unavailable';
  document.title = `${destination.name} | LakbayPH`;
  text('destinationName', destination.name);
  text('destinationLocation', destination.location);
  text('destinationIsland', destination.island);
  text('destinationRating', rating === null ? 'Not yet rated' : `${rating.toFixed(1)} / 5`);
  text('destinationReviews', reviews);
  text('destinationDescription', destination.description);
  const image = document.getElementById('destinationImage');
  image.src = destination.detailImage;
  image.alt = destination.imageAlt || destination.name;
  text('destinationCaption', destination.imageCaption || `${destination.name} · ${destination.island}`);

  const score = document.getElementById('ratingScore');
  if (rating === null) {
    score.textContent = 'Not yet rated';
    score.classList.add('unrated');
  } else {
    score.append(document.createTextNode(rating.toFixed(1)));
    const maximum = document.createElement('small'); maximum.textContent = ' / 5'; score.append(maximum);
  }
  const stars = document.getElementById('ratingStars');
  stars.setAttribute('aria-label', rating === null ? 'No rating available' : `${rating.toFixed(1)} out of 5 stars`);
  document.getElementById('ratingStarsFilled').style.width = `${rating === null ? 0 : rating / 5 * 100}%`;
  text('ratingReviews', reviews);

  const breakdown = destination.ratingBreakdown;
  const hasBreakdown = breakdown && [5, 4, 3, 2, 1].every(star => Number.isFinite(breakdown[star]) && breakdown[star] >= 0 && breakdown[star] <= 100)
    && Math.abs(Object.values(breakdown).reduce((sum, value) => sum + value, 0) - 100) <= 1;
  const bars = document.getElementById('ratingBreakdown');
  for (const star of [5, 4, 3, 2, 1]) {
    const percentage = hasBreakdown ? breakdown[star] : null;
    const row = document.createElement('div'); row.className = 'rating-row';
    row.setAttribute('aria-label', `${star} star${star === 1 ? '' : 's'}: ${percentage === null ? 'breakdown unavailable' : percentage + '%'}`);
    const label = document.createElement('span'); label.className = 'rating-label'; label.textContent = `${star} `;
    const icon = document.createElement('span'); icon.textContent = '★'; label.append(icon);
    const track = document.createElement('div'); track.className = 'rating-track'; track.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('span'); fill.className = 'rating-fill'; fill.style.width = `${percentage || 0}%`; track.append(fill);
    const value = document.createElement('span'); value.className = 'rating-percent'; value.textContent = percentage === null ? '—' : `${percentage}%`;
    row.append(label, track, value); bars.append(row);
  }
  text('ratingNote', hasBreakdown ? 'Rating distribution' : 'Rating breakdown is not available.');

  const attractions = document.getElementById('destinationAttractions');
  destination.attractions.forEach(attraction => {
    const item = document.createElement('li');
    const check = document.createElement('span'); check.className = 'attraction-check'; check.textContent = '✓'; check.setAttribute('aria-hidden', 'true');
    item.append(check, document.createTextNode(attraction)); attractions.append(item);
  });
  text('significanceTitle', destination.significanceTitle);
  text('destinationSignificance', destination.significance);
  if (destination.source) {
    const source = document.getElementById('destinationSource');
    source.href = destination.source; source.hidden = false;
  }
  document.getElementById('destinationDetail').hidden = false;
})();
