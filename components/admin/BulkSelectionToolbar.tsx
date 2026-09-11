"use client";

export function BulkSelectionToolbar({
  count,
  onClear,
  onDelete,
}: {
  count: number;
  onClear: () => void;
  onDelete: () => void;
}) {
  if (count < 1) return null;

  return (
    <div className="sw-admin-bulk-toolbar" role="region" aria-label="Bulk selection">
      <strong className="sw-admin-bulk-toolbar-count">
        {count} selected
      </strong>
      <div className="sw-admin-bulk-toolbar-actions">
        <button
          type="button"
          className="sw-admin-btn sw-admin-btn-ghost"
          onClick={onClear}
        >
          Clear Selection
        </button>
        <button
          type="button"
          className="sw-admin-btn sw-admin-btn-danger-solid"
          onClick={onDelete}
        >
          Delete Selected
        </button>
      </div>
    </div>
  );
}
