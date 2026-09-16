(function () {
  // ?static renders everything at once (used for screenshots and by anyone who prefers no motion).
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]static\b/.test(location.search);
  const saveData = navigator.connection && navigator.connection.saveData;

  // ---- Nav: transparent over the hero, solid after ----
  const nav = document.getElementById('nav');
  const hero = document.querySelector('.hero');
  if (nav && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      nav.classList.toggle('solid', e.intersectionRatio < 0.08 || e.boundingClientRect.bottom < 80);
    }, { threshold: [0, 0.08, 0.2] }).observe(hero);
  }

  // ---- Reveal on scroll ----
  const reveals = document.querySelectorAll('.reveal, .pair');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in-view'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  }

  // ---- Sticky phone: swap the screenshot as steps scroll by ----
  const phone = document.getElementById('phone');
  const steps = document.querySelectorAll('.step[data-shot]');
  if (phone && steps.length && 'IntersectionObserver' in window) {
    const shots = phone.querySelectorAll('img[data-shot]');
    const show = (name) => shots.forEach(img => img.classList.toggle('on', img.dataset.shot === name));
    const so = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) show(e.target.dataset.shot); });
    }, { rootMargin: '-18% 0px -62% 0px', threshold: 0 });
    steps.forEach(s => so.observe(s));
  }

  // ---- Hero: rotating belief line ----
  const rot = document.getElementById('rot');
  if (rot && !reduce) {
    const items = rot.querySelectorAll('.rot-item');
    let i = 0;
    setInterval(() => {
      items[i].classList.remove('on');
      i = (i + 1) % items.length;
      items[i].classList.add('on');
    }, 2600);
  }

  // ---- Background video with a seamless loop (two players cross-fading) ----
  function mountVideo(container) {
    if (!container || reduce || saveData) return;
    const small = window.innerWidth < 720;
    const src = small && container.dataset.videoSmall ? container.dataset.videoSmall : container.dataset.video;
    if (!src) return;

    const make = (first) => {
      const v = document.createElement('video');
      v.muted = true; v.playsInline = true; v.loop = false; v.preload = 'auto';
      // Attributes as well as properties: iOS Safari checks the attributes
      // for its autoplay policy, and declarative autoplay on the first
      // player is more reliable there than a scripted play().
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
      v.setAttribute('aria-hidden', 'true');
      if (first) v.setAttribute('autoplay', '');
      v.src = src;
      container.appendChild(v);
      v.load();
      return v;
    };
    const a = make(true), b = make(false);
    let cur = a, nxt = b, armed = false;

    const start = (v) => { try { v.currentTime = 0; } catch (_e) {} const p = v.play(); if (p && p.catch) p.catch(() => {}); };

    const reveal = () => { if (!a.classList.contains('on')) { a.classList.add('on'); start(a); } };
    a.addEventListener('canplay', reveal, { once: true });
    a.addEventListener('playing', reveal, { once: true });
    // Low Power Mode and some in-app browsers refuse autoplay until the
    // person touches the page; retry on the first gesture.
    const nudge = () => { if (cur.paused) { const p = cur.play(); if (p && p.catch) p.catch(() => {}); } };
    ['touchstart', 'scroll', 'click'].forEach(ev => window.addEventListener(ev, nudge, { once: true, passive: true }));

    const tick = () => {
      if (!isFinite(cur.duration)) { requestAnimationFrame(tick); return; }
      const left = cur.duration - cur.currentTime;
      if (left < 1.1 && !armed) {
        armed = true;
        start(nxt);
        nxt.classList.add('on');
        cur.classList.remove('on');
        setTimeout(() => { cur.pause(); const t = cur; cur = nxt; nxt = t; armed = false; }, 1200);
      }
      requestAnimationFrame(tick);
    };
    a.addEventListener('playing', () => requestAnimationFrame(tick), { once: true });

    // Pause when off-screen; resume when back.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { const p = cur.play(); if (p && p.catch) p.catch(() => {}); }
        else { cur.pause(); }
      }, { threshold: 0.05 }).observe(container);
    }
  }
  const heroMedia = document.querySelector('.hero-media');
  const bandMedia = document.querySelector('.band .media');
  mountVideo(heroMedia);
  if (bandMedia && 'IntersectionObserver' in window) {
    // Don't fetch the second clip until the band is near the viewport.
    const bo = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { mountVideo(bandMedia); bo.disconnect(); }
    }, { rootMargin: '600px 0px' });
    bo.observe(bandMedia);
  } else {
    mountVideo(bandMedia);
  }
})();
