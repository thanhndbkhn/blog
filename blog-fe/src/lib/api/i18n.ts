import type { Locale } from "@/lib/locale";
import { getPublicApiUrl } from "@/lib/env";

export type I18nBundle = {
  locale: Locale;
  strings: Record<string, string>;
};

export async function fetchI18n(locale: Locale): Promise<I18nBundle> {
  const base = getPublicApiUrl();
  const r = await fetch(`${base}/i18n?ln=${locale}`, {
    next: { revalidate: 300 },
  });
  if (!r.ok) throw new Error(`i18n ${r.status}`);
  return r.json() as Promise<I18nBundle>;
}

export function t(
  strings: Record<string, string>,
  key: string,
  fallback = "",
): string {
  return strings[key] ?? fallback;
}
