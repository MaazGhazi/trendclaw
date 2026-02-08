"use client";

import { useEffect, useState } from "react";
import DigestCard from "../components/DigestCard";
import { getDigestsLatest } from "../lib/api";

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

export default function Dashboard() {
  const [digests, setDigests] = useState<Digest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDigestsLatest();
        setDigests(data);
      } catch (err) {
        console.error("Failed to load digests:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Latest sales signals and opportunities
        </p>
      </div>

      {/* Stats */}
      {digests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <p className="text-sm text-gray-400">Signals Found</p>
            <p className="text-2xl font-bold text-white mt-1">{digests.length}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <p className="text-sm text-gray-400">Avg Score</p>
            <p className="text-2xl font-bold text-white mt-1">
              {(digests.reduce((sum, d) => sum + d.score, 0) / digests.length).toFixed(1)}
            </p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <p className="text-sm text-gray-400">Top Signal</p>
            <p className="text-2xl font-bold text-teal-400 mt-1">
              {getMostCommonType(digests)}
            </p>
          </div>
        </div>
      )}

      {/* Digest Cards */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 animate-pulse"
            >
              <div className="h-6 bg-gray-700 rounded w-1/3 mb-3" />
              <div className="h-2 bg-gray-700 rounded w-full mb-3" />
              <div className="h-16 bg-gray-700/50 rounded mb-3" />
              <div className="h-12 bg-gray-700/30 rounded" />
            </div>
          ))}
        </div>
      ) : digests.length === 0 ? (
        <div className="text-center py-20">
          <svg
            className="w-16 h-16 text-gray-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">
            No signals found
          </h2>
          <p className="text-gray-500">
            Add clients and keywords in Settings, then click &ldquo;Run Scan&rdquo; to
            discover opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {digests.map((digest) => (
            <DigestCard key={digest.id} digest={digest} />
          ))}
        </div>
      )}
    </div>
  );
}

function getMostCommonType(digests: Digest[]): string {
  const counts: Record<string, number> = {};
  for (const d of digests) {
    counts[d.signal_type] = (counts[d.signal_type] || 0) + 1;
  }
  let max = 0;
  let maxType = "";
  for (const [type, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      maxType = type;
    }
  }
  const labels: Record<string, string> = {
    FUNDING: "Funding",
    HIRING: "Hiring",
    PRODUCT_LAUNCH: "Launch",
    EXPANSION: "Expansion",
    PARTNERSHIP: "Partnership",
  };
  return labels[maxType] || maxType;
}
