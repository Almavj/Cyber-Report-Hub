import { AnimatedPage } from "@/components/ui/animated-page";
import { useListWriteups } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { format } from "date-fns";

export default function WriteupsList() {
  const [search, setSearch] = useState("");
  const { data: writeups, isLoading } = useListWriteups({ search: search || undefined });
  const writeupsList = Array.isArray(writeups) ? writeups : [];

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <h1 className="text-3xl font-bold font-mono text-primary glow-text-primary">Writeups</h1>
        <Link href="/writeups/new">
          <Button className="font-mono bg-primary text-background hover:bg-primary/90 glow-green">
            <Plus className="w-4 h-4 mr-2" /> NEW WRITEUP
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search target, title, CVE..." 
          className="pl-9 font-mono bg-background/50 border-primary/30 focus-visible:ring-primary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
        ) : writeupsList.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-dashed border-border/50 font-mono text-muted-foreground">
            No writeups found.
          </div>
        ) : (
          writeupsList.map((writeup) => (
            <Link key={writeup.id} href={`/writeups/${writeup.id}`}>
              <Card className="h-full bg-background/30 hover:bg-background/60 border-border/50 hover:border-primary/50 transition-all cursor-pointer group flex flex-col">
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <SeverityBadge severity={writeup.severity} />
                    {writeup.bountyAmount !== null && (
                      <span className="font-mono text-primary text-sm font-bold">${writeup.bountyAmount.toLocaleString()}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {writeup.title}
                  </h3>
                  <div className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                    {writeup.summary || writeup.content}
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono text-muted-foreground pt-4 border-t border-border/30">
                    <span>{writeup.platform}</span>
                    <span>{format(new Date(writeup.createdAt), 'MMM dd, yyyy')}</span>
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
