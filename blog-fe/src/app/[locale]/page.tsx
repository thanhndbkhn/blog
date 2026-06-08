import { redirect } from "next/navigation";
import { isValidLocale } from "@/lib/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleIndexPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) redirect("/en/about");
  redirect(`/${locale}/about`);
}
