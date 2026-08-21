import { useRef } from "react";
import type { SettingsField } from "../../../lib/admin-configuration-surfaces";
import {
  getDisabledAdditionalConfigurationFields,
  isAdditionalConfigurationActionDisabled,
} from "../../../lib/additional-configurations-behavior";
import styles from "../../../styles/routes/admin-configuration-surfaces.module.css";
import {
  useModalHideListener,
} from "../_shared/bundle-configure/modal-utils";
import { getFieldValueKey } from "./settings-state";

export function ControlsContentCards({
  title,
  description,
  fields,
  values,
  onFieldChange,
  onFieldAction,
}: {
  title: string;
  description?: string;
  fields: SettingsField[];
  values: Record<string, string>;
  onFieldChange: (label: string, value: string) => void;
  onFieldAction?: (label: string) => void;
}) {
  const disabledFields = getDisabledAdditionalConfigurationFields(values);
  const fieldGroups = fields.reduce<Array<{ title: string; fields: SettingsField[] }>>((groups, field) => {
    const groupTitle = field.group || title;
    const existingGroup = groups.find((group) => group.title === groupTitle);
    if (existingGroup) {
      existingGroup.fields.push(field);
      return groups;
    }
    groups.push({ title: groupTitle, fields: [field] });
    return groups;
  }, []);

  return (
    <>
      {fieldGroups.map((group, index) => (
        <section key={`${title}-${group.title}`} className={styles.controlsContentCard}>
          <div className={styles.controlsCardHeader}>
            <div>
              <h3>{group.title}</h3>
              {index === 0 && description && <p>{description}</p>}
            </div>
            {group.title === "Cart Messaging" && (
              <s-button
                variant="tertiary"
                disabled={isAdditionalConfigurationActionDisabled("shared.cartMessaging.isEnabled", values)}
                onClick={() => onFieldAction?.("shared.cartMessaging.isEnabled")}
              >
                Edit Language
              </s-button>
            )}
          </div>
          <div className={styles.controlsCardFields}>
            {group.fields.map((field) => {
              const displayField = group.title === "Cart Messaging" && field.label === "Cart Messaging"
                ? { ...field, description: undefined }
                : field;

              return (
                <ControlsField
                  key={`${title}-${getFieldValueKey(field)}`}
                  field={displayField}
                  value={values[getFieldValueKey(field)] ?? ""}
                  disabled={disabledFields.has(getFieldValueKey(field))}
                  onChange={(value) => onFieldChange(getFieldValueKey(field), value)}
                  onAction={onFieldAction ? () => onFieldAction(getFieldValueKey(field)) : undefined}
                />
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

export function getSettingsVariables(fields: SettingsField[], values: Record<string, string>) {
  const variables = new Set<string>();
  for (const field of fields) {
    const value = String(values[getFieldValueKey(field)] ?? field.value ?? "");
    const matches = value.match(/\{\{[^{}]+\}\}/g) ?? [];
    for (const match of matches) {
      variables.add(match);
    }
  }
  return Array.from(variables);
}

export function SettingsVariablesModal({
  modal,
  onClose,
}: {
  modal: { title: string; variables: string[] } | null;
  onClose: () => void;
}) {
  const modalRef = useRef<any>(null);
  useModalHideListener(modalRef, onClose);

  const descriptions: Record<string, string> = {
    "{{boxSelectionDifference}}": "The number of excess items the customer must remove.",
    "{{conditionQuantity}}": "The required number of products for the step.",
    "{{conditionAmount}}": "The required monetary value for the step, shown without a currency symbol.",
    "{{conditionWeight}}": "The required product weight for the step.",
    "{{stepName}}": "The current bundle step name.",
    "{{maxAllowedAddons}}": "The maximum number of addon products allowed on the step.",
    "{{allowedQuantity}}": "The allowed product quantity.",
    "{{quantityDifference}}": "The number of products still required.",
  };

  return (
    <s-modal ref={modalRef} id="settings-language-variables" heading="Variables">
      <s-button
        slot="primary-action"
        variant="primary"
        commandFor="settings-language-variables"
        command="--hide"
        onClick={onClose}
      >
        Close
      </s-button>
      <s-stack gap="base">
        {modal ? <s-text color="subdued">{modal.title}</s-text> : null}
        {modal?.variables.map((variable) => (
          <s-section key={variable} heading={variable}>
            {descriptions[variable] ? <s-text>{descriptions[variable]}</s-text> : null}
          </s-section>
        ))}
      </s-stack>
    </s-modal>
  );
}

export function ControlsFormGroup({
  title,
  description,
  fields,
  values,
  onFieldChange,
  onFieldAction,
  onShowVariables,
}: {
  title: string;
  description?: string;
  fields: SettingsField[];
  values: Record<string, string>;
  onFieldChange: (label: string, value: string) => void;
  onFieldAction?: (label: string) => void;
  onShowVariables?: (title: string, variables: string[]) => void;
}) {
  const fieldGroups = fields.reduce<Array<{ title: string; fields: SettingsField[] }>>((groups, field) => {
    const groupTitle = field.group ?? "";
    const existingGroup = groups.find((group) => group.title === groupTitle);
    if (existingGroup) {
      existingGroup.fields.push(field);
      return groups;
    }
    groups.push({ title: groupTitle, fields: [field] });
    return groups;
  }, []);
  const variables = getSettingsVariables(fields, values);
  const hasVariables = variables.length > 0;

  return (
    <section className={styles.ebControlsPanel}>
      <div>
        <div className={styles.ebSectionHeader}>
          <h3 className={styles.detailTitle}>{title}</h3>
          {hasVariables && (
            <s-button
              variant="tertiary"
              commandFor="settings-language-variables"
              command="--show"
              onClick={() => onShowVariables?.(title, variables)}
            >
              Show Variables
            </s-button>
          )}
        </div>
        {description && <p className={styles.detailDescription}>{description}</p>}
      </div>
      {fieldGroups.map((group) => (
        <div key={`${title}-${group.title || "default"}`} className={styles.ebControlsSection}>
          {group.title && <h4 className={styles.fieldGroupTitle}>{group.title}</h4>}
          <div className={styles.ebControlsStack}>
            {group.fields.map((field) => (
              <ControlsField
                key={`${title}-${getFieldValueKey(field)}`}
                field={field}
                value={values[getFieldValueKey(field)] ?? ""}
                onChange={(value) => onFieldChange(getFieldValueKey(field), value)}
                onAction={onFieldAction ? () => onFieldAction(field.label) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export function ControlsField({
  field,
  value,
  disabled = false,
  onChange,
  onAction,
}: {
  field: SettingsField;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onAction?: () => void;
}) {
  const isChecked = value === "Checked";
  const inputId = `settings-${field.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const hasInlineAction = field.description === "Edit Language" || field.description === "Know More";
  const displayValue = value.trim() ? value : field.value ?? "";

  if (field.kind === "toggle") {
    if (hasInlineAction) {
      return (
        <s-stack direction="inline" gap="base" justifyContent="space-between" alignItems="center">
          <s-switch
            id={inputId}
            label={field.label}
            checked={isChecked || undefined}
            disabled={disabled || undefined}
            onChange={(event: Event) => onChange((event.currentTarget as HTMLInputElement).checked ? "Checked" : "")}
          />
          <s-button variant="tertiary" disabled={disabled || undefined} onClick={onAction}>
            {field.description}
          </s-button>
        </s-stack>
      );
    }

    return (
      <s-stack direction="block" gap="small-100">
        <s-switch
          id={inputId}
          label={field.label}
          details={field.description}
          checked={isChecked || undefined}
          disabled={disabled || undefined}
          onChange={(event: Event) => onChange((event.currentTarget as HTMLInputElement).checked ? "Checked" : "")}
        />
      </s-stack>
    );
  }

  if (field.kind === "color") {
    const colorValue = /^#[0-9a-f]{6}$/i.test(value) ? value : field.value || "#000000";

    return (
      <s-color-field
        label={field.label}
        details={field.description}
        value={colorValue}
        disabled={disabled || undefined}
        onInput={(event: Event) => onChange((event.currentTarget as HTMLInputElement).value)}
      />
    );
  }

  if (field.kind === "select") {
    const options = field.options?.length ? field.options : [field.value ?? ""];
    const selectedOption = value || options[0] || "";
    const selectedIndex = Math.max(0, options.indexOf(selectedOption));

    return (
      <s-select
        label={field.label}
        details={field.description}
        value={`controls-option-${selectedIndex}`}
        disabled={disabled || undefined}
        onChange={(event: Event) => {
          const optionIndex = Number.parseInt(
            (event.currentTarget as HTMLSelectElement).value.replace("controls-option-", ""),
            10,
          );
          const selected = options.at(optionIndex);
          if (selected !== undefined) onChange(selected);
        }}
      >
        {options.map((option, optionIndex) => (
          <s-option key={option} value={`controls-option-${optionIndex}`}>{option}</s-option>
        ))}
      </s-select>
    );
  }

  if (field.kind === "radio") {
    return (
      <s-choice-list
        label={field.label}
        details={field.description}
        name={inputId}
        values={[value || field.value || ""]}
        disabled={disabled || undefined}
        onChange={(event: Event) => {
          const values = (event.currentTarget as HTMLElement & { values?: string[] }).values;
          if (values?.[0]) onChange(values[0]);
        }}
      >
        {(field.options?.length ? field.options : [field.value ?? ""]).map((option) => (
          <s-choice key={option} value={option}>{option}</s-choice>
        ))}
      </s-choice-list>
    );
  }

  if (field.kind === "script" || field.kind === "css") {
    return (
      <s-text-area
        label={field.label}
        details={[field.description, field.note ? `Note: ${field.note}` : ""].filter(Boolean).join(" ") || undefined}
        value={value}
        rows={4}
        disabled={disabled || undefined}
        onInput={(event: Event) => onChange((event.currentTarget as HTMLTextAreaElement).value)}
      />
    );
  }

  if (field.kind === "image") {
    return (
      <s-stack direction="block" gap="small-100">
        <s-text type="strong">{field.label}</s-text>
        <s-image src={value || field.value || ""} alt={field.label} />
        {field.description ? <s-text color="subdued">{field.description}</s-text> : null}
      </s-stack>
    );
  }

  if (field.kind === "loadingSpinner") {
    return (
      <div className={styles.ebFieldStack}>
        <span>{field.label}</span>
        <div className={styles.ebLoadingSpinnerPreview} role="img" aria-label={`${field.label} default spinner preview`}>
          <span className={styles.ebLoadingSpinner} aria-hidden="true" />
        </div>
        <span className={styles.ebFieldNote}>{displayValue ? displayValue : "Default spinner"}</span>
        {field.description && <span className={styles.ebSettingHelp}>{field.description}</span>}
      </div>
    );
  }

  if (field.kind === "button") {
    return (
      <s-stack direction="block" gap="small-100">
        <s-button variant="secondary" disabled={disabled || undefined} onClick={onAction}>
          {field.value || field.label}
        </s-button>
        {field.description ? <s-text color="subdued">{field.description}</s-text> : null}
      </s-stack>
    );
  }

  if (field.kind === "secret") {
    return (
      <s-text-field
        type="password"
        label={field.label}
        {...({ details: field.description } as any)}
        value={value}
        autocomplete="off"
        disabled={disabled || undefined}
        onInput={(event: Event) => onChange((event.currentTarget as HTMLInputElement).value)}
      />
    );
  }

  return (
    <s-text-field
      label={field.label}
      details={[field.description, field.note ? `Note: ${field.note}` : ""].filter(Boolean).join(" ") || undefined}
      value={value}
      autocomplete="off"
      disabled={disabled || undefined}
      onInput={(event: Event) => onChange((event.currentTarget as HTMLInputElement).value)}
    />
  );
}
