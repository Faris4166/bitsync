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
      <main className="flex-1 overflow-auto bg-background/50">
        <div className="p-4 border-b border-border/5 flex items-center gap-2">
          <SidebarTrigger />
          <div className="h-4 w-px bg-border/40 mx-2" />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
