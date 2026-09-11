"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import { ImageFieldPicker } from "@/components/admin/ImageFieldPicker";
import { ColorSwatch } from "@/components/admin/ColorSwatch";
import { ProductVariantEditor } from "@/components/admin/ProductVariantEditor";
import {
  createProduct,
  updateProduct,
} from "@/lib/admin/client-actions";
import {
  PRODUCT_CURRENCIES,
  defaultProductCurrency,
  isProductCurrency,
} from "@/lib/admin/product-currencies";
import {
  applyProductDiscount,
  discountLabel,
  formatMoneyAmount,
  parseDiscountType,
  type DiscountType,
} from "@/lib/catalog/pricing";
import type {
  ColorDefinition,
  Product,
  SizeDefinition,
} from "@/lib/admin/types-catalog";
import type { MediaAsset } from "@/lib/admin/types-media";
import { slugify } from "@/lib/admin/slugify";

function bulletsText(bullets: Product["bullets"] | undefined): string {
  if (!bullets) return "";
  if (Array.isArray(bullets)) return bullets.map(String).join("\n");
  return "";
}

type CategoryOption = { id: string; name: string; parent_id: string | null };

function initialParentId(
  product: Product | null | undefined,
  categories: CategoryOption[]
): string {
  if (!product?.category_id) return "";
  const selected = categories.find((c) => c.id === product.category_id);
  if (!selected) return "";
  return selected.parent_id ?? selected.id;
}

function initialChildId(
  product: Product | null | undefined,
  categories: CategoryOption[]
): string {
  if (!product?.category_id) return "";
  const selected = categories.find((c) => c.id === product.category_id);
  if (!selected?.parent_id) return "";
  return selected.id;
}

