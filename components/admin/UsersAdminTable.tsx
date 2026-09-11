"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { ManagedUser } from "@/lib/admin/data/users";
import { roleLabel } from "@/lib/admin/labels";
import {
  deleteAdminUser,
  setAdminActive,
} from "@/lib/admin/client-actions";
import { ConfirmationDialog } from "@/components/admin/ConfirmationDialog";
import { useAdminToastContext } from "@/components/admin/AdminToastProvider";

export function UsersAdminTable({ users }: { users: ManagedUser[] }) {
  const { showSuccess, showError } = useAdminToastContext();
  const [items, setItems] = useState(users);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [company, setCompany] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);

  const companyOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of items) {
      for (const c of u.companies) map.set(c.id, c.name);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const filtered = items.filter((u) => {
    const hay = `${u.full_name ?? ""} ${u.email ?? ""}`.toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (role !== "all" && u.role !== role) return false;
    if (company !== "all") {
      if (u.role === "super_admin") return true;
      if (!u.companies.some((c) => c.id === company)) return false;
    }
    return true;
  });

  return (
    <div className="sw-admin-users">
      <div className="sw-admin-toolbar">
        <div className="sw-admin-users-filters">
          <input
            type="search"
            placeholder="Search name or email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search users"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-label="Filter by role"
          >
            <option value="all">All roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="company_admin">Company Admin</option>
            <option value="staff">Staff</option>
          </select>
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            aria-label="Filter by company"
          >
            <option value="all">All companies</option>
            {companyOptions.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <Link className="sw-admin-btn" href="/admin/settings/users/new">
          + Add Administrator
        </Link>
      </div>

      {error ? (
        <div className="sw-admin-alert is-error" role="alert">
          {error}
        </div>
      ) : null}

      {!filtered.length ? (
        <div className="sw-admin-empty">No administrators match your filters.</div>
      ) : (
        <div className="sw-admin-table-wrap">
          <table className="sw-admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Companies</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.full_name || "—"}</strong>
                  </td>
                  <td>{u.email || "—"}</td>
                  <td>{roleLabel(u.role)}</td>
                  <td>
                    {u.role === "super_admin"
                      ? "All companies"
                      : u.companies.map((c) => c.name).join(", ") || "—"}
                  </td>
                  <td>
                    <span
                      className={`sw-admin-badge ${
                        u.is_active ? "is-active" : "is-inactive"
                      }`}
                    >
                      {u.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    <div className="sw-admin-media-actions">
                      <Link
                        className="sw-admin-btn sw-admin-btn-ghost"
                        href={`/admin/settings/users/${u.id}`}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="sw-admin-btn sw-admin-btn-ghost"
                        disabled={pending}
                        onClick={() => {
                          setError(null);
                          startTransition(async () => {
                            const res = await setAdminActive(u.id, !u.is_active);
                            if (!res.ok) {
                              setError(res.error);
                              showError("Couldn't update this administrator.");
                              return;
                            }
                            setItems((prev) =>
                              prev.map((row) =>
                                row.id === u.id
                                  ? { ...row, is_active: !row.is_active }
                                  : row
                              )
                            );
                            showSuccess("Changes saved.");
                          });
                        }}
                      >
                        {u.is_active ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        className="sw-admin-btn sw-admin-btn-ghost"
                        disabled={pending}
                        onClick={() => setDeleteTarget(u)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        title="Delete Administrator?"
        error={error}
        pending={pending}
        confirmLabel="Delete Administrator"
        pendingLabel="Deleting..."
        onCancel={() => {
          if (pending) return;
          setDeleteTarget(null);
          setError(null);
        }}
        onConfirm={() => {
          if (!deleteTarget) return;
          const deletedId = deleteTarget.id;
          setError(null);
          startTransition(async () => {
            const res = await deleteAdminUser(deletedId);
            if (!res.ok) {
              setError(res.error);
              showError("Couldn't delete this administrator.");
              return;
            }
            setItems((prev) => prev.filter((row) => row.id !== deletedId));
            setDeleteTarget(null);
            showSuccess("Administrator deleted.");
          });
        }}
      >
        <p>
          This permanently removes the Auth account and profile. Business
          records they created are preserved.
        </p>
        {deleteTarget ? (
          <p>
            {deleteTarget.full_name || "—"}
            <br />
            {deleteTarget.email || "—"}
            <br />
            {roleLabel(deleteTarget.role)}
          </p>
        ) : null}
        <p>This action cannot be undone.</p>
      </ConfirmationDialog>
    </div>
  );
}
