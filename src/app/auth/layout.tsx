import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function UserPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto bg-background transition-all duration-300 relative">
        {/* Decorative background element */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_98%),transparent_60%)]" />

        <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="hover:bg-accent hover:text-foreground transition-colors rounded-md h-8 w-8" />
            <div className="h-4 w-px bg-border/60" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2.5 py-1 rounded-full bg-muted/50 border border-border">
                Dashboard
              </span>
            </div>
          </div>
        </header>

        <section className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </section>
      </main>
    </SidebarProvider>
  );
}
