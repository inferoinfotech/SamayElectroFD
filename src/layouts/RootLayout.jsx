// src/layouts/RootLayout.jsx
import { AppSidebar } from "@/components/AppSidebar";
import { ModeToggle } from "@/components/ModeToggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { HelpButton } from "@/components/HelpButton";

export default function RootLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center justify-between gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <div className="ml-auto mr-5">
              <ModeToggle />
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4">
            <Outlet />
          </div>
          <HelpButton />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}