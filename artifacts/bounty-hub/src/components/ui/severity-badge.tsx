import { Badge } from "@/components/ui/badge";
import { WriteupSeverity } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: string;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const isCritical = severity === "critical";
  const isHigh = severity === "high";
  const isMedium = severity === "medium";
  const isLow = severity === "low";
  const isInfo = severity === "info";

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-xs uppercase tracking-wider rounded-none border",
        isCritical && "text-red-500 glow-red border-red-500 bg-red-500/10",
        isHigh && "text-orange-500 glow-orange border-orange-500 bg-orange-500/10",
        isMedium && "text-yellow-500 glow-yellow border-yellow-500 bg-yellow-500/10",
        isLow && "text-green-500 glow-green border-green-500 bg-green-500/10",
        isInfo && "text-cyan-500 glow-cyan border-cyan-500 bg-cyan-500/10",
        className
      )}
    >
      {severity}
    </Badge>
  );
}
