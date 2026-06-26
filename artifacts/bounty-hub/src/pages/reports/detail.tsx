import { AnimatedPage } from "@/components/ui/animated-page";
import { useGetReport, useDeleteReport, getListReportsQueryKey } from "@workspace/api-client-react";
import { useRoute, useLocation, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Calendar, Shield, DollarSign, Activity } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function ReportDetail() {
  const [, params] = useRoute("/reports/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const queryClient = useQueryClient();

  const { data: report, isLoading } = useGetReport(id, {
    query: { enabled: !!id }
  });

  const deleteReport = useDeleteReport();

  if (isLoading || !report) {
    return (
      <AnimatedPage className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </AnimatedPage>
    );
  }

  const handleDelete = () => {
    deleteReport.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
          toast.success("Report deleted");
          setLocation("/reports");
        },
        onError: () => toast.error("Failed to delete report"),
      }
    );
  };

  return (
    <AnimatedPage className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-4xl font-bold font-mono tracking-tight text-foreground">{report.title}</h1>
          <div className="flex gap-2 shrink-0">
            <Link href={`/reports/${id}/edit`}>
              <Button variant="outline" size="icon" className="font-mono text-cyan-500 border-cyan-500/50 hover:bg-cyan-500/10">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="font-mono text-red-500 border-red-500/50 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-red-500/50 bg-background/95 backdrop-blur">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-mono text-red-500">DELETE REPORT?</AlertDialogTitle>
                  <AlertDialogDescription className="font-mono">
                    This action cannot be undone. This will permanently delete the report.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="font-mono">CANCEL</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="font-mono bg-red-500 text-foreground hover:bg-red-600 glow-red">
                    CONFIRM PURGE
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center text-sm font-mono text-muted-foreground bg-background/30 p-4 border border-border/30">
          <StatusBadge status={report.status} />
          <SeverityBadge severity={report.severity} />
          
          <div className="flex items-center gap-1 text-primary">
            <Shield className="w-4 h-4" />
            <span>{report.target}</span>
          </div>

          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4 text-cyan-500" />
            <span>{report.vulnerability}</span>
          </div>
          
          {report.reward !== null && report.reward !== undefined && (
            <div className="flex items-center gap-1 text-primary glow-text-primary">
              <DollarSign className="w-4 h-4" />
              <span>{report.reward.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 ml-auto">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(report.createdAt), 'yyyy-MM-dd')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {report.description && (
          <div className="space-y-2">
            <h3 className="text-xl font-mono font-bold text-cyan-500 border-b border-border/30 pb-2">Description</h3>
            <div className="prose prose-invert prose-p:font-mono max-w-none">
              <ReactMarkdown>{report.description}</ReactMarkdown>
            </div>
          </div>
        )}

        {report.stepsToReproduce && (
          <div className="space-y-2">
            <h3 className="text-xl font-mono font-bold text-cyan-500 border-b border-border/30 pb-2">Steps To Reproduce</h3>
            <div className="prose prose-invert prose-p:font-mono max-w-none bg-background/30 p-4 border border-border/50">
              <ReactMarkdown>{report.stepsToReproduce}</ReactMarkdown>
            </div>
          </div>
        )}

        {report.impact && (
          <div className="space-y-2">
            <h3 className="text-xl font-mono font-bold text-cyan-500 border-b border-border/30 pb-2">Impact</h3>
            <div className="prose prose-invert prose-p:font-mono max-w-none text-red-500/80">
              <ReactMarkdown>{report.impact}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
