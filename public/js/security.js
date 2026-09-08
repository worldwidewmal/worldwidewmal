/* ===== WW_SECURITY — client-side hardening helper =====
   NOTE: client-side protections ONLY. Real rate limiting, bot mitigation,
   secrets management, server-side validation, and tamper-evident audit
   logging REQUIRE a backend/hosting/CI layer and are NOT implemented here. */
(function(){
  var INMEM = {};
  var CB_PREFIX = 'ww_cb_';
  var LOCK_PREFIX = 'ww_lock_';
  function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
  function lsDel(k){ try{ localStorage.removeItem(k); }catch(e){} }
  function clean(value, max){
    if (value === null || value === undefined) return '';
    var s = String(value);
    s = s.replace(/[\x00-\x1F\x7F]/g, '');
    s = s.replace(/[<>`]/g, '');
    s = s.replace(/\s+/g, ' ').trim();
    if (typeof max === 'number' && max > 0) s = s.slice(0, max);
    return s;
  }
  function cleanEmail(value){ return clean(value, 254).toLowerCase().replace(/\s+/g,'').slice(0,254); }
  function validEmail(value){
    var s = String(value || '');
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 254;
  }
  function safeForm(form, caps){
    caps = caps || {};
    var out = {};
    var fd = new FormData(form);
    fd.forEach(function(val, key){
      if (key === 'access_key' || key === 'subject') return;
      var cap = (typeof caps[key] === 'number') ? caps[key] : 200;
      out[key] = /email/i.test(key) ? cleanEmail(val) : clean(val, cap);
    });
    return out;
  }
  function submissionId(prefix){
    prefix = prefix || 'ww';
    var rnd;
    try{
      if (window.crypto && window.crypto.getRandomValues){
        var a = new Uint8Array(8); window.crypto.getRandomValues(a);
        rnd = Array.prototype.map.call(a, function(b){ return ('0'+b.toString(16)).slice(-2); }).join('');
      }
    }catch(e){}
    if (!rnd) rnd = Math.random().toString(16).slice(2,18);
    return prefix + '_' + Date.now().toString(36) + '_' + rnd;
  }
  function acquire(key, windowMs){
    windowMs = windowMs || 60000;
    if (INMEM[key]) return false;
    var last = +(lsGet(LOCK_PREFIX + key) || 0);
    if (last && (Date.now() - last) < windowMs) return false;
    INMEM[key] = true;
    lsSet(LOCK_PREFIX + key, String(Date.now()));
    return true;
  }
  function release(key){ INMEM[key] = false; }
  function cbState(host){ try{ return JSON.parse(lsGet(CB_PREFIX + host) || '{}') || {}; }catch(e){ return {}; } }
  function cbBlocked(host){ var st = cbState(host); return !!(st.until && Date.now() < st.until); }
  function cbFail(host){
    var st = cbState(host);
    st.fails = (st.fails || 0) + 1;
    if (st.fails >= 3) st.until = Date.now() + 300000;
    lsSet(CB_PREFIX + host, JSON.stringify(st));
  }
  function cbReset(host){ lsDel(CB_PREFIX + host); }
  function hostOf(url){ try{ return new URL(url, location.href).host; }catch(e){ return url; } }
  function delay(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  var RETRY_STATUS = {408:1,425:1,429:1,500:1,501:1,502:1,503:1,504:1,520:1,521:1,522:1,523:1,524:1};
  function postJSON(url, payload, options){
    options = options || {};
    var host = hostOf(url);
    if (cbBlocked(host)) return Promise.reject(new Error('circuit_open'));
    var body = {};
    for (var k in payload){ if (Object.prototype.hasOwnProperty.call(payload, k)) body[k] = payload[k]; }
    if (!body.submission_id) body.submission_id = submissionId(options.idPrefix || 'ww');
    body.page_url = location.href;
    body.submitted_at = new Date().toISOString();
    function attempt(triesLeft){
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        cache: 'no-store',
        credentials: 'omit',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: JSON.stringify(body)
      }).then(function(res){
        if (res.ok){ cbReset(host); return res.json().catch(function(){ return {}; }); }
        if (RETRY_STATUS[res.status] && triesLeft > 0){ return delay(800).then(function(){ return attempt(triesLeft - 1); }); }
        cbFail(host); throw new Error('http_' + res.status);
      }, function(netErr){
        if (triesLeft > 0){ return delay(800).then(function(){ return attempt(triesLeft - 1); }); }
        cbFail(host); throw netErr;
      });
    }
    return attempt(1);
  }
  window.WW_SECURITY = {
    clean: clean, cleanEmail: cleanEmail, validEmail: validEmail,
    safeForm: safeForm, submissionId: submissionId,
    acquire: acquire, release: release, postJSON: postJSON
  };
})();
