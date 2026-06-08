"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { t } from "@/lib/api/i18n";
import { getPublicApiUrl } from "@/lib/env";
import { parseLocale, withLocale } from "@/lib/locale";

function SiteHeaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = parseLocale(searchParams.get("ln"));
  const [strings, setStrings] = useState<Record<string, string>>({});

  useEffect(() => {
    const base = getPublicApiUrl();
    fetch(`${base}/i18n?ln=${locale}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { strings?: Record<string, string> } | null) => {
        if (j?.strings) setStrings(j.strings);
      })
      .catch(() => setStrings({}));
  }, [locale]);

  const homeHref = withLocale("/", locale);
  const adminHref = withLocale("/admin", locale);

  const links = [
    { href: homeHref, label: t(strings, "nav.home", "Trang chủ"), exact: true },
    {
      href: `${homeHref}#about`,
      label: t(strings, "nav.about", "Về tôi"),
      exact: false,
    },
    { href: adminHref, label: t(strings, "nav.admin", "Admin"), exact: false },
  ];

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href={homeHref} className="site-logo">
          <span className="site-logo-dot" />
          <span>{t(strings, "site.name", "Gonzalo")}</span>
        </Link>

        <nav className="site-nav" aria-label="Main">
          {links.map((link) => {
            const active = link.exact
              ? pathname === "/"
              : link.href.includes("/admin")
                ? pathname.startsWith("/admin")
                : false;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`site-nav-link${active ? " site-nav-link--active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="site-header-actions">
          <LocaleSwitcher locale={locale} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function SiteHeader() {
  return (
    <Suspense fallback={<header className="site-header site-header--placeholder" />}>
      <SiteHeaderInner />
    </Suspense>
  );
}
