/** Divide una lista en filas de `size`; la última se completa con `null` para conservar la alineación. */
export function toRows<T>(items: readonly T[], size: number): (T | null)[][] {
  const rows: (T | null)[][] = [];
  for (let i = 0; i < items.length; i += size) {
    const row: (T | null)[] = items.slice(i, i + size);
    while (row.length < size) {
      row.push(null);
    }
    rows.push(row);
  }
  return rows;
}
