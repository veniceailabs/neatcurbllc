"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const navItems = [
  { href: "/admin", label: "Dashboard", badge: "Live" },
  { href: "/admin/leads", label: "Leads & Sales", badge: "Live" },
  { href: "/admin/clients", label: "Clients", badge: "CRM" },
  { href: "/admin/schedule", label: "Schedule", badge: "Week" },
  { href: "/admin/routes", label: "Routes", badge: "Dispatch" },
  { href: "/admin/invoices", label: "Invoices", badge: "Net-15" },
  { href: "/admin/marketing", label: "Marketing", badge: "SMS" },
  { href: "/admin/lead-intake", label: "Lead Intake", badge: "Quote" },
  { href: "/admin/audit", label: "Audit", badge: "Merkle" },
  { href: "/site", label: "Public Site", badge: "SEO" }
];

export default function Sidebar() {
  const pathname = usePathname();

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
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
      <nav className="nav-list">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${active ? "active" : ""}`}
            >
              <span>{item.label}</span>
              <span className="nav-pill">{item.badge}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
