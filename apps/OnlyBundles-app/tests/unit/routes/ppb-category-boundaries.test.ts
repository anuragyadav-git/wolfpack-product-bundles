import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  PpbCategoryAccordion,
  type PpbCategoryAccordionProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCategoryAccordion";
import {
  PpbStepCategoriesCard,
  type PpbStepCategoriesCardProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepCategoriesCard";

const mockCommonAccordion = jest.fn<unknown, [Record<string, unknown>]>(() => null);

jest.mock(
  "../../../app/routes/app/_shared/bundle-configure/CommonStepCategoryAccordion",
  () => ({
    CommonStepCategoryAccordion: (props: Record<string, unknown>) =>
      mockCommonAccordion(props),
  }),
);
function findElement(
  node: React.ReactNode,
  predicate: (element: React.ReactElement) => boolean,
): React.ReactElement | null {
  for (const child of React.Children.toArray(node)) {
    if (!React.isValidElement(child)) continue;
    if (predicate(child)) return child;
    const nested = findElement(child.props.children, predicate);
    if (nested) return nested;
  }
  return null;
}

const adapter = {
  categoryActiveTabs: {},
  categoryOpen: {},
  clearValidationError: jest.fn(),
  draggedCatKey: null,
  dragOverCatKey: null,
  handleCatDragEnd: jest.fn(),
  handleCatDragStart: jest.fn(),
  handleCatDrop: jest.fn(),
  markAsDirty: jest.fn(),
  openStepCategoryMultiLanguageModal: jest.fn(),
  setCategoryActiveTabs: jest.fn(),
  setCategoryOpen: jest.fn(),
  setDragOverCatKey: jest.fn(),
  shopify: {},
  shopLocales: [],
  stepsState: { updateStepField: jest.fn() },
  validationErrors: {},
};

describe("PPB category boundaries", () => {
  it("passes an explicit category adapter to the shared accordion", () => {
    const props = {
      adapter,
      cat: { id: "cat-1", name: "Products" },
      catIndex: 0,
      step: {
        id: "step-1",
        StepCategory: [{ id: "cat-1", name: "Products" }],
      },
    } as unknown as PpbCategoryAccordionProps;

    renderToStaticMarkup(React.createElement(PpbCategoryAccordion, props));

    expect(mockCommonAccordion).toHaveBeenCalledWith(
      expect.objectContaining({
        catIndex: 0,
        adapter: expect.objectContaining({
          categoryActiveTabs: adapter.categoryActiveTabs,
          stepsState: adapter.stepsState,
        }),
      }),
    );
  });

  it("adds a category through the explicit step owner", () => {
    const markAsDirty = jest.fn();
    const updateStepField = jest.fn();
    const props = {
      categoryAdapter: adapter,
      markAsDirty,
      step: { id: "step-1", StepCategory: [] },
      stepsState: { updateStepField },
    } as unknown as PpbStepCategoriesCardProps;

    const view = PpbStepCategoriesCard(props);
    const addButton = findElement(
      view,
      (element) =>
        element.type === "s-button" && element.props.icon === "plus",
    );
    addButton!.props.onClick();

    expect(updateStepField).toHaveBeenCalledWith(
      "step-1",
      "StepCategory",
      expect.arrayContaining([
        expect.objectContaining({ variantSelectorMode: "dropdown" }),
      ]),
    );
    expect(markAsDirty).toHaveBeenCalledTimes(1);
  });
});
