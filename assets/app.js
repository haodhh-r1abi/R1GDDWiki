/* R1 GDD Wiki — menu trai + khung xem wiki con.
 *
 * Noi dung tung game KHONG duoc sao chep vao day: moi game duoc nhung truc tiep bang <iframe>
 * tu GitHub Pages cua no, nen wiki con cap nhat la o day thay ngay.
 *
 * Duong dan tren thanh dia chi:
 *    #/<id>                     -> trang chu cua wiki do
 *    #/<id>/features/Ads.html   -> mo thang mot trang ben trong
 * Nho vay link chia se duoc va bam F5 van dung cho cu.
 */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var LS_SIDE = 'r1gdd.sidebar';
  var LS_LAST = 'r1gdd.last';

  var CFG = null;
  var BY_ID = {};
  var current = null;          // game dang mo
  var syncingHash = false;     // chan vong lap khi tu minh doi hash
  var loadTimer = null;

  /* ---------------- tien ich ---------------- */

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function baseOf(g) { return g.url.replace(/\/+$/, '') + '/'; }

  /* ---------------- dieu huong ---------------- */

  function parseHash() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    if (!h) return { id: null, path: '' };
    var i = h.indexOf('/');
    if (i < 0) return { id: decodeURIComponent(h), path: '' };
    return { id: decodeURIComponent(h.slice(0, i)), path: h.slice(i + 1) };
  }

  function setHash(id, path) {
    if (!id) {
      // Gan location.hash = '#' KHONG xoa duoc phan hash dang co; phai dung replaceState.
      // replaceState cung khong ban hashchange nen noi goi phai tu ve lai giao dien.
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      return;
    }
    var want = '#/' + id + (path ? '/' + path : '');
    if (location.hash === want) return;
    syncingHash = true;
    location.hash = want;
    setTimeout(function () { syncingHash = false; }, 0);
  }

  function route() {
    if (syncingHash) return;
    var r = parseHash();
    if (!r.id || !BY_ID[r.id]) {
      // id sai hoac khong co -> ve trang tong quan, va don luon dia chi cho khoi gay hieu nham
      if (r.id) setHash(null);
      showHome();
      return;
    }
    // chan duong dan tuyet doi lot vao (vi du #/blockout/https://vi-du) — chi cho phep
    // duong dan tuong doi ben trong chinh wiki do
    var p = r.path || '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(p) || p.indexOf('//') === 0) p = '';
    showGame(BY_ID[r.id], p);
  }

  /* ---------------- trang tong quan ---------------- */

  function showHome() {
    current = null;
    $('#home').hidden = false;
    $('#viewer').hidden = true;
    $('#frame').removeAttribute('src');
    $('#acts').hidden = true;
    document.title = CFG ? CFG.title : 'R1 GDD Wiki';
    markNav(null);
  }

  function markNav(id) {
    Array.prototype.forEach.call(document.querySelectorAll('.nav-item'), function (n) {
      n.classList.toggle('cur', n.getAttribute('data-id') === id);
    });
  }

  /* ---------------- khung xem ---------------- */

  function showGame(g, path) {
    current = g;
    $('#home').hidden = true;
    $('#viewer').hidden = false;
    markNav(g.id);
    try { localStorage.setItem(LS_LAST, g.id); } catch (e) {}

    document.title = g.name + ' – ' + (CFG ? CFG.title : 'R1 GDD Wiki');

    var src = baseOf(g) + (path || '');
    var a = $('#openNew');
    a.href = src;
    a.setAttribute('title', 'Mở ' + g.name + ' trong tab mới');
    $('#reload').setAttribute('title', 'Tải lại ' + g.name);
    $('#acts').hidden = false;

    state('load', g);
    var f = $('#frame');
    if (f.getAttribute('src') !== src) f.setAttribute('src', src);
    else stateHide();

    // Neu 12 giay khong tai xong thi coi nhu hong (mat mang, site doi ten...)
    clearTimeout(loadTimer);
    loadTimer = setTimeout(function () { state('slow', g); }, 12000);
  }

  function stateHide() { $('#vstate').hidden = true; $('#vstate').innerHTML = ''; }

  function state(kind, g) {
    var box = $('#vstate');
    box.innerHTML = '';
    box.hidden = false;
    if (kind === 'load') {
      box.appendChild(el('div', { class: 'spin' }));
      box.appendChild(el('p', { text: 'Đang mở ' + g.name + '…' }));
      return;
    }
    box.appendChild(el('h3', { text: 'Chưa mở được ' + g.name }));
    box.appendChild(el('p', {
      text: 'Trang con nằm ở GitHub Pages nên cần mạng. Nếu vẫn không lên, mở thẳng bằng nút bên dưới.'
    }));
    var row = el('p');
    row.appendChild(el('a', { class: 'btn', href: baseOf(g), target: '_blank', rel: 'noopener', text: 'Mở trong tab mới ↗' }));
    box.appendChild(row);
    box.appendChild(el('p', { class: 'muted', text: baseOf(g) }));
  }

  function onFrameLoad() {
    clearTimeout(loadTimer);
    stateHide();
    if (!current) return;
    // Khi trang tong hop va wiki con cung mot ten mien thi doc duoc duong dan ben trong,
    // nho vay dieu huong sau trong iframe van phan anh len thanh dia chi. Khac ten mien
    // (vi du mo bang file://) thi truy cap nay nem loi — bo qua, chi mat tinh nang deep link.
    try {
      var u = $('#frame').contentWindow.location.href;
      var b = baseOf(current);
      if (u.indexOf(b) === 0) {
        var p = u.slice(b.length);
        if (p === 'index.html') p = '';
        setHash(current.id, p);
        var a = $('#openNew'); a.href = u;
      }
    } catch (e) { /* khac ten mien — khong sao */ }
  }

  /* ---------------- so lieu lay truc tiep tu wiki con ---------------- */

  function fetchStats(g, onDone) {
    // Cac wiki con tra Access-Control-Allow-Origin: * nen doc duoc bang fetch.
    // Lay khoi .stats o trang chu cua chung -> so lieu luon dung ban moi nhat.
    fetch(baseOf(g), { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var box = doc.querySelector('.stats');
        var out = [];
        if (box) Array.prototype.forEach.call(box.querySelectorAll('span'), function (s) {
          var b = s.querySelector('b');
          if (b) out.push({ n: b.textContent.trim(), t: s.textContent.replace(b.textContent, '').trim() });
        });
        onDone(out, null);
      })
      .catch(function (err) { onDone(null, err); });
  }

  function renderStats(node, rows, err) {
    node.innerHTML = '';
    if (err || !rows || !rows.length) {
      node.className = 'c-stats err';
      node.textContent = 'chưa lấy được số liệu — bấm để mở wiki';
      return;
    }
    node.className = 'c-stats';
    rows.forEach(function (r) {
      var s = el('span');
      s.appendChild(el('b', { text: r.n }));
      s.appendChild(document.createTextNode(' ' + r.t));
      node.appendChild(s);
    });
  }

  /* ---------------- dung giao dien ---------------- */

  function build(cfg) {
    CFG = cfg;
    var nav = $('#nav'), cards = $('#cards');
    nav.innerHTML = ''; cards.innerHTML = '';
    var totals = {};

    cfg.games.forEach(function (g) {
      BY_ID[g.id] = g;

      // menu trai — co title de khi thu gon con rail chi con icon van biet la game nao
      var item = el('a', {
        class: 'nav-item', href: '#/' + g.id, 'data-id': g.id,
        title: g.name + (g.studio && g.studio !== '—' ? ' · ' + g.studio : '')
      }, [
        el('img', { src: g.icon, alt: '' }),
        el('span', { class: 'n' }, [
          el('b', { text: g.name }),
          el('small', { text: g.genre + (g.studio && g.studio !== '—' ? ' · ' + g.studio : '') })
        ])
      ]);
      nav.appendChild(item);

      // the o trang tong quan
      var stats = el('div', { class: 'c-stats' , text: 'đang lấy số liệu…'});
      var card = el('a', { class: 'card', href: '#/' + g.id }, [
        el('img', { src: g.icon, alt: '' }),
        el('div', {}, [
          el('div', { class: 'c-t', text: g.name }),
          el('div', { class: 'c-s', text: g.genre + (g.studio && g.studio !== '—' ? ' · ' + g.studio : '') }),
          el('div', { class: 'c-n', text: g.note || '' }),
          stats
        ])
      ]);
      cards.appendChild(card);

      fetchStats(g, function (rows, err) {
        renderStats(stats, rows, err);
        if (rows) rows.forEach(function (r) {
          var v = parseInt(r.n.replace(/[.,]/g, ''), 10);
          if (!isNaN(v)) totals[r.t] = (totals[r.t] || 0) + v;
        });
        drawHeroStats(totals, cfg.games.length);
      });
    });

    window.addEventListener('hashchange', route);
    route();
  }

  function drawHeroStats(totals, nGames) {
    var box = $('#heroStats');
    box.innerHTML = '';
    box.appendChild(statSpan(String(nGames), 'bộ tài liệu'));
    ['trang tính năng', 'use case', 'dòng cấu hình', 'sự kiện', 'level'].forEach(function (k) {
      if (totals[k]) box.appendChild(statSpan(totals[k].toLocaleString('vi-VN'), k));
    });
  }

  function statSpan(n, t) {
    var s = el('span');
    s.appendChild(el('b', { text: n }));
    s.appendChild(document.createTextNode(' ' + t));
    return s;
  }

  /* ---------------- thu gon menu ---------------- */

  function setCollapsed(v) {
    document.body.classList.toggle('collapsed', !!v);
    try { localStorage.setItem(LS_SIDE, v ? '1' : '0'); } catch (e) {}
    $('#toggle').setAttribute('title', (v ? 'Mở menu' : 'Thu gọn menu') + ' (Ctrl+B)');
  }

  /* ---------------- khoi dong ---------------- */

  document.addEventListener('DOMContentLoaded', function () {
    // Lan dau vao (chua co lua chon cu) thi man hinh hep mac dinh thu gon cho do che noi dung.
    // Luu y: khong duoc viet `getItem(...) || '0'` vi nhu vay khong con phan biet duoc
    // "chua tung chon" (null) voi "da chon mo" ('0') — nhanh mac dinh se khong bao gio chay.
    var saved = null;
    try { saved = localStorage.getItem(LS_SIDE); } catch (e) {}
    setCollapsed(saved === null ? window.innerWidth < 820 : saved === '1');

    $('#toggle').addEventListener('click', function () {
      setCollapsed(!document.body.classList.contains('collapsed'));
    });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setCollapsed(!document.body.classList.contains('collapsed'));
      }
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-home]'), function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); setHash(null); showHome(); });
    });
    $('#reload').addEventListener('click', function () {
      var f = $('#frame'), s = f.getAttribute('src');
      if (!s || !current) return;
      state('load', current);
      f.setAttribute('src', '');
      setTimeout(function () { f.setAttribute('src', s); }, 30);
    });
    $('#frame').addEventListener('load', onFrameLoad);
    // man hinh hep: bam vao mot game thi tu thu menu lai
    $('#nav').addEventListener('click', function () {
      if (window.innerWidth < 820) setCollapsed(true);
    });

    fetch('assets/games.json', { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(build)
      .catch(function (err) {
        $('#cards').innerHTML = '<p class="muted">Không đọc được <code>assets/games.json</code> (' +
          String(err) + '). Nếu đang mở bằng file:// thì chạy một web server nhỏ, ví dụ ' +
          '<code>python -m http.server</code> trong thư mục này.</p>';
      });
  });
})();
