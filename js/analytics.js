/**
 * Funnel tracking, wired once.
 *
 * Every event in the commercial funnel is attached here through delegated
 * listeners, so no component carries analytics code of its own and nothing has
 * to be re-wired when markup moves.
 *
 * Measurement is opt-in and consent-gated. With no measurement ID configured
 * nothing loads, no cookie is set, and `track()` is a no-op — the site is then
 * genuinely cookieless and needs no consent banner. When an ID is present,
 * GA4 loads only after the visitor accepts, using Consent Mode defaults of
 * "denied" so the tag cannot write storage beforehand.
 */
(function () {
  'use strict';

  var cfg = window.WW_ANALYTICS_CONFIG || {};
  var ID = cfg.measurementId || '';
  var CONSENT_KEY = 'worldwidewmal_consent';

  /* Consent is a durable preference, so it belongs in localStorage — unlike
     the project builder's selections, which are per-visit. It stores one of
     "granted" / "denied" and nothing else. */
  function readConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function writeConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
  }

  var loaded = false;
  var queue = [];

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }

  function loadGA() {
    if (loaded || !ID) return;
    loaded = true;

    gtag('js', new Date());
    gtag('config', ID, { anonymize_ip: true });

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
    document.head.appendChild(s);

    while (queue.length) {
      var q = queue.shift();
      gtag('event', q.name, q.params);
    }
  }

  function grant() {
    writeConsent('granted');
    if (!ID) return;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    loadGA();
  }

  function deny() {
    writeConsent('denied');
    queue.length = 0;
  }

  /* Consent Mode defaults must be set before the tag loads. */
  if (ID) {
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500,
    });
    if (readConsent() === 'granted') {
      gtag('consent', 'update', { analytics_storage: 'granted' });
      loadGA();
    }
  }

  /** Record a funnel event. Safe to call whether or not measurement is on. */
  function track(name, params) {
    if (!name) return;
    var payload = params || {};
    if (!ID || readConsent() !== 'granted') {
      /* Hold a short buffer so events fired just before a visitor accepts are
         not lost. Dropped entirely if they decline. */
      if (ID && queue.length < 25) queue.push({ name: name, params: payload });
      return;
    }
    gtag('event', name, payload);
  }

  var api = {
    track: track,
    grant: grant,
    deny: deny,
    consent: readConsent,
    /** True when measurement is configured and therefore consent is required. */
    needsConsent: function () { return !!ID && !readConsent(); },
    enabled: !!ID,
  };
  window.WW_ANALYTICS = api;

  /* Single entry point: the wiring below calls through the public object
     rather than the closure, so anything that wraps WW_ANALYTICS.track sees
     every event the page produces. */
  function emit(name, params) {
    api.track(name, params);
  }

  /* ── event wiring ─────────────────────────────────────────────────────
     One delegated listener covers everything reachable from the DOM. */
  function wire() {
    document.addEventListener(
      'click',
      function (e) {
        var t = e.target;
        if (!t || !t.closest) return;

        var portfolio = t.closest('a[href*="canva.site"]');
        if (portfolio) {
          emit('portfolio_click', { link_text: (portfolio.textContent || '').trim().slice(0, 60) });
          return;
        }

        var travel = t.closest('a[href="/travel"], a[href^="/travel/"]');
        if (travel) { emit('travel_planning_click'); return; }

        var svc = t.closest('#services .card');
        if (svc && t.closest('a,button')) {
          var title = (svc.querySelector('.card-t') || {}).textContent || '';
          emit(/on-location/i.test(title) ? 'service_on_location_click' : 'service_ugc_click');
          return;
        }

        var incl = t.closest('.js-incl');
        if (incl) {
          /* Only the opening direction is a signal of interest. */
          if (incl.getAttribute('aria-expanded') !== 'true') {
            emit('pricing_expand', { package: incl.getAttribute('aria-controls') || '' });
          }
          return;
        }

        var sel = t.closest('.js-select');
        if (sel) {
          /* Fires on add, not on remove. */
          if (sel.getAttribute('aria-pressed') === 'true') return;
          var d = sel.dataset;
          if (d.select === 'package') emit('package_add', { item: d.title || d.id, price: d.price || '' });
          else if (d.select === 'addon') emit('addon_add', { item: d.label || d.id, group: d.group || '' });
          else if (d.select === 'posting') emit('posting_add', { item: d.id });
          return;
        }

        if (t.closest('#pbar-open')) { emit('project_builder_open'); return; }
        if (t.closest('#pdrawer-go, #psumm-edit')) {
          if (t.closest('#pdrawer-go')) emit('project_builder_complete');
          return;
        }
      },
      true
    );

    /* First interaction with the inquiry form. */
    var started = false;
    document.addEventListener(
      'focusin',
      function (e) {
        if (started) return;
        if (e.target && e.target.closest && e.target.closest('#project-form')) {
          started = true;
          emit('project_form_start');
        }
      },
      true
    );

    /* The form dispatches this once the provider has accepted the submission,
       so it counts real inquiries rather than clicks on the button. */
    document.addEventListener('ww:form-submitted', function (e) {
      emit('project_form_submit', (e && e.detail) || {});
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }

})();
