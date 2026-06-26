import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { ScanlineOverlay } from "../3d/ScanlineOverlay";

export function AppLayout({ children }: { children: ReactNode }) {
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="relative min-h-[100dvh] bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-primary">
      <ScanlineOverlay />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10 w-full max-w-7xl">
        {children}
      </main>
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-md py-6 z-10 relative">
        <div className="container mx-auto px-4 text-center">
          <p className="font-mono text-sm text-muted-foreground">
            <span className="text-primary">ROOT@BB_HUB</span>:~# system_status <span className="text-primary glow-text-primary">ONLINE</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
