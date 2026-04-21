import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/app" },
    { label: "Log", path: "/app/log" },
    { label: "Past", path: "/app/past" },
    { label: "Insights", path: "/app/insights" },
    { label: "Profile", path: "/app/profile" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground p-2 rounded">
        Skip to main content
      </a>
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 max-w-5xl h-16 flex items-center justify-between">
          <Link href="/app" className="font-bold text-xl tracking-tight text-white hover:text-primary transition-colors">
            WAS IT WORTH IT?
          </Link>
          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={location === item.path ? "secondary" : "ghost"}
                  className={`uppercase font-bold tracking-wider text-xs ${location === item.path ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main id="main-content" className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
