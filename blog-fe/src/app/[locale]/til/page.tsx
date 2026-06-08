import { SectionPlaceholder } from "@/components/SectionPlaceholder";
import { fetchI18n, t } from "@/lib/api/i18n";
import { parseLocale } from "@/lib/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TilPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = parseLocale(localeParam);
  const { strings } = await fetchI18n(locale);

  return (
    <SectionPlaceholder
      title={t(strings, "page.til.title", "TIL")}
      description={t(strings, "page.til.empty")}
    />
  );
}
