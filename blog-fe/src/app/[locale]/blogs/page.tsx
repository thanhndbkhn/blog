import { HomeFeed } from "@/components/HomeFeed";
import { fetchI18n, t } from "@/lib/api/i18n";
import { parseLocale } from "@/lib/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BlogsPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = parseLocale(localeParam);
  const { strings } = await fetchI18n(locale);

  return (
    <main className="page-container page-container--editorial">
      <div className="stagger-in space-y-10">
        <header className="editorial-hero">
          <p className="editorial-hero-eyebrow">
            {t(strings, "nav.blogs", "Blogs")}
          </p>
          <h1 className="editorial-hero-title">
            {t(strings, "page.blogs.title")}
          </h1>
          <p className="editorial-hero-tagline text-balance">
            {t(strings, "page.blogs.subtitle")}
          </p>
        </header>

        <HomeFeed locale={locale} strings={strings} />
      </div>
    </main>
  );
}
