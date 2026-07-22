interface MetricCardProps {
  label: string;
  value: number | string;
  description: string;
  tone?: "normal" | "warning" | "danger" | "muted";
}

export function MetricCard({
  label,
  value,
  description,
  tone = "normal"
}: MetricCardProps) {
  return (
    <article className="metric-card" data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{description}</p>
    </article>
  );
}
