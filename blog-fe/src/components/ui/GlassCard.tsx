type Props = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
};

export function GlassCard({ children, className = "", title, subtitle }: Props) {
  return (
    <section className={`glass-card ${className}`}>
      {(title || subtitle) && (
        <header className="glass-card-header">
          {title && <h2 className="glass-card-title">{title}</h2>}
          {subtitle && <p className="glass-card-subtitle">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
