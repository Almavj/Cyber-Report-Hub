import { AnimatedPage } from "@/components/ui/animated-page";
import { useListReports } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";

export default function ReportsList() {
  const [search, setSearch] = useState("");
  const { data: reports, isLoading } = useListReports({ search: search || undefined });

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <h1 className="text-3xl font-bold font-mono text-cyan-500 glow-cyan">Reports</h1>
        <Link href="/reports/new">
          <Button className="font-mono bg-cyan-500 text-foreground hover:bg-cyan-600 glow-cyan">
            <Plus className="w-4 h-4 mr-2" /> NEW REPORT
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search target, title, vulnerability..." 
          className="pl-9 font-mono bg-background/50 border-cyan-500/30 focus-visible:ring-cyan-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
        ) : reports?.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-dashed border-border/50 font-mono text-muted-foreground">
            No reports found.
          </div>
        ) : (
          reports?.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card className="h-full bg-background/30 hover:bg-background/60 border-border/50 hover:border-cyan-500/50 transition-all cursor-pointer group">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <StatusBadge status={report.status} />
                      <SeverityBadge severity={report.severity} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{format(new Date(report.createdAt), 'yyyy-MM-dd')}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-cyan-500 transition-colors truncate">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm font-mono mt-1 text-muted-foreground">
                      <span className="text-primary truncate">{report.target}</span>
                      <span className="truncate">{report.vulnerability}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </AnimatedPage>
  );
}
