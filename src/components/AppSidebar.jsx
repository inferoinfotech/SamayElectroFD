import {
  Calculator,
  ChartNoAxesColumnIncreasing,
  Dot,
  FilePlus2,
  ListChecks,
  Newspaper,
  UsersRound,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/NavMain";
import { NavUser } from "@/components/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./TeamSwitcher";
import { useState } from "react";

const user = {
  name: "John Doe",
  email: "johndoe@example.com",
  avatar: null,
  role: "admin",
};

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    title: "RE Generator",
    icon: UsersRound ,
    subItems: [
      {
        title: "View RE Generator",
        url: "/admin/allclients",
        icon: Dot,
      },
      {
        title: "Add RE Generator",
        url: "/admin/lead",
        icon: Dot,
      },
    ],
  },
  {
    title: "Upload",
    icon: FilePlus2,
    subItems: [
      {
        title: "Upload Meter File",
        url: "/admin/meter-data",
        icon: Dot,
      },
      {
        title: "Upload Logger File",
        url: "/admin/logger-data",
        icon: Dot,
      },
    ],
  },
  {
    title: "Reports",
    icon: Newspaper ,
    subItems: [
      {
        title: "Monthly Analytics ",
        url: "/admin/loss-calculation-file",
        icon: Dot,
      },
      {
        title: "Daily Generation Report",
        url: "/admin/daily-generation",
        icon: Dot,
      },
      {
        title: "Total Generation Report",
        url: "/admin/total-generation",
        icon: Dot,
      },
      {
        title: "Yearly Generation Report",
        url: "/admin/yearly-generation",
        icon: Dot,
      },
    ],
  },
   {
    title: "Client Progress Report",
    url: "/admin/client-progress",
    icon: ListChecks ,
  },
];

export function AppSidebar({ ...props }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sidebar collapsible="icon" onCollapseChange={setCollapsed}  {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} sidebarCollapsed={collapsed} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}