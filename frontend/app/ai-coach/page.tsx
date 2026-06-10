"use client";

import { useState, useEffect } from "react";

export default function AICoachPage() {
  const [recommendation, setRecommendation] = useState<{ suggestionText: string; impactCategory: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRecommendation() {
      try {
        // First get the latest footprint ID
        const footRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/carbon`, { credentials: "include" });
        if (!footRes.ok) throw new Error("Failed to fetch footprints");
        const footData = await footRes.json();
        const latest = footData.history?.[footData.history.length - 1];

        if (!latest) {
          setError("No footprint logged yet. Please log a footprint to get AI recommendations.");
          setLoading(false);
          return;
        }

        const aiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/ai-coach`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ footprintId: latest.id }),
          credentials: "include",
        });

        if (!aiRes.ok) {
          const aiData = await aiRes.json();
          throw new Error(aiData.error || "Failed to get AI recommendation");
        }

        const aiData = await aiRes.json();
        setRecommendation(aiData.recommendation);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendation();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">AI Carbon Coach</h1>
      
      {loading && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center animate-pulse">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-slate-600">Analyzing your footprint signature...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 text-red-700" role="alert">
          {error}
        </div>
      )}

      {recommendation && !loading && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-emerald-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl" aria-hidden="true">💡</div>
          <h2 className="text-sm font-bold tracking-wider text-emerald-600 uppercase mb-2">
            Priority: {recommendation.impactCategory}
          </h2>
          <p className="text-xl text-slate-800 leading-relaxed relative z-10">
            {recommendation.suggestionText}
          </p>
        </div>
      )}
    </div>
  );
}
