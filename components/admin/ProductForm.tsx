"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";
import { ImageFieldPicker } from "@/components/admin/ImageFieldPicker";
import type { Product } from "@/lib/admin/types-catalog";
import type { MediaAsset } from "@/lib/admin/types-media";

function bulletsText(bullets: Product["bullets"] | undefined): string {
  if (!bullets) return "";
  if (Array.isArray(bullets)) return bullets.map(String).join("\n");
  return "";
}

type FormState = {
  error?: string;
  success?: string;
  redirectTo?: string;
} | null;

export function ProductForm({
  companySlug,
  product,
  categories,
  mediaLibrary,
  canUpload,
  action,
}: {
  companySlug: string;
  product?: Product | null;
  categories: { id: string; name: string; parent_id: string | null }[];
  mediaLibrary: MediaAsset[];
  canUpload: boolean;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, null);
  const { showSuccess } = useAdminToastContext();
  const router = useRouter();
  const isEdit = Boolean(product);

  useEffect(() => {
    if (!state?.success) return;
    showSuccess(state.success);
    if (state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state, showSuccess, router]);

  return (
    <form action={formAction} className="sw-admin-form-grid">
      {state?.error ? (
        <div className="sw-admin-alert is-error sw-admin-field-span" role="alert">
          {state.error}
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
        <label htmlFor="slug">Slug (auto if blank)</label>
        <input id="slug" name="slug" defaultValue={product?.slug ?? ""} />
      </div>
      <div className="sw-admin-field sw-admin-field-span">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
        />
      </div>
      <div className="sw-admin-field">
        <label htmlFor="price">Price</label>
        <input
          id="price"
          name="price"
          inputMode="decimal"
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
          placeholder="Get Quote / Enquire"
        />
      </div>
      <div className="sw-admin-field">
        <label htmlFor="currency">Currency</label>
        <input
          id="currency"
          name="currency"
          defaultValue={product?.currency ?? "TZS"}
        />
      </div>
      <div className="sw-admin-field">
        <label htmlFor="category_id">Category</label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={product?.category_id ?? ""}
        >
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.parent_id ? `↳ ${c.name}` : c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="sw-admin-field">
        <label htmlFor="subcategory">Subcategory</label>
        <input
          id="subcategory"
          name="subcategory"
          defaultValue={product?.subcategory ?? ""}
        />
      </div>
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
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          defaultValue={product?.status ?? "draft"}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
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
        label="Product image"
      />

      <div className="sw-admin-toolbar sw-admin-field-span">
        <SubmitButton>{isEdit ? "Save product" : "Create product"}</SubmitButton>
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
