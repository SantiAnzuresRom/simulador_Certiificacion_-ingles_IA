"use client";

type Props = {
  label: string;
  value: number; // 0 - 100
  color: string;
};

export default function ScoreRing({ label, value, color }: Props) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg text-center">
      <svg width="120" height="120" className="mx-auto">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          className="text-xl font-bold fill-[#161616]"
        >
          {value}%
        </text>
      </svg>

      <p className="mt-2 text-sm font-semibold">
        {label}
      </p>
    </div>
  );
}
