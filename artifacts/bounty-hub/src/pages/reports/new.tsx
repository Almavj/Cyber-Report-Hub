import { AnimatedPage } from "@/components/ui/animated-page";
import { useCreateReport, getListReportsQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  target: z.string().min(1, "Target is required"),
  vulnerability: z.string().min(1, "Vulnerability type is required"),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  status: z.enum(["draft", "submitted", "triaged", "resolved", "duplicate", "invalid"]),
  reward: z.coerce.number().optional(),
  description: z.string().optional(),
  stepsToReproduce: z.string().optional(),
  impact: z.string().optional(),
});

export default function NewReport() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createReport = useCreateReport();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      target: "",
      vulnerability: "",
      severity: "medium",
      status: "draft",
      reward: undefined,
      description: "",
      stepsToReproduce: "",
      impact: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createReport.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
          toast.success("Report created successfully");
          setLocation(`/reports/${data.id}`);
        },
        onError: () => {
          toast.error("Failed to create report");
        },
      }
    );
  }

  return (
    <AnimatedPage className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-border/50 pb-4">
        <h1 className="text-3xl font-bold font-mono text-cyan-500 glow-cyan">New Report</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-background/50 p-6 border border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel className="font-mono">REPORT TITLE</FormLabel>
                  <FormControl>
                    <Input className="font-mono bg-background/30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">TARGET / SCOPE</FormLabel>
                  <FormControl>
                    <Input placeholder="api.example.com" className="font-mono bg-background/30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vulnerability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">VULNERABILITY TYPE</FormLabel>
                  <FormControl>
                    <Input placeholder="SQL Injection, XSS..." className="font-mono bg-background/30" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">STATUS</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="font-mono bg-background/30">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">DRAFT</SelectItem>
                      <SelectItem value="submitted">SUBMITTED</SelectItem>
                      <SelectItem value="triaged">TRIAGED</SelectItem>
                      <SelectItem value="resolved">RESOLVED</SelectItem>
                      <SelectItem value="duplicate">DUPLICATE</SelectItem>
                      <SelectItem value="invalid">INVALID</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono">REWARD AMOUNT ($)</FormLabel>
                  <FormControl>
                    <Input type="number" className="font-mono bg-background/30" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel className="font-mono">DESCRIPTION</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="font-mono bg-background/30 min-h-[150px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stepsToReproduce"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel className="font-mono">STEPS TO REPRODUCE</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="font-mono bg-background/30 min-h-[150px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="impact"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel className="font-mono">IMPACT</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="font-mono bg-background/30 min-h-[100px]" 
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
              disabled={createReport.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {createReport.isPending ? "SAVING..." : "SAVE REPORT"}
            </Button>
          </div>
        </form>
      </Form>
    </AnimatedPage>
  );
}
