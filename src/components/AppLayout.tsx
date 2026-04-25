import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  FileSearch,
  Layers,
  Briefcase,
  Settings,
  Sparkles,
  Circle,
  Menu,
  X,
  RefreshCw,
} from "lucide-react";
import { useLocalStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: "jobs";
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Tools",
    items: [
      { to: "/single", label: "Single Screening", icon: FileSearch },
      { to: "/batch", label: "Batch Screening", icon: Layers },
    ],
  },
  {
    label: "Data",
    items: [{ to: "/jobs", label: "Job Repository", icon: Briefcase, badgeKey: "jobs" }],
  },
  {
    label: "Account",
    items: [{ to: "/settings", label: "Settings", icon: Settings }],
  },
];

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/single": "Single Screening",
  "/batch": "Batch Screening",
  "/jobs": "Job Repository",
  "/settings": "Settings",
};

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const jobsCount = useLocalStore((s) => s.jobs.length);

  const title = useMemo(() => PAGE_TITLES[pathname] ?? "ResumeSift", [pathname]);

  const sidebar = (
    <aside
      className={cn(
        "flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        "fixed inset-y-0 left-0 z-40 md:sticky md:top-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "transition-transform duration-200"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">
            Resume<span className="text-primary">Sift</span>
          </span>
        </Link>
        <button
          className="md:hidden text-muted-foreground"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 scrollbar-thin">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.to;
                const Icon = item.icon;
                const badge = item.badgeKey === "jobs" ? jobsCount : undefined;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent text-foreground shadow-[inset_0_0_0_1px_oklch(1_0_0/8%)]"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                      {badge !== undefined && badge > 0 && (
                        <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          {badge}
                        </span>
                      )}
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Profile + status */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-primary/10 text-xs font-semibold text-foreground ring-1 ring-primary/30">
            RS
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Recruiter</p>
            <p className="text-[11px] text-muted-foreground">Hiring Manager</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-md bg-success/10 px-2.5 py-1.5 text-[11px] font-medium text-success">
          <Circle className="h-2 w-2 fill-success text-success" />
          System Live
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {sidebar}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur md:px-8">
          <button
            className="md:hidden text-muted-foreground"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Last updated:{" "}
              <span className="text-foreground/80">
                {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </span>
            <button
              onClick={() => setLastUpdated(new Date())}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-elevated"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
