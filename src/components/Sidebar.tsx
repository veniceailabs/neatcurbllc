"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";
import LanguageToggle from "@/components/language-toggle";
import { useAdminRole } from "@/components/admin-context";
import Tooltip from "@/components/Tooltip";

const navItems = [
  { href: "/admin", label: "Dashboard", badge: "Live" },
  { href: "/admin/leads", label: "Leads", badge: "Live" },
  { href: "/admin/clients", label: "Clients", badge: "CRM" },
  { href: "/admin/jobs", label: "Jobs", badge: "Schedule" },
  { href: "/admin/lead-intake", label: "Lead Intake", badge: "Quote" },
  { href: "/admin/messages", label: "Messages", badge: "Comms" },
  { href: "/admin/settings", label: "Settings", badge: "Admin" },
  { href: "/site", label: "Public Site", badge: "SEO" }
];

const staffNavItems = [
  { href: "/admin/work-orders", label: "Work Orders", badge: "Crew" },
  { href: "/admin/logout", label: "Logout", badge: "Exit" }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useAdminRole();
  const items = role === "staff" ? staffNavItems : navItems;

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <img
          src="/brand/neat-curb-logo-full.svg"
          alt="Neat Curb LLC full color logo"
          className="brand-logo"
        />
        <span className="pill">Snow Ready</span>
        <div className="brand-title">Neat Curb Command</div>
        <div className="brand-sub">Unified Ops + Lead Engine</div>
        <div className="sidebar-controls">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
      <nav className="nav-list">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Tooltip key={item.href} label={`Open ${item.label}`}>
              <Link
                href={item.href}
                className={`nav-link ${active ? "active" : ""}`}
              >
                <span>{item.label}</span>
                <span className="nav-pill">{item.badge}</span>
              </Link>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
}
