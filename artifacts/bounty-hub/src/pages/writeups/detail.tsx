import { AnimatedPage } from "@/components/ui/animated-page";
import { useGetWriteup, useDeleteWriteup, useToggleWriteupFeature, getListWriteupsQueryKey } from "@workspace/api-client-react";
import { useRoute, useLocation, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Star, Calendar, DollarSign, Tag } from "lucide-react";
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

export default function WriteupDetail() {
  const [, params] = useRoute("/writeups/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const queryClient = useQueryClient();

  const { data: writeup, isLoading } = useGetWriteup(id, {
    query: { enabled: !!id }
  });

  const deleteWriteup = useDeleteWriteup();
  const toggleFeature = useToggleWriteupFeature();

  if (isLoading || !writeup) {
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
    deleteWriteup.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWriteupsQueryKey() });
          toast.success("Writeup deleted");
          setLocation("/writeups");
        },
        onError: () => toast.error("Failed to delete writeup"),
      }
    );
  };

  const handleToggleFeature = () => {
    toggleFeature.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWriteupsQueryKey() });
          toast.success(`Writeup ${writeup.featured ? 'unfeatured' : 'featured'}`);
        },
        onError: () => toast.error("Failed to update feature status"),
      }
    );
  };

  return (
    <AnimatedPage className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-4xl font-bold font-mono tracking-tight text-foreground">{writeup.title}</h1>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="icon"
              className={`font-mono ${writeup.featured ? 'text-yellow-500 border-yellow-500 glow-yellow bg-yellow-500/10' : ''}`}
              onClick={handleToggleFeature}
              disabled={toggleFeature.isPending}
            >
              <Star className="w-4 h-4" />
            </Button>
            <Link href={`/writeups/${id}/edit`}>
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
                  <AlertDialogTitle className="font-mono text-red-500">DELETE WRITEUP?</AlertDialogTitle>
                  <AlertDialogDescription className="font-mono">
                    This action cannot be undone. This will permanently delete the writeup from the system.
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
          <SeverityBadge severity={writeup.severity} />
          
          <div className="flex items-center gap-1">
            <img src="/Alma101.png" alt="Platform" className="w-4 h-4" />
            <span>{writeup.platform}</span>
          </div>
          
          {writeup.bountyAmount !== null && (
            <div className="flex items-center gap-1 text-primary glow-text-primary">
              <DollarSign className="w-4 h-4" />
              <span>{writeup.bountyAmount.toLocaleString()}</span>
            </div>
          )}

          {writeup.cveId && (
            <div className="flex items-center gap-1 text-orange-500">
              <Tag className="w-4 h-4" />
              <span>{writeup.cveId}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 ml-auto">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(writeup.createdAt), 'yyyy-MM-dd')}</span>
          </div>
        </div>
      </div>

      {writeup.summary && (
        <div className="text-lg font-mono text-muted-foreground border-l-4 border-primary/50 pl-4 py-2 bg-primary/5">
          {writeup.summary}
        </div>
      )}

      <div className="prose prose-invert prose-p:font-mono prose-headings:font-mono prose-headings:text-primary max-w-none prose-pre:bg-muted prose-pre:border prose-pre:border-border/50">
        <ReactMarkdown>{writeup.content}</ReactMarkdown>
      </div>
    </AnimatedPage>
  );
}
