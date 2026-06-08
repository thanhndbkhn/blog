import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/locale";

export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}/about`);
}
