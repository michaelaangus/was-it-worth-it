import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Landing() {
  useEffect(() => {
    document.title = "Was It Worth It? · The Reflection-Based Tracker";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground p-2 rounded">
        Skip to main content
      </a>
      <header className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="font-bold text-2xl tracking-tight">WAS IT WORTH IT?</div>
        <Link href="/app">
          <Button variant="outline" className="uppercase font-bold tracking-wider text-sm">Open the App</Button>
        </Link>
      </header>
      
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 max-w-4xl text-white">
          Stop wondering where your money went. <br/><span className="text-primary">Start asking if it was worth it.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
          A reflection-based discretionary spending tracker. Log a purchase, wait through a reflection window, and come back to decide if it brought you lasting satisfaction or regret.
        </p>
        <Link href="/app">
          <Button size="lg" className="uppercase font-extrabold tracking-widest text-lg px-8 py-6 rounded-full hover:scale-105 transition-transform">
            OPEN THE APP
          </Button>
        </Link>
      </main>
    </div>
  );
}
