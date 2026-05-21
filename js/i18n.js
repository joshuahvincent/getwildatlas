// Wild Atlas Landing Page — i18n Engine
// Auto-detects browser language, applies translations, provides language picker.
//
// Architecture notes (added 2026-05-13):
//   - `supportedLocales` in translations.js is the source of truth for which locales
//     the WEBSITE supports. It MUST be kept in sync with the iOS app's `.lproj`
//     directories. Run `scripts/check-locale-coverage.sh` to detect drift.
//   - Every locale block must contain every key present in the default locale (`en`).
//     Missing keys fall back through `defaultLocale`. On boot, missing keys are logged
//     to console with `[i18n]` prefix so gaps surface during dev/review.
//   - When adding a new locale: (1) append to supportedLocales, (2) add a
//     languageNames entry, (3) add a complete translations block, (4) add a flag-emoji
//     entry to the "Available in N Languages" section in index.html.

(function () {
  'use strict';

  var I18N = window.WILD_ATLAS_I18N;
  if (!I18N) return;

  var STORAGE_KEY = 'wa_lang';
  var currentLocale = null;

  // ── Language Resolution ──
  function resolveLocale() {
    // 1. Explicit choice saved in localStorage
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && I18N.supportedLocales.indexOf(stored) !== -1) {
      return stored;
    }
    // 2. Browser language
    var browserLangs = navigator.languages || [navigator.language || 'en'];
    for (var i = 0; i < browserLangs.length; i++) {
      var raw = browserLangs[i].toLowerCase();
      // Try full tag first (e.g. zh-hans), then base (e.g. zh)
      if (I18N.supportedLocales.indexOf(raw) !== -1) return raw;
      var base = raw.split('-')[0];
      if (I18N.supportedLocales.indexOf(base) !== -1) return base;
    }
    // 3. Fallback
    return I18N.defaultLocale;
  }

  // ── String lookup with fallback ──
  // Returns the value for `key` in `locale`, falling back through `defaultLocale`
  // if missing. Returns null if the key is missing everywhere.
  function lookup(locale, key) {
    var t = I18N.translations[locale];
    if (t && t[key] != null) return t[key];
    var fb = I18N.translations[I18N.defaultLocale];
    if (fb && fb[key] != null) return fb[key];
    return null;
  }

  // ── Locale coverage validation ──
  // Logs warnings for any supportedLocale missing keys present in defaultLocale.
  // Catches drift between locales at boot rather than at user-report time.
  function validateLocaleCoverage() {
    var ref = I18N.translations[I18N.defaultLocale];
    if (!ref) {
      console.warn('[i18n] no translation block for defaultLocale "' + I18N.defaultLocale + '"');
      return;
    }
    var refKeys = Object.keys(ref);
    var problems = 0;
    for (var i = 0; i < I18N.supportedLocales.length; i++) {
      var loc = I18N.supportedLocales[i];
      if (loc === I18N.defaultLocale) continue;
      var t = I18N.translations[loc];
      if (!t) {
        console.warn('[i18n] supportedLocales lists "' + loc + '" but no translation block exists');
        problems++;
        continue;
      }
      var missing = [];
      for (var j = 0; j < refKeys.length; j++) {
        if (t[refKeys[j]] == null) missing.push(refKeys[j]);
      }
      if (missing.length > 0) {
        console.warn('[i18n] locale "' + loc + '" missing ' + missing.length +
                     ' keys: ' + missing.slice(0, 8).join(', ') +
                     (missing.length > 8 ? ', ...' : ''));
        problems++;
      }
    }
    if (problems === 0) {
      // Silent on success in prod; opt-in via ?debug=i18n
      if (location.search.indexOf('debug=i18n') !== -1) {
        console.log('[i18n] all ' + I18N.supportedLocales.length + ' locales fully translated against "' + I18N.defaultLocale + '"');
      }
    }
  }

  // ── Apply Translations to DOM ──
  function applyTranslations(locale) {
    if (!I18N.translations[locale]) {
      console.warn('[i18n] requested locale "' + locale + '" not found; falling back to "' + I18N.defaultLocale + '"');
      locale = I18N.defaultLocale;
    }

    currentLocale = locale;
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;

    // Document title
    var titleVal = lookup(locale, 'meta.title');
    if (titleVal) document.title = titleVal;

    // Meta content attributes
    var metas = document.querySelectorAll('[data-i18n-content]');
    for (var i = 0; i < metas.length; i++) {
      var mKey = metas[i].getAttribute('data-i18n-content');
      var mVal = lookup(locale, mKey);
      if (mVal != null) metas[i].setAttribute('content', mVal);
    }

    // Text content
    var texts = document.querySelectorAll('[data-i18n]');
    for (var j = 0; j < texts.length; j++) {
      var tKey = texts[j].getAttribute('data-i18n');
      var tVal = lookup(locale, tKey);
      if (tVal != null) texts[j].textContent = tVal;
    }

    // innerHTML (strings with <strong>, <br>, etc.)
    var htmls = document.querySelectorAll('[data-i18n-html]');
    for (var k = 0; k < htmls.length; k++) {
      var hKey = htmls[k].getAttribute('data-i18n-html');
      var hVal = lookup(locale, hKey);
      if (hVal != null) htmls[k].innerHTML = hVal;
    }

    // Placeholders
    var phs = document.querySelectorAll('[data-i18n-placeholder]');
    for (var p = 0; p < phs.length; p++) {
      var pKey = phs[p].getAttribute('data-i18n-placeholder');
      var pVal = lookup(locale, pKey);
      if (pVal != null) phs[p].setAttribute('placeholder', pVal);
    }

    // Alt text
    var alts = document.querySelectorAll('[data-i18n-alt]');
    for (var a = 0; a < alts.length; a++) {
      var aKey = alts[a].getAttribute('data-i18n-alt');
      var aVal = lookup(locale, aKey);
      if (aVal != null) alts[a].setAttribute('alt', aVal);
    }

    // Structured data
    updateStructuredData(locale);

    // Picker display
    updatePickerDisplay(locale);
  }

  // ── Structured Data ──
  function updateStructuredData(locale) {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var data = JSON.parse(scripts[i].textContent);
        if (data['@type'] === 'FAQPage') {
          var qa = [
            ['faq.q1','faq.a1'], ['faq.q2','faq.a2'],
            ['faq.q3','faq.a3'], ['faq.q4','faq.a4']
          ];
          for (var f = 0; f < qa.length; f++) {
            var qv = lookup(locale, qa[f][0]);
            var av = lookup(locale, qa[f][1]);
            if (qv && av && data.mainEntity[f]) {
              data.mainEntity[f].name = qv;
              data.mainEntity[f].acceptedAnswer.text = av;
            }
          }
          scripts[i].textContent = JSON.stringify(data);
        }
        if (data['@type'] === 'SoftwareApplication') {
          var dv = lookup(locale, 'meta.description');
          if (dv) {
            data.description = dv;
            scripts[i].textContent = JSON.stringify(data);
          }
        }
      } catch (e) { /* ignore */ }
    }
  }

  // ── Language Picker ──
  function initPickers() {
    var dropdowns = document.querySelectorAll('.lang-picker-dropdown');
    for (var d = 0; d < dropdowns.length; d++) {
      var dropdown = dropdowns[d];
      for (var i = 0; i < I18N.supportedLocales.length; i++) {
        var code = I18N.supportedLocales[i];
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('data-lang', code);
        li.textContent = I18N.languageNames[code] || code;
        li.addEventListener('click', (function (c) {
          return function () {
            applyTranslations(c);
            closeAllDropdowns();
          };
        })(code));
        dropdown.appendChild(li);
      }
    }

    var btns = document.querySelectorAll('.lang-picker-btn');
    for (var b = 0; b < btns.length; b++) {
      btns[b].addEventListener('click', (function (btn) {
        return function (e) {
          e.stopPropagation();
          var dd = btn.nextElementSibling;
          var isOpen = !dd.hidden;
          closeAllDropdowns();
          if (!isOpen) {
            dd.hidden = false;
            btn.setAttribute('aria-expanded', 'true');
          }
        };
      })(btns[b]));
    }

    document.addEventListener('click', closeAllDropdowns);
  }

  function closeAllDropdowns() {
    var dds = document.querySelectorAll('.lang-picker-dropdown');
    for (var i = 0; i < dds.length; i++) dds[i].hidden = true;
    var btns = document.querySelectorAll('.lang-picker-btn');
    for (var j = 0; j < btns.length; j++) btns[j].setAttribute('aria-expanded', 'false');
  }

  function updatePickerDisplay(locale) {
    var name = I18N.languageNames[locale] || locale;
    var currents = document.querySelectorAll('.lang-picker-current');
    for (var i = 0; i < currents.length; i++) {
      currents[i].textContent = name;
    }
    var items = document.querySelectorAll('.lang-picker-dropdown [data-lang]');
    for (var j = 0; j < items.length; j++) {
      var isActive = items[j].getAttribute('data-lang') === locale;
      items[j].className = isActive ? 'active' : '';
    }
  }

  // ── Init ──
  function init() {
    validateLocaleCoverage();
    var locale = resolveLocale();
    initPickers();
    applyTranslations(locale);
    document.documentElement.classList.remove('i18n-loading');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.WildAtlasI18n = {
    setLocale: applyTranslations,
    getLocale: function () { return currentLocale; },
    lookup: lookup,
    validate: validateLocaleCoverage
  };
})();
