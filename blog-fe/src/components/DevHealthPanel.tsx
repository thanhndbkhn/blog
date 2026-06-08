import { HealthCheck } from "@/components/HealthCheck";
import { GlassCard } from "@/components/ui/GlassCard";

/** Chỉ hiện khi dev — không làm giảm cảm giác production trên homepage */
export function DevHealthPanel() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <GlassCard title="Dev only" subtitle="API health — ẩn khi build production">
      <HealthCheck />
    </GlassCard>
  );
}