export function ProductForm({
  companySlug,
  product,
  categories,
  mediaLibrary,
  sizeLibrary,
  colorLibrary,
  canUpload,
}: {
  companySlug: string;
  product?: Product | null;
  categories: CategoryOption[];
  mediaLibrary: MediaAsset[];
  sizeLibrary: SizeDefinition[];
  colorLibrary: ColorDefinition[];
  canUpload: boolean;
}) {
  const { showSuccess, showError } = useAdminToastContext();
  const router = useRouter();
  const isEdit = Boolean(product);
  const [uploadsInFlight, setUploadsInFlight] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleUploadBusy(busy: boolean) {
    setUploadsInFlight((count) => Math.max(0, count + (busy ? 1 : -1)));
  }
  const currencyDefault = product?.currency || defaultProductCurrency(companySlug);
  const currencyOptions = isProductCurrency(currencyDefault)
    ? [...PRODUCT_CURRENCIES]
    : [currencyDefault, ...PRODUCT_CURRENCIES];

  const parents = useMemo(
    () => categories.filter((c) => !c.parent_id),
    [categories]
  );

  const [parentId, setParentId] = useState(() =>
    initialParentId(product, categories)
  );
  const [categoryId, setCategoryId] = useState(() =>
    initialChildId(product, categories)
  );
  const [selectedColors, setSelectedColors] = useState<
    { color_id: string; name: string; hex_code: string }[]
  >(() =>
    (product?.colors ?? [])
      .filter((c) => c.color_id)
      .map((c) => ({
        color_id: c.color_id as string,
        name: c.name,
        hex_code: c.hex_code ?? "",
      }))
  );
  const [primaryColorId, setPrimaryColorId] = useState(() => {
    const match = product?.colors?.find(
      (c) =>
        c.color_id === product.primary_color_id ||
        c.id === product.primary_color_id
    );
    return match?.color_id || product?.colors?.[0]?.color_id || "";
  });
  const [slugDraft, setSlugDraft] = useState(() => product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(() => Boolean(product?.slug));

  const handleColorsChange = useCallback(
    (next: { color_id: string; name: string; hex_code: string }[]) => {
      setSelectedColors(next);
      setPrimaryColorId((current) => {
        if (next.some((c) => c.color_id === current)) return current;
        return next[0]?.color_id ?? "";
      });
    },
    []
  );
  const [discountType, setDiscountType] = useState<DiscountType>(
    () => parseDiscountType(product?.discount_type)
  );
  const [discountValue, setDiscountValue] = useState(() =>
    product?.discount_value != null && Number(product.discount_value) > 0
      ? String(product.discount_value)
      : ""
  );
  const [priceDraft, setPriceDraft] = useState(() =>
    product?.price != null ? String(product.price) : ""
  );
  const discountPreview = applyProductDiscount(
    Number(String(priceDraft).replace(/,/g, "")) || 0,
    discountType,
    discountValue
  );
  const previewLabel = discountLabel(
    discountPreview,
    isProductCurrency(currencyDefault) ? currencyDefault : "INR"
  );

  const children = useMemo(
    () => categories.filter((c) => c.parent_id === parentId),
    [categories, parentId]
  );

  return (
    <form
      className="sw-admin-form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        if (uploadsInFlight > 0) {
          showError("Wait for the image upload to finish, then save.");
          return;
        }
        const formData = new FormData(event.currentTarget);
        setError(null);
        startTransition(async () => {
          const result =
            isEdit && product
              ? await updateProduct(companySlug, product.id, formData)
              : await createProduct(companySlug, formData);
          if (!result.ok) {
            setError(result.error);
            showError(result.error);
            return;
          }
          showSuccess(
            isEdit
              ? "Product updated successfully"
              : "Product created successfully"
          );
          router.refresh();
          if (!isEdit) {
            router.push(`/admin/companies/${companySlug}/products`);
          }
        });
      }}
    >
      {error ? (
        <div className="sw-admin-alert is-error sw-admin-field-span" role="alert">
          {error}
        </div>
      ) : null}
      <div className="sw-admin-field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          required
          defaultValue={product?.name ?? ""}
          onChange={(event) => {
            if (!isEdit && !slugTouched) {
              setSlugDraft(slugify(event.target.value));
            }
          }}
        />
      </div>
      <div className="sw-admin-field">
        <label htmlFor="slug">Slug</label>
        <input
          id="slug"
          name="slug"
          value={slugDraft}
          placeholder="mini-signature-boston-bag"
          onChange={(event) => {
            setSlugTouched(true);
            setSlugDraft(event.target.value);
          }}
        />
        <p className="sw-admin-muted-sm">
          Lowercase letters, numbers, and hyphens only. Generated from the name if left blank.
        </p>
      </div>
      <div className="sw-admin-field sw-admin-field-span">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          defaultValue={product?.description ?? ""}
        />
      </div>
      <div className="sw-admin-field">
        <label htmlFor="price">Price</label>
        <input
          id="price"
          name="price"
          inputMode="decimal"
          required
          value={priceDraft}
          onChange={(event) => setPriceDraft(event.target.value)}
          placeholder="85000"
        />
      </div>
      <div className="sw-admin-field">
        <label htmlFor="price_label">Price label</label>
        <input
          id="price_label"
          name="price_label"
          defaultValue={product?.price_label ?? ""}
          placeholder="Optional display label"
        />
      </div>
      <div className="sw-admin-field">
        <label htmlFor="currency">Currency</label>
        <select
          id="currency"
          name="currency"
          required
          defaultValue={currencyDefault}
        >
          {currencyOptions.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>
      <div className="sw-admin-field">
        <label htmlFor="discount_type">Discount Type</label>
        <select
          id="discount_type"
          name="discount_type"
          value={discountType}
          onChange={(event) =>
            setDiscountType(parseDiscountType(event.target.value))
          }
        >
          <option value="none">None</option>
          <option value="percent">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
      </div>
      {discountType !== "none" ? (
        <div className="sw-admin-field">
          <label htmlFor="discount_value">
            {discountType === "percent" ? "Discount (%)" : "Discount amount"}
          </label>
          <input
            id="discount_value"
            name="discount_value"
            inputMode="decimal"
            value={discountValue}
            onChange={(event) => setDiscountValue(event.target.value)}
            placeholder={discountType === "percent" ? "20" : "500"}
          />
        </div>
      ) : (
        <input type="hidden" name="discount_value" value="0" />
      )}
      {previewLabel ? (
        <p className="sw-admin-discount-preview sw-admin-field-span">
          {formatMoneyAmount(
            isProductCurrency(currencyDefault) ? currencyDefault : "INR",
            discountPreview.original
          )}{" "}
          →{" "}
          <strong>
            {formatMoneyAmount(
              isProductCurrency(currencyDefault) ? currencyDefault : "INR",
              discountPreview.sale
            )}
          </strong>{" "}
          ({previewLabel})
        </p>
      ) : null}
      <div className="sw-admin-field">
        <label htmlFor="parent_category_id">Parent category</label>
        <select
          id="parent_category_id"
          name="parent_category_id"
          required
          value={parentId}
          onChange={(event) => {
            setParentId(event.target.value);
            setCategoryId("");
          }}
        >
          <option value="">Select parent category</option>
          {parents.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <input type="hidden" name="category_id" value={categoryId} />
      <div className="sw-admin-field">
        <label htmlFor="category_id">Category</label>
        <select
          id="category_id"
          required
          disabled={!parentId}
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value="">
            {parentId ? "Select category" : "Select a parent category first"}
          </option>
          {children.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sw-admin-field">
        <label htmlFor="primary_color_id">Primary Color</label>
        <input type="hidden" name="primary_color_id" value={primaryColorId} />
        <div className="sw-admin-primary-color">
          {selectedColors.length ? (
            <select
              id="primary_color_id"
              value={primaryColorId}
              onChange={(event) => setPrimaryColorId(event.target.value)}
            >
              {selectedColors.map((color) => (
                <option key={color.color_id} value={color.color_id}>
                  {color.name}
                </option>
              ))}
            </select>
          ) : (
            <select id="primary_color_id" disabled>
              <option>Select colors first</option>
            </select>
          )}
          {selectedColors.find((c) => c.color_id === primaryColorId) ? (
            <ColorSwatch
              hex={
                selectedColors.find((c) => c.color_id === primaryColorId)
                  ?.hex_code
              }
              name={
                selectedColors.find((c) => c.color_id === primaryColorId)?.name
              }
            />
          ) : null}
        </div>
      </div>

      <ProductVariantEditor
        companySlug={companySlug}
        canUpload={canUpload}
        initialColors={product?.colors}
        initialSizes={product?.sizes}
        sizeLibrary={sizeLibrary}
        colorLibrary={colorLibrary}
        onBusyChange={handleUploadBusy}
        onColorsChange={handleColorsChange}
      />

      <div className="sw-admin-field">
        <label htmlFor="rating">Rating</label>
        <input
          id="rating"
          name="rating"
          defaultValue={product?.rating ?? ""}
          placeholder="4.6 · 94 ratings"
        />
      </div>
      <div className="sw-admin-field">
        <label htmlFor="sort_order">Sort order</label>
        <input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={product?.sort_order ?? 0}
        />
      </div>
      <div className="sw-admin-field">
        <label htmlFor="featured" className="sw-admin-check-label">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            value="true"
            defaultChecked={product?.featured ?? false}
          />{" "}
          Featured
        </label>
      </div>
      <div className="sw-admin-field sw-admin-field-span">
        <label htmlFor="bullets">Bullets (one per line)</label>
        <textarea
          id="bullets"
          name="bullets"
          rows={4}
          defaultValue={bulletsText(product?.bullets)}
        />
      </div>

      <ImageFieldPicker
        companySlug={companySlug}
        library={mediaLibrary}
        canUpload={canUpload}
        initialUrl={product?.image_url}
        initialPublicId={product?.image_public_id}
        label="Fallback image (used if the primary color has no photo)"
        onBusyChange={handleUploadBusy}
      />

      <div className="sw-admin-toolbar sw-admin-field-span">
        <SubmitButton
          pending={pending}
          pendingLabel="Saving..."
          disabled={uploadsInFlight > 0}
        >
          {isEdit ? "Save Changes" : "Create Product"}
        </SubmitButton>
        <Link
          className="sw-admin-btn sw-admin-btn-ghost"
          href={`/admin/companies/${companySlug}/products`}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
