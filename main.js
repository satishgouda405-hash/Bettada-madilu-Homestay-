(function () {
  var PHONE_WA = '916363249754';
  document.documentElement.classList.add('js');

  // mobile menu
  var btn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  // gentle rise on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // enquiry form: opens WhatsApp with the message filled in
  var form = document.getElementById('enquiryForm');
  if (form) {
    var cin = document.getElementById('checkin');
    var cout = document.getElementById('checkout');
    var today = new Date();
    var iso = function (d) {
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return d.getFullYear() + '-' + m + '-' + day;
    };
    cin.min = iso(today);
    cout.min = iso(today);
    cin.addEventListener('change', function () {
      cout.min = cin.value || iso(today);
      if (cout.value && cout.value < cin.value) cout.value = cin.value;
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var v = function (id) { return document.getElementById(id).value.trim(); };
      var lines = ['Hello Bettada Madilu Homestay, I would like to make an enquiry.'];
      lines.push('Name: ' + v('name'));
      lines.push('Phone: ' + v('phone'));
      if (v('checkin')) lines.push('Check-in: ' + v('checkin'));
      if (v('checkout')) lines.push('Check-out: ' + v('checkout'));
      lines.push('Guests: ' + v('guests'));
      if (v('message')) lines.push('Message: ' + v('message'));
      var url = 'https://wa.me/' + PHONE_WA + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
    });
  }

  // gallery lightbox
  var dlg = document.getElementById('lightbox');
  if (dlg && typeof dlg.showModal === 'function') {
    var img = dlg.querySelector('img');
    var cap = dlg.querySelector('.cap');
    document.querySelectorAll('.g-item').forEach(function (b) {
      b.addEventListener('click', function () {
        var src = b.getAttribute('data-src');
        img.src = src;
        img.alt = b.getAttribute('data-alt');
        cap.textContent = b.getAttribute('data-alt');
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('close')) dlg.close(); });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ===== v2: cinematic intro + motion ===== */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');

  // scroll progress bar + solid header
  var bar = document.createElement('div');
  bar.className = 'progress';
  document.body.appendChild(bar);
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
      if (header) header.classList.toggle('solid', scrollY > 40 || document.getElementById('nav').classList.contains('open'));
      document.querySelectorAll('[data-par]').forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        el.style.transform = 'translateY(' + ((r.top + r.height / 2 - innerHeight / 2) * -0.06).toFixed(1) + 'px) scale(1.12)';
      });
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  var mb = document.getElementById('menuBtn');
  if (mb) mb.addEventListener('click', function () { setTimeout(onScroll, 0); });

  // parallax on photos, stagger on grids
  if (!reduce) document.querySelectorAll('.photo img, .room .pic img').forEach(function (i) { i.setAttribute('data-par', ''); });
  document.querySelectorAll('.grid.amen, .strip, .facts .grid, .themes').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, n) { c.classList.add('reveal'); c.style.setProperty('--d', n * 90 + 'ms'); });
  });
  document.querySelectorAll('.reveal').forEach(function (el) {
    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); } }); }, { threshold: 0.1 });
      io2.observe(el);
    } else el.classList.add('in');
  });

  // card spotlight follows the cursor
  document.querySelectorAll('.card').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // count-up numbers
  document.querySelectorAll('.fact b').forEach(function (b) {
    var m = b.textContent.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!m || reduce) return;
    var end = parseFloat(m[1]), dec = (m[1].split('.')[1] || '').length, rest = m[2];
    b.textContent = (0).toFixed(dec) + rest;
    var go = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      go.disconnect();
      var t0 = performance.now();
      (function tick(t) {
        var p = Math.min((t - t0) / 1400, 1), v = end * (1 - Math.pow(1 - p, 3));
        b.textContent = v.toFixed(dec) + rest;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.6 });
    go.observe(b);
  });

  // smooth page-to-page fade
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var u = new URL(a.href, location.href);
    if (u.origin !== location.origin || u.pathname === location.pathname || /^(tel|mailto)/.test(a.protocol)) return;
    e.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(function () { location.href = a.href; }, 320);
  });
  addEventListener('pageshow', function (e) { if (e.persisted) document.body.classList.remove('leaving'); });

  // ---- hero video intro (home page only) ----
  var hero = document.querySelector('.hero');
  var vid = document.getElementById('heroVideo');
  if (!hero || !vid) { root.classList.remove('intro'); onScroll(); return; }

  // headline words rise one by one
  var h1 = hero.querySelector('h1'), k = 0;
  (function split(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (t) {
          if (!t) return;
          if (/^\s+$/.test(t)) { f.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'), s = document.createElement('span');
          w.className = 'w'; s.textContent = t; s.style.setProperty('--k', k++); w.appendChild(s); f.appendChild(w);
        });
        node.replaceChild(f, n);
      } else if (n.nodeType === 1) split(n);
    });
  })(h1);
  Array.prototype.forEach.call(hero.querySelector('.container').children, function (c, n) { c.style.setProperty('--i', n); });

  var started = false, introMs = 3400;
  function endIntro() { root.classList.remove('intro'); onScroll(); }
  function begin(hasVideo) {
    if (started) return; started = true;
    if (hasVideo) hero.classList.add('has-video');
    setTimeout(endIntro, reduce ? 0 : introMs);
  }

  if (reduce) { // no motion: show a still frame, interface immediately
    vid.removeAttribute('autoplay'); root.classList.remove('intro'); onScroll(); return;
  }

  // plays once on every visit, then holds on the final frame
  vid.addEventListener('ended', function () { hero.classList.add('ended'); vid.pause(); });
  vid.addEventListener('error', function () { begin(false); }, true);
  var src = vid.querySelector('source');
  if (src) src.addEventListener('error', function () { begin(false); });
  var p = vid.play();
  if (p && p.then) p.then(function () { begin(true); }).catch(function () { begin(false); });
  else begin(true);
  setTimeout(function () { begin(!vid.paused); }, 2500); // safety net on slow connections

  // sound toggle
  var snd = document.getElementById('sndBtn');
  if (snd) snd.addEventListener('click', function () {
    vid.muted = !vid.muted;
    snd.setAttribute('aria-pressed', vid.muted ? 'false' : 'true');
    snd.setAttribute('aria-label', vid.muted ? 'Turn video sound on' : 'Turn video sound off');
  });
  onScroll();
})();
