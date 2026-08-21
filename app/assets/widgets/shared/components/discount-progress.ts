/**
 * Shared discount progress renderer.
 *
 * Accepts prepared progress data so FPB and PPB can keep their pricing and
 * discount calculation ownership while sharing the DOM contract.
 */

'use strict';

export function renderDiscountProgress(progressData: any = {}, options: any = {}) {
  const progressPercent = normalizePercent(progressData.progressPercent);
  const mode = options.mode || 'bar';
  const message = progressData.message || '';
  const shouldRenderMessage = options.messagePlacement !== 'external' && message;
  const renderedMessage = options.messageIsHtml ? String(message) : escapeHtml(message);
  const milestones = Array.isArray(progressData.milestones) ? progressData.milestones : [];
  const trackMarkup = renderTrack(progressPercent, options);
  const rootClasses = [
    'bw-discount-progress',
    `bw-discount-progress--mode-${escapeAttribute(mode)}`,
    progressData.success ? 'bw-discount-progress--success' : '',
    options.className || '',
  ].filter(Boolean).join(' ');

  return `
    <div class="${rootClasses}" data-bw-discount-progress="true" style="--bw-discount-progress-width:${progressPercent}%">
      ${shouldRenderMessage ? `<div class="bw-discount-progress__message ${escapeAttribute(options.messageClassName || '')}">${renderedMessage}</div>` : ''}
      ${renderMilestones(milestones, options, options.milestonesOnTrack ? trackMarkup : '')}
      ${options.milestonesOnTrack && milestones.length ? '' : trackMarkup}
      ${options.renderSubtitleList ? renderMilestoneSubtitleList(milestones, options) : ''}
    </div>
  `;
}

function renderTrack(progressPercent: number, options: any) {
  return `<div class="bw-discount-progress__track ${escapeAttribute(options.trackClassName || '')}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressPercent}">
    <div class="bw-discount-progress__fill ${escapeAttribute(options.fillClassName || '')}" data-bw-discount-progress-fill="true"></div>
  </div>`;
}

function renderMilestones(milestones: any[], options: any, trackMarkup = '') {
  if (!milestones.length) return '';

  const listClassName = escapeAttribute(options.milestoneListClassName || 'bw-discount-progress__milestones');
  const itemClassName = options.milestoneClassName || 'bw-discount-progress__milestone';
  const reachedClassName = options.milestoneReachedClassName || 'bw-discount-progress__milestone--reached';
  const activeClassName = options.milestoneActiveClassName || 'bw-discount-progress__milestone--active';
  const pendingClassName = options.milestonePendingClassName || 'bw-discount-progress__milestone--pending';
  const titleClassName = escapeAttribute(options.milestoneTitleClassName || 'bw-discount-progress__milestone-title');
  const subtitleClassName = escapeAttribute(options.milestoneSubtitleClassName || 'bw-discount-progress__milestone-subtitle');
  const markerClassName = escapeAttribute(options.milestoneMarkerClassName || 'bw-discount-progress__milestone-marker');
  const includeInlineSubtitle = options.renderInlineSubtitles !== false;

  const items = milestones.map((milestone: any, index: number) => {
    const state = normalizeMilestoneState(milestone);
    const position = normalizePercent(milestone?.position);
    const classes = [
      itemClassName,
      state === 'reached' ? reachedClassName : '',
      state === 'active' ? activeClassName : '',
      state === 'pending' ? pendingClassName : '',
    ].filter(Boolean).map(escapeAttribute).join(' ');
    const title = escapeHtml(milestone?.title || '');
    const subtitle = escapeHtml(milestone?.subTitle || '');
    const markerContent = state === 'reached' ? '&#10003;' : '';

    return `
      <div class="${classes}" data-state="${state}" style="--bw-discount-milestone-index:${index + 1};--bw-discount-milestone-position:${position}%">
        <span class="${titleClassName}">${title}</span>
        <span class="${markerClassName}" aria-hidden="true">${markerContent}</span>
        ${includeInlineSubtitle && subtitle ? `<span class="${subtitleClassName}">${subtitle}</span>` : ''}
      </div>
    `;
  }).join('');

  return `<div class="${listClassName}" style="--bw-discount-milestone-count:${milestones.length}">${trackMarkup}${items}</div>`;
}

function renderMilestoneSubtitleList(milestones: any[], options: any) {
  if (!milestones.length) return '';

  const listClassName = escapeAttribute(options.subtitleListClassName || 'bw-discount-progress__milestone-subtitles');
  const subtitleClassName = options.milestoneSubtitleClassName || 'bw-discount-progress__milestone-subtitle';
  const reachedClassName = options.milestoneReachedClassName || 'bw-discount-progress__milestone--reached';
  const items = milestones.map((milestone: any) => {
    const classes = [
      subtitleClassName,
      milestone?.isReached ? reachedClassName : '',
    ].filter(Boolean).map(escapeAttribute).join(' ');

    return `<span class="${classes}">${escapeHtml(milestone?.subTitle || '')}</span>`;
  }).join('');

  return `<div class="${listClassName}">${items}</div>`;
}

function normalizePercent(value: number) {
  const numericValue = Number(value || 0);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(100, Math.round(numericValue)));
}

function normalizeMilestoneState(milestone: any) {
  if (milestone?.state === 'reached' || milestone?.isReached === true) return 'reached';
  if (milestone?.state === 'active') return 'active';
  return 'pending';
}

export function readRenderedDiscountProgressPercent(root: any) {
  const track = root?.querySelector?.('[role="progressbar"]');
  if (!track) return null;
  const fill = root?.querySelector?.('[data-bw-discount-progress-fill="true"]');
  const trackWidth = Number(track?.getBoundingClientRect?.().width || 0);
  const fillWidth = Number(fill?.getBoundingClientRect?.().width || 0);

  if (trackWidth > 0 && Number.isFinite(fillWidth)) {
    return normalizePercent((fillWidth / trackWidth) * 100);
  }

  return normalizePercent(track?.getAttribute?.('aria-valuenow'));
}

export function applyDiscountProgressTransition(progressElement: HTMLElement | null, fromPercent: number, toPercent: any, options: any = {}) {
  if (!progressElement?.style?.setProperty) return;

  const from = normalizePercent(fromPercent);
  const target = normalizePercent(toPercent);
  const setProgress = (value: number) => {
    progressElement.style.setProperty('--bw-discount-progress-width', `${value}%`);
    progressElement.style.setProperty('--fpb-discount-progress-width', `${value}%`);
  };
  const prefersReducedMotion = typeof options.prefersReducedMotion === 'boolean'
    ? options.prefersReducedMotion
    : globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  const scheduleFrame = options.requestAnimationFrame || globalThis.requestAnimationFrame;

  if (prefersReducedMotion || from === target || typeof scheduleFrame !== 'function') {
    setProgress(target);
    return;
  }

  setProgress(from);
  scheduleFrame(() => {
    scheduleFrame(() => setProgress(target));
  });
}

function escapeHtml(value: any) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value: any) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
