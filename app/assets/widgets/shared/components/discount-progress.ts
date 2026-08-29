/**
 * Shared discount progress renderer.
 *
 * Accepts prepared progress data so FPB and PPB can keep their pricing and
 * discount calculation ownership while sharing the DOM contract.
 */

'use strict';

import { createMessageFragment } from '../message-segments.js';

export function createDiscountProgressElement(progressData: any = {}, options: any = {}) {
  const runtimeDocument: Document = options.document || document;
  const progressPercent = normalizePercent(progressData.progressPercent);
  const mode = options.mode || 'bar';
  const message = progressData.message || '';
  const shouldRenderMessage = options.messagePlacement !== 'external'
    && (message || options.messageSegments?.length);
  const milestones = Array.isArray(progressData.milestones) ? progressData.milestones : [];
  const root = runtimeDocument.createElement('div');
  root.className = [
    'bw-discount-progress',
    `bw-discount-progress--mode-${mode}`,
    progressData.success ? 'bw-discount-progress--success' : '',
    options.className || '',
  ].filter(Boolean).join(' ');
  root.dataset.bwDiscountProgress = 'true';
  root.style.setProperty('--bw-discount-progress-width', `${progressPercent}%`);

  if (shouldRenderMessage) {
    const messageElement = runtimeDocument.createElement('div');
    messageElement.className = ['bw-discount-progress__message', options.messageClassName || '']
      .filter(Boolean).join(' ');
    if (options.messageSegments?.length) {
      messageElement.append(createMessageFragment(options.messageSegments, runtimeDocument));
    } else {
      messageElement.textContent = String(message);
    }
    root.append(messageElement);
  }

  const track = createTrackElement(progressPercent, options, runtimeDocument);
  if (options.milestonesOnTrack && milestones.length) {
    root.append(createMilestonesElement(milestones, options, runtimeDocument, track));
  } else {
    if (milestones.length) root.append(createMilestonesElement(milestones, options, runtimeDocument));
    root.append(track);
  }
  if (options.renderSubtitleList && milestones.length) {
    root.append(createMilestoneSubtitleList(milestones, options, runtimeDocument));
  }
  return root;
}

function createTrackElement(progressPercent: number, options: any, runtimeDocument: Document) {
  const track = runtimeDocument.createElement('div');
  track.className = ['bw-discount-progress__track', options.trackClassName || ''].filter(Boolean).join(' ');
  track.setAttribute('role', 'progressbar');
  track.setAttribute('aria-valuemin', '0');
  track.setAttribute('aria-valuemax', '100');
  track.setAttribute('aria-valuenow', String(progressPercent));
  const fill = runtimeDocument.createElement('div');
  fill.className = ['bw-discount-progress__fill', options.fillClassName || ''].filter(Boolean).join(' ');
  fill.dataset.bwDiscountProgressFill = 'true';
  track.append(fill);
  return track;
}

function createMilestonesElement(milestones: any[], options: any, runtimeDocument: Document, track?: HTMLElement) {
  const list = runtimeDocument.createElement('div');
  list.className = options.milestoneListClassName || 'bw-discount-progress__milestones';
  list.style.setProperty('--bw-discount-milestone-count', String(milestones.length));
  if (track) list.append(track);
  const itemClassName = options.milestoneClassName || 'bw-discount-progress__milestone';
  const reachedClassName = options.milestoneReachedClassName || 'bw-discount-progress__milestone--reached';
  const activeClassName = options.milestoneActiveClassName || 'bw-discount-progress__milestone--active';
  const pendingClassName = options.milestonePendingClassName || 'bw-discount-progress__milestone--pending';
  const titleClassName = options.milestoneTitleClassName || 'bw-discount-progress__milestone-title';
  const subtitleClassName = options.milestoneSubtitleClassName || 'bw-discount-progress__milestone-subtitle';
  const markerClassName = options.milestoneMarkerClassName || 'bw-discount-progress__milestone-marker';
  const includeInlineSubtitle = options.renderInlineSubtitles !== false;

  milestones.forEach((milestone: any, index: number) => {
    const state = normalizeMilestoneState(milestone);
    const position = normalizePercent(milestone?.position);
    const item = runtimeDocument.createElement('div');
    item.className = [
      itemClassName,
      state === 'reached' ? reachedClassName : '',
      state === 'active' ? activeClassName : '',
      state === 'pending' ? pendingClassName : '',
    ].filter(Boolean).join(' ');
    item.dataset.state = state;
    item.style.setProperty('--bw-discount-milestone-index', String(index + 1));
    item.style.setProperty('--bw-discount-milestone-position', `${position}%`);
    const title = runtimeDocument.createElement('span');
    title.className = titleClassName;
    title.textContent = String(milestone?.title || '');
    const marker = runtimeDocument.createElement('span');
    marker.className = markerClassName;
    marker.setAttribute('aria-hidden', 'true');
    marker.textContent = state === 'reached' ? '✓' : '';
    item.append(title, marker);
    if (includeInlineSubtitle && milestone?.subTitle) {
      const subtitle = runtimeDocument.createElement('span');
      subtitle.className = subtitleClassName;
      subtitle.textContent = String(milestone.subTitle);
      item.append(subtitle);
    }
    list.append(item);
  });
  return list;
}

function createMilestoneSubtitleList(milestones: any[], options: any, runtimeDocument: Document) {
  const list = runtimeDocument.createElement('div');
  list.className = options.subtitleListClassName || 'bw-discount-progress__milestone-subtitles';
  const subtitleClassName = options.milestoneSubtitleClassName || 'bw-discount-progress__milestone-subtitle';
  const reachedClassName = options.milestoneReachedClassName || 'bw-discount-progress__milestone--reached';
  milestones.forEach((milestone: any) => {
    const subtitle = runtimeDocument.createElement('span');
    subtitle.className = [
      subtitleClassName,
      milestone?.isReached ? reachedClassName : '',
    ].filter(Boolean).join(' ');
    subtitle.textContent = String(milestone?.subTitle || '');
    list.append(subtitle);
  });
  return list;
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
