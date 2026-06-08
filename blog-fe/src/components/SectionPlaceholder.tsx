import { GlassCard } from "@/components/ui/GlassCard";

type Props = {
  title: string;
  description: string;
};

export function SectionPlaceholder({ title, description }: Props) {
  return (
    <main className="page-container page-container--editorial">
      <div className="stagger-in space-y-8">
        <header className="editorial-hero">
          <h1 className="editorial-hero-title">{title}</h1>
        </header>
        <GlassCard>
          <p className="text-muted leading-relaxed">{description}</p>
        </GlassCard>
      </div>
    </main>
  );
}
