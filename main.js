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
