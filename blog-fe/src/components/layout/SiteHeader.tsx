"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { t } from "@/lib/api/i18n";
import { getPublicApiUrl } from "@/lib/env";
import { localeFromPathname, localePath } from "@/lib/locale";

type NavItem = {
  id: string;
  href: string;
  labelKey: string;
  fallback: string;
};

function SiteHeaderInner() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
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

  const aboutHref = localePath("/about", locale);
  const blogsHref = localePath("/blogs", locale);

  const links: NavItem[] = [
    { id: "about", href: aboutHref, labelKey: "nav.about", fallback: "About" },
    { id: "blogs", href: blogsHref, labelKey: "nav.blogs", fallback: "Blogs" },
    { id: "til", href: localePath("/til", locale), labelKey: "nav.til", fallback: "TIL" },
    {
      id: "notes",
      href: localePath("/notes", locale),
      labelKey: "nav.notes",
      fallback: "Notes",
    },
  ];

  function isActive(item: NavItem): boolean {
    if (item.id === "about") return pathname === aboutHref;
    if (item.id === "blogs") {
      return (
        pathname === blogsHref || pathname.startsWith(`${blogsHref}/`) ||
        pathname.includes("/p/")
      );
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href={aboutHref} className="site-logo">
          <span className="site-logo-dot" />
          <span>{t(strings, "site.name", "Gonzalo")}</span>
        </Link>

        <nav className="site-nav" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`site-nav-link${isActive(link) ? " site-nav-link--active" : ""}`}
            >
              {t(strings, link.labelKey, link.fallback)}
            </Link>
          ))}
        </nav>

        <div className="site-header-actions">
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
