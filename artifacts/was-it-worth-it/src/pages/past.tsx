import { useEffect, useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useListPurchases } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import type { PurchaseStatus, Category } from "@workspace/api-client-react/src/generated/api.schemas";

export default function PastPurchases() {
  useEffect(() => {
    document.title = "Past Purchases · Was It Worth It?";
  }, []);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<PurchaseStatus | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: purchases, isLoading } = useListPurchases({
    search: debouncedSearch || undefined,
    status: status !== "all" ? status : undefined,
    category: category !== "all" ? category : undefined,
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Past Purchases</h1>
          <p className="text-muted-foreground mt-1">Review your spending history and reflections.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search purchases..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={(val: any) => setStatus(val)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="reflected">Reflected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={(val: any) => setCategory(val)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="subscriptions">Subscriptions</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
          ) : purchases?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No purchases found matching your criteria.
            </div>
          ) : (
            purchases?.map((p) => (
              <Card key={p.id} className="hover:bg-card/80 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 flex-1">
                    <div className="min-w-[200px]">
                      <div className="font-bold text-white text-lg">{p.name}</div>
                      <div className="text-muted-foreground text-sm flex items-center gap-2">
                        {format(new Date(p.purchaseDate), "MMM d, yyyy")}
                        <span>•</span>
                        <span className="capitalize">{p.category}</span>
                      </div>
                    </div>
                    <div className="font-bold text-xl">${p.amount.toFixed(2)}</div>
                    <div>
                      {p.status === "reflected" ? (
                        <Badge className="bg-[#22C55E] hover:bg-[#22C55E] text-black">Reflected</Badge>
                      ) : p.readyForReflection ? (
                        <Badge variant="destructive">Ready to Reflect</Badge>
                      ) : (
                        <Badge className="bg-[#FACC15] hover:bg-[#FACC15] text-black">Waiting</Badge>
                      )}
                    </div>
                  </div>
                  <Link href={`/app/purchase/${p.id}`}>
                    <Button variant="outline" size="sm" className="uppercase font-bold text-xs tracking-wider">
                      View
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
