"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", badge: "Live" },
  { href: "/leads", label: "Leads & Sales", badge: "12" },
  { href: "/clients", label: "Clients", badge: "CRM" },
  { href: "/schedule", label: "Schedule", badge: "Week" },
  { href: "/routes", label: "Routes", badge: "Dispatch" },
  { href: "/invoices", label: "Invoices", badge: "Net-15" },
  { href: "/marketing", label: "Marketing", badge: "SMS" },
  { href: "/lead-intake", label: "Lead Intake", badge: "Quote" },
  { href: "/audit", label: "Audit", badge: "Merkle" },
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
