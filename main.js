(function () {
  var PHONE_WA = '916363249754', root = document.documentElement;
  root.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header'), nav = document.getElementById('nav'), btn = document.getElementById('menuBtn');

  // menu
  if (btn && nav) btn.addEventListener('click', function () {
    var o = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', o ? 'true' : 'false');
    btn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    if (header) header.classList.toggle('solid', o || scrollY > 40);
  });

  // photos unveil as they enter (checked on scroll; clip-path hides them from IntersectionObserver)
  var rv = [].slice.call(document.querySelectorAll('.reveal'));
  function checkReveal() { rv = rv.filter(function (el) { if (el.getBoundingClientRect().top < innerHeight * .88) { el.classList.add('in'); return false; } return true; }); }

  // progress bar, solid header, gentle parallax
  var bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar);
  var par = reduce ? [] : [].slice.call(document.querySelectorAll('.photo img'));
  var trail = null, tick = false;
  function frame() {
    tick = false;
    var h = root.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    if (header) header.classList.toggle('solid', scrollY > 50 || (nav && nav.classList.contains('open')));
    par.forEach(function (im) {
      var r = im.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      im.style.transform = 'translateY(' + ((r.top + r.height / 2 - innerHeight / 2) * -.05).toFixed(1) + 'px) scale(1.1)';
    });
    checkReveal();
    if (trail) trail.update();
  }
  function onScroll() { if (!tick) { tick = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { if (trail) trail.build(); onScroll(); });

  // page fade between pages
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || /^(tel|mailto)/.test(a.protocol)) return;
    var u = new URL(a.href, location.href);
    if (u.origin !== location.origin || u.pathname === location.pathname) return;
    e.preventDefault(); document.body.classList.add('leaving');
    setTimeout(function () { location.href = a.href; }, 280);
  });
  addEventListener('pageshow', function (e) { if (e.persisted) document.body.classList.remove('leaving'); });

  // drag-to-scroll photo rail
  var rail = document.getElementById('rail');
  if (rail) {
    var down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
    addEventListener('pointermove', function (e) { if (!down) return; var d = e.clientX - sx; if (Math.abs(d) > 4) { moved = true; rail.classList.add('drag'); } rail.scrollLeft = sl - d; });
    addEventListener('pointerup', function () { down = false; rail.classList.remove('drag'); });
    rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  }

  // enquiry form -> WhatsApp
  var form = document.getElementById('enquiryForm');
  if (form) {
    var cin = document.getElementById('checkin'), cout = document.getElementById('checkout'), t = new Date();
    var iso = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    cin.min = cout.min = iso(t);
    cin.addEventListener('change', function () { cout.min = cin.value || iso(t); if (cout.value && cout.value < cin.value) cout.value = cin.value; });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); if (!form.reportValidity()) return;
      var v = function (id) { return document.getElementById(id).value.trim(); };
      var l = ['Hello Bettada Madilu Homestay, I would like to make an enquiry.', 'Name: ' + v('name'), 'Phone: ' + v('phone')];
      if (v('checkin')) l.push('Check-in: ' + v('checkin')); if (v('checkout')) l.push('Check-out: ' + v('checkout'));
      l.push('Guests: ' + v('guests')); if (v('message')) l.push('Message: ' + v('message'));
      window.open('https://wa.me/' + PHONE_WA + '?text=' + encodeURIComponent(l.join('\n')), '_blank', 'noopener');
    });
  }

  // lightbox
  var dlg = document.getElementById('lightbox');
  if (dlg && dlg.showModal) {
    var im = dlg.querySelector('img'), cap = dlg.querySelector('.cap');
    document.querySelectorAll('.g-item').forEach(function (b) {
      b.addEventListener('click', function () { im.src = b.getAttribute('data-src'); im.alt = cap.textContent = b.getAttribute('data-alt'); dlg.showModal(); });
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('close')) dlg.close(); });
  }
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

  // ===== home: trail line =====
  var main = document.getElementById('main'), wps = [].slice.call(document.querySelectorAll('[data-wp]'));
  if (document.body.classList.contains('home') && wps.length) {
    var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'trail'); svg.setAttribute('aria-hidden', 'true');
    main.insertBefore(svg, main.firstChild);
    trail = {
      len: 0,
      build: function () {
        if (innerWidth < 1100) return;
        svg.innerHTML = ''; var mr = main.getBoundingClientRect(), top = mr.top + scrollY, x0 = Math.max(34, Math.min(innerWidth * .05, 72));
        var pts = [{ x: x0, y: wps[0].getBoundingClientRect().top + scrollY - top + 70 }];
        wps.forEach(function (w, i) { pts.push({ x: x0 + (i % 2 ? 22 : -8), y: w.getBoundingClientRect().top + scrollY - top + 110, t: w.getAttribute('data-wp') }); });
        var endEl = document.querySelector('.rail-sec'); pts.push({ x: x0, y: endEl.getBoundingClientRect().top + scrollY - top - 30 });
        var d = 'M' + pts[0].x + ' ' + pts[0].y;
        for (var i = 1; i < pts.length; i++) { var a = pts[i - 1], b = pts[i], m = (a.y + b.y) / 2; d += ' C' + a.x + ' ' + m + ' ' + b.x + ' ' + m + ' ' + b.x + ' ' + b.y; }
        svg.setAttribute('viewBox', '0 0 ' + innerWidth + ' ' + main.offsetHeight);
        var p1 = document.createElementNS(NS, 'path'), p2 = document.createElementNS(NS, 'path');
        p1.setAttribute('d', d); p1.setAttribute('class', 'bgp'); p2.setAttribute('d', d); p2.setAttribute('class', 'fg'); svg.appendChild(p1); svg.appendChild(p2);
        this.len = p2.getTotalLength(); p2.style.strokeDasharray = this.len; p2.style.strokeDashoffset = this.len; this.fg = p2; this.pts = pts; this.dots = [];
        pts.slice(1, -1).forEach(function (p) {
          var c = document.createElementNS(NS, 'circle'); c.setAttribute('class', 'dot'); c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 9);
          var tx = document.createElementNS(NS, 'text'); tx.setAttribute('x', p.x + 20); tx.setAttribute('y', p.y + 5); tx.textContent = p.t; svg.appendChild(c); svg.appendChild(tx); trail.dots.push({ c: c, y: p.y });
        });
        this.you = document.createElementNS(NS, 'circle'); this.you.setAttribute('class', 'you'); this.you.setAttribute('r', 8); svg.appendChild(this.you);
      },
      update: function () {
        if (!this.fg) return;
        var mr = main.getBoundingClientRect(), y = -mr.top + innerHeight * .55, s = this.pts[0].y, e = this.pts[this.pts.length - 1].y;
        var p = Math.max(0, Math.min(1, (y - s) / (e - s))), L = this.len * p;
        this.fg.style.strokeDashoffset = this.len - L;
        var pt = this.fg.getPointAtLength(L); this.you.setAttribute('cx', pt.x); this.you.setAttribute('cy', pt.y); this.you.style.opacity = p > 0 && p < 1 ? 1 : 0;
        this.dots.forEach(function (d) { d.c.classList.toggle('on', y > d.y); });
      }
    };
    addEventListener('load', function () { trail.build(); onScroll(); });
    setTimeout(function () { trail.build(); onScroll(); }, 600);
  }

  // ===== home: the opening film =====
  var hero = document.getElementById('hero'), vid = document.getElementById('heroVideo');
  if (!hero || !vid) { root.classList.remove('intro-on'); onScroll(); return; }

  // headline words rise from a mask
  var k = 0;
  hero.querySelectorAll('h1 span').forEach(function (sp) {
    var w = document.createElement('span'), i = document.createElement('i'); w.className = 'w'; i.textContent = sp.textContent; i.style.setProperty('--k', k++); w.appendChild(i); sp.textContent = ''; sp.appendChild(w);
  });

  var chapters = [].slice.call(document.querySelectorAll('#chapters li')), starts = [0, 3, 9, 12.5], began = false;
  function endIntro() { root.classList.remove('intro-on'); onScroll(); }
  function begin(ok) {
    if (began) return; began = true;
    if (ok) hero.classList.add('has-video'); else hero.classList.add('no-video');
    setTimeout(endIntro, reduce ? 0 : 3600);
  }
  function holdEnd() { hero.classList.add('ended'); vid.pause(); chapters.forEach(function (li, i) { li.firstChild.firstChild.style.setProperty('--p', 1); li.classList.toggle('on', i === 3); }); }

  if (reduce) { hero.classList.add('no-video'); root.classList.remove('intro-on'); onScroll(); return; }

  // sync chapter bars + framing on phones to the playing video
  var ops = [50, 50, 74, 38];
  vid.addEventListener('timeupdate', function () {
    var t = vid.currentTime, d = vid.duration || 24, cur = 0;
    starts.forEach(function (s, i) { if (t >= s) cur = i; });
    chapters.forEach(function (li, i) {
      var end = starts[i + 1] || d, p = Math.max(0, Math.min(1, (t - starts[i]) / (end - starts[i])));
      li.firstChild.firstChild.style.setProperty('--p', p.toFixed(3)); li.classList.toggle('on', i === cur);
    });
    vid.style.setProperty('--op', ops[cur] + '%');
  });
  vid.addEventListener('ended', holdEnd);
  chapters.forEach(function (li, i) {
    li.firstChild.addEventListener('click', function () {
      hero.classList.remove('ended'); vid.currentTime = starts[i]; var p = vid.play(); if (p && p.catch) p.catch(function () {});
    });
  });
  var src = vid.querySelectorAll('source'); if (src.length) src[src.length - 1].addEventListener('error', function () { begin(false); });
  var p = vid.play();
  if (p && p.then) p.then(function () { begin(true); }).catch(function () { begin(false); }); else begin(true);
  setTimeout(function () { begin(!vid.paused); }, 2600);

  var snd = document.getElementById('sndBtn');
  if (snd) snd.addEventListener('click', function () {
    vid.muted = !vid.muted; snd.setAttribute('aria-pressed', vid.muted ? 'false' : 'true');
    snd.setAttribute('aria-label', vid.muted ? 'Turn video sound on' : 'Turn video sound off');
    if (!vid.muted && vid.paused && !hero.classList.contains('ended')) vid.play();
  });
  onScroll();
})();
