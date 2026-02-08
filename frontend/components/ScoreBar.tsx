"use client";

function getScoreColor(score: number): string {
  if (score >= 8) return "from-emerald-500 to-green-400";
  if (score >= 6) return "from-amber-500 to-yellow-400";
  if (score >= 4) return "from-orange-500 to-amber-400";
  return "from-gray-500 to-gray-400";
}

function getScoreLabel(score: number): string {
  if (score >= 8) return "Hot";
  if (score >= 6) return "Warm";
  if (score >= 4) return "Moderate";
  return "Low";
}

export default function ScoreBar({ score }: { score: number }) {
  const maxScore = 10;
  const percentage = Math.min((score / maxScore) * 100, 100);
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-300 w-16 text-right">
        {score.toFixed(1)} <span className="text-xs text-gray-500">{label}</span>
      </span>
    </div>
  );
}
