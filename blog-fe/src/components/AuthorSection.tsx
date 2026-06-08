import { t } from "@/lib/api/i18n";

type Props = {
  strings: Record<string, string>;
};

export function AuthorSection({ strings }: Props) {
  return (
    <section className="author-section glass-card">
      <h2 className="section-title">{t(strings, "section.about")}</h2>
      <div className="author-section-inner">
        <div className="author-avatar" aria-hidden>
          G
        </div>
        <div>
          <h3 className="author-name">{t(strings, "author.name", "Gonzalo")}</h3>
          <p className="author-role">{t(strings, "author.role")}</p>
          <p className="author-bio">{t(strings, "author.bio")}</p>
        </div>
      </div>
    </section>
  );
}
