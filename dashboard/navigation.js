/* HAIEC dashboard navigation, history and contextual return controls.
 * Presentation-only routing. Does not touch assessment data or factory logic.
 * Loaded last, after all page renderers and report routes have registered.
 */
(function () {
  'use strict';

  if (typeof STATE === 'undefined' || typeof render !== 'function') return;
  var KEY = '__haiecNavigationV1';
  var pageNames = {
    exec:'Executive Command Center', overview:'Operations Overview',
    estate:'AI Estate', system:'System Detail', workflows:'Workflows & Authority',
    lab:'Decision Lab', controls:'Controls Studio', monitor:'Monitoring',
    reports:'Reports & Evidence', evaluations:'HAIEC Evaluations',
    station217:'Station 217 Replay', replay:'Evidence Replay',
    tryit:'Try It Yourself', governance:'Deployment Governance',
    provenance:'HF Provenance', setup:'Connections & Setup',
    factory:'Digital Factory', journey:'Operator Journey',
    industry:'Industry Experiences', autobaseline:'Behavior Changes',
    evolution:'Evidence Conditions', idealreport:'Example Evidence Report',
    blueprint:'Engineering Plan'
  };
  var reportNames = {
    hub:'Reports Hub', exec:'Executive Report', s217:'Station 217 Report',
    judge:'Judge Showcase', gov:'Governance Report', demo:'Demo Record',
    'case':'Case Assurance Report'
  };
  var maxIndex = 0;

  function currentReport() {
    return window.RPT || null;
  }
  function snapshot() {
    var report = currentReport();
    var page = STATE.page || 'exec';
    return {
      page:page,
      system:STATE.selectedSystem || null,
      tab:STATE.systemTab || null,
      workflow:STATE.selectedWorkflow || null,
      reportView:page === 'reports' && report ? report.view || 'hub' : null,
      reportCase:page === 'reports' && report ? report.caseId || null : null,
      reportMode:page === 'reports' && report ? report.s217mode || 'exec' : null,
      scroll:Math.max(0, window.scrollY || 0)
    };
  }
  function identity(s) {
    return JSON.stringify([
      s.page,
      s.page === 'system' ? s.system : null,
      s.page === 'system' ? s.tab : null,
      s.page === 'workflows' ? s.workflow : null,
      s.reportView,s.reportCase,s.reportMode
    ]);
  }
  function label(s) {
    if (s.page === 'reports') {
      if (s.reportView === 'case') return s.reportCase || 'Case Assurance Report';
      if (s.reportView === 's217' && s.reportMode === 'tech') return 'Station 217 Technical Report';
      return reportNames[s.reportView] || 'Reports & Evidence';
    }
    if (s.page === 'system' && s.system) return s.system + ' System Detail';
    return pageNames[s.page] || 'Dashboard';
  }
  function reportQuery(s) {
    if (s.reportView === 'case' && s.reportCase) return 'case:' + s.reportCase;
    if (s.reportView === 's217' && s.reportMode === 'tech') return 's217-tech';
    return s.reportView || 'hub';
  }
  function urlFor(s) {
    var u = new URL(window.location.href);
    ['view','system','tab','report','workflow'].forEach(function (k) { u.searchParams.delete(k); });
    u.hash = '';
    if (s.page === 'reports') {
      u.searchParams.set('report',reportQuery(s));
    } else {
      u.searchParams.set('view',s.page);
      if (s.page === 'system' && s.system) {
        u.searchParams.set('system',s.system);
        if (s.tab) u.searchParams.set('tab',s.tab);
      }
      if (s.page === 'workflows' && s.workflow) u.searchParams.set('workflow',s.workflow);
    }
    return u.pathname + u.search + u.hash;
  }
  function stored(s, index, backLabel) {
    var obj = {};
    obj[KEY] = true;
    obj.index = index;
    obj.backLabel = backLabel || '';
    obj.snapshot = s;
    return obj;
  }
  function activeState() {
    var item = window.history.state;
    return item && item[KEY] ? item : null;
  }
  function restore(s) {
    if (!s || !s.page || !Object.prototype.hasOwnProperty.call(pageNames,s.page)) return false;
    if (!PAGE_RENDERERS[s.page]) return false;
    STATE.page = s.page;
    if (s.system && typeof s.system === 'string') STATE.selectedSystem = s.system;
    if (s.tab && typeof s.tab === 'string') STATE.systemTab = s.tab;
    if (s.workflow && typeof s.workflow === 'string') STATE.selectedWorkflow = s.workflow;
    var report = currentReport();
    if (s.page === 'reports' && report) {
      report.view = s.reportView || 'hub';
      report.caseId = s.reportCase || null;
      report.s217mode = s.reportMode || 'exec';
      report.notice = null;
    }
    render();
    var y = Math.max(0,Number(s.scroll) || 0);
    window.requestAnimationFrame(function () { window.scrollTo(0,y); });
    return true;
  }
  function fromUrl() {
    var params = new URLSearchParams(window.location.search);
    var p = params.get('report');
    if (p) {
      var report = currentReport();
      if (!report) return null;
      var result = snapshot();
      result.page = 'reports';
      result.reportView = p.indexOf('case:') === 0 ? 'case'
        : p === 's217-tech' ? 's217' : p;
      if (result.reportView !== 'case' &&
          !Object.prototype.hasOwnProperty.call(reportNames,result.reportView)) return null;
      result.reportCase = result.reportView === 'case' ? p.substring(5) : null;
      result.reportMode = p === 's217-tech' ? 'tech' : 'exec';
      return result;
    }
    var view = params.get('view');
    if (!view || !Object.prototype.hasOwnProperty.call(pageNames,view) || !PAGE_RENDERERS[view]) return null;
    var result2 = snapshot();
    result2.page = view;
    result2.reportView = null;
    result2.reportCase = null;
    result2.reportMode = null;
    if (view === 'system') {
      result2.system = params.get('system') || result2.system;
      result2.tab = params.get('tab') || 'overview';
    }
    if (view === 'workflows') result2.workflow = params.get('workflow') || result2.workflow;
    result2.scroll = 0;
    return result2;
  }
  function goFallback() {
    var prev = snapshot(), next;
    if (prev.page === 'reports') {
      var rpt = currentReport();
      if (rpt) { rpt.view = 'hub'; rpt.caseId = null; rpt.notice = null; }
      STATE.page = 'reports';
    } else {
      STATE.page = 'exec';
    }
    next = snapshot();
    if (identity(prev) === identity(next)) {
      STATE.page = 'exec';
      next = snapshot();
    }
    var cur = activeState();
    var idx = cur ? cur.index : 0;
    window.history.replaceState(stored(prev,idx,cur && cur.backLabel),'',window.location.href);
    window.history.pushState(stored(next,idx + 1,label(prev)),'',urlFor(next));
    maxIndex = Math.max(maxIndex,idx + 1);
    render();
    window.scrollTo(0,0);
  }
  function returnBack() {
    var state = activeState();
    if (state && state.index > 0) window.history.back();
    else goFallback();
  }
  function navbar() {
    var main = document.getElementById('main');
    if (!main) return;
    var old = main.querySelector('.haiec-navigation');
    if (old) old.remove();
    var s = snapshot();
    if (s.page === 'exec') return;

    var item = activeState(), canBack = !!(item && item.index > 0);
    var backName = canBack ? item.backLabel || 'Previous view'
      : s.page === 'reports' && s.reportView !== 'hub' ? 'Reports Hub' : 'Executive Command Center';
    var bar = document.createElement('nav');
    bar.className = 'haiec-navigation';
    bar.setAttribute('aria-label','Dashboard navigation');
    var back = document.createElement('button');
    back.type = 'button';
    back.className = 'haiec-navigation-back';
    back.setAttribute('data-haiec-nav','back');
    back.textContent = '\u2190 Back to ' + backName;
    var crumbs = document.createElement('span');
    crumbs.className = 'haiec-navigation-crumbs';
    crumbs.textContent = 'Dashboard / ' + label(s);
    var link = document.createElement('a');
    link.className = 'haiec-navigation-newtab';
    link.href = urlFor(s);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = 'Open this view in a new tab';
    link.setAttribute('aria-label','Open this view in a new tab');
    link.textContent = 'Open in new tab \u2197';
    bar.appendChild(back);
    bar.appendChild(crumbs);
    bar.appendChild(link);
    var coach = main.querySelector('.guided-coach');
    if (coach) coach.insertAdjacentElement('afterend',bar);
    else main.prepend(bar);
  }

  // The established render chain includes the older product guide and all
  // dynamically registered report and industry views. Wrap only its output.
  var previousRender = render;
  render = function () {
    previousRender();
    navbar();
  };

  var init = fromUrl();
  if (init) restore(init);
  var initial = snapshot();
  var entry = activeState();
  if (!entry) {
    window.history.replaceState(stored(initial,0,''),'',window.location.href);
  } else {
    maxIndex = entry.index || 0;
  }
  navbar();

  // Capture the old route, allow the existing modules to handle the action,
  // then register the resulting route. Report module pushState is reused rather
  // than creating a second entry for the same report navigation.
  document.addEventListener('click',function (event) {
    var target = event.target.closest('[data-nav],[data-act],[data-rp],[data-v7],[data-ind-open]');
    if (!target || target.closest('.haiec-navigation')) return;
    var before = snapshot();
    var oldHref = window.location.href;
    var existing = activeState();
    var index = existing ? existing.index : 0;
    window.history.replaceState(stored(before,index,existing && existing.backLabel),'',oldHref);
    window.setTimeout(function () {
      var after = snapshot();
      if (identity(before) === identity(after)) return;
      var dest = urlFor(after);
      var next = stored(after,index + 1,label(before));
      if (window.location.href !== oldHref) window.history.replaceState(next,'',dest);
      else window.history.pushState(next,'',dest);
      maxIndex = Math.max(maxIndex,index + 1);
      navbar();
    },0);
  },true);

  document.addEventListener('click',function (event) {
    var button = event.target.closest('[data-haiec-nav="back"]');
    if (!button) return;
    event.preventDefault();
    returnBack();
  });

  window.addEventListener('popstate',function (event) {
    var next = event.state && event.state[KEY] ? event.state.snapshot : fromUrl();
    if (event.state && event.state[KEY]) maxIndex = Math.max(maxIndex,event.state.index);
    if (next) restore(next);
    else navbar();
  });

  var style = document.createElement('style');
  style.textContent =
    '.haiec-navigation{display:flex;align-items:center;gap:13px;flex-wrap:wrap;' +
    'padding:10px 13px;margin:0 0 16px;border:1px solid var(--line,#dce7e2);' +
    'background:var(--card,#fff);border-radius:10px;box-shadow:0 2px 10px rgba(15,42,35,.05)}' +
    '.haiec-navigation-back{border:1px solid #b8cec6;background:#edf8f3;color:#225d4b;' +
    'border-radius:7px;padding:7px 11px;cursor:pointer;font-weight:700;font-size:12px}' +
    '.haiec-navigation-back:hover{background:#d9eee5}' +
    '.haiec-navigation-crumbs{color:var(--muted,#63746e);font-size:12px;flex:1;min-width:100px}' +
    '.haiec-navigation-newtab{font-size:12px;font-weight:700;color:#176a5a;' +
    'text-decoration:none;white-space:nowrap}' +
    '.haiec-navigation-newtab:hover{text-decoration:underline}' +
    '@media(max-width:670px){.haiec-navigation{gap:8px}' +
    '.haiec-navigation-crumbs{order:3;flex-basis:100%}}';
  document.head.appendChild(style);

  window.HAIEC_NAV = { snapshot:snapshot, urlFor:urlFor, returnBack:returnBack };
})();