"use client";

interface RiskScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function RiskScoreBadge({
  score,
  showLabel = true,
  size = "md",
}: RiskScoreBadgeProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 71) return { label: "High", color: "red" };
    if (score >= 31) return { label: "Medium", color: "orange" };
    if (score >= 1) return { label: "Low", color: "yellow" };
    return { label: "Safe", color: "green" };
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "red":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          ring: "ring-red-200",
          bar: "bg-red-500",
        };
      case "orange":
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          ring: "ring-orange-200",
          bar: "bg-orange-500",
        };
      case "yellow":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          ring: "ring-yellow-200",
          bar: "bg-yellow-500",
        };
      default:
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          ring: "ring-green-200",
          bar: "bg-green-500",
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "sm":
        return {
          container: "px-2 py-0.5 text-xs",
          score: "text-sm",
          bar: "h-1",
        };
      case "lg":
        return {
          container: "px-4 py-2",
          score: "text-2xl",
          bar: "h-3",
        };
      default:
        return {
          container: "px-3 py-1 text-sm",
          score: "text-lg",
          bar: "h-2",
        };
    }
  };

  const risk = getRiskLevel(score);
  const colors = getColorClasses(risk.color);
  const sizes = getSizeClasses(size);

  return (
    <div
      className={`inline-flex flex-col ${sizes.container} rounded-lg ${colors.bg} ${colors.text} ring-1 ${colors.ring}`}
    >
      <div className="flex items-center gap-2">
        <span className={`font-bold ${sizes.score}`}>{score}</span>
        {showLabel && (
          <span className="text-xs font-medium opacity-75">/ 100</span>
        )}
      </div>
      
      {/* Progress bar */}
      <div className={`mt-1 w-full ${sizes.bar} bg-white/50 rounded-full overflow-hidden`}>
        <div
          className={`${sizes.bar} ${colors.bar} rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      
      {showLabel && (
        <span className="mt-1 text-xs font-medium">{risk.label} Risk</span>
      )}
    </div>
  );
}

// Circular variant for dashboard stats
export function RiskScoreCircular({
  score,
  size = 60,
  strokeWidth = 6,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const getColor = (score: number) => {
    if (score >= 71) return "#DC2626";
    if (score >= 31) return "#F97316";
    if (score >= 1) return "#EAB308";
    return "#16A34A";
  };

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color: getColor(score) }}>
        {score}
      </span>
    </div>
  );
}
