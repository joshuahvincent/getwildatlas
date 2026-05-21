// Wild Atlas Landing Page — main.js

(function () {
  'use strict';

  // ── Navbar scroll effect ──
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });

  // ── Mobile nav toggle ──
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', function () {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });

  // Close mobile nav on link click
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  });

  // ── Scroll-triggered fade-in ──
  var fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show everything
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ── Email signup form ──
  var form = document.getElementById('signupForm');
  var success = document.getElementById('signupSuccess');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            form.hidden = true;
            success.hidden = false;
          } else {
            var errMsg = 'Something went wrong. Please try again!';
            try {
              var loc = window.WildAtlasI18n ? window.WildAtlasI18n.getLocale() : 'en';
              var t = window.WILD_ATLAS_I18N && window.WILD_ATLAS_I18N.translations[loc];
              if (t && t['signup.error']) errMsg = t['signup.error'];
            } catch (ex) { /* fallback */ }
            alert(errMsg);
          }
        })
        .catch(function () {
          alert('Something went wrong. Please try again!');
        });
    });
  }
})();
