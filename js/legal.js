// Wild Atlas — Legal page renderer
// Parses plain-text Privacy Policy / Terms of Service bodies into structured HTML.
//
// Source format conventions (from AboutView.swift):
//   - Section headings: "1. Introduction"               → <h2>
//   - Sub-headings:     "2.1 Information You Provide"   → <h3>
//   - Bullet lists:     lines starting with "- "         → <ul><li>
//   - Everything else:                                   → <p>
//
// The body to render is selected by `data-legal-doc` on <body> ("privacy" | "terms")
// and the current locale (from window.WildAtlasI18n).

(function () {
  'use strict';

  var LEGAL = window.WILD_ATLAS_LEGAL;
  var I18N = window.WILD_ATLAS_I18N;
  if (!LEGAL || !I18N) return;

  var docKind = document.body.getAttribute('data-legal-doc');
  if (!docKind || !LEGAL[docKind]) return;

  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Auto-link email + URL inside legal text. Run AFTER escapeHTML.
  function linkify(s) {
    return s
      .replace(/([\w.+-]+@[\w-]+\.[\w.-]+)/g, '<a href="mailto:$1">$1</a>')
      .replace(/\b(www\.[\w./?=&%-]+)/g, '<a href="https://$1" target="_blank" rel="noopener">$1</a>');
  }

  function renderDoc(text) {
    var blocks = text.split(/\n\s*\n+/);
    return blocks.map(function (block) {
      block = block.trim();
      if (!block) return '';

      // H3: "2.1 Information You Provide" — must come BEFORE h2 check
      var h3m = block.match(/^(\d+\.\d+)\s+(.+)$/);
      if (h3m && !/\n/.test(block)) {
        return '<h3><span class="legal-num">' + escapeHTML(h3m[1]) + '</span> ' + escapeHTML(h3m[2]) + '</h3>';
      }

      // H2: "1. Introduction"
      var h2m = block.match(/^(\d+)\.\s+(.+)$/);
      if (h2m && !/\n/.test(block)) {
        return '<h2><span class="legal-num">' + escapeHTML(h2m[1]) + '.</span> ' + escapeHTML(h2m[2]) + '</h2>';
      }

      // Bullet list: every line starts with "- "
      var lines = block.split('\n');
      if (lines.length > 0 && lines.every(function (l) { return /^- /.test(l); })) {
        return '<ul>' + lines.map(function (l) {
          return '<li>' + linkify(escapeHTML(l.replace(/^- /, ''))) + '</li>';
        }).join('') + '</ul>';
      }

      // Paragraph (may contain soft line breaks)
      return '<p>' + linkify(escapeHTML(block)).replace(/\n/g, '<br>') + '</p>';
    }).join('\n');
  }

  function currentLocale() {
    if (window.WildAtlasI18n && window.WildAtlasI18n.getLocale) {
      var l = window.WildAtlasI18n.getLocale();
      if (l) return l;
    }
    return I18N.defaultLocale;
  }

  function render() {
    var target = document.getElementById('legalBody');
    if (!target) return;
    var locale = currentLocale();
    var body = (LEGAL[docKind] && LEGAL[docKind][locale]) || LEGAL[docKind][I18N.defaultLocale];
    target.innerHTML = renderDoc(body);
  }

  // Re-render when the language picker changes locale.
  function hookLocaleChanges() {
    if (!window.WildAtlasI18n || !window.WildAtlasI18n.setLocale) return;
    var original = window.WildAtlasI18n.setLocale;
    window.WildAtlasI18n.setLocale = function (locale) {
      original(locale);
      render();
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { render(); hookLocaleChanges(); });
  } else {
    render();
    hookLocaleChanges();
  }
})();
