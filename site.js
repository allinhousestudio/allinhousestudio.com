/* AllInHouse Studio site script: forms, cookie choice and Google Analytics */

/* ===== SETTINGS =====
   Paste your Google Analytics Measurement ID between the quotes, for example 'G-AB12CD34EF'.
   While it's empty, no cookie banner shows and Google Analytics never loads. */
var GA_MEASUREMENT_ID = '';
/* ==================== */

(function () {
  var KEY = 'aih-cookie-choice';

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadAnalytics() {
    if (!GA_MEASUREMENT_ID || window.__aihGaLoaded) return;
    window.__aihGaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
  }

  function removeAnalyticsCookies() {
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ga') === 0) {
        var host = location.hostname, parts = host.split('.');
        var domains = ['', host, '.' + host];
        if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
        domains.forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  function showBanner() {
    if (!GA_MEASUREMENT_ID) return;
    var old = document.getElementById('cookie-banner');
    if (old) old.remove();
    var b = document.createElement('div');
    b.id = 'cookie-banner'; b.className = 'cookie-banner';
    b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Cookie choice');
    b.innerHTML =
      '<p><strong>Can we use analytics cookies?</strong> They tell us how many people visit and which pages are useful, so we can improve the site. ' +
      'We only use them if you say yes. <a href="cookies.html">Read about our cookies</a>.</p>' +
      '<div class="btns"><button type="button" class="btn btn-accept">Accept</button><button type="button" class="btn btn-decline">Decline</button></div>';
    document.body.appendChild(b);
    b.querySelector('.btn-accept').addEventListener('click', function () { setChoice('accepted'); b.remove(); loadAnalytics(); });
    b.querySelector('.btn-decline').addEventListener('click', function () { setChoice('declined'); b.remove(); removeAnalyticsCookies(); });
  }

  var choice = getChoice();
  if (choice === 'accepted') loadAnalytics();
  else if (choice !== 'declined') showBanner();

  document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
    if (!GA_MEASUREMENT_ID) { el.hidden = true; return; }
    el.addEventListener('click', function (e) { e.preventDefault(); showBanner(); });
  });

  // Send any form with data-formspree to Formspree without leaving the page.
  document.querySelectorAll('form[data-formspree]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg');
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…'; }
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('send failed');
          form.reset();
          if (msg) { msg.hidden = false; msg.className = 'form-msg ok'; msg.textContent = form.dataset.thanks || 'Thank you. Your message has been sent.'; }
        })
        .catch(function () {
          if (msg) { msg.hidden = false; msg.className = 'form-msg err'; msg.textContent = 'Your message did not send. Please check your connection and try again, or email morag@allinhousestudio.com.'; }
        })
        .then(function () { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; } });
    });
  });
})();
