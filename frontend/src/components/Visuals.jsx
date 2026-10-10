export function RangeBar({ label, value, min, max, normalMin, normalMax, unit }) {
  const clamp = (v) => Math.min(max, Math.max(min, v));
  const toPercent = (v) => ((clamp(v) - min) / (max - min)) * 100;
  const hasValue = value !== null && value !== undefined && !Number.isNaN(value);
  const markerPos = hasValue ? toPercent(value) : null;
  const normalLeft = normalMin != null ? toPercent(normalMin) : null;
  const normalWidth = normalMin != null ? toPercent(normalMax) - normalLeft : null;

  return (
    <div className="range-bar">
      <div className="range-bar-label">
        <span>{label}</span>
        <span className="range-bar-value">
          {hasValue ? `${value}${unit}` : normalMin != null ? `${normalMin}–${normalMax}${unit} normal` : "—"}
        </span>
      </div>
      <div className="range-bar-track">
        {normalLeft != null && (
          <div
            className="range-bar-normal"
            style={{ left: `${normalLeft}%`, width: `${normalWidth}%` }}
            title="Typical healthy range"
          />
        )}
        {hasValue && <div className="range-bar-marker" style={{ left: `${markerPos}%` }} />}
      </div>
      <div className="range-bar-scale">
        <span>{min}</span>
        {normalMin != null && <span className="range-bar-scale-normal">normal range</span>}
        <span>{max}</span>
      </div>
    </div>
  );
}

export function ProbabilityRing({ probability, positive, color }) {
  const pct = Math.round(probability * 100);
  const ringColor = positive ? (color || "#d9486b") : "#2f9e75";
  return (
    <div
      className="prob-ring"
      style={{ background: `conic-gradient(${ringColor} ${pct}%, #ececf4 ${pct}% 100%)` }}
    >
      <div className="prob-ring-inner">
        <span className="prob-ring-value">{pct}%</span>
        <span className="prob-ring-caption">est. risk</span>
      </div>
    </div>
  );
}

export function Sparkline({ data, width = 280, height = 56 }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data
    .map((d, i) => {
      const x = i * stepX;
      const y = height - 6 - ((d - min) / range) * (height - 12);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="sparkline" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="#5b63d3" strokeWidth="2" />
    </svg>
  );
}
