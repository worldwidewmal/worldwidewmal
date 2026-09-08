/**
 * Project builder — an inquiry tool, not a checkout.
 *
 * The visitor assembles a project while scrolling; the selections survive
 * scrolling, accordions, and a refresh, then arrive at the inquiry form
 * already filled in and, crucially, still visible to them. Nothing here
 * collects payment and nothing is ever priced by guesswork: an item without a
 * published rate is carried as "Custom" and left out of the arithmetic.
 */
(function () {
  'use strict';

  var KEY = 'worldwidewmal_project';

  /* Selections live in sessionStorage: they should survive a refresh and
     same-site navigation, but they are not account data and should not
     outlive the visit. */
  var store = {
    read: function () {
      try {
        var raw = sessionStorage.getItem(KEY);
        if (!raw) return null;
        var v = JSON.parse(raw);
        return v && typeof v === 'object' ? v : null;
      } catch (e) {
        return null;
      }
    },
    write: function (v) {
      try {
        sessionStorage.setItem(KEY, JSON.stringify(v));
      } catch (e) {
        /* Private mode or a full quota: the page still works, the selection
           just will not survive a refresh. */
      }
    },
    clear: function () {
      try {
        sessionStorage.removeItem(KEY);
      } catch (e) {}
    },
  };

  function blank() {
    return { packages: {}, addOns: {}, posting: [] };
  }

  var state = (function () {
    var s = store.read() || blank();
    if (!s.packages || typeof s.packages !== 'object') s.packages = {};
    if (!s.addOns || typeof s.addOns !== 'object') s.addOns = {};
    if (!Array.isArray(s.posting)) s.posting = [];
    return s;
  })();

  var listeners = [];

  /* ── pricing ─────────────────────────────────────────────────────────
     Every published rate is one of four shapes. Anything unrecognised is
     treated as custom rather than coerced into a number. */
  function parsePrice(raw) {
    if (raw === null || raw === undefined || raw === '') return { kind: 'custom' };
    var s = String(raw).trim();

    var pct = s.match(/^(\d+(?:\.\d+)?)%$/);
    if (pct) return { kind: 'percent', percent: parseFloat(pct[1]) };

    var from = s.match(/^Starting at \$([\d,]+(?:\.\d+)?)$/i);
    if (from) return { kind: 'from', amount: parseFloat(from[1].replace(/,/g, '')) };

    var fixed = s.match(/^\$([\d,]+(?:\.\d+)?)$/);
    if (fixed) return { kind: 'fixed', amount: parseFloat(fixed[1].replace(/,/g, '')) };

    return { kind: 'custom' };
  }

  function money(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  /* ── selection model ─────────────────────────────────────────────────
     packages: one per category, so the three On-Location tiers are mutually
     exclusive and the three UGC tiers are mutually exclusive, but a visitor
     may combine one of each.
     addOns:   keyed by group. Production stacks; a licensing group holds a
               single duration, since you buy one term or none.
     posting:  overlapping distribution is resolved rather than double-charged. */
  var api = {
    get: function () {
      return state;
    },

    isSelected: function (kind, id) {
      if (kind === 'package') {
        for (var c in state.packages) {
          if (state.packages[c] && state.packages[c].id === id) return true;
        }
        return false;
      }
      if (kind === 'posting') return state.posting.indexOf(id) !== -1;
      for (var g in state.addOns) {
        if ((state.addOns[g] || []).some(function (r) { return r.id === id; })) return true;
      }
      return false;
    },

    togglePackage: function (category, pkg) {
      var current = state.packages[category];
      if (current && current.id === pkg.id) delete state.packages[category];
      else state.packages[category] = pkg;
      commit();
    },

    toggleAddOn: function (group, mode, row) {
      var list = state.addOns[group] || [];
      var at = list.findIndex(function (r) { return r.id === row.id; });
      if (at !== -1) list.splice(at, 1);
      else if (mode === 'single') list = [row];
      else list.push(row);
      if (list.length) state.addOns[group] = list;
      else delete state.addOns[group];
      commit();
    },

    togglePosting: function (id) {
      var at = state.posting.indexOf(id);
      if (at !== -1) {
        state.posting.splice(at, 1);
        commit();
        return null;
      }

      var notice = null;
      if (id === 'cross-post') {
        /* The cross-post already covers both platforms. */
        if (state.posting.length) notice = 'Cross-post covers both platforms, so the separate TikTok and Instagram posting selections were removed.';
        state.posting = ['cross-post'];
      } else {
        state.posting = state.posting.filter(function (p) { return p !== 'cross-post'; });
        state.posting.push(id);
        /* Both platforms individually costs more than the cross-post, so
           collapse it rather than let the visitor overpay. */
        if (state.posting.indexOf('tiktok') !== -1 && state.posting.indexOf('instagram') !== -1) {
          state.posting = ['cross-post'];
          notice = 'TikTok and Instagram together are covered by the $700 cross-post, so that replaced the two separate selections.';
        }
      }
      commit();
      return notice;
    },

    clear: function () {
      state = blank();
      store.clear();
      commit();
    },

    count: function () {
      var n = Object.keys(state.packages).length + state.posting.length;
      for (var g in state.addOns) n += state.addOns[g].length;
      return n;
    },

    /**
     * Flatten the selection into display lines plus a total.
     *
     * Percentage terms are quoted against the package subtotal, which is what
     * "% of package" means; with no package chosen there is nothing to take a
     * percentage of, so they stay custom until one is picked.
     */
    summary: function () {
      var groups = [];
      var packageSubtotal = 0;
      var total = 0;
      var custom = [];
      var isFrom = false;

      var pkgLines = [];
      ['onLocation', 'ugc'].forEach(function (cat) {
        var p = state.packages[cat];
        if (!p) return;
        var parsed = parsePrice(p.price);
        if (parsed.kind === 'fixed' || parsed.kind === 'from') {
          packageSubtotal += parsed.amount;
          total += parsed.amount;
          if (parsed.kind === 'from') isFrom = true;
        }
        pkgLines.push({ label: p.title, price: p.price, custom: false });
      });
      if (pkgLines.length) groups.push({ title: 'Core package', items: pkgLines });

      Object.keys(state.addOns).forEach(function (gid) {
        var rows = state.addOns[gid];
        if (!rows.length) return;
        var items = rows.map(function (r) {
          var parsed = parsePrice(r.price);
          /* The group heading already names the group, so the row is just the row. */
          var line = { label: r.label };

          if (parsed.kind === 'fixed') {
            total += parsed.amount;
            line.price = money(parsed.amount);
          } else if (parsed.kind === 'from') {
            total += parsed.amount;
            isFrom = true;
            line.price = 'From ' + money(parsed.amount);
          } else if (parsed.kind === 'percent') {
            if (packageSubtotal > 0) {
              var amt = (packageSubtotal * parsed.percent) / 100;
              total += amt;
              line.price = parsed.percent + '% · ' + money(amt);
            } else {
              line.price = parsed.percent + '% of package';
              line.custom = true;
              custom.push(line.label);
            }
          } else {
            line.price = 'Custom';
            line.custom = true;
            custom.push(line.label);
          }
          return line;
        });
        groups.push({ title: rows[0].groupTitle || 'Add-ons', items: items });
      });

      if (state.posting.length) {
        var items = state.posting.map(function (id) {
          var card = (window.WW_POSTING || []).filter(function (c) { return c.id === id; })[0];
          if (!card) return { label: id, price: 'Custom', custom: true };
          var parsed = parsePrice(card.price);
          if (parsed.kind === 'fixed') total += parsed.amount;
          return { label: card.title, price: card.price, custom: false };
        });
        groups.push({ title: 'Social posting', items: items });
      }

      return {
        groups: groups,
        total: total,
        totalLabel: total > 0 ? (isFrom ? 'From ' + money(total) : money(total)) : null,
        custom: custom,
        count: api.count(),
      };
    },

    /** A plain-text block for the inquiry email — no JSON for a human to decode. */
    asText: function () {
      var s = api.summary();
      if (!s.count) return '';
      var out = [];
      s.groups.forEach(function (g) {
        out.push(g.title.toUpperCase());
        g.items.forEach(function (i) { out.push('  ' + i.label + ' · ' + i.price); });
        out.push('');
      });
      if (s.totalLabel) {
        out.push('ESTIMATED TOTAL');
        out.push('  ' + s.totalLabel + (s.custom.length ? ' + ' + s.custom.join(', ') : ''));
      } else if (s.custom.length) {
        out.push('ESTIMATED TOTAL');
        out.push('  Quoted based on scope');
      }
      out.push('');
      out.push('Estimated only — travel, location, quantities, and licensing scope may change the final quote.');
      return out.join('\n');
    },

    onChange: function (fn) {
      listeners.push(fn);
      fn();
    },
  };

  function commit() {
    store.write(state);
    listeners.forEach(function (fn) {
      try { fn(); } catch (e) {}
    });
  }

  api.parsePrice = parsePrice;
  api.money = money;
  window.WW_PROJECT = api;
})();
