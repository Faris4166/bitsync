"use client"

import Link from "next/link"
import {
  Receipt,
  Home,
  PackageSearch,
  History,
  Settings,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

import { ModeToggle } from "./ModeToggle"
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs"

// นำเข้าธีมจาก Clerk และ Hook สำหรับเช็คสถานะ Dark Mode
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

const items = [
  { title: "Home", url: "/auth/home", icon: Home },
  { title: "Receipt", url: "/auth/receipt", icon: Receipt },
  { title: "Products", url: "/auth/products", icon: PackageSearch },
  { title: "History", url: "/auth/history", icon: History },
  { title: "Settings", url: "/auth/settings", icon: Settings },
]

export function AppSidebar() {
  // ดึงค่า theme ปัจจุบัน (light หรือ dark)
  const { resolvedTheme } = useTheme()

  return (
    <Sidebar className="border-r border-sidebar-border/50 glass">
      {/* ================= CONTENT ================= */}
      <SidebarContent>
        <SidebarGroup className="px-3">
          <Link href="/auth/home" className="flex items-center gap-2.5 py-8 px-2 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-105">
              <Sparkles className="text-primary-foreground h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Bit<span className="text-primary">Sync</span>
            </span>
          </Link>

          <SidebarGroupContent className="mt-4">
            <SidebarMenu className="gap-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10 px-3 rounded-lg transition-all duration-200 hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground">
                    <Link
                      href={item.url}
                      className="flex items-center gap-3"
                    >
                      <item.icon className="h-4.5 w-4.5" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ================= FOOTER ================= */}
      <SidebarFooter className="gap-4 p-6 glass border-t border-sidebar-border/50">
        <ModeToggle />

        <div className="h-px w-full bg-sidebar-border/30" />

        <SignedIn>
          <div className="flex items-center gap-3 py-2">
            <UserButton
              appearance={{
                baseTheme: resolvedTheme === "dark" ? dark : undefined,
                variables: {
                  colorPrimary: 'oklch(0.205 0 0)', // matching our new primary
                },
                elements: {
                  avatarBox: "h-8 w-8 rounded-lg shadow-sm border border-border transition-all",
                  userButtonOuterIdentifier: "text-foreground font-semibold tracking-tight text-xs ml-1",
                  userButtonTrigger: "hover:bg-accent rounded-lg p-0.5 transition-all",
                },
              }}
              showName
            />
          </div>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <Button size="sm" className="w-full h-10 bg-primary text-primary-foreground rounded-lg font-bold shadow-sm hover:opacity-90 transition-all border-none">
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
      </SidebarFooter>
    </Sidebar>
  )
}
