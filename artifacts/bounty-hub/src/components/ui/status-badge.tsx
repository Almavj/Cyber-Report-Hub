import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = status.toLowerCase();
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-xs uppercase tracking-wider rounded-none border border-primary/50 text-primary bg-primary/5 glow-green",
        s === "draft" && "border-muted-foreground/50 text-muted-foreground bg-muted shadow-none",
        s === "resolved" && "border-cyan-500 text-cyan-500 bg-cyan-500/10 glow-cyan",
        s === "invalid" && "border-red-500 text-red-500 bg-red-500/10 glow-red",
        s === "duplicate" && "border-orange-500 text-orange-500 bg-orange-500/10 glow-orange",
        className
      )}
    >
      {status}
    </Badge>
  );
}
