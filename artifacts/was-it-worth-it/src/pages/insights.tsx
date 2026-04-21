import { useEffect } from "react";
import { Link } from "wouter";
import { useGetInsights } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Insights() {
  useEffect(() => {
    document.title = "Insights · Was It Worth It?";
  }, []);

  const { data, isLoading, error } = useGetInsights();

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
        <div className="text-destructive font-bold">Failed to load insights.</div>
      </Layout>
    );
  }

  if (data.categories.length === 0) {
    return (
      <Layout>
        <div className="text-center py-20 max-w-lg mx-auto space-y-6">
          <h1 className="text-3xl font-extrabold text-white">No Insights Yet</h1>
          <p className="text-muted-foreground">
            We need more data to spot patterns. Log some purchases, reflect on them, and come back here later.
          </p>
          <Link href="/app/log">
            <Button className="uppercase font-bold tracking-wider">LOG NEW PURCHASE</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Spending Patterns</h1>
          <p className="text-muted-foreground mt-1">What brings you satisfaction vs. regret?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="uppercase tracking-widest text-xs text-muted-foreground">Overall Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-[#22C55E]">
                {data.overallWorthItPercent.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">of your reflected purchases were worth it.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="uppercase tracking-widest text-xs text-muted-foreground">Total Reflected Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-white">
                ${data.totalSpent.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="pb-2">
              <CardTitle className="uppercase tracking-widest text-xs text-destructive">Regret Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-destructive">
                ${data.regretSpent.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">spent on "not worth it" items.</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Satisfaction by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categories} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="category" type="category" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={100} style={{ textTransform: 'capitalize' }} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    formatter={(val: number) => [`${val.toFixed(0)}%`, 'Worth It']}
                  />
                  <Bar dataKey="worthItPercent" radius={[0, 4, 4, 0]}>
                    {data.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(142, 71%, 45%)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Spend by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categories}>
                  <XAxis dataKey="category" tick={{ fill: 'hsl(var(--muted-foreground))' }} style={{ textTransform: 'capitalize' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    formatter={(val: number) => [`$${val.toFixed(2)}`, 'Spent']}
                  />
                  <Bar dataKey="totalSpent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
