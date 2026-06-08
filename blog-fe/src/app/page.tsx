import { AuthorSection } from "@/components/AuthorSection";
import { DevHealthPanel } from "@/components/DevHealthPanel";
import { HomeFeed } from "@/components/HomeFeed";
import { fetchI18n, t } from "@/lib/api/i18n";
import { parseLocale } from "@/lib/locale";

type Props = {
  searchParams: Promise<{ ln?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const { ln } = await searchParams;
  const locale = parseLocale(ln);
  const { strings } = await fetchI18n(locale);

  return (
    <main className="page-container page-container--editorial">
      <div className="stagger-in space-y-12">
        <header className="editorial-hero">
          <p className="editorial-hero-eyebrow">
            {t(strings, "site.hero.eyebrow")}
          </p>
          <h1 className="editorial-hero-title">
            {t(strings, "site.name", "Gonzalo")}
          </h1>
          <p className="editorial-hero-tagline text-balance">
            {t(strings, "site.hero.tagline")}
          </p>
        </header>

        <div id="about">
          <AuthorSection strings={strings} />
        </div>

        <HomeFeed locale={locale} strings={strings} />

        <DevHealthPanel />
      </div>
    </main>
  );
}
