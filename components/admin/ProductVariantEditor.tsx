"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MediaUploadButton } from "@/components/admin/MediaUploadButton";
import { ColorSwatch } from "@/components/admin/ColorSwatch";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import { createLibraryColor } from "@/lib/admin/client-actions";
import { resolvedSwatchHex } from "@/lib/catalog/color-display";
import type {
  ColorDefinition,
  ProductColor,
  ProductSizeOption,
  SizeDefinition,
} from "@/lib/admin/types-catalog";

type ColorDraft = {
  key: string;
  id?: string;
  color_id: string;
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
  colorLibrary: initialColorLibrary,
  onBusyChange,
  onColorsChange,
}: {
  companySlug: string;
  canUpload: boolean;
  initialColors?: ProductColor[];
  initialSizes?: ProductSizeOption[];
  sizeLibrary: SizeDefinition[];
  colorLibrary: ColorDefinition[];
  onBusyChange?: (busy: boolean) => void;
  onColorsChange?: (
    colors: { color_id: string; name: string; hex_code: string }[]
  ) => void;
}) {
  const { showSuccess, showError } = useAdminToastContext();
  const [library, setLibrary] = useState<ColorDefinition[]>(
    () => initialColorLibrary
  );
  const [colors, setColors] = useState<ColorDraft[]>(() =>
    (initialColors ?? [])
      .filter((c) => c.color_id || c.id)
      .map((c) => ({
        key: c.id,
        id: c.id,
        color_id: c.color_id || "",
        name: c.name,
        hex_code: resolvedSwatchHex(c.hex_code) ?? "",
        image_url: c.image_url || "",
        image_public_id: c.image_public_id || "",
      }))
      .filter((c) => c.color_id)
  );
  const [sizeNames, setSizeNames] = useState<string[]>(() =>
    (initialSizes ?? []).map((s) => s.name)
  );
  const [extraSizeNames, setExtraSizeNames] = useState<string[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#808080");
  const [addingLibraryColor, setAddingLibraryColor] = useState(false);
  const [savingLibraryColor, setSavingLibraryColor] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [newSizeName, setNewSizeName] = useState("");
  const [addingSize, setAddingSize] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  const selectedIds = useMemo(
    () => new Set(colors.map((c) => c.color_id)),
    [colors]
  );

  const availableLibrary = useMemo(
    () => library.filter((c) => !selectedIds.has(c.id)),
    [library, selectedIds]
  );

  const sizeOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: string[] = [];
    function addOption(name: string) {
      const trimmed = name.trim();
      if (!trimmed) return;
      const key = trimmed.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      options.push(trimmed);
    }
    for (const size of sizeLibrary) addOption(size.name);
    for (const name of extraSizeNames) addOption(name);
    for (const name of sizeNames) addOption(name);
    return options;
  }, [sizeLibrary, extraSizeNames, sizeNames]);

  useEffect(() => {
    onColorsChange?.(
      colors.map((c) => ({
        color_id: c.color_id,
        name: c.name,
        hex_code: c.hex_code,
      }))
    );
  }, [colors, onColorsChange]);

  useEffect(() => {
    if (!selectorOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!selectorRef.current?.contains(event.target as Node)) {
        setSelectorOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [selectorOpen]);

  function isSizeSelected(name: string) {
    return sizeNames.some((s) => s.toLowerCase() === name.toLowerCase());
  }

  function toggleSize(name: string) {
    setSizeNames((prev) =>
      prev.some((s) => s.toLowerCase() === name.toLowerCase())
        ? prev.filter((s) => s.toLowerCase() !== name.toLowerCase())
        : [...prev, name]
    );
  }

  function selectLibraryColor(color: ColorDefinition) {
    if (selectedIds.has(color.id)) return;
    setColors((prev) => [
      ...prev,
      {
        key: `new-${color.id}`,
        color_id: color.id,
        name: color.name,
        hex_code: resolvedSwatchHex(color.hex_code) ?? "",
        image_url: "",
        image_public_id: "",
      },
    ]);
    setSelectorOpen(false);
  }

  async function saveLibraryColor() {
    const name = newColorName.trim();
    if (!name) {
      showError("Enter a color name.");
      return;
    }
    setSavingLibraryColor(true);
    const result = await createLibraryColor(companySlug, name, newColorHex);
    setSavingLibraryColor(false);
    if (!result.ok) {
      showError(result.error);
      return;
    }
    const next: ColorDefinition = {
      id: result.id,
      name: result.name,
      hex_code: result.hex_code,
      sort_order: 0,
      is_active: true,
    };
    setLibrary((prev) =>
      prev.some((c) => c.id === next.id) ? prev : [...prev, next]
    );
    selectLibraryColor(next);
    setNewColorName("");
    setNewColorHex("#808080");
    setAddingLibraryColor(false);
    showSuccess("Color added successfully");
  }

  function addSize(name: string) {
    const next = name.trim();
    if (!next) {
      showError("Enter a size name.");
      return;
    }
    const exists = sizeOptions.some((s) => s.toLowerCase() === next.toLowerCase());
    if (!exists) {
      setExtraSizeNames((prev) => [...prev, next]);
    }
    setSizeNames((prev) =>
      prev.some((s) => s.toLowerCase() === next.toLowerCase())
        ? prev
        : [...prev, next]
    );
    setNewSizeName("");
    setAddingSize(false);
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
        <div className="sw-admin-color-select" ref={selectorRef}>
          <button
            type="button"
            className="sw-admin-color-select-trigger"
            aria-haspopup="listbox"
            aria-expanded={selectorOpen}
            onClick={() => setSelectorOpen((open) => !open)}
          >
            Select color
            <span aria-hidden="true">▾</span>
          </button>
          {selectorOpen ? (
            <ul className="sw-admin-color-select-menu" role="listbox">
              {availableLibrary.length ? (
                availableLibrary.map((color) => (
                  <li key={color.id} role="option" aria-selected="false">
                    <button
                      type="button"
                      onClick={() => selectLibraryColor(color)}
                    >
                      <ColorSwatch hex={color.hex_code} name={color.name} />
                      {color.name}
                    </button>
                  </li>
                ))
              ) : (
                <li className="sw-admin-muted-sm">
                  {library.length
                    ? "All library colors are selected."
                    : "No colors in the library yet."}
                </li>
              )}
            </ul>
          ) : null}
        </div>

        {colors.length ? (
          <ul className="sw-admin-color-list">
            {colors.map((color) => (
              <li key={color.key} className="sw-admin-color-card">
                <div className="sw-admin-color-card-head">
                  <ColorSwatch hex={color.hex_code} name={color.name} />
                  <span className="sw-admin-color-name">{color.name}</span>
                </div>
                <div className="sw-admin-color-card-preview">
                  {color.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={color.image_url} alt="" />
                  ) : (
                    <span>No image</span>
                  )}
                </div>
                <div className="sw-admin-color-card-actions">
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
                  <button
                    type="button"
                    className="sw-admin-btn sw-admin-btn-ghost sw-admin-btn-danger"
                    onClick={() => setPendingDelete(color.key)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sw-admin-muted-sm">No colors selected yet.</p>
        )}

        {canUpload ? (
          <div className="sw-admin-color-add">
            {addingLibraryColor ? (
              <>
                <input
                  autoFocus
                  aria-label="New color name"
                  placeholder="Color name"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                />
                <input
                  type="color"
                  className="sw-admin-color-picker"
                  aria-label="New color"
                  value={
                    /^#([0-9A-Fa-f]{6})$/.test(newColorHex)
                      ? newColorHex
                      : "#808080"
                  }
                  onChange={(e) => setNewColorHex(e.target.value)}
                />
                <button
                  type="button"
                  className="sw-admin-btn"
                  disabled={savingLibraryColor}
                  onClick={() => void saveLibraryColor()}
                >
                  {savingLibraryColor ? "Saving..." : "Save Color"}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="sw-admin-btn"
                onClick={() => setAddingLibraryColor(true)}
              >
                + Add Color
              </button>
            )}
          </div>
        ) : null}
      </div>

      <div className="sw-admin-variant-panel">
        <h3>Sizes</h3>
        <div className="sw-admin-size-chips" role="group" aria-label="Product sizes">
          {sizeOptions.length ? (
            sizeOptions.map((name) => {
              const selected = isSizeSelected(name);
              return (
                <button
                  key={name}
                  type="button"
                  className={`sw-admin-size-chip${selected ? " is-selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => toggleSize(name)}
                >
                  {name}
                  {selected ? <span aria-hidden="true"> ✓</span> : null}
                </button>
              );
            })
          ) : (
            <p className="sw-admin-muted-sm">No sizes in the library yet.</p>
          )}
        </div>
        <div className="sw-admin-size-add">
          {addingSize ? (
            <input
              autoFocus
              aria-label="New size name"
              placeholder="New size"
              value={newSizeName}
              onChange={(e) => setNewSizeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSize(newSizeName);
                }
              }}
            />
          ) : null}
          <button
            type="button"
            className="sw-admin-btn"
            onClick={() => {
              if (!addingSize) {
                setAddingSize(true);
                return;
              }
              addSize(newSizeName);
            }}
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
