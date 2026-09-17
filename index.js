document.querySelector("#homeSearch").addEventListener("submit", (event) => {
  event.preventDefault();
  const search = event.currentTarget.elements.search.value.trim();
  if (search)
    window.location.href = `destination.html?search=${encodeURIComponent(search)}`;
});
