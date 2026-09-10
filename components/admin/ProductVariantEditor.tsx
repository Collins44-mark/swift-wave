"use client";

import { useMemo, useState } from "react";
import { MediaUploadButton } from "@/components/admin/MediaUploadButton";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import type {
  ProductColor,
  ProductSizeOption,
  SizeDefinition,
} from "@/lib/admin/types-catalog";

type ColorDraft = {
  key: string;
  id?: string;
  name: string;
  hex_code: string;
  image_url: string;
  image_public_id: string;
};

export function ProductVariantEditor({
  companySlug,
  canUpload,
  initialColors,
  initialSizes,
  sizeLibrary,
  onBusyChange,
}: {
  companySlug: string;
  canUpload: boolean;
  initialColors?: ProductColor[];
  initialSizes?: ProductSizeOption[];
  sizeLibrary: SizeDefinition[];
  onBusyChange?: (busy: boolean) => void;
}) {
  const { showSuccess, showError } = useAdminToastContext();
  const [colors, setColors] = useState<ColorDraft[]>(() =>
    (initialColors ?? []).map((c) => ({
      key: c.id,
      id: c.id,
      name: c.name,
      hex_code: c.hex_code || "#111111",
      image_url: c.image_url || "",
      image_public_id: c.image_public_id || "",
    }))
  );
  const [sizeNames, setSizeNames] = useState<string[]>(() =>
    (initialSizes ?? []).map((s) => s.name)
  );
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#111111");
  const [newSizeName, setNewSizeName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const unusedLibrary = useMemo(
    () =>
      sizeLibrary.filter(
        (s) =>
          !sizeNames.some((name) => name.toLowerCase() === s.name.toLowerCase())
      ),
    [sizeLibrary, sizeNames]
  );

  function addColor() {
    const name = newColorName.trim();
    if (!name) {
      showError("Enter a color name.");
      return;
    }
    setColors((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}`,
        name,
        hex_code: newColorHex || "#111111",
        image_url: "",
        image_public_id: "",
      },
    ]);
    setNewColorName("");
    setNewColorHex("#111111");
    showSuccess("Color added successfully");
  }

  function addSize(name: string) {
    const next = name.trim();
    if (!next) return;
    if (sizeNames.some((s) => s.toLowerCase() === next.toLowerCase())) return;
    setSizeNames((prev) => [...prev, next]);
    setNewSizeName("");
  }

  return (
    <div className="sw-admin-field-span sw-admin-variant-block">
      <input type="hidden" name="colors_json" value={JSON.stringify(colors)} />
      <input type="hidden" name="sizes_json" value={JSON.stringify(sizeNames)} />

      <div className="sw-admin-section-head" style={{ marginTop: "0.4rem" }}>
        <div>
          <h2>Variants</h2>
          <p>Add colors and sizes for this product. Leave empty if not needed.</p>
        </div>
      </div>

      <div className="sw-admin-variant-panel">
        <h3>Colors</h3>
        {colors.length ? (
          <ul className="sw-admin-color-list">
            {colors.map((color) => (
              <li key={color.key} className="sw-admin-color-row">
                <span
                  className="sw-admin-color-dot"
                  style={{ background: color.hex_code }}
                  aria-hidden="true"
                />
                <input
                  aria-label="Color name"
                  value={color.name}
                  onChange={(e) =>
                    setColors((prev) =>
                      prev.map((c) =>
                        c.key === color.key ? { ...c, name: e.target.value } : c
                      )
                    )
                  }
                />
                <input
                  type="color"
                  aria-label={`${color.name} color`}
                  value={
                    /^#([0-9A-Fa-f]{6})$/.test(color.hex_code)
                      ? color.hex_code
                      : "#111111"
                  }
                  onChange={(e) =>
                    setColors((prev) =>
                      prev.map((c) =>
                        c.key === color.key
                          ? { ...c, hex_code: e.target.value }
                          : c
                      )
                    )
                  }
                />
                <div className="sw-admin-color-image">
                  {color.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={color.image_url} alt="" />
                  ) : (
                    <span>No image</span>
                  )}
                  {canUpload ? (
                    <MediaUploadButton
                      companySlug={companySlug}
                      label="Upload Image"
                      className="sw-admin-btn sw-admin-btn-ghost"
                      onBusyChange={onBusyChange}
                      onSaved={(asset) =>
                        setColors((prev) =>
                          prev.map((c) =>
                            c.key === color.key
                              ? {
                                  ...c,
                                  image_url: asset.secure_url,
                                  image_public_id: asset.public_id,
                                }
                              : c
                          )
                        )
                      }
                    />
                  ) : null}
                </div>
                <button
                  type="button"
                  className="sw-admin-btn sw-admin-btn-ghost sw-admin-btn-danger"
                  onClick={() => setPendingDelete(color.key)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sw-admin-muted-sm">No colors added yet.</p>
        )}

        <div className="sw-admin-color-add">
          <input
            placeholder="Color name"
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
          />
          <input
            type="color"
            aria-label="New color"
            value={newColorHex}
            onChange={(e) => setNewColorHex(e.target.value)}
          />
          <button type="button" className="sw-admin-btn" onClick={addColor}>
            + Add Color
          </button>
        </div>
      </div>

      <div className="sw-admin-variant-panel">
        <h3>Sizes</h3>
        <div className="sw-admin-size-chips">
          {sizeNames.length ? (
            sizeNames.map((name) => (
              <button
                key={name}
                type="button"
                className="sw-admin-size-chip"
                onClick={() =>
                  setSizeNames((prev) => prev.filter((s) => s !== name))
                }
              >
                {name} ×
              </button>
            ))
          ) : (
            <p className="sw-admin-muted-sm">No sizes selected yet.</p>
          )}
        </div>
        <div className="sw-admin-size-add">
          {unusedLibrary.length ? (
            <select
              aria-label="Select size"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) addSize(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Select existing size</option>
              {unusedLibrary.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : null}
          <input
            placeholder="Or add a size"
            value={newSizeName}
            onChange={(e) => setNewSizeName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSize(newSizeName);
              }
            }}
          />
          <button
            type="button"
            className="sw-admin-btn"
            onClick={() => addSize(newSizeName)}
          >
            + Add Size
          </button>
        </div>
      </div>

      {pendingDelete ? (
        <div className="sw-admin-modal-backdrop" role="presentation">
          <div className="sw-admin-modal" role="dialog" aria-modal="true">
            <h3 style={{ marginTop: 0 }}>Remove this color?</h3>
            <p style={{ color: "var(--admin-muted)" }}>
              It will be removed from this product when you save.
            </p>
            <div className="sw-admin-toolbar">
              <button
                type="button"
                className="sw-admin-btn sw-admin-btn-ghost"
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sw-admin-btn sw-admin-btn-danger-solid"
                onClick={() => {
                  setColors((prev) =>
                    prev.filter((c) => c.key !== pendingDelete)
                  );
                  setPendingDelete(null);
                  showSuccess("Color removed.");
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
