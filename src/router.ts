/**
 * router.ts
 * Lightweight client-side router for SureSign SPA.
 */

import { renderHome } from './pages/home';
import { renderVerify } from './pages/verify';
import { renderBatch } from './pages/batch';
import { renderDashboard } from './pages/dashboard';

type RouteHandler = (container: HTMLElement) => { title: string; render: () => void };

const routes: Record<string, RouteHandler> = {
  '/': (container) => ({
    title: 'SureSign — Is That Signature Real?',
    render: () => renderHome(container),
  }),
  '/verify': (container) => ({
    title: 'Upload & Compare — SureSign',
    render: () => renderVerify(container),
  }),
  '/batch': (container) => ({
    title: 'Batch Document Extraction — SureSign',
    render: () => renderBatch(container),
  }),
  '/dashboard': (container) => ({
    title: 'Model Insights & Telemetry Dashboard — SureSign',
    render: () => renderDashboard(container),
  }),
};

let appContainer: HTMLElement | null = null;

export function initRouter(container: HTMLElement): void {
  appContainer = container;

  // Intercept clicks on links with data-route or internal links
  document.addEventListener('click', (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('a');
    if (!target) return;

    const href = target.getAttribute('href');
    const route = target.getAttribute('data-route');

    if (route) {
      e.preventDefault();
      navigateTo(route);
      return;
    }

    if (
      href &&
      (href.startsWith('/verify') ||
        href.startsWith('/upload.html') ||
        href.startsWith('/batch') ||
        href.startsWith('/dashboard') ||
        href === '/')
    ) {
      e.preventDefault();
      navigateTo(href);
    }
  });

  // Handle browser back / forward
  window.addEventListener('popstate', () => {
    handleRoute();
  });

  window.addEventListener('hashchange', () => {
    handleRoute();
  });

  // Initial route
  handleRoute();
}

export function navigateTo(path: string): void {
  if (path.startsWith('/#')) {
    // Navigate home and then scroll to hash anchor
    window.history.pushState({}, '', '/');
    handleRoute();
    const hash = path.slice(2);
    setTimeout(() => {
      const el = document.getElementById(hash);
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return;
  }

  window.history.pushState({}, '', path);
  handleRoute();
}

function handleRoute(): void {
  if (!appContainer) return;

  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  let matchedHandler = routes['/'];

  if (pathname === '/verify' || pathname === '/upload.html' || hash === '#/verify' || hash === '#verify') {
    matchedHandler = routes['/verify'];
  } else if (pathname === '/batch' || pathname === '/batch.html' || hash === '#/batch' || hash === '#batch') {
    matchedHandler = routes['/batch'];
  } else if (pathname === '/dashboard' || pathname === '/stats' || hash === '#/dashboard' || hash === '#dashboard' || hash === '#stats') {
    matchedHandler = routes['/dashboard'];
  }

  const { title, render } = matchedHandler(appContainer);
  document.title = title;
  render();
}
