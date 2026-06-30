import { AnimatedPage } from "@/components/ui/animated-page";
import { useGetWriteup, useUpdateWriteup, getGetWriteupQueryKey, getListWriteupsQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  platform: z.string().min(1, "Platform is required"),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  bountyAmount: z.coerce.number().optional(),
  cveId: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

export default function EditWriteup() {
  const [, params] = useRoute("/writeups/:id/edit");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const queryClient = useQueryClient();

  const { data: writeup, isLoading } = useGetWriteup(id, {
    query: { queryKey: getGetWriteupQueryKey(id), enabled: !!id }
  });

  const updateWriteup = useUpdateWriteup();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      platform: "",
      severity: "medium",
      bountyAmount: undefined,
      cveId: "",
      summary: "",
      content: "",
    },
  });

  useEffect(() => {
    if (writeup) {
      form.reset({
        title: writeup.title,
        platform: writeup.platform,
        severity: writeup.severity as any,
        bountyAmount: writeup.bountyAmount || undefined,
        cveId: writeup.cveId || "",
        summary: writeup.summary || "",
        content: writeup.content,
      });
    }
  }, [writeup, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateWriteup.mutate(
      { id, data: values },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getGetWriteupQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListWriteupsQueryKey() });
          toast.success("Writeup updated successfully");
          setLocation(`/writeups/${data.id}`);
        },
        onError: () => {
          toast.error("Failed to update writeup");
        },
      }
    );
  }

  if (isLoading) {
    return (
      <AnimatedPage className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[600px] w-full" />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-border/50 pb-4">
        <h1 className="text-3xl font-bold font-mono text-cyan-500 glow-cyan">Edit Writeup</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-background/50 p-6 border border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel className="font-mono">TITLE</FormLabel>
                  <FormControl>
                    <Input className="font-mono bg-background/30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">PLATFORM / TARGET</FormLabel>
                  <FormControl>
                    <Input className="font-mono bg-background/30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">SEVERITY</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="font-mono bg-background/30">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="critical">CRITICAL</SelectItem>
                      <SelectItem value="high">HIGH</SelectItem>
                      <SelectItem value="medium">MEDIUM</SelectItem>
                      <SelectItem value="low">LOW</SelectItem>
                      <SelectItem value="info">INFO</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bountyAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">BOUNTY AMOUNT ($)</FormLabel>
                  <FormControl>
                    <Input type="number" className="font-mono bg-background/30" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cveId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">CVE ID (OPTIONAL)</FormLabel>
                  <FormControl>
                    <Input className="font-mono bg-background/30" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel className="font-mono">SUMMARY</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="font-mono bg-background/30 min-h-[100px]" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel className="font-mono">CONTENT (MARKDOWN)</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="font-mono bg-background/30 min-h-[300px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
            <Button 
              type="submit" 
              className="font-mono bg-cyan-500 text-foreground hover:bg-cyan-600 glow-cyan"
              disabled={updateWriteup.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateWriteup.isPending ? "SAVING..." : "UPDATE WRITEUP"}
            </Button>
          </div>
        </form>
      </Form>
    </AnimatedPage>
  );
}
