/**
 * Shared step timeline renderers.
 *
 * The widget controller still owns state, paging, and click behavior. This
 * component owns the stable DOM contract used by template timelines.
 */

'use strict';

export function renderStepTimelineEntry({
  stepIndex = 0,
  timelineType = 'step',
  label = '',
  iconHtml = '',
  classes = [],
}: any = {}) {
  const className = [
    'timeline-step',
    ...classes,
  ].filter(Boolean).join(' ');

  return `
    <div class="${escapeAttribute(className)}" data-step-index="${escapeAttribute(stepIndex)}" data-timeline-type="${escapeAttribute(timelineType)}">
      <div class="timeline-icon-wrapper">
        ${iconHtml || ''}
        <div class="timeline-checkmark"></div>
      </div>
      <span class="timeline-step-name">${escapeHtml(label)}</span>
    </div>
  `;
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value: string|number) {
  return escapeHtml(String(value)).replace(/`/g, '&#96;');
}
