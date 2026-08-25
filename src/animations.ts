/**
 * animations.ts
 * GSAP + ScrollTrigger animations for SignVerify AI.
 * Initial hidden states are set in JS (not CSS) to avoid layout-based scroll jumps.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────
   Set initial states in JS (not CSS)
   so there's no invisible content that
   confuses the browser scroll restoration.
──────────────────────────────────────────── */
export function setInitialStates(): void {
  // Hero elements — hidden before timeline runs
  // NOTE: .topnav is NOT hidden — navs must always be visible on load
  gsap.set('.sticker',              { scale: 0, opacity: 0 });
  gsap.set('.hero__card--headline', { y: 80, opacity: 0 });
  gsap.set('.hero__desc',           { y: 50, opacity: 0 });
  gsap.set('.hero__cta .btn',       { y: 30, opacity: 0 });
  gsap.set('.verify-card',          { x: 100, opacity: 0 });
  gsap.set('.sig-card--ref',        { opacity: 0 });
  gsap.set('.sig-card--upload',     { opacity: 0 });
  gsap.set('.result-badge',         { scale: 0, opacity: 0 });

  // Scroll-reveal elements — hidden before they enter viewport
  gsap.utils.toArray<HTMLElement>('[data-gsap="fade-up"]').forEach((el) => {
    gsap.set(el, { y: 60, opacity: 0 });
  });
  gsap.utils.toArray<HTMLElement>('[data-gsap="fade-left"]').forEach((el) => {
    gsap.set(el, { x: 60, opacity: 0 });
  });
  gsap.utils.toArray<HTMLElement>('[data-gsap="scale-up"]').forEach((el) => {
    gsap.set(el, { scale: 0.85, opacity: 0 });
  });
}

/* ─────────────────────────────────────────
   Hero entrance (plays once on load)
──────────────────────────────────────────── */
export function initHeroAnimations(): void {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.0 } });

  // Nav is always visible — skip it from entrance animation
  tl.to('.sticker', { scale: 1, opacity: 1, stagger: 0.1 })
    .to('.hero__card--headline', { y: 0, opacity: 1, duration: 1.0 }, '-=0.5')
    .to('.hero__desc', { y: 0, opacity: 1, rotate: 0 }, '-=0.6')
    .to('.hero__cta .btn', { y: 0, opacity: 1, stagger: 0.12 }, '-=0.5')
    .to('.verify-card', { x: 0, opacity: 1, duration: 1.1, ease: 'expo.out' }, '-=1.1')
    .to('.sig-card--ref',    { opacity: 1, duration: 0.7 }, '-=0.7')
    .to('.sig-card--upload', { opacity: 1, duration: 0.7 }, '-=0.4')
    .to('.result-badge', { scale: 1, opacity: 1, ease: 'back.out(1.7)', duration: 0.5 }, '-=0.2');
}

/* ─────────────────────────────────────────
   ScrollTrigger section reveals
──────────────────────────────────────────── */
export function initScrollAnimations(): void {
  gsap.utils.toArray<HTMLElement>('[data-gsap="fade-up"]').forEach((el) => {
    const delay = parseFloat(el.dataset.gsapDelay ?? '0');
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      delay,
      ease: 'expo.out',
      clearProps: 'transform,y',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-gsap="fade-left"]').forEach((el) => {
    const delay = parseFloat(el.dataset.gsapDelay ?? '0');
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 1.0,
      delay,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-gsap="scale-up"]').forEach((el) => {
    const delay = parseFloat(el.dataset.gsapDelay ?? '0');
    gsap.to(el, {
      opacity: 1,
      scale: 1,
      duration: 0.75,
      delay,
      ease: 'back.out(1.5)',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  });
}

/* ─────────────────────────────────────────
   Parallax on background decorations
──────────────────────────────────────────── */
export function initParallax(): void {
  const pairs: [string, gsap.TweenVars][] = [
    ['.bg-circle-yellow', { y: -120 }],
    ['.bg-square-pink',   { y: -80, rotate: 60 }],
    ['.bg-star',          { y: -60, rotate: 40 }],
    ['.bg-squiggle-top',  { y: 60 }],
  ];

  pairs.forEach(([selector, vars]) => {
    gsap.to(selector, {
      ...vars,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  });
}

/* ─────────────────────────────────────────
   Number counters (stats section)
──────────────────────────────────────────── */

export function initCounters(): void {
  gsap.utils.toArray<HTMLElement>('.num-card__val[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count ?? '0');
    const hasPercent = el.textContent?.includes('%') ?? false;
    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 2.0,
          ease: 'power2.out',
          onUpdate() {
            const formatted = target % 1 !== 0 ? obj.val.toFixed(1) : Math.round(obj.val).toString();
            el.textContent = formatted + (hasPercent ? '%' : '');
          },
        });
      },
    });
  });
}



/* ─────────────────────────────────────────
   Magnetic hover on buttons
──────────────────────────────────────────── */
export function initMagneticButtons(): void {
  document.querySelectorAll<HTMLElement>('.btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const dx = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
      const dy = ((e.clientY - rect.top)  / rect.height - 0.5) * 10;
      gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ─────────────────────────────────────────
   Sticker hover wiggle
──────────────────────────────────────────── */
export function initStickerWiggle(): void {
  document.querySelectorAll<HTMLElement>('.sticker').forEach((s) => {
    s.addEventListener('mouseenter', () => {
      gsap.to(s, { scale: 1.1, duration: 0.2, ease: 'power2.out' });
    });
    s.addEventListener('mouseleave', () => {
      gsap.to(s, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

/* ─────────────────────────────────────────
   Nav active-link highlight on scroll
──────────────────────────────────────────── */
export function initNavHighlight(): void {
  const sections = document.querySelectorAll<HTMLElement>('section[id]');
  const links    = document.querySelectorAll<HTMLAnchorElement>('.topnav__link');

  sections.forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter:      () => setActive(sec.id),
      onEnterBack:  () => setActive(sec.id),
    });
  });

  function setActive(id: string): void {
    links.forEach((link) => {
      const href = link.getAttribute('href')?.slice(1);
      link.classList.toggle('topnav__link--active', href === id);
    });
  }
}
