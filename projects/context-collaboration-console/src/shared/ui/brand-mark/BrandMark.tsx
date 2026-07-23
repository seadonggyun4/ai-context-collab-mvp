import "./brand-mark.css";

interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <span className="brand-mark" aria-label="Context Console">
      <span className="brand-mark__symbol" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {!compact && <span className="brand-mark__name">Context Console</span>}
    </span>
  );
}
