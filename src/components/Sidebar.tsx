"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";
import LanguageToggle from "@/components/language-toggle";
import { useAdminRole } from "@/components/admin-context";
import Tooltip from "@/components/Tooltip";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/lead-intake", label: "Lead Intake" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/site", label: "Public Site" }
];

const staffNavItems = [
  { href: "/", label: "Home" },
  { href: "/admin/work-orders", label: "Work Orders" },
  { href: "/admin/logout", label: "Logout" }
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
              </Link>
            </Tooltip>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <LanguageToggle />
        <ThemeToggle variant="sidebar" />
      </div>
    </aside>
  );
}
