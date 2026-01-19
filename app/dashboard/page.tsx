"use client";

import ScoreRing from "@/app/components/page";
import { useState } from "react";

export default function DashboardPage() {
  const [level, setLevel] = useState("A1");

  return (
    <div className="min-h-screen bg-[#fbfaf7] px-6 py-14">

      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[#161616]">
          English Dashboard
        </h1>
        <p className="text-sm text-[#161616]/70 mt-2">
          Select your English level and track your progress
        </p>
      </div>

      {/* LEVEL SELECTOR */}
      <div className="flex justify-center mb-14">
        <div className="bg-white border border-[#59d2ec] rounded-xl p-2 flex gap-2 shadow-md">

          {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition
                ${level === lvl
                  ? "bg-[#59d2ec] text-white"
                  : "text-[#161616] hover:bg-[#59d2ec]/10"}
              `}
            >
              {lvl}
            </button>
          ))}

        </div>
      </div>

      {/* SCORES */}
      <div className="max-w-6xl mx-auto">

        <h2 className="text-xl font-semibold text-[#161616] text-center mb-8">
          Skill Scores – Level {level}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          <ScoreRing
            label="Speaking"
            value={72}
            color="#59d2ec"
          />

          <ScoreRing
            label="Listening"
            value={85}
            color="#029e99"
          />

          <ScoreRing
            label="Writing"
            value={64}
            color="#161616"
          />

          <ScoreRing
            label="Reading"
            value={78}
            color="#4b5563"
          />

        </div>
      </div>

    </div>
  );
}
