"use client";

import SignalBadge from "./SignalBadge";
import ScoreBar from "./ScoreBar";

interface Digest {
  id: number;
  entity: string;
  signal_type: string;
  summary: string;
  score: number;
  url: string;
  outreach_snippet: string;
  content_hook: string;
  date: string;
}

export default function DigestCard({ digest }: { digest: Digest }) {
  return (
    <div className="relative group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:border-teal-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{digest.entity}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{digest.date}</p>
        </div>
        <SignalBadge type={digest.signal_type} />
      </div>

      {/* Score */}
      <div className="mb-3">
        <ScoreBar score={digest.score} />
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-300 mb-4 leading-relaxed">{digest.summary}</p>

      {/* Outreach Snippet */}
      <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-3 mb-3">
        <p className="text-xs font-medium text-teal-400 mb-1">Outreach Hook</p>
        <p className="text-sm text-gray-300 italic">&ldquo;{digest.outreach_snippet}&rdquo;</p>
      </div>

      {/* Content Hook */}
      <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-3 mb-3">
        <p className="text-xs font-medium text-cyan-400 mb-1">Content Angle</p>
        <p className="text-sm text-gray-300">{digest.content_hook}</p>
      </div>

      {/* Link */}
      {digest.url && (
        <a
          href={digest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs text-teal-400 hover:text-teal-300 transition-colors"
        >
          View Source &rarr;
        </a>
      )}
    </div>
  );
}
