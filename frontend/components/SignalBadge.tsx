"use client";

const SIGNAL_COLORS: Record<string, string> = {
  FUNDING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  HIRING: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  PRODUCT_LAUNCH: "bg-green-500/20 text-green-400 border-green-500/30",
  EXPANSION: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  PARTNERSHIP: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const SIGNAL_LABELS: Record<string, string> = {
  FUNDING: "Funding",
  HIRING: "Hiring",
  PRODUCT_LAUNCH: "Product Launch",
  EXPANSION: "Expansion",
  PARTNERSHIP: "Partnership",
};

export default function SignalBadge({ type }: { type: string }) {
  const colors = SIGNAL_COLORS[type] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  const label = SIGNAL_LABELS[type] || type;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors}`}
    >
      {label}
    </span>
  );
}
