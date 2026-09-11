type DbError = { code?: string; message?: string } | null;

export function isMissingColumnError(error: DbError, column?: string): boolean {
  if (!error) return false;
  const message = (error.message || "").toLowerCase();
  const looksMissing =
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /schema cache|does not exist|could not find/i.test(error.message || "");
  if (!looksMissing) return false;
  return column ? message.includes(column.toLowerCase()) : true;
}

export function isForeignKeyError(error: DbError): boolean {
  if (!error) return false;
  return (
    error.code === "23503" ||
    /foreign key|violates foreign key/i.test(error.message || "")
  );
}

export function formatSupabaseError(
  operation: string,
  error: { code?: string; message?: string } | null,
  fallback: string
): string {
  if (!error?.message && !error?.code) return fallback;
  const code = error.code ? ` [${error.code}]` : "";
  return `${fallback} (${operation}${code}: ${error.message || "unknown error"})`;
}
