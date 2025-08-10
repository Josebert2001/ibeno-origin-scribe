import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Home, CheckCircle2, Shield, LogIn, FileText, Scale } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type Item = { title: string; url: string; icon: LucideIcon };

const items: Item[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Verify", url: "/verify", icon: CheckCircle2 },
  { title: "Admin", url: "/admin", icon: Shield },
  { title: "Auth", url: "/auth", icon: LogIn },
  { title: "Privacy", url: "/privacy", icon: FileText },
  { title: "Terms", url: "/terms", icon: Scale },
];

export function AppSidebar() {
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className="w-60" collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
