import { AuthorSection } from "@/components/AuthorSection";
import { GlassCard } from "@/components/ui/GlassCard";
import { fetchI18n, t } from "@/lib/api/i18n";
import { parseLocale } from "@/lib/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = parseLocale(localeParam);
  const { strings } = await fetchI18n(locale);

  return (
    <main className="page-container page-container--editorial">
      <div className="stagger-in space-y-10">
        <header className="editorial-hero">
          <p className="editorial-hero-eyebrow">
            {t(strings, "page.about.eyebrow", "About")}
          </p>
          <h1 className="editorial-hero-title">
            {t(strings, "author.name", "Gonzalo")}
          </h1>
          <p className="editorial-hero-tagline text-balance">
            {t(strings, "author.role")}
          </p>
        </header>

        <AuthorSection strings={strings} />

        <GlassCard>
          <div className="about-detail space-y-4">
            <p className="about-detail-text">{t(strings, "author.bio")}</p>
            <p className="about-detail-text">{t(strings, "page.about.body")}</p>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
