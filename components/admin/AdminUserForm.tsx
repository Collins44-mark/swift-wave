"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createAdminUser, updateAdminUser } from "@/lib/admin/actions/users";
import type { ManagedUser } from "@/lib/admin/data/users";
import type { AdminRole } from "@/lib/auth/types";

type CompanyOption = { id: string; name: string; slug: string };

export function AdminUserForm({
  companies,
  user,
}: {
  companies: CompanyOption[];
  user?: ManagedUser | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<AdminRole>(user?.role ?? "company_admin");
  const [selected, setSelected] = useState<string[]>(
    user?.companies.map((c) => c.id) ?? []
  );
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(user);

  function toggleCompany(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <form
      className="sw-admin-form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        // Ensure multi-select company ids
        fd.delete("company_ids");
        for (const id of selected) fd.append("company_ids", id);
        fd.set("role", role);
        if (isEdit) {
          fd.set("is_active", fd.get("is_active_toggle") === "on" ? "true" : "false");
        }

        setError(null);
        startTransition(async () => {
          const result = isEdit
            ? await updateAdminUser(user!.id, fd)
            : await createAdminUser(fd);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.push("/admin/settings/users");
          router.refresh();
        });
      }}
    >
      {error ? (
        <div className="sw-admin-alert is-error sw-admin-field-span" role="alert">
          {error}
        </div>
      ) : null}

      <div className="sw-admin-field">
        <label htmlFor="full_name">Full name</label>
        <input
          id="full_name"
          name="full_name"
          required
          defaultValue={user?.full_name ?? ""}
        />
      </div>

      {!isEdit ? (
        <div className="sw-admin-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
      ) : (
        <div className="sw-admin-field">
          <label>Email</label>
          <input value={user?.email ?? ""} disabled readOnly />
        </div>
      )}

      {!isEdit ? (
        <>
          <div className="sw-admin-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="sw-admin-field">
            <label htmlFor="confirm_password">Confirm password</label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
        </>
      ) : null}

      <div className="sw-admin-field">
        <label htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as AdminRole)}
        >
          <option value="super_admin">Super Admin</option>
          <option value="company_admin">Company Admin</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      {isEdit ? (
        <div className="sw-admin-field">
          <label htmlFor="is_active_toggle" className="sw-admin-check-label">
            <input
              id="is_active_toggle"
              name="is_active_toggle"
              type="checkbox"
              defaultChecked={user?.is_active ?? true}
            />{" "}
            Account active
          </label>
        </div>
      ) : null}

      {role !== "super_admin" ? (
        <div className="sw-admin-field sw-admin-field-span">
          <span className="sw-admin-image-field-label">Company access</span>
          <p style={{ margin: "0 0 0.65rem", color: "var(--admin-muted)" }}>
            Select one or more companies this administrator can access.
          </p>
          <div className="sw-admin-company-checkgrid">
            {companies.map((c) => (
              <label key={c.id} className="sw-admin-check-label">
                <input
                  type="checkbox"
                  checked={selected.includes(c.id)}
                  onChange={() => toggleCompany(c.id)}
                />{" "}
                {c.name}
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="sw-admin-alert sw-admin-field-span" role="status">
          Super Admins automatically have access to all companies.
        </div>
      )}

      <div className="sw-admin-toolbar sw-admin-field-span">
        <button type="submit" className="sw-admin-btn" disabled={pending}>
          {pending
            ? "Saving…"
            : isEdit
              ? "Save changes"
              : "Create administrator"}
        </button>
        <Link className="sw-admin-btn sw-admin-btn-ghost" href="/admin/settings/users">
          Cancel
        </Link>
      </div>
    </form>
  );
}
