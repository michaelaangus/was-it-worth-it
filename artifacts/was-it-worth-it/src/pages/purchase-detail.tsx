import { useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import { format } from "date-fns";
import { useGetPurchase, getGetPurchaseQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function PurchaseDetail() {
  const { id } = useParams();
  const { data, isLoading, error } = useGetPurchase(id!, { query: { enabled: !!id, queryKey: getGetPurchaseQueryKey(id!) } });

  useEffect(() => {
    if (data?.purchase?.name) {
      document.title = `${data.purchase.name} · Was It Worth It?`;
    } else {
      document.title = "Purchase Details · Was It Worth It?";
    }
  }, [data]);

  if (isLoading) {
    return (
      <Layout>
        <Skeleton className="w-full h-64 rounded-xl" />
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

  const { purchase, reflection } = data;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link href="/app/past" className="text-sm text-primary hover:underline mb-4 inline-block">
            &larr; Back to Past Purchases
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{purchase.name}</h1>
          <div className="text-2xl font-bold mt-2">${purchase.amount.toFixed(2)}</div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium capitalize">{purchase.category}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{format(new Date(purchase.purchaseDate), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-muted-foreground">Status</span>
                <span>
                  {purchase.status === "reflected" ? (
                    <Badge className="bg-[#22C55E] hover:bg-[#22C55E] text-black">Reflected</Badge>
                  ) : purchase.readyForReflection ? (
                    <Badge variant="destructive">Ready to Reflect</Badge>
                  ) : (
                    <Badge className="bg-[#FACC15] hover:bg-[#FACC15] text-black">Waiting</Badge>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {purchase.status === "reflected" && reflection ? (
            <Card className="border-l-4 border-l-[#22C55E]">
              <CardHeader>
                <CardTitle>Reflection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Verdict</span>
                  <span className="font-bold">
                    {reflection.verdict === "worth_it" && <span className="text-[#22C55E]">WORTH IT</span>}
                    {reflection.verdict === "not_worth_it" && <span className="text-destructive">NOT WORTH IT</span>}
                    {reflection.verdict === "uncertain" && <span className="text-[#FACC15]">UNCERTAIN</span>}
                  </span>
                </div>
                {reflection.comments && (
                  <div className="pt-2">
                    <span className="text-muted-foreground block mb-1">Notes</span>
                    <p className="bg-background p-3 rounded border border-border text-sm whitespace-pre-wrap">
                      {reflection.comments}
                    </p>
                  </div>
                )}
                <div className="text-xs text-muted-foreground pt-2">
                  Reflected on {format(new Date(reflection.reflectedAt), "MMMM d, yyyy")}
                </div>
              </CardContent>
            </Card>
          ) : (
            purchase.readyForReflection && (
              <div className="bg-card border border-primary p-6 rounded-xl text-center space-y-4">
                <h3 className="text-xl font-bold text-white">Time to Reflect</h3>
                <p className="text-muted-foreground">
                  The reflection window for this purchase has passed. Was it worth the money?
                </p>
                <Link href={`/app/reflect/${purchase.id}`}>
                  <Button size="lg" className="uppercase font-bold tracking-widest w-full">
                    REFLECT NOW
                  </Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
}
