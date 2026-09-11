"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import { ImageFieldPicker } from "@/components/admin/ImageFieldPicker";
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
import type {
  ColorDefinition,
  Product,
  SizeDefinition,
} from "@/lib/admin/types-catalog";
import type { MediaAsset } from "@/lib/admin/types-media";

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
            showError("Couldn't save changes. Please try again.");
            return;
          }
          showSuccess(
            isEdit
              ? "Product updated successfully"
              : "Product created successfully"
          );
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
        />
      </div>
      <div className="sw-admin-field">
        <label htmlFor="slug">Slug</label>
        <input
          id="slug"
          name="slug"
          defaultValue={product?.slug ?? ""}
          placeholder="Auto if blank"
        />
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
          defaultValue={product?.price != null ? String(product.price) : ""}
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

      <ProductVariantEditor
        companySlug={companySlug}
        canUpload={canUpload}
        initialColors={product?.colors}
        initialSizes={product?.sizes}
        sizeLibrary={sizeLibrary}
        colorLibrary={colorLibrary}
        onBusyChange={handleUploadBusy}
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
        label="Cover image (used if a color has no photo)"
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
