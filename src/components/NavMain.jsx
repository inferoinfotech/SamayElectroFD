import { Collapsible } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { ChevronDown, Users, UserPlus, UserCheck } from "lucide-react"; // Added icons for sub-items
import React, { useState } from "react";

export function NavMain({ items, sidebarCollapsed  }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavItem key={item.title} item={item} sidebarCollapsed={sidebarCollapsed}/>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavItem({ item }) {
  const [isOpen, setIsOpen] = useState(false);
  const { state, setOpen } = useSidebar(); // Get sidebar state and setter from context
  const isCollapsed = state === "collapsed";

  React.useEffect(() => {
    if (isCollapsed) {
      setIsOpen(false);
    }
  }, [isCollapsed]);

  const handleClick = () => {
    // If sidebar is collapsed and user clicks to open dropdown,
    // first expand the sidebar
    if (isCollapsed && item.subItems) {
      setOpen(true);
      // Small delay to allow sidebar animation to complete before opening dropdown
      setTimeout(() => setIsOpen(true), 100);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div>
      {item.subItems ? (
        <SidebarMenuItem className="cursor-pointer" onClick={handleClick}>
          <SidebarMenuButton tooltip={item.title} className={"hover:cursor-pointer"}>
            {item.icon && <item.icon />}
            <span className="text-base font-semibold text-gray-800">{item.title}</span>
            <ChevronDown className={`ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </SidebarMenuButton>
        </SidebarMenuItem>
      ) : (
        <SidebarMenuItem>
          <Link to={item.url}>
            <SidebarMenuButton tooltip={item.title} className={"hover:cursor-pointer"}>
              {item.icon && <item.icon />}
              <span className="text-base font-semibold text-gray-800">{item.title}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      )}

      {/* Render Dropdown if subItems exist and sidebar is not collapsed */}
      {item.subItems && isOpen && !isCollapsed && (
        <div className="pl-6">
          {item.subItems.map((subItem) => (
            <SidebarMenuItem key={subItem.title}>
              <Link to={subItem.url}>
                <SidebarMenuButton tooltip={subItem.title} className={"hover:cursor-pointer"}>
                  {subItem.icon && <subItem.icon className="" />}
                  <span className="">{subItem.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </div>
      )}
    </div>
  );
}