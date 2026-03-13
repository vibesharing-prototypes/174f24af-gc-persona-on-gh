/*!
 * proto-panel.js — Reusable prototype controls bar
 * ─────────────────────────────────────────────────
 * Drop into any Claude-coded project. Zero dependencies.
 *
 * QUICK START (auto-init via data attribute):
 *   <script src="proto-panel.js"
 *           data-description="My project description"></script>
 *
 * QUICK START (JS API — call after DOMContentLoaded):
 *   ProtoPanel.init({
 *     description: 'My project description.',
 *   });
 *
 * FULL CONFIG:
 *   ProtoPanel.init({
 *     description:     'What this prototype does.',   // shown in the expanded panel
 *     themeToggle:     true,                          // show Dark / Light toggle
 *     stateToggle:     true,                          // show Near-term / Future goal toggle
 *     stateLabels:     ['NEAR-TERM', 'FUTURE GOAL'],  // labels for the two states
 *     steps:           ['1. Cold Start', '2. Readiness', ...],  // optional: step labels (replaces STATE)
 *     applyThemeClass: true,   // auto-toggle .light on <html>
 *     applyStateClass: true,   // auto-toggle .future-state on <body>
 *     onThemeChange:   (theme) => {},  // 'dark' | 'light'
 *     onStateChange:   (state) => {},  // 'near'  | 'future'
 *     onStepChange:    (step) => {},  // step index 1..n when steps are used
 *   });
 *
 *   ProtoPanel.setStep(2);  // set active step from host page (e.g. to sync with in-page nav)
 *
 * EVENTS (fired on document regardless of callbacks):
 *   document.addEventListener('proto:theme', e => console.log(e.detail.theme));
 *   document.addEventListener('proto:state', e => console.log(e.detail.state));
 *   document.addEventListener('proto:step', e => console.log(e.detail.step));  // 1-based step index
 *
 * HOST-PAGE CLASS HOOKS (for CSS in the host page):
 *   body.pp-open        — proto panel is expanded
 *   html.light          — light theme active   (when applyThemeClass: true)
 *   body.future-state   — future state active  (when applyStateClass: true)
 */

(function (global) {
  'use strict';

  const DEFAULTS = {
    description:     'A Claude-coded prototype.',
    themeToggle:     true,
    stateToggle:     true,
    stateLabels:     ['NEAR-TERM', 'FUTURE GOAL'],
    steps:           null,
    applyThemeClass: true,
    applyStateClass: true,
    onThemeChange:   null,
    onStateChange:   null,
    onStepChange:    null,
  };

  const CSS = /* css */`
    .pp-bar {
      background: linear-gradient(180deg, #111113 0%, #1a1a1d 55%, #1c1c1f 100%);
      border-bottom: 1px solid #2e2e32;
      flex-shrink: 0;
      z-index: 200;
      overflow: hidden;
      position: relative;
      transition: max-height 0.32s cubic-bezier(0.4, 0, 0.2, 1);
      max-height: 34px;
      box-shadow:
        inset 0 1px 0 rgba(0,0,0,0.8),
        inset 0 3px 12px rgba(0,0,0,0.5),
        0 3px 10px rgba(0,0,0,0.35);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      font-size: 12px;
      box-sizing: border-box;
    }
    .pp-bar::before {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(255,255,255,0.07) 15%,
        rgba(255,255,255,0.07) 85%,
        transparent 100%);
      pointer-events: none;
      z-index: 1;
    }
    .pp-bar.pp-open { max-height: 130px; }
    .pp-bar.pp-open.pp-has-steps { max-height: 88px; }
    .pp-collapsed {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 34px;
      padding: 0 14px 0 16px;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s;
    }
    .pp-collapsed:hover { background: rgba(255,255,255,0.02); }
    .pp-collapsed:hover .pp-label { color: #c0c0c3; }
    .pp-label {
      font-family: 'Courier New', Courier, 'Lucida Console', monospace;
      font-size: 12px;
      letter-spacing: 0.06em;
      color: #909093;
      transition: color 0.15s;
      white-space: nowrap;
    }
    .pp-chevron {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #8a8a8d;
      display: flex;
      align-items: center;
      transition: color 0.15s, transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
    }
    .pp-chevron:hover { color: #c0c0c3; }
    .pp-bar.pp-open .pp-chevron { transform: rotate(180deg); }
    .pp-expanded {
      display: flex;
      align-items: center;
      gap: 0;
      padding: 0 16px 11px;
      opacity: 0;
      transform: perspective(480px) rotateX(-6deg) translateY(-6px);
      transform-origin: top center;
      transition:
        opacity 0.25s 0.04s,
        transform 0.28s 0.04s cubic-bezier(0.2, 0.8, 0.4, 1);
      pointer-events: none;
    }
    .pp-bar.pp-open .pp-expanded {
      opacity: 1;
      transform: perspective(480px) rotateX(0deg) translateY(0);
      pointer-events: auto;
    }
    .pp-divider {
      width: 1px;
      height: 20px;
      background: #424246;
      margin: 0 16px;
      flex-shrink: 0;
    }
    .pp-group { display: flex; align-items: center; gap: 8px; }
    .pp-group-label {
      font-size: 12px;
      color: #8a8a8d;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }
    .pp-pill {
      display: flex;
      background: #111113;
      border: 1px solid #424246;
      border-radius: 20px;
      padding: 2px;
      gap: 2px;
    }
    .pp-btn {
      font-family: inherit;
      font-size: 12px;
      border: none;
      background: none;
      color: #8a8a8d;
      padding: 3px 10px;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.15s;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }
    .pp-btn:hover:not(.pp-active):not(.pp-state-active) { color: #c0c0c3; }
    .pp-theme-pill .pp-btn.pp-active {
      background: #2e2e32;
      color: #ccccce;
    }
    .pp-state-pill .pp-btn.pp-active {
      background: #2a2040;
      color: #9d84e8;
      border: 1px solid rgba(157, 132, 232, 0.25);
    }
    .pp-description {
      font-size: 12px;
      color: #8a8a8d;
      line-height: 1.5;
      letter-spacing: 0.03em;
      flex: 1;
      min-width: 0;
      margin: 0;
    }
    .pp-steps-group {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .pp-step-btn {
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid #424246;
      background: #1a1a1d;
      color: #8a8a8d;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .pp-step-btn:hover { color: #c0c0c3; border-color: #525256; }
    .pp-step-btn.pp-active {
      background: #2e2e32;
      color: #e8e8ea;
      border-color: #2e2e32;
    }
  `;

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function buildHTML(cfg) {
    const themeBlock = cfg.themeToggle ? `
      <div class="pp-group">
        <span class="pp-group-label">THEME</span>
        <div class="pp-pill pp-theme-pill">
          <button class="pp-btn pp-active" data-pp-theme="dark">DARK</button>
          <button class="pp-btn"           data-pp-theme="light">LIGHT</button>
        </div>
      </div>
      <div class="pp-divider"></div>` : '';

    const hasSteps = Array.isArray(cfg.steps) && cfg.steps.length > 0;
    const stateBlock = !hasSteps && cfg.stateToggle ? `
      <div class="pp-group">
        <span class="pp-group-label">STATE</span>
        <div class="pp-pill pp-state-pill">
          <button class="pp-btn pp-active" data-pp-state="near">${cfg.stateLabels[0]}</button>
          <button class="pp-btn"           data-pp-state="future">${cfg.stateLabels[1]}</button>
        </div>
      </div>
      <div class="pp-divider"></div>` : '';

    const stepsBlock = hasSteps ? `
      <div class="pp-group">
        <span class="pp-group-label">STEP</span>
        <div class="pp-steps-group">
          ${cfg.steps.map((label, i) => `<button type="button" class="pp-step-btn ${i === 0 ? 'pp-active' : ''}" data-pp-step="${i + 1}">${escapeHtml(label)}</button>`).join('')}
        </div>
      </div>
      <div class="pp-divider"></div>` : '';

    return `
      <div class="pp-bar ${hasSteps ? 'pp-has-steps' : ''}" id="pp-bar" role="region" aria-label="Prototype controls">
        <div class="pp-collapsed" id="pp-collapsed" role="button" aria-expanded="false" tabindex="0">
          <span class="pp-label">PROTOTYPE CONTROLS &mdash; NOT PART OF THE PRODUCT</span>
          <button class="pp-chevron" aria-label="Toggle prototype controls" tabindex="-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="pp-expanded" aria-hidden="true">
          ${themeBlock}
          ${stateBlock}
          ${stepsBlock}
          <p class="pp-description">${escapeHtml(cfg.description)}</p>
        </div>
      </div>`;
  }

  function init(userConfig) {
    const cfg = Object.assign({}, DEFAULTS, userConfig);
    const hasSteps = Array.isArray(cfg.steps) && cfg.steps.length > 0;

    if (document.getElementById('pp-bar')) return;

    const style = document.createElement('style');
    style.id = 'pp-styles';
    style.textContent = CSS;
    document.head.appendChild(style);

    const tmp = document.createElement('div');
    tmp.innerHTML = buildHTML(cfg);
    const bar = tmp.firstElementChild;
    document.body.insertBefore(bar, document.body.firstChild);

    const bs = getComputedStyle(document.body);
    if (bs.display !== 'flex' && bs.display !== 'grid') {
      document.body.style.cssText += ';display:flex;flex-direction:column';
    }

    const collapsed = bar.querySelector('.pp-collapsed');
    const expanded  = bar.querySelector('.pp-expanded');

    function toggle() {
      const isOpen = bar.classList.toggle('pp-open');
      document.body.classList.toggle('pp-open', isOpen);
      collapsed.setAttribute('aria-expanded', String(isOpen));
      expanded.setAttribute('aria-hidden', String(!isOpen));
    }

    collapsed.addEventListener('click', toggle);
    collapsed.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });

    if (cfg.themeToggle) {
      let currentTheme = 'dark';
      bar.querySelectorAll('[data-pp-theme]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const theme = btn.dataset.ppTheme;
          if (theme === currentTheme) return;
          currentTheme = theme;
          bar.querySelectorAll('[data-pp-theme]').forEach(b => b.classList.remove('pp-active'));
          btn.classList.add('pp-active');
          if (cfg.applyThemeClass) {
            document.documentElement.classList.toggle('light', theme === 'light');
          }
          if (typeof cfg.onThemeChange === 'function') cfg.onThemeChange(theme);
          document.dispatchEvent(new CustomEvent('proto:theme', { detail: { theme }, bubbles: true }));
        });
      });
    }

    if (cfg.stateToggle && !hasSteps) {
      let currentState = 'near';
      bar.querySelectorAll('[data-pp-state]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const state = btn.dataset.ppState;
          if (state === currentState) return;
          currentState = state;
          bar.querySelectorAll('[data-pp-state]').forEach(b => b.classList.remove('pp-active'));
          btn.classList.add('pp-active');
          if (cfg.applyStateClass) {
            document.body.classList.toggle('future-state', state === 'future');
          }
          if (typeof cfg.onStateChange === 'function') cfg.onStateChange(state);
          document.dispatchEvent(new CustomEvent('proto:state', { detail: { state }, bubbles: true }));
        });
      });
    }

    let currentStep = 1;
    const stepBtns = hasSteps ? bar.querySelectorAll('[data-pp-step]') : [];

    function setActiveStep(stepIndex) {
      const n = Math.max(1, Math.min(stepIndex, stepBtns.length));
      if (n === currentStep) return;
      currentStep = n;
      stepBtns.forEach((btn) => {
        btn.classList.toggle('pp-active', parseInt(btn.dataset.ppStep, 10) === n);
      });
    }

    if (hasSteps) {
      stepBtns.forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const step = parseInt(btn.dataset.ppStep, 10);
          if (step === currentStep) return;
          stepBtns.forEach(b => b.classList.remove('pp-active'));
          btn.classList.add('pp-active');
          currentStep = step;
          if (typeof cfg.onStepChange === 'function') cfg.onStepChange(step);
          document.dispatchEvent(new CustomEvent('proto:step', { detail: { step }, bubbles: true }));
        });
      });
      global.ProtoPanel.setStep = function (stepIndex) {
        if (!bar.parentNode) return;
        setActiveStep(stepIndex);
      };
    } else {
      global.ProtoPanel.setStep = function () {};
    }
  }

  function autoInit() {
    const scripts = document.querySelectorAll('script[src*="proto-panel"]');
    const script  = document.currentScript || scripts[scripts.length - 1];
    if (!script || !('description' in script.dataset)) return;

    const cfg = { description: script.dataset.description };
    if (script.dataset.themeToggle  === 'false') cfg.themeToggle  = false;
    if (script.dataset.stateToggle  === 'false') cfg.stateToggle  = false;
    if (script.dataset.stateLabels) {
      cfg.stateLabels = script.dataset.stateLabels.split('|').map(s => s.trim());
    }
    if (script.dataset.steps) {
      cfg.steps = script.dataset.steps.split('|').map(s => s.trim());
      cfg.stateToggle = false;
    }

    const run = () => init(cfg);
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', run)
      : run();
  }

  global.ProtoPanel = { init };
  autoInit();

}(window));
