// Home page "From the World Wildlife Calendar" card. index.html is static, so the
// latest day comes from /calendar/latest.json (built daily, see
// content/calendar-latest.njk). The calendar is English-only, so the card shows
// only when the page is in English; it stays hidden if the feed can't load.
(function () {
  var section = document.getElementById('calendar-today');
  if (!section || !window.fetch) return;
  var data = null;
  function $(s) { return section.querySelector(s); }
  function render() {
    var on = data && data.latest && (document.documentElement.lang || 'en').slice(0, 2) === 'en';
    section.hidden = !on;
    if (!on) return;
    var d = data.latest;
    $('.calday-card').href = d.url;
    var img = $('.calday-img');
    img.src = d.image; img.alt = d.animal ? 'Photo: ' + d.animal : '';
    $('.calday-when').textContent = (d.isToday ? 'Today · ' : '') + d.dateText;
    $('.calday-day').textContent = d.day;
    $('.calday-animal').textContent = d.animal && d.animal.toLowerCase() !== d.day.toLowerCase() ? 'Meet the ' + d.animal.charAt(0).toLowerCase() + d.animal.slice(1) : '';
    var n = data.next, next = $('.calday-next');
    if (n) { var a = $('.calday-next-link'); a.href = n.url; a.textContent = n.day; $('.calday-next-date').textContent = n.dateText; next.hidden = false; }
    else next.hidden = true;
  }
  fetch('/calendar/latest.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) { data = j; render(); })
    .catch(function () {});
  // Re-check when the language switcher changes <html lang>.
  if (window.MutationObserver) new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
