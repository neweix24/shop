export function normalizeBangladeshPhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("01") ? `88${digits}` : digits;
  return /^8801[3-9][0-9]{8}$/.test(normalized) ? `+${normalized}` : null;
}
