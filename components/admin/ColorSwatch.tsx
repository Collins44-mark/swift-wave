import {
  swatchClassName,
  swatchStyle,
} from "@/lib/catalog/color-display";

export function ColorSwatch({
  hex,
  name,
  className,
}: {
  hex: string | null | undefined;
  name?: string;
  className?: string;
}) {
  return (
    <span
      className={swatchClassName(hex, className)}
      style={swatchStyle(hex)}
      title={name}
      aria-hidden="true"
    />
  );
}
