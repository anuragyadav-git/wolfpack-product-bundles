import {
  CommonStepCategoryAccordion,
  type CommonStepCategoryAccordionAdapter,
} from "../../_shared/bundle-configure/CommonStepCategoryAccordion";

export function FpbStepCategoryAccordion({
  adapter,
  step,
  cat,
  catIndex,
}: {
  adapter: CommonStepCategoryAccordionAdapter;
  step: any;
  cat: any;
  catIndex: number;
}) {
  return (
    <CommonStepCategoryAccordion
      adapter={adapter}
      step={step}
      cat={cat}
      catIndex={catIndex}
    />
  );
}
