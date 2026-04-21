import { useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import { useGetPurchase, getGetPurchaseQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";

export default function Reflected() {
  const { id } = useParams();
  const { data, isLoading } = useGetPurchase(id!, { query: { enabled: !!id, queryKey: getGetPurchaseQueryKey(id!) } });

  useEffect(() => {
    document.title = "Reflection Saved · Was It Worth It?";
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <Skeleton className="w-full h-64 rounded-xl max-w-lg mx-auto" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto mt-12 text-center space-y-8">
        <CheckCircle2 className="w-24 h-24 text-[#22C55E] mx-auto" />
        
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">Reflection Saved</h1>
          <p className="text-xl text-muted-foreground">
            You marked <span className="font-bold text-white">{data?.purchase.name}</span> as{' '}
            <span className={`font-bold ${
              data?.reflection?.verdict === 'worth_it' ? 'text-[#22C55E]' :
              data?.reflection?.verdict === 'not_worth_it' ? 'text-destructive' :
              'text-[#FACC15]'
            }`}>
              {data?.reflection?.verdict.replace(/_/g, ' ').toUpperCase()}
            </span>.
          </p>
        </div>

        <div className="pt-8">
          <Link href="/app/past">
            <Button size="lg" className="uppercase font-bold tracking-widest px-8">
              BACK TO PAST PURCHASES
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
