'use strict';

export function installControllerMethods(target: any, ...sources: (Record<string, any> & ThisType<any>)[]) {
  sources.forEach((source) => {
    if (!source) return;
    Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
  });
  return target;
}
