import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useGetPurchase, useSubmitReflection, getGetPurchaseQueryKey, getGetDashboardQueryKey, getListPurchasesQueryKey, getGetInsightsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Verdict } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Reflect() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useGetPurchase(id!, { query: { enabled: !!id, queryKey: getGetPurchaseQueryKey(id!) } });
  const submitReflection = useSubmitReflection();

  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [comments, setComments] = useState("");

  useEffect(() => {
    document.title = "Reflect · Was It Worth It?";
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <Skeleton className="w-full h-96 rounded-xl" />
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="text-destructive font-bold">Failed to load purchase.</div>
      </Layout>
    );
  }

  const { purchase } = data;

  const handleSubmit = () => {
    if (!verdict) return;
    
    submitReflection.mutate(
      { id: purchase.id, data: { verdict, comments } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetPurchaseQueryKey(purchase.id) });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListPurchasesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetInsightsQueryKey() });
          toast({ title: "Reflection saved" });
          setLocation(`/app/reflected/${purchase.id}`);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to save reflection.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Reflect on {purchase.name}
          </h1>
          <div className="text-2xl font-bold text-primary">${purchase.amount.toFixed(2)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setVerdict("worth_it")}
            className={`p-6 rounded-xl border-2 transition-all text-center ${
              verdict === "worth_it" 
                ? "border-[#22C55E] bg-[#22C55E]/10" 
                : "border-border bg-card hover:border-muted-foreground"
            }`}
          >
            <div className={`font-bold text-lg mb-1 ${verdict === "worth_it" ? "text-[#22C55E]" : "text-white"}`}>
              WORTH IT
            </div>
            <div className="text-xs text-muted-foreground">I would buy this again.</div>
          </button>
          
          <button
            onClick={() => setVerdict("uncertain")}
            className={`p-6 rounded-xl border-2 transition-all text-center ${
              verdict === "uncertain" 
                ? "border-[#FACC15] bg-[#FACC15]/10" 
                : "border-border bg-card hover:border-muted-foreground"
            }`}
          >
            <div className={`font-bold text-lg mb-1 ${verdict === "uncertain" ? "text-[#FACC15]" : "text-white"}`}>
              UNCERTAIN
            </div>
            <div className="text-xs text-muted-foreground">The jury is still out.</div>
          </button>

          <button
            onClick={() => setVerdict("not_worth_it")}
            className={`p-6 rounded-xl border-2 transition-all text-center ${
              verdict === "not_worth_it" 
                ? "border-destructive bg-destructive/10" 
                : "border-border bg-card hover:border-muted-foreground"
            }`}
          >
            <div className={`font-bold text-lg mb-1 ${verdict === "not_worth_it" ? "text-destructive" : "text-white"}`}>
              NOT WORTH IT
            </div>
            <div className="text-xs text-muted-foreground">I regret this purchase.</div>
          </button>
        </div>

        <Card>
          <CardContent className="p-6">
            <label className="block text-sm font-medium mb-2">Optional Notes</label>
            <Textarea
              placeholder="Why do you feel this way?"
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="resize-none"
            />
          </CardContent>
        </Card>

        <Button 
          size="lg" 
          className="w-full uppercase font-bold tracking-widest" 
          disabled={!verdict || submitReflection.isPending}
          onClick={handleSubmit}
        >
          {submitReflection.isPending ? "SAVING..." : "SUBMIT REFLECTION"}
        </Button>
      </div>
    </Layout>
  );
}
