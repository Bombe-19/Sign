/**
 * main.ts
 * Application entry point for SignVerify AI.
 */

import './style.css';
import { initRouter } from './router';

const app = document.getElementById('app');
if (app) {
  initRouter(app);
} else {
  console.error('Root #app container not found.');
}
