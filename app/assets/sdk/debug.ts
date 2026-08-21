'use strict';

var _debugEnabled = false;

export function isDebugMode() {
  try {
    return window.location.search.indexOf('wbp_debug=true') !== -1;
  } catch (_: any) {
    return false;
  }
}

export function initDebugMode(state: any, sdk: any) {
  if (!isDebugMode()) return;
  _debugEnabled = true;

  console.group('[WolfpackBundles SDK] Debug mode active (?wbp_debug=true)');
  console.log('State:', state);
  console.log('SDK:', sdk);
  console.groupEnd();

  var events: any[] = [
    'wbp:ready', 'wbp:item-added', 'wbp:item-removed',
    'wbp:step-cleared', 'wbp:cart-success', 'wbp:cart-failed',
    'wbp:discount-tier-reached',
  ];
  events.forEach(function (name) {
    window.addEventListener(name, function (e: any) {
      console.log('[WolfpackBundles] Event:', name, e.detail);
    });
  });
}

export function debugLog(...args: any[]) {
  if (!_debugEnabled) return;
  console.log.apply(console, ['[WolfpackBundles]'].concat(args));
}
