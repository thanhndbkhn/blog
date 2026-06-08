"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/locale";
import { withLocale } from "@/lib/locale";

type Props = {
  locale: Locale;
};

export function LocaleSwitcher({ locale }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.toString();
  const pathWithQuery = current ? `${pathname}?${current}` : pathname;

  const other: Locale = locale === "vn" ? "en" : "vn";
  const href = withLocale(pathWithQuery, other);

  return (
    <div className="locale-switcher" role="group" aria-label="Language">
      <Link
        href={withLocale(pathWithQuery, "vn")}
        className={`locale-switcher-btn${locale === "vn" ? " locale-switcher-btn--active" : ""}`}
        aria-current={locale === "vn" ? "true" : undefined}
      >
        VN
      </Link>
      <Link
        href={withLocale(pathWithQuery, "en")}
        className={`locale-switcher-btn${locale === "en" ? " locale-switcher-btn--active" : ""}`}
        aria-current={locale === "en" ? "true" : undefined}
      >
        EN
      </Link>
      <span className="sr-only">
        Current: {locale.toUpperCase()}. Switch to{" "}
        <Link href={href}>{other.toUpperCase()}</Link>
      </span>
    </div>
  );
}
