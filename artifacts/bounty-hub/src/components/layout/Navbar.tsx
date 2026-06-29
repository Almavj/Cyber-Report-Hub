import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, FileSearch } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/writeups", label: "Writeups", icon: FileText },
    { href: "/reports", label: "Reports", icon: FileSearch },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="mr-8 flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center border border-primary bg-primary/10 glow-green">
            <img src="/Alma101.png" alt="BB_HUB Logo" className="h-5 w-5" />
          </div>
          <span className="font-mono text-xl font-bold tracking-tighter text-primary glitch-text" data-text="BB_HUB">
            BB_HUB
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {links.map((link) => {
            const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-mono transition-colors hover:text-primary",
                  isActive ? "text-primary glow-text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline-block">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
    </nav>
  );
}
