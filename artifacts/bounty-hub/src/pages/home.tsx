import { useGetDashboardStats, useGetRecentActivity, useListWriteups } from "@workspace/api-client-react";
import { AnimatedPage } from "@/components/ui/animated-page";
import { HeroScene } from "@/components/3d/HeroScene";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "wouter";
import { format } from "date-fns";
import { ChevronRight, Target, Award, TerminalSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();
  const { data: featuredWriteups, isLoading: writeupsLoading } = useListWriteups({ featured: true });

  return (
    <AnimatedPage>
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center text-center -mx-4 -mt-8 mb-12 px-4 py-20 overflow-hidden border-b border-border/50 bg-background/50">
        <HeroScene />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-sm text-primary border border-primary/30 bg-primary/10 glow-green mb-4">
            <TerminalSquare className="w-4 h-4" />
            <span>ACCESS GRANTED: LEVEL 9 CLEARANCE</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-mono tracking-tighter text-foreground glitch-text" data-text="ELITE THREAT INTEL">
            ELITE THREAT INTEL
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto border-l-2 border-primary/50 pl-4 text-left">
            Security research, vulnerability disclosures, and critical writeups from the edge of the internet.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            <Link href="/writeups" className="inline-flex items-center justify-center h-12 px-8 font-mono font-bold text-background bg-primary hover:bg-primary/90 transition-colors glow-green">
              READ WRITEUPS <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/reports" className="inline-flex items-center justify-center h-12 px-8 font-mono font-bold text-primary border border-primary hover:bg-primary/10 transition-colors">
              VIEW REPORTS
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-background/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-mono text-muted-foreground">TOTAL BOUNTY</CardTitle>
            <Award className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-3xl font-bold font-mono text-primary glow-text-primary">
                ${stats?.totalBounty?.toLocaleString() || 0}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-background/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-mono text-muted-foreground">RESOLVED REPORTS</CardTitle>
            <img src="/Alma101.png" alt="Resolved Reports" className="w-4 h-4" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold font-mono text-cyan-500">
                {stats?.resolvedReports || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-background/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-mono text-muted-foreground">CRITICAL FINDINGS</CardTitle>
            <Target className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-3xl font-bold font-mono text-red-500">
                {stats?.criticalCount || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h2 className="text-2xl font-mono font-bold text-foreground">Featured Writeups</h2>
            <Link href="/writeups" className="text-sm text-primary hover:underline font-mono">View all</Link>
          </div>
          
          <div className="space-y-4">
            {writeupsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
            ) : featuredWriteups?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground font-mono border border-dashed border-border/50">No featured writeups.</div>
            ) : (
              featuredWriteups?.map(writeup => (
                <Link key={writeup.id} href={`/writeups/${writeup.id}`}>
                  <Card className="group cursor-pointer bg-background/30 hover:bg-background/60 border-border/30 hover:border-primary/50 transition-all">
                    <CardContent className="p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{writeup.title}</h3>
                        <SeverityBadge severity={writeup.severity} />
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2">{writeup.summary || writeup.content}</div>
                      <div className="flex items-center gap-4 text-xs font-mono mt-2">
                        <span className="text-muted-foreground">{format(new Date(writeup.createdAt), 'MMM dd, yyyy')}</span>
                        {writeup.bountyAmount !== null && (
                          <span className="text-primary">${writeup.bountyAmount.toLocaleString()}</span>
                        )}
                        <span className="text-muted-foreground">{writeup.platform}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h2 className="text-2xl font-mono font-bold text-foreground">System Activity log</h2>
          </div>
          
          <div className="bg-background/30 border border-border/50 p-4 font-mono text-sm relative overflow-hidden">
            <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-border/50" />
            <div className="space-y-4 relative">
              {activityLoading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
              ) : activity?.length === 0 ? (
                <div className="text-muted-foreground">No recent activity.</div>
              ) : (
                activity?.map((item, i) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="mt-1 w-2 h-2 rounded-full bg-primary glow-green z-10 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm:ss')}</span>
                        {item.type === 'report' ? (
                          <StatusBadge status={item.status || 'unknown'} className="text-[10px] py-0 h-4" />
                        ) : (
                          <SeverityBadge severity={item.severity} className="text-[10px] py-0 h-4" />
                        )}
                      </div>
                      <div className="text-foreground mt-1">
                        [{item.type.toUpperCase()}] {item.title}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
