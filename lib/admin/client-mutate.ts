export async function adminMutate<T>(
  action: string,
  payload: FormData | Record<string, unknown>
): Promise<T> {
  const started = Date.now();
  const isForm = payload instanceof FormData;
  const body = isForm ? payload : JSON.stringify({ _action: action, ...payload });
  if (isForm) {
    payload.set("_action", action);
  }

  const response = await fetch("/api/admin/mutate", {
    method: "POST",
    credentials: "same-origin",
    headers: isForm ? undefined : { "Content-Type": "application/json" },
    body,
  });

  let result: T & { error?: string; ok?: boolean };
  try {
    result = (await response.json()) as T & { error?: string; ok?: boolean };
  } catch {
    throw new Error("Couldn't save changes. Please try again.");
  }

  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.info(
      `[Admin Mutation] ${action}: ${Date.now() - started}ms (http ${response.status})`
    );
  }

  if (!response.ok && result?.ok !== false) {
    throw new Error(result?.error || "Couldn't save changes. Please try again.");
  }

  return result;
}
