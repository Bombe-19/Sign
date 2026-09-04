/**
 * main.ts
 * Entry point — Lenis smooth scroll + GSAP animations.
 *
 * Key fix: Lenis is wired to GSAP's ticker ONLY via lenis.raf().
 * ScrollTrigger.update() is NOT called in the RAF loop — instead
 * we use ScrollTrigger's built-in scroller proxy so it reads
 * Lenis's virtual scroll position directly, with no double-update.
 */

import './style.css';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  setInitialStates,
  initHeroAnimations,
  initScrollAnimations,
  initParallax,
  initCounters,
  initDocumentReveal,
  initFinalCtaReveal,
  initMagneticButtons,
  initStickerWiggle,
  initNavHighlight,
} from './animations';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────
   1. Force scroll to top before anything
      (prevents browser restore from fighting
      with Lenis initial position)
──────────────────────────────────────────── */
window.history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ─────────────────────────────────────────
   2. Set JS-driven initial hidden states
      BEFORE Lenis + ScrollTrigger init,
      so layout is already correct on first
      ScrollTrigger.refresh()
──────────────────────────────────────────── */
setInitialStates();

/* ─────────────────────────────────────────
   3. Lenis smooth scroll
──────────────────────────────────────────── */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 2,
});

/* ─────────────────────────────────────────
   4. Connect Lenis to GSAP ticker ONLY.
      Do NOT also call ScrollTrigger.update()
      here — ScrollTrigger's scroller proxy
      already handles that via onScroll.
──────────────────────────────────────────── */
gsap.ticker.add((time: number) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

/* ─────────────────────────────────────────
   5. ScrollTrigger scroller proxy — lets
      ScrollTrigger read Lenis's virtual
      scroll position instead of window's
──────────────────────────────────────────── */
ScrollTrigger.scrollerProxy(document.body, {
  scrollTop(value?: number) {
    if (typeof value === 'number') {
      lenis.scrollTo(value, { immediate: true });
    }
    return lenis.scroll;
  },
  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  },
  pinType: 'transform',
});

// Keep ScrollTrigger in sync when Lenis scrolls
lenis.on('scroll', ScrollTrigger.update);

// Refresh ScrollTrigger once all images/fonts are loaded
ScrollTrigger.addEventListener('refresh', () => lenis.resize());
ScrollTrigger.refresh();

/* ─────────────────────────────────────────
   6. Anchor link delegation → Lenis
──────────────────────────────────────────── */
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const id = anchor.getAttribute('href')!.slice(1);
    const target = document.getElementById(id);
    if (target) {
      lenis.scrollTo(target, { offset: -80, duration: 1.6 });
    }
  });
});

/* ─────────────────────────────────────────
   7. Run all animations
──────────────────────────────────────────── */
initHeroAnimations();
initScrollAnimations();
initParallax();
initCounters();
initDocumentReveal();
initFinalCtaReveal();
initMagneticButtons();
initStickerWiggle();
initNavHighlight();

/* ─────────────────────────────────────────
   8. Button ripple (GSAP-powered)
──────────────────────────────────────────── */
function createRipple(btn: HTMLElement, e: MouseEvent): void {
  const old = btn.querySelector<HTMLElement>('.ripple');
  if (old) old.remove();

  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;

  Object.assign(ripple.style, {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.35)',
    width: `${size}px`,
    height: `${size}px`,
    left: `${e.clientX - rect.left - size / 2}px`,
    top:  `${e.clientY - rect.top  - size / 2}px`,
    transform: 'scale(0)',
    pointerEvents: 'none',
  });
  btn.style.overflow = 'hidden';
  btn.style.position = 'relative';
  btn.appendChild(ripple);

  gsap.to(ripple, {
    scale: 1, opacity: 0, duration: 0.55, ease: 'power2.out',
    onComplete: () => ripple.remove(),
  });
}

document.querySelectorAll<HTMLElement>('.btn').forEach((btn) => {
  btn.addEventListener('click', (e) => createRipple(btn, e as MouseEvent));
});

/* ─────────────────────────────────────────
   9. 3D tilt on verify card
──────────────────────────────────────────── */
const verifyCard = document.querySelector<HTMLElement>('.verify-card');
if (verifyCard) {
  verifyCard.addEventListener('mousemove', (e: MouseEvent) => {
    const r  = verifyCard.getBoundingClientRect();
    const rx = ((e.clientY - r.top  - r.height / 2) / r.height) * -10;
    const ry = ((e.clientX - r.left - r.width  / 2) / r.width)  *  10;
    gsap.to(verifyCard, { rotateX: rx, rotateY: ry, transformPerspective: 800, duration: 0.4, ease: 'power2.out' });
  });
  verifyCard.addEventListener('mouseleave', () => {
    gsap.to(verifyCard, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
  });
}

/* ─────────────────────────────────────────
   10. Cleanup
──────────────────────────────────────────── */
window.addEventListener('beforeunload', () => {
  lenis.destroy();
});
