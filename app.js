/* ════════════════════════════════════════════════════════════════════════
   CPC FÁCIL · app.js — SOMENTE COMPORTAMENTOS E EFEITOS
   --------------------------------------------------------------------------
   Todo o conteúdo (textos, nomes, descrições, seções, tabelas) está
   ESTÁTICO no index.html, dentro de <main id="content"> — edite lá.
   Este arquivo cuida apenas de: preloader, cursor, scroll, menu mobile,
   navegação suave, animações de entrada, contadores, spotlight, parallax,
   tilt das imagens e highlight de coluna das tabelas.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var content = document.getElementById('content');
  if (!content) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ── Preloader: remoção fail-safe ── */
  window.addEventListener('load', function () {
    var p = document.getElementById('preloader');
    if (p) setTimeout(function () { p.classList.add('hidden'); }, 2650);
  });

  /* ── Custom cursor ── */
  (function () {
    var dot = document.getElementById('cur-dot'), ring = document.getElementById('cur-ring');
    if (!dot || !ring) return;
    if (!window.matchMedia('(hover:hover)').matches || window.innerWidth < 901) return;
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
    var hov = 'a,button,.tc,.fc,.iconbox,.query-card,.pill,.dn,.cgrid-card';
    document.addEventListener('mouseover', function (e) { if (e.target.closest(hov)) ring.classList.add('hover'); });
    document.addEventListener('mouseout', function (e) { if (e.target.closest(hov)) ring.classList.remove('hover'); });
  })();

  /* ── Scroll progress + navbar state + scrollspy ── */
  var navbar = document.getElementById('navbar');
  var scrollBar = document.getElementById('scroll-bar');

  function onScroll() {
    var h = document.documentElement;
    var sc = h.scrollTop || document.body.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    if (scrollBar) scrollBar.style.transform = 'scaleX(' + (max > 0 ? sc / max : 0) + ')';
    if (navbar) navbar.classList.toggle('scrolled', sc > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ── */
  (function () {
    var burger = document.getElementById('burger'), mm = document.getElementById('mobile-menu');
    if (!burger || !mm) return;
    burger.addEventListener('click', function () {
      var open = burger.classList.toggle('open');
      mm.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mm.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        burger.classList.remove('open'); mm.classList.remove('open'); document.body.style.overflow = '';
      });
    });
  })();

  /* ── Smooth scroll (data-link) — usa Lenis se disponível ── */
  function scrollToTarget(sel) {
    var el = document.querySelector(sel);
    if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -68, duration: 1.2 });
    else { var y = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - 68; window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' }); }
  }
  document.addEventListener('click', function (e) {
    var l = e.target.closest('[data-link]');
    if (!l) return;
    var tgt = l.getAttribute('data-target') || l.getAttribute('href');
    if (tgt && tgt.charAt(0) === '#') { e.preventDefault(); scrollToTarget(tgt); }
  });

  /* ── Lenis desativado: o scroll-snap nativo (encaixe de dobras) conflita
        com scroll animado por JS. Navegação usa smooth nativo. ── */
  window.addEventListener('load', function () {
    return;
    // eslint-disable-next-line no-unreachable
    if (reduceMotion || !window.Lenis) return;
    try {
      var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
      window.__lenis = lenis;
      lenis.on('scroll', onScroll);
      function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      document.documentElement.classList.add('lenis');
    } catch (err) { /* fallback nativo */ }
  });

  /* ── Hero: título letra a letra (palavras intactas, só embrulhadas) ── */
  (function () {
    if (reduceMotion) return;
    var idx = 0;
    function split(node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split('').forEach(function (chr) {
          if (chr === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
          var s = document.createElement('i');
          s.className = 'ch';
          s.textContent = chr;
          s.style.setProperty('--i', idx++);
          frag.appendChild(s);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && !node.classList.contains('hcaret')) {
        [].slice.call(node.childNodes).forEach(split);
      }
    }
    document.querySelectorAll('.hero-h1 .hl').forEach(function (line) {
      [].slice.call(line.childNodes).forEach(split);
    });
  })();

  /* ── Tilt 3D nas imagens das seções (desktop) ── */
  (function () {
    if (reduceMotion || !window.matchMedia('(hover:hover)').matches) return;
    document.querySelectorAll('.sf-imgbox').forEach(function (box) {
      box.addEventListener('mousemove', function (e) {
        var r = box.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        box.style.transform = 'perspective(1100px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      });
      box.addEventListener('mouseleave', function () { box.style.transform = ''; });
    });
  })();

  /* ── Spotlight dourado seguindo o mouse dentro dos cards ── */
  (function () {
    if (!window.matchMedia('(hover:hover)').matches) return;
    var sel = '.fc,.iconbox,.query-card,.cgrid-card,.tc,.hs-cell,.sf-pills .pill';
    var cur = null;
    document.addEventListener('mousemove', function (e) {
      var card = e.target.closest(sel);
      if (cur && cur !== card) { cur.style.backgroundImage = ''; cur = null; }
      if (!card) return;
      var r = card.getBoundingClientRect();
      var light = card.closest('[data-theme="light"]');
      card.style.backgroundImage = 'radial-gradient(300px circle at ' +
        (e.clientX - r.left) + 'px ' + (e.clientY - r.top) + 'px,' +
        (light ? 'rgba(62,107,0,.09)' : 'rgba(245,150,11,.11)') + ',transparent 62%)';
      cur = card;
    }, { passive: true });
  })();

  /* ── Parallax de profundidade no scroll (fundos e numeração) ── */
  (function () {
    if (reduceMotion) return;
    var items = [];
    document.querySelectorAll('.cf-bg').forEach(function (b) { items.push([b, 30]); });
    document.querySelectorAll('.sec-num').forEach(function (n) { items.push([n, -22]); });
    function upd() {
      items.forEach(function (p) {
        var parent = p[0].parentNode;
        if (!parent || !parent.getBoundingClientRect) return;
        var r = parent.getBoundingClientRect();
        if (r.bottom < -100 || r.top > innerHeight + 100) return;
        var prog = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        p[0].style.transform = 'translateY(' + (prog * p[1]).toFixed(1) + 'px)';
      });
    }
    var tick = false;
    window.addEventListener('scroll', function () {
      if (!tick) { tick = true; requestAnimationFrame(function () { upd(); tick = false; }); }
    }, { passive: true });
    upd();
  })();

  /* ── Tabelas: highlight da coluna sob o mouse ── */
  (function () {
    document.querySelectorAll('.dt').forEach(function (t) {
      function clearCol() {
        t.querySelectorAll('.col-hi').forEach(function (c) { c.classList.remove('col-hi'); });
      }
      t.addEventListener('mouseover', function (e) {
        var cell = e.target.closest('td,th');
        if (!cell || cell.parentNode.classList.contains('row-group')) return;
        var i = cell.cellIndex;
        if (t.__ci === i) return;
        clearCol(); t.__ci = i;
        if (i > 0) t.querySelectorAll('tr').forEach(function (r) {
          if (r.classList.contains('row-group')) return;
          var c = r.cells[i]; if (c) c.classList.add('col-hi');
        });
      });
      t.addEventListener('mouseleave', function () { clearCol(); t.__ci = -1; });
    });
  })();

  /* ── Hero: parallax de mouse + botões magnéticos ── */
  (function () {
    if (reduceMotion || !window.matchMedia('(hover:hover)').matches) return;
    var hero = document.querySelector('.hero');
    var helm = document.querySelector('.hero-orn');
    var badges = document.querySelector('.hero-sub');
    if (hero && helm) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var dx = (e.clientX - r.width / 2) / r.width, dy = (e.clientY - r.height / 2) / r.height;
        helm.style.transform = 'translate(' + (dx * 16) + 'px,' + (dy * 12) + 'px)';
        if (badges) badges.style.transform = 'translate(' + (dx * -8) + 'px,' + (dy * -6) + 'px)';
      }, { passive: true });
      hero.addEventListener('mouseleave', function () {
        helm.style.transform = '';
        if (badges) badges.style.transform = '';
      });
    }
    document.querySelectorAll('.hero .btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' +
          ((e.clientY - r.top - r.height / 2) * 0.3) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  })();

  /* ── Hero typewriter ── */
  (function () {
    var t = document.getElementById('tw-target');
    if (!t) return;
    var text = 'INTELIGÊNCIA DE DADOS';
    if (reduceMotion) { t.textContent = text; return; }
    var i = 0;
    (function tp() {
      if (i <= text.length) { t.textContent = text.slice(0, i); i++; setTimeout(tp, 78); }
    })();
  })();

  /* ── Counters ── */
  (function () {
    function run(el) {
      var target = parseFloat(el.getAttribute('data-target'));
      if (isNaN(target)) return; // ignora data-target de navegação (ex.: "#s-sumario")
      var suf = el.getAttribute('data-suffix') || '';
      var pre = el.getAttribute('data-prefix') || '';
      // milhar com ponto (pt-BR) só para números grandes; anos ficam sem separador
      function fmt(n) { return pre + (target >= 10000 ? n.toLocaleString('pt-BR') : String(n)) + suf; }
      if (reduceMotion) { el.textContent = fmt(target); return; }
      var cur = 0, inc = target / 58;
      var id = setInterval(function () {
        cur += inc;
        if (cur >= target) { cur = target; clearInterval(id); }
        el.textContent = fmt(Math.floor(cur));
      }, 16);
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-target]:not([data-link])').forEach(function (el) {
      if (!isNaN(parseFloat(el.getAttribute('data-target')))) obs.observe(el);
    });
  })();

  /* ── Reveal on enter (.aoe) ── */
  (function () {
    var els = document.querySelectorAll('.aoe');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); }); return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { obs.observe(el); });
    /* failsafe: nada visível pode permanecer escondido (cobre falhas do observer) */
    setInterval(function () {
      document.querySelectorAll('.aoe:not(.in)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < innerHeight - 30 && r.bottom > 0) el.classList.add('in');
      });
    }, 1200);
  })();

  /* ── Particle network (#pcanvas) ── */
  (function () {
    var c = document.getElementById('pcanvas');
    if (!c) return;
    var ctx = c.getContext('2d');
    var W, H, pts, ratio = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      var r = c.getBoundingClientRect();
      W = r.width; H = r.height;
      c.width = W * ratio; c.height = H * ratio; ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      var n = W < 768 ? 32 : 64;
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.32, vy: (Math.random() - 0.5) * 0.32, r: Math.random() * 1.5 + 0.6 });
    }
    size();
    window.addEventListener('resize', size, { passive: true });
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = 'rgba(245,150,11,.38)'; ctx.fill();
      }
      for (var a = 0; a < pts.length; a++) for (var b = a + 1; b < pts.length; b++) {
        var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 118) {
          ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y);
          ctx.strokeStyle = 'rgba(109,190,0,' + (1 - d / 118) * 0.16 + ')'; ctx.lineWidth = 0.7; ctx.stroke();
        }
      }
      if (!reduceMotion) requestAnimationFrame(frame);
    }
    frame();
  })();

  /* ── Cards de consulta (#s-busca): abre/fecha a descrição ── */
  (function () {
    var cards = document.querySelectorAll('#s-busca .query-card');
    if (!cards.length) return;
    Array.prototype.forEach.call(cards, function (card) {
      function toggle() {
        var open = card.classList.toggle('open');
        card.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      card.addEventListener('click', toggle);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); toggle(); }
      });
    });
  })();

})();
