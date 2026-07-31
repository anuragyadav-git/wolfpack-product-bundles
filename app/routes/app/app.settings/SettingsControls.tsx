import { useRef, useState } from "react";
import type { SettingsField } from "../../../lib/admin-configuration-surfaces";
import {
  getDisabledAdditionalConfigurationFields,
  isAdditionalConfigurationActionDisabled,
} from "../../../lib/additional-configurations-behavior";
import styles from "../../../styles/routes/admin-configuration-surfaces.module.css";
import { getFieldValueKey } from "./settings-state";

function AdditionalConfigurationFileUpload({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  const uploadFile = async (file: File) => {
    setStatus("uploading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadResponse = await fetch("/app/upload-store-file", {
        method: "POST",
        body: formData,
      });
      const uploadResult = await uploadResponse.json() as {
        ok?: boolean;
        fileId?: string;
      };
      if (!uploadResponse.ok || !uploadResult.ok || !uploadResult.fileId) {
        setStatus("error");
        return;
      }

      for (let pollCount = 0; pollCount < 15; pollCount += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const statusResponse = await fetch(
          `/app/upload-store-file?fileId=${encodeURIComponent(uploadResult.fileId)}`,
        );
        const statusResult = await statusResponse.json() as {
          fileStatus?: string;
          file?: { url?: string };
        };
        if (statusResult.fileStatus === "READY" && statusResult.file?.url) {
          onChange(statusResult.file.url);
          setStatus("success");
          return;
        }
        if (!statusResponse.ok || statusResult.fileStatus === "FAILED") {
          setStatus("error");
          return;
        }
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className={styles.ebFieldStack}>
      {value ? <img className={styles.ebPreviewImage} src={value} alt="Selected video player logo" /> : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
        hidden
        disabled={disabled || status === "uploading"}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file) void uploadFile(file);
        }}
      />
      <s-button
        variant="secondary"
        loading={status === "uploading" || undefined}
        disabled={disabled || status === "uploading" || undefined}
        onClick={() => inputRef.current?.click()}
      >
        {value ? "Replace file" : "Upload file"}
      </s-button>
      {status === "success" ? <s-badge tone="success">Upload complete</s-badge> : null}
      {status === "error" ? <s-badge tone="critical">Upload failed. Please try again.</s-badge> : null}
    </div>
  );
}

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
              <button
                type="button"
                className={styles.controlsEditLanguageButton}
                disabled={isAdditionalConfigurationActionDisabled("Cart Messaging", values)}
                onClick={() => onFieldAction?.("Cart Messaging")}
              >
                Edit Language
              </button>
            )}
          </div>
          <div className={styles.controlsCardFields}>
            {group.fields.map((field) => {
              const displayField = group.title === "Cart Messaging" && field.label === "Cart Messaging"
                ? { ...field, description: undefined }
                : field;

              return (
                <ControlsField
                  key={`${title}-${field.label}`}
                  field={displayField}
                  value={values[field.label] ?? ""}
                  disabled={disabledFields.has(field.label)}
                  onChange={(value) => onFieldChange(field.label, value)}
                  onAction={onFieldAction ? () => onFieldAction(field.label) : undefined}
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
  if (!modal) {
    return null;
  }

  return (
    <div className={styles.settingsModalBackdrop} role="presentation">
      <section className={styles.settingsVariablesModal} role="dialog" aria-modal="true" aria-labelledby="settings-variables-title">
        <div className={styles.settingsVariablesHeader}>
          <h2 id="settings-variables-title">Variables</h2>
          <button type="button" className={styles.settingsModalDismiss} aria-label="Dismiss variables modal" onClick={onClose}>
            <s-icon type="x" size="small"></s-icon>
          </button>
        </div>
        <p className={styles.settingsVariablesDescription}>{modal.title}</p>
        <div className={styles.settingsVariablesList}>
          {modal.variables.map((variable) => (
            <code key={variable}>{variable}</code>
          ))}
        </div>
      </section>
    </div>
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
            <button
              type="button"
              className={styles.ebVariablesButton}
              onClick={() => onShowVariables?.(title, variables)}
            >
              Show Variables
            </button>
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
    return (
      <label className={styles.ebSettingRow} htmlFor={inputId}>
        <input
          id={inputId}
          className={styles.ebSwitchInput}
          type="checkbox"
          checked={isChecked}
          disabled={disabled}
          onChange={(event) => onChange(event.currentTarget.checked ? "Checked" : "")}
        />
        <span className={styles.ebSwitchVisual} aria-hidden="true">
          <s-icon type={isChecked ? "toggle-on" : "toggle-off"} size="small"></s-icon>
        </span>
        <span>
          <span className={hasInlineAction ? styles.ebSettingLabelLine : undefined}>
            <span className={styles.ebSettingLabel}>{field.label}</span>
            {hasInlineAction ? (
            <button
              type="button"
              className={styles.ebInlineAction}
              disabled={disabled}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onAction?.();
              }}
            >
              {field.description}
            </button>
            ) : null}
          </span>
          {!hasInlineAction && field.description ? (
            <span className={styles.ebSettingHelp}>{field.description}</span>
          ) : null}
        </span>
      </label>
    );
  }

  if (field.kind === "color") {
    const colorValue = /^#[0-9a-f]{6}$/i.test(value) ? value : field.value || "#000000";

    return (
      <label className={styles.ebFieldStack}>
        <span>{field.label}</span>
        {field.description && <span className={styles.ebSettingHelp}>{field.description}</span>}
        <span className={styles.ebColorInputRow}>
          <input
            className={styles.ebTextInput}
            aria-label={`${field.label} Hex Code`}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.currentTarget.value)}
          />
          <input
            className={styles.ebColorWell}
            type="color"
            value={colorValue}
            disabled={disabled}
            onChange={(event) => onChange(event.currentTarget.value)}
          />
        </span>
      </label>
    );
  }

  if (field.kind === "select") {
    return (
      <label className={styles.ebFieldStack}>
        <span>{field.label}</span>
            <span className={styles.ebSelectWrap}>
              <select className={styles.ebSelect} value={value || field.options?.[0] || ""} disabled={disabled} onChange={(event) => onChange(event.currentTarget.value)}>
                {(field.options?.length ? field.options : [field.value ?? ""]).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </span>
        {field.description && <span className={styles.ebSettingHelp}>{field.description}</span>}
      </label>
    );
  }

  if (field.kind === "radio") {
    return (
      <fieldset className={styles.ebRadioGroup} disabled={disabled}>
        <legend>{field.label}</legend>
        {field.description && <span className={styles.ebSettingHelp}>{field.description}</span>}
        {(field.options?.length ? field.options : [field.value ?? ""]).map((option) => (
          <label key={option} className={styles.ebSettingRow}>
            <input
              type="radio"
              name={inputId}
              checked={(value || field.value) === option}
              onChange={() => onChange(option)}
            />
            <span className={styles.ebSettingLabel}>{option}</span>
          </label>
        ))}
      </fieldset>
    );
  }

  if (field.kind === "script" || field.kind === "css") {
    return (
      <label className={styles.ebFieldStack}>
        <span>{field.label}</span>
        <textarea className={styles.ebTextArea} value={value} rows={4} disabled={disabled} onChange={(event) => onChange(event.currentTarget.value)} />
        {field.description && <span className={styles.ebSettingHelp}>{field.description}</span>}
        {field.note && <span className={styles.ebFieldNote}>Note: {field.note}</span>}
      </label>
    );
  }

  if (field.kind === "image") {
    return (
      <div className={styles.ebFieldStack}>
        <span>{field.label}</span>
        <img className={styles.ebPreviewImage} src={value || field.value} alt={field.label} />
        {field.description && <span className={styles.ebSettingHelp}>{field.description}</span>}
      </div>
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

  if (field.kind === "file") {
    return (
      <div className={styles.ebFieldStack}>
        <span>{field.label}</span>
        <AdditionalConfigurationFileUpload
          value={value}
          disabled={disabled}
          onChange={onChange}
        />
        {field.description && <span className={styles.ebSettingHelp}>{field.description}</span>}
      </div>
    );
  }

  if (field.kind === "button") {
    return (
      <div className={styles.ebFieldStack}>
        <button type="button" className={styles.settingsSecondaryButton} disabled={disabled} onClick={onAction}>
          {field.value || field.label}
        </button>
        {field.description && <span className={styles.ebSettingHelp}>{field.description}</span>}
      </div>
    );
  }

  if (field.kind === "secret") {
    return (
      <label className={styles.ebFieldStack}>
        <span>{field.label}</span>
        <input
          className={styles.ebTextInput}
          type="password"
          autoComplete="off"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
        {field.description && <span className={styles.ebSettingHelp}>{field.description}</span>}
      </label>
    );
  }

  return (
    <label className={styles.ebFieldStack}>
      <span>{field.label}</span>
      <input className={styles.ebTextInput} value={value} disabled={disabled} onChange={(event) => onChange(event.currentTarget.value)} />
      {field.description && <span className={styles.ebSettingHelp}>{field.description}</span>}
      {field.note && <span className={styles.ebFieldNote}>Note: {field.note}</span>}
    </label>
  );
}
