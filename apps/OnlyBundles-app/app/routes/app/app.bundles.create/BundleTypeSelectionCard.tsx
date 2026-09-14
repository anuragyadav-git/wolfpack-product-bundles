import styles from "./create-bundle.module.css";

type BundleTypeSelectionCardProps = {
  description: string;
  selected: boolean;
  selectedLabel: string;
  selectLabel?: string;
  thumbnail: "product-page" | "full-page";
  title: string;
  onSelect: () => void;
};

export function BundleTypeSelectionCard({
  description,
  selected,
  selectedLabel,
  thumbnail,
  title,
  onSelect,
}: BundleTypeSelectionCardProps) {
  const thumbnailSource =
    thumbnail === "product-page" ? "/ppb.avif" : "/fpb.avif";

  return (
    <s-clickable
      accessibilityLabel={selected ? `${title} (${selectedLabel})` : title}
      background={selected ? "subdued" : "base"}
      blockSize="100%"
      border="base"
      borderColor={selected ? "strong" : "base"}
      borderRadius="base"
      inlineSize="100%"
      overflow="hidden"
      onClick={onSelect}
    >
      <s-stack gap="none">
        <div className={styles.thumbnailWrapper}>
          <s-image
            accessibilityRole="presentation"
            alt=""
            aspectRatio="16 / 9"
            inlineSize="fill"
            objectFit="contain"
            src={thumbnailSource}
          />
          {selected && (
            <div className={styles.selectedBadge}>
              <s-badge tone="success" icon="check">
                {selectedLabel}
              </s-badge>
            </div>
          )}
        </div>
        <s-box padding="base">
          <s-stack gap="small">
            <s-text type="strong">{title}</s-text>
            <s-text color="subdued">{description}</s-text>
          </s-stack>
        </s-box>
      </s-stack>
    </s-clickable>
  );
}
