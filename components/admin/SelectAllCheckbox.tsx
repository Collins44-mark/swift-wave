"use client";

import { useEffect, useRef } from "react";

export function SelectAllCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className="sw-admin-select-input"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      aria-label={label}
    />
  );
}
