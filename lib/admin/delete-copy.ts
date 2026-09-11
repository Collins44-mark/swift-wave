export function bulkDeleteCopy(
  count: number,
  singular: string,
  plural: string
) {
  const noun = count === 1 ? singular : plural;
  const titled =
    count === 1
      ? `${singular.charAt(0).toUpperCase()}${singular.slice(1)}`
      : `${plural.charAt(0).toUpperCase()}${plural.slice(1)}`;
  return {
    title: `Delete ${count} ${noun}?`,
    body: `You are about to permanently delete ${count} selected ${noun}.`,
    confirmLabel: `Delete ${count} ${titled}`,
    pendingLabel: `Deleting ${count}...`,
    success: `${count} ${noun} deleted successfully`,
  };
}
