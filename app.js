/* ============================================================
   Ayush Katiyar — portfolio
   Motion + interaction. Degrades to a static page if anything
   here fails, and stays still for prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var animated = root.classList.contains('anim');

  /* ---------------------------------------------------------
     Safety net: if reveal never runs, nothing stays invisible.
     --------------------------------------------------------- */
  function revealEverything() {
    var all = document.querySelectorAll(REVEAL);
    for (var i = 0; i < all.length; i++) all[i].classList.add('in');
    var svgs = document.querySelectorAll('.figure svg');
    for (var j = 0; j < svgs.length; j++) svgs[j].classList.add('drawn');
  }

  var REVEAL = [
    '.sec-head', '.entry', '.peek-card', '.principles li', '.facts',
    '.edu .item', '.crow', '.spec div', '.nextprev a', '.figure',
    '.code', '.pull', '.stat', '.cta-band',
    '.case-body h2', '.case-body .prose', '.about-grid .prose', '.skill-rows'
  ].join(',');

  /* ---------------------------------------------------------
     Scroll progress + nav condense
     --------------------------------------------------------- */
  var nav = document.querySelector('.nav');
  var bar = null;

  if (animated) {
    bar = document.createElement('div');
    bar.className = 'progress';
    document.body.appendChild(bar);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (bar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
      }
      if (nav) nav.classList.toggle('scrolled', y > 40);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     Scroll reveal, staggered among siblings
     --------------------------------------------------------- */
  if (!animated || !('IntersectionObserver' in window)) {
    revealEverything();
  } else {
    var targets = document.querySelectorAll(REVEAL);

    // stagger: elements sharing a parent come in one after another
    var seen = {};
    Array.prototype.forEach.call(targets, function (el) {
      var parent = el.parentNode;
      var key = parent.getAttribute('data-stagger-key');
      if (!key) {
        key = 's' + Math.random().toString(36).slice(2, 8);
        parent.setAttribute('data-stagger-key', key);
      }
      seen[key] = (seen[key] || 0) + 1;
      var index = seen[key] - 1;
      if (index > 0) {
        el.style.transitionDelay = Math.min(index * 80, 320) + 'ms';
      }
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });

    // last resort, in case an observer never fires on some browser
    window.setTimeout(function () {
      var hidden = document.querySelectorAll(REVEAL);
      Array.prototype.forEach.call(hidden, function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) el.classList.add('in');
      });
    }, 2500);
  }

  /* ---------------------------------------------------------
     Diagrams: nodes fade in, edges draw themselves
     --------------------------------------------------------- */
  function prepare(svg) {
    var lines = svg.querySelectorAll('line');
    Array.prototype.forEach.call(lines, function (line) {
      if (line.getAttribute('class') && line.getAttribute('class').indexOf('dashed') > -1) return;
      var dx = line.x2.baseVal.value - line.x1.baseVal.value;
      var dy = line.y2.baseVal.value - line.y1.baseVal.value;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
      line.setAttribute('data-len', len);
    });
  }

  function draw(svg) {
    var nodes = svg.querySelectorAll('g.node');
    var texts = svg.querySelectorAll('text');
    var lines = svg.querySelectorAll('line');
    var arrows = svg.querySelectorAll('polygon');
    var lanes = svg.querySelectorAll('rect.lane-bg');

    Array.prototype.forEach.call(lanes, function (el, i) {
      el.style.transitionDelay = (i * 60) + 'ms';
    });
    Array.prototype.forEach.call(nodes, function (el, i) {
      el.style.transitionDelay = (80 + i * 85) + 'ms';
    });
    Array.prototype.forEach.call(texts, function (el, i) {
      el.style.transitionDelay = (140 + i * 55) + 'ms';
    });
    Array.prototype.forEach.call(lines, function (el, i) {
      el.style.transitionDelay = (260 + i * 70) + 'ms';
      el.style.strokeDashoffset = 0;
    });
    Array.prototype.forEach.call(arrows, function (el, i) {
      el.style.transitionDelay = (520 + i * 70) + 'ms';
    });

    svg.classList.add('drawn');
  }

  var figures = document.querySelectorAll('.figure svg');
  if (animated && 'IntersectionObserver' in window && figures.length) {
    Array.prototype.forEach.call(figures, prepare);
    var fio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        draw(entry.target);
        fio.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    Array.prototype.forEach.call(figures, function (svg) { fio.observe(svg); });
  } else {
    Array.prototype.forEach.call(figures, function (svg) { svg.classList.add('drawn'); });
  }

  /* ---------------------------------------------------------
     Payment state machine: token walks the happy path
     --------------------------------------------------------- */
  (function () {
    var token = document.getElementById('token');
    var run = document.getElementById('run');
    if (!token || !run) return;

    var nodes = ['n0', 'n1', 'n2'].map(function (id) { return document.getElementById(id); });
    var spots = [[72, 70], [280, 70], [488, 70]];
    var timers = [];
    var still = !animated;

    function at(i) {
      token.style.transform = 'translate(' + spots[i][0] + 'px,' + spots[i][1] + 'px)';
      nodes.forEach(function (n, j) { n.classList.toggle('on', j === i); });
    }

    function sequence() {
      timers.forEach(clearTimeout);
      timers = [];
      nodes.forEach(function (n) { n.classList.remove('on'); });
      token.classList.add('live');
      at(0);
      var step = still ? 400 : 1150;
      timers.push(setTimeout(function () { at(1); }, step));
      timers.push(setTimeout(function () { at(2); }, step * 2));
      timers.push(setTimeout(function () { run.textContent = 'Run it again'; }, step * 2 + 900));
    }

    run.addEventListener('click', sequence);

    var fig = token.closest ? token.closest('.figure') : null;
    if (fig && 'IntersectionObserver' in window) {
      var tio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          // let the diagram finish drawing itself first
          setTimeout(sequence, animated ? 1200 : 200);
          tio.unobserve(entry.target);
        });
      }, { threshold: 0.3 });
      tio.observe(fig);
    } else {
      sequence();
    }
  })();

  /* ---------------------------------------------------------
     Email links: fire mailto as normal, but also copy the
     address and say so — so a blocked mailto or a machine with
     no mail client still leaves the visitor with the address.
     --------------------------------------------------------- */
  function toast(message) {
    var el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    // reflow so the class re-triggers on repeat clicks
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('show'); }, 3200);
  }

  function writeClipboard(text, then) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(then, then);
      return;
    }
    var t = document.createElement('textarea');
    t.value = text;
    t.setAttribute('readonly', '');
    t.style.position = 'fixed';
    t.style.top = '-1000px';
    document.body.appendChild(t);
    t.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(t);
    then();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-email]'), function (link) {
    link.addEventListener('click', function () {
      var address = link.getAttribute('data-email');
      writeClipboard(address, function () {
        toast('Address copied: ' + address);
      });
      // the mailto navigation is left alone — no preventDefault
    });
  });

  /* ---------------------------------------------------------
     Theme toggle. The stored choice wins; with nothing stored we
     follow the OS and keep following it until the user picks.
     data-theme is already set by the inline boot script in <head>,
     so this only wires the control up.
     --------------------------------------------------------- */
  (function () {
    var docEl = document.documentElement;
    var btn = document.getElementById('themeToggle');
    var meta = document.querySelector('meta[name="theme-color"]');
    var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    function stored() {
      try {
        var v = localStorage.getItem('theme');
        return v === 'dark' || v === 'light' ? v : null;
      } catch (e) { return null; }
    }

    function paint(theme) {
      docEl.setAttribute('data-theme', theme);
      var dark = theme === 'dark';
      if (meta) meta.setAttribute('content', dark ? '#070D17' : '#FFFFFF');
      if (btn) {
        btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
        btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      }
    }

    paint(docEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    if (btn) {
      btn.addEventListener('click', function () {
        var next = docEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem('theme', next); } catch (e) {}
        paint(next);
      });
    }

    if (mq) {
      var onSystem = function () { if (!stored()) paint(mq.matches ? 'dark' : 'light'); };
      if (mq.addEventListener) mq.addEventListener('change', onSystem);
      else if (mq.addListener) mq.addListener(onSystem);
    }
  })();

  /* ---------------------------------------------------------
     Copy email
     --------------------------------------------------------- */
  (function () {
    var copy = document.getElementById('copyEmail');
    if (!copy) return;
    copy.addEventListener('click', function () {
      var email = 'ayushkatiyar323@gmail.com';
      var done = function () {
        copy.textContent = 'Copied';
        setTimeout(function () { copy.textContent = 'Copy'; }, 1800);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(done, done);
      } else {
        var t = document.createElement('textarea');
        t.value = email;
        document.body.appendChild(t);
        t.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(t);
        done();
      }
    });
  })();

})();
