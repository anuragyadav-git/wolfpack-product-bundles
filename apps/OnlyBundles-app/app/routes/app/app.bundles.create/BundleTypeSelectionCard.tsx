type BundleTypeSelectionCardProps = {
  description: string;
  selected: boolean;
  selectedLabel: string;
  selectLabel: string;
  thumbnail: "product-page" | "full-page";
  title: string;
  onSelect: () => void;
};

export function BundleTypeSelectionCard({
  description,
  selected,
  selectedLabel,
  selectLabel,
  thumbnail,
  title,
  onSelect,
}: BundleTypeSelectionCardProps) {
  const actionLabel = selected ? selectedLabel : selectLabel;
  const thumbnailSource =
    thumbnail === "product-page" ? "/ppb.avif" : "/fpb.avif";

  return (
    <s-clickable
      accessibilityLabel={`${actionLabel}: ${title}`}
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
        <s-image
          accessibilityRole="presentation"
          alt=""
          aspectRatio="16 / 9"
          inlineSize="fill"
          objectFit="contain"
          src={thumbnailSource}
        />
        <s-box padding="base">
          <s-grid
            alignItems="center"
            gap="base"
            gridTemplateColumns="1fr auto"
          >
            <s-stack gap="small">
              <s-text type="strong">{title}</s-text>
              <s-text color="subdued">{description}</s-text>
            </s-stack>
            <s-stack direction="inline" gap="small" alignItems="center">
              {selected && <s-icon type="check" />}
              <s-text type="strong">{actionLabel}</s-text>
            </s-stack>
          </s-grid>
        </s-box>
      </s-stack>
    </s-clickable>
  );
}
