// Wild Atlas — parent email signup (getwildatlas#18).
// First-party progressive enhancement: intercept the form, POST JSON to
// /api/subscribe, show an inline status message. If JS is off, the form still
// works via a native POST (the function returns an HTML confirmation page).
(function () {
  'use strict';

  var forms = document.querySelectorAll('.email-signup-form');
  if (!forms.length) return;

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var msg = form.querySelector('.email-signup-msg');
      var btn = form.querySelector('.email-signup-btn');
      var emailEl = form.querySelector('input[type="email"]');
      var consentEl = form.querySelector('input[name="consent"]');
      var sourceEl = form.querySelector('input[name="source"]');

      function show(text, ok) {
        if (!msg) return;
        msg.hidden = false;
        msg.textContent = text;
        msg.classList.toggle('is-error', !ok);
        msg.classList.toggle('is-ok', ok);
      }

      if (emailEl && !emailEl.checkValidity()) {
        show('Please enter a valid email address.', false);
        emailEl.focus();
        return;
      }
      if (consentEl && !consentEl.checked) {
        show('Please tick the consent box so we know you agree to receive email.', false);
        return;
      }

      var original = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Subscribing…'; }

      fetch(form.getAttribute('action') || '/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          email: emailEl ? emailEl.value.trim() : '',
          consent: consentEl && consentEl.checked ? 'on' : '',
          source: sourceEl ? sourceEl.value : 'unknown'
        })
      })
        .then(function (r) {
          return r.json().catch(function () { return { ok: r.ok }; });
        })
        .then(function (d) {
          if (d && d.ok) {
            form.reset();
            show('You’re subscribed — we’ll be in touch when there’s something new. Unsubscribe anytime.', true);
          } else {
            show((d && d.error) || 'Something went wrong. Please try again.', false);
          }
        })
        .catch(function () {
          show('Something went wrong. Please try again.', false);
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = original; }
        });
    });
  });
})();
