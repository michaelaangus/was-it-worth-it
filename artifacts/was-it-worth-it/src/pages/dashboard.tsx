import { useEffect } from "react";
import { useGetDashboard, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  useEffect(() => {
    document.title = "Dashboard · Was It Worth It?";
  }, []);

  const { data, isLoading, error } = useGetDashboard();

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Here is where you stand today.</p>
          </div>
          <Link href="/app/log">
            <Button className="uppercase font-bold tracking-wider text-sm">
              + LOG NEW PURCHASE
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <Skeleton className="w-full h-64 rounded-xl" />
        ) : error ? (
          <div className="text-destructive font-bold">Failed to load dashboard.</div>
        ) : data ? (
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 border-l-4 border-l-primary bg-card/50">
              <CardHeader>
                <CardTitle className="uppercase tracking-widest text-sm text-primary">Needs Reflection</CardTitle>
                <CardDescription className="text-3xl font-bold text-white">
                  {data.readyForReflectionCount} {data.readyForReflectionCount === 1 ? 'purchase is' : 'purchases are'} ready.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.nextPending ? (
                  <div className="bg-background rounded-lg p-4 border border-border flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{data.nextPending.name}</div>
                      <div className="text-sm text-muted-foreground">${data.nextPending.amount.toFixed(2)}</div>
                    </div>
                    <Link href={`/app/reflect/${data.nextPending.id}`}>
                      <Button variant="default" className="uppercase font-bold text-xs tracking-wider">
                        REFLECT
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">You have no purchases waiting for reflection right now.</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="uppercase tracking-widest text-xs text-muted-foreground">Total Logged</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-extrabold text-white">{data.totalPurchases}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="uppercase tracking-widest text-xs text-muted-foreground">Total Reflected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-extrabold text-white">{data.totalReflected}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
