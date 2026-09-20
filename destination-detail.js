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
  const presetRating = Number.isFinite(destination.rating) ? Math.max(0, Math.min(5, destination.rating)) : null;
  const score = document.getElementById('ratingScore');
  const stars = document.getElementById('ratingStars');
  const starsFilled = document.getElementById('ratingStarsFilled');
  const breakdown = document.getElementById('ratingBreakdown');
  const reviewList = document.getElementById('communityReviewList');

  document.title = `${destination.name} | LakbayPH`;
  text('destinationName', destination.name);
  text('destinationLocation', destination.location);
  text('destinationIsland', destination.island);
  text('destinationDescription', destination.description);
  const image = document.getElementById('destinationImage');
  image.src = destination.detailImage;
  image.alt = destination.imageAlt || destination.name;
  text('destinationCaption', destination.imageCaption || `${destination.name} · ${destination.island}`);

  function reviewCountLabel(count) {
    return count === 0 ? 'No community reviews yet' : `${count.toLocaleString()} community review${count === 1 ? '' : 's'}`;
  }

  function renderRatingSummary(rating, count) {
    const hasRating = Number.isFinite(rating);
    score.replaceChildren();
    score.classList.toggle('unrated', !hasRating);
    if (hasRating) {
      score.append(document.createTextNode(rating.toFixed(1)));
      const maximum = document.createElement('small');
      maximum.textContent = ' / 5';
      score.append(maximum);
    } else {
      score.textContent = 'Not yet rated';
    }
    stars.setAttribute('aria-label', hasRating ? `${rating.toFixed(1)} out of 5 stars` : 'No rating yet');
    starsFilled.style.width = `${hasRating ? rating / 5 * 100 : 0}%`;
    text('destinationRating', hasRating ? `${rating.toFixed(1)} / 5` : 'Not yet rated');
    text('destinationReviews', reviewCountLabel(count));
    text('ratingReviews', reviewCountLabel(count));
  }

  function validRatings(ratings) {
    return ratings.filter(review =>
      typeof review.fullName === 'string' && review.fullName.trim() &&
      Number.isFinite(review.rating) && review.rating >= 0.5 && review.rating <= 5 &&
      Number.isInteger(review.rating * 2)
    );
  }

  function renderBreakdown(ratings) {
    breakdown.replaceChildren();
    if (!ratings.length) {
      breakdown.hidden = true;
      return;
    }

    const totals = new Map();
    ratings.forEach(review => totals.set(review.rating, (totals.get(review.rating) || 0) + 1));
    [...totals.keys()].sort((a, b) => b - a).forEach(value => {
      const count = totals.get(value);
      const percentage = Math.round(count / ratings.length * 100);
      const row = document.createElement('div');
      row.className = 'rating-row';
      row.setAttribute('aria-label', `${value.toFixed(1)} stars: ${percentage}%`);
      const label = document.createElement('span');
      label.className = 'rating-label';
      label.textContent = Number.isInteger(value) ? String(value) : value.toFixed(1);
      const icon = document.createElement('span');
      icon.textContent = ' ★';
      label.append(icon);
      const track = document.createElement('div');
      track.className = 'rating-track';
      track.setAttribute('aria-hidden', 'true');
      const fill = document.createElement('span');
      fill.className = 'rating-fill';
      fill.style.width = `${percentage}%`;
      track.append(fill);
      const percent = document.createElement('span');
      percent.className = 'rating-percent';
      percent.textContent = `${percentage}%`;
      row.append(label, track, percent);
      breakdown.append(row);
    });
    breakdown.hidden = false;
  }

  function reviewDate(review) {
    try {
      const date = review.createdAt?.toDate?.();
      return date instanceof Date && !Number.isNaN(date.valueOf())
        ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : '';
    } catch (_) {
      return '';
    }
  }

  function renderCommunityReviews(allRatings) {
    const ratings = validRatings(allRatings).sort((a, b) => {
      const left = a.createdAt?.seconds || 0;
      const right = b.createdAt?.seconds || 0;
      return right - left;
    });
    const count = ratings.length;
    const average = count ? ratings.reduce((sum, review) => sum + review.rating, 0) / count : presetRating;
    renderRatingSummary(average, count);
    renderBreakdown(ratings);
    text('communityReviewSummary', count
      ? `${average.toFixed(1)} out of 5 from ${reviewCountLabel(count).toLowerCase()}.`
      : 'No community ratings yet.');

    reviewList.replaceChildren();
    if (!count) {
      const empty = document.createElement('p');
      empty.className = 'empty-reviews';
      empty.textContent = 'Be the first to rate this destination.';
      reviewList.append(empty);
      return;
    }

    ratings.forEach(review => {
      const item = document.createElement('article');
      item.className = 'community-review';
      const header = document.createElement('div');
      header.className = 'community-review-header';
      const identity = document.createElement('div');
      const name = document.createElement('h3');
      name.textContent = review.fullName.trim();
      const date = document.createElement('time');
      date.textContent = reviewDate(review);
      identity.append(name);
      if (date.textContent) identity.append(date);
      const rating = document.createElement('p');
      rating.className = 'community-review-rating';
      rating.textContent = `${review.rating.toFixed(1)} ★`;
      rating.setAttribute('aria-label', `${review.rating.toFixed(1)} out of 5 stars`);
      header.append(identity, rating);
      item.append(header);
      if (typeof review.description === 'string' && review.description.trim()) {
        const description = document.createElement('p');
        description.className = 'community-review-description';
        description.textContent = review.description.trim();
        item.append(description);
      }
      reviewList.append(item);
    });
  }

  renderRatingSummary(presetRating, 0);

  const attractions = document.getElementById('destinationAttractions');
  destination.attractions.forEach(attraction => {
    const item = document.createElement('li');
    const check = document.createElement('span');
    check.className = 'attraction-check';
    check.textContent = '✓';
    check.setAttribute('aria-hidden', 'true');
    item.append(check, document.createTextNode(attraction));
    attractions.append(item);
  });
  text('significanceTitle', destination.significanceTitle);
  text('destinationSignificance', destination.significance);
  if (destination.source) {
    const source = document.getElementById('destinationSource');
    source.href = destination.source;
    source.hidden = false;
  }
  document.getElementById('destinationDetail').hidden = false;

  const modal = document.getElementById('ratingModal');
  const form = document.getElementById('ratingForm');
  const nameInput = document.getElementById('reviewerName');
  const descriptionInput = document.getElementById('reviewDescription');
  const descriptionCount = document.getElementById('descriptionCount');
  const interactiveFill = document.getElementById('interactiveStarsFill');
  const selectedRatingOutput = document.getElementById('selectedRating');
  const starHitboxes = document.getElementById('starHitboxes');
  const submitButton = document.getElementById('submitRating');
  let currentStep = 1;
  let selectedRating = 0;

  function showStep(step) {
    currentStep = step;
    document.querySelectorAll('[data-rating-step]').forEach(section => {
      section.hidden = Number(section.dataset.ratingStep) !== currentStep;
    });
    const target = currentStep === 1 ? nameInput
      : currentStep === 2 ? starHitboxes.querySelector('[data-rating-value]')
      : descriptionInput;
    setTimeout(() => target?.focus(), 0);
  }

  function paintInteractiveStars(value) {
    interactiveFill.style.width = `${value / 5 * 100}%`;
  }

  function chooseRating(value) {
    selectedRating = value;
    paintInteractiveStars(value);
    selectedRatingOutput.value = `${value.toFixed(1)} out of 5 stars`;
    starHitboxes.querySelectorAll('[data-rating-value]').forEach(button => {
      button.setAttribute('aria-checked', String(Number(button.dataset.ratingValue) === value));
    });
    text('starRatingError', '');
  }

  for (let halfStep = 1; halfStep <= 10; halfStep++) {
    const value = halfStep / 2;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'star-hitbox';
    button.dataset.ratingValue = value;
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', 'false');
    button.setAttribute('aria-label', `${value.toFixed(1)} out of 5 stars`);
    button.addEventListener('click', () => chooseRating(value));
    button.addEventListener('pointerenter', () => paintInteractiveStars(value));
    button.addEventListener('focus', () => paintInteractiveStars(value));
    starHitboxes.append(button);
  }
  starHitboxes.addEventListener('pointerleave', () => paintInteractiveStars(selectedRating));
  starHitboxes.addEventListener('focusout', event => {
    if (!starHitboxes.contains(event.relatedTarget)) paintInteractiveStars(selectedRating);
  });

  function resetRatingForm() {
    form.reset();
    selectedRating = 0;
    paintInteractiveStars(0);
    selectedRatingOutput.value = 'Select a rating';
    descriptionCount.textContent = '0';
    text('nameRatingError', '');
    text('starRatingError', '');
    text('ratingSaveError', '');
    submitButton.disabled = false;
    submitButton.textContent = 'Done';
    showStep(1);
  }

  document.getElementById('openRatingModal').addEventListener('click', () => {
    resetRatingForm();
    modal.showModal();
  });
  document.getElementById('closeRatingModal').addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => {
    if (event.target === modal) modal.close();
  });
  descriptionInput.addEventListener('input', () => {
    descriptionCount.textContent = String(descriptionInput.value.length);
  });

  document.querySelectorAll('[data-next-rating-step]').forEach(button => {
    button.addEventListener('click', () => {
      if (currentStep === 1) {
        const name = nameInput.value.trim();
        if (name.length < 2) {
          text('nameRatingError', 'Please enter your full name.');
          nameInput.focus();
          return;
        }
        text('nameRatingError', '');
        showStep(2);
      } else if (currentStep === 2) {
        if (!selectedRating) {
          text('starRatingError', 'Please choose a full or half-star rating.');
          return;
        }
        text('starRatingError', '');
        showStep(3);
      }
    });
  });
  document.querySelectorAll('[data-previous-rating-step]').forEach(button => {
    button.addEventListener('click', () => showStep(Math.max(1, currentStep - 1)));
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    text('ratingSaveError', '');
    submitButton.disabled = true;
    submitButton.textContent = 'Saving…';
    try {
      if (typeof window.saveDestinationRating !== 'function') throw new Error('Rating service is unavailable.');
      await window.saveDestinationRating({
        destinationId: destination.id,
        fullName: nameInput.value,
        rating: selectedRating,
        description: descriptionInput.value
      });
      modal.close();
      resetRatingForm();
    } catch (error) {
      console.error('Could not save destination rating:', error);
      text('ratingSaveError', 'Your rating could not be saved. Please try again.');
      submitButton.disabled = false;
      submitButton.textContent = 'Done';
    }
  });

  if (typeof window.subscribeDestinationRatings === 'function') {
    const unsubscribe = window.subscribeDestinationRatings(destination.id, renderCommunityReviews, error => {
      console.error('Could not load destination ratings:', error);
      text('communityReviewSummary', 'Community reviews could not be loaded right now.');
    });
    window.addEventListener('pagehide', unsubscribe, { once: true });
  }
})();
