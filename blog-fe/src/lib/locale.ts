export type Locale = "vn" | "en";

export const DEFAULT_LOCALE: Locale = "vn";

export function parseLocale(ln?: string | string[] | null): Locale {
  const raw = Array.isArray(ln) ? ln[0] : ln;
  return raw === "en" ? "en" : "vn";
}

export function withLocale(path: string, locale: Locale): string {
  const [base, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set("ln", locale);
  const q = params.toString();
  return q ? `${base}?${q}` : `${base}?ln=${locale}`;
}
