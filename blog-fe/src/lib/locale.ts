export type Locale = "vn" | "en";

export const LOCALES: Locale[] = ["en", "vn"];
export const DEFAULT_LOCALE: Locale = "en";

export function isValidLocale(value: string): value is Locale {
  return value === "en" || value === "vn";
}

/** Parse segment from URL path — invalid → default en */
export function parseLocale(segment?: string | null): Locale {
  return segment === "vn" ? "vn" : "en";
}

/** Read locale from pathname (`/en/...`, `/vn/...`); non-prefixed paths → en */
export function localeFromPathname(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0];
  return parseLocale(first);
}

/** Build path with locale prefix: `/en`, `/vn/p/slug` */
export function localePath(path: string, locale: Locale): string {
  const [pathname, query] = path.split("?");
  let p = pathname.replace(/^\/(en|vn)(?=\/|$)/, "") || "/";
  if (!p.startsWith("/")) p = `/${p}`;
  const prefixed = p === "/" ? `/${locale}` : `/${locale}${p}`;
  return query ? `${prefixed}?${query}` : prefixed;
}

/** Swap locale segment, keep rest of path */
export function switchLocalePath(pathname: string, target: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 0 && isValidLocale(parts[0])) {
    parts[0] = target;
  } else {
    parts.unshift(target);
  }
  return `/${parts.join("/")}`;
}
