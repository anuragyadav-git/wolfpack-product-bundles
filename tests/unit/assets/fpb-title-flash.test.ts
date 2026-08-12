import { fullPageInitialRenderMethods } from '../../../app/assets/widgets/full-page/methods/initial-render-methods';

describe('FPB canonical DOM setup', () => {
  it('creates only the steps owner and modal for the full-page runtime', () => {
    const stepsContainer = { kind: 'steps' };
    const modal = { kind: 'modal' };
    const appended: unknown[] = [];
    const createHeader = jest.fn(() => ({ kind: 'header' }));
    const createFooter = jest.fn(() => ({ kind: 'footer' }));
    const container = {
      querySelector: jest.fn(() => null),
      appendChild: jest.fn((element) => {
        appended.push(element);
        return element;
      }),
    };
    const context = {
      container,
      elements: {},
      createHeader,
      createFooter,
      createStepsContainer: () => stepsContainer,
      ensureModal: () => modal,
    };

    fullPageInitialRenderMethods.setupDOMElements.call(context);

    expect(createHeader).not.toHaveBeenCalled();
    expect(createFooter).not.toHaveBeenCalled();
    expect(appended).toEqual([stepsContainer]);
    expect(context.elements).toEqual({ stepsContainer, modal });
  });
});
