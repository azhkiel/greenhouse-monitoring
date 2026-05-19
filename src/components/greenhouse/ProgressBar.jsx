"use client";

export default function ProgressBar({ value, max = 100, barClass = "bg-gh-rose", height = "h-2" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`w-full ${height} bg-gh-blush rounded-full overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ${barClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}