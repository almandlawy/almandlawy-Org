/** Export website quote rows to CSV for admin desk workflows. */

function csvCell(value: unknown): string {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

function pickField(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const val = row[key];
    if (val !== undefined && val !== null && String(val).trim()) {
      return String(val);
    }
  }
  return "";
}

export function quotesToCsv(quotes: Record<string, unknown>[]): string {
  const headers = [
    "id",
    "name",
    "email",
    "phone",
    "company",
    "country_city",
    "metal_interest",
    "product_category",
    "weight",
    "status",
    "source",
    "created_at",
  ];

  const rows = quotes.map((q) =>
    [
      pickField(q, "id"),
      pickField(q, "name"),
      pickField(q, "email"),
      pickField(q, "phone"),
      pickField(q, "company"),
      pickField(q, "countryCity", "country_city"),
      pickField(q, "metalInterest", "metal_interest"),
      pickField(q, "productCategory", "product_category"),
      pickField(q, "weight", "weight_preference"),
      pickField(q, "status"),
      pickField(q, "source"),
      pickField(q, "created_at"),
    ]
      .map(csvCell)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export function downloadQuotesCsv(
  quotes: Record<string, unknown>[],
  filename = "pgr-quote-leads.csv"
): void {
  const csv = quotesToCsv(quotes);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
