"use client"

import Link from "next/link"
import {
  Receipt,
  Home,
  PackageSearch,
  History,
  Settings,
} from "lucide-react"

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
  const { theme } = useTheme()

  return (
    <Sidebar>
      {/* ================= CONTENT ================= */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold">
            Bit<span className="text-blue-600">Sync</span>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className="flex items-center gap-3"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ================= FOOTER ================= */}
      <SidebarFooter className="gap-3 p-3">
        <ModeToggle />

        <div className="h-px w-full bg-sidebar-border" />

        <SignedIn>
          <div className="flex items-center gap-3">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                // ถ้า theme เป็น dark ให้ใช้ธีม dark ของ Clerk เพื่อให้ข้อความเปลี่ยนสี
                baseTheme: theme === "dark" ? dark : undefined,
                elements: {
                  avatarBox: "h-8 w-8",
                  // จัดการสีข้อความชื่อผู้ใช้ให้สอดคล้องกับ Sidebar
                  userButtonOuterIdentifier: "text-sidebar-foreground font-medium",
                },
              }}
              showName
            />
          </div>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <SidebarMenuButton className="w-full justify-center">
              Sign In
            </SidebarMenuButton>
          </SignInButton>
        </SignedOut>
      </SidebarFooter>
    </Sidebar>
  )
}