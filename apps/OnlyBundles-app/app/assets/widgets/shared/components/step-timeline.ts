/**
 * Shared step timeline renderers.
 *
 * The widget controller still owns state, paging, and click behavior. This
 * component owns the stable DOM contract used by template timelines.
 */

'use strict';

export function createStepTimelineEntryElement({
  stepIndex = 0,
  timelineType = 'step',
  label = '',
  iconElement = null,
  classes = [],
  document: runtimeDocument = document,
}: any = {}) {
  const className = [
    'timeline-step',
    ...classes,
  ].filter(Boolean).join(' ');

  const root = runtimeDocument.createElement('div');
  root.className = className;
  root.dataset.stepIndex = String(stepIndex);
  root.dataset.timelineType = String(timelineType);
  const iconWrapper = runtimeDocument.createElement('div');
  iconWrapper.className = 'timeline-icon-wrapper';
  if (iconElement?.nodeType) iconWrapper.append(iconElement);
  const checkmark = runtimeDocument.createElement('div');
  checkmark.className = 'timeline-checkmark';
  iconWrapper.append(checkmark);
  const name = runtimeDocument.createElement('span');
  name.className = 'timeline-step-name';
  name.textContent = String(label);
  root.append(iconWrapper, name);
  return root;
}
