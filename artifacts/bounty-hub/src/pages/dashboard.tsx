import { AnimatedPage } from "@/components/ui/animated-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Activity, Target, ShieldCheck, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <AnimatedPage className="space-y-6">
        <h1 className="text-3xl font-bold font-mono border-b border-border/50 pb-4">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <h1 className="text-3xl font-bold font-mono flex items-center gap-2">
          <BarChart className="w-8 h-8 text-primary" />
          Metrics Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-background/50 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-mono text-muted-foreground">TOTAL BOUNTY</CardTitle>
            <Target className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-primary glow-text-primary">
              ${stats?.totalBounty?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-cyan-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-mono text-muted-foreground">RESOLVED REPORTS</CardTitle>
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-cyan-500 glow-cyan">
              {stats?.resolvedReports || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Out of {stats?.totalReports || 0} total</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-mono text-muted-foreground">ACTIVE REPORTS</CardTitle>
            <Activity className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-orange-500 glow-orange">
              {stats?.activeReports || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-mono text-muted-foreground">PUBLISHED WRITEUPS</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {stats?.totalWriteups || 0}
            </div>
            <p className="text-xs text-primary mt-1 font-mono">{stats?.featuredWriteups || 0} featured</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold font-mono mt-8 mb-4 border-b border-border/50 pb-2">Findings by Severity</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-500/10 border border-red-500/50 p-6 flex flex-col items-center justify-center glow-red">
          <div className="text-sm font-mono text-red-500 mb-2">CRITICAL</div>
          <div className="text-4xl font-bold text-red-500">{stats?.criticalCount || 0}</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/50 p-6 flex flex-col items-center justify-center glow-orange">
          <div className="text-sm font-mono text-orange-500 mb-2">HIGH</div>
          <div className="text-4xl font-bold text-orange-500">{stats?.highCount || 0}</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/50 p-6 flex flex-col items-center justify-center glow-yellow">
          <div className="text-sm font-mono text-yellow-500 mb-2">MEDIUM</div>
          <div className="text-4xl font-bold text-yellow-500">{stats?.mediumCount || 0}</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/50 p-6 flex flex-col items-center justify-center glow-green">
          <div className="text-sm font-mono text-green-500 mb-2">LOW</div>
          <div className="text-4xl font-bold text-green-500">{stats?.lowCount || 0}</div>
        </div>
      </div>
    </AnimatedPage>
  );
}
