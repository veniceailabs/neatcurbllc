"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";
import LanguageToggle from "@/components/language-toggle";
import { useAdminRole } from "@/components/admin-context";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";
import Tooltip from "@/components/Tooltip";

const navItems = [
  { href: "/", key: "home" },
  { href: "/admin", key: "dashboard" },
  { href: "/admin/leads", key: "leads" },
  { href: "/admin/clients", key: "clients" },
  { href: "/admin/jobs", key: "jobs" },
  { href: "/admin/invoices", key: "invoices" },
  { href: "/admin/lead-intake", key: "leadIntake" },
  { href: "/admin/messages", key: "messages" },
  { href: "/admin/settings", key: "settings" }
];

const staffNavItems = [
  { href: "/", key: "home" },
  { href: "/admin/work-orders", key: "workOrders" },
  { href: "/admin/logout", key: "logout" }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useAdminRole();
  const { language } = useLanguage();
  const copy = getCopy(language);
  const items = role === "staff" ? staffNavItems : navItems;

  if (pathname === "/admin/login" || pathname === "/admin/change-password") {
    return null;
  }

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
        <div className="brand-phone">(716) 241-1499</div>
      </div>
      <nav className="nav-list">
        {items.map((item) => {
          const active = pathname === item.href;
          const label = copy.adminNav[item.key as keyof typeof copy.adminNav];
          return (
            <Tooltip key={item.href} label={`Open ${label}`}>
              <Link
                href={item.href}
                className={`nav-link ${active ? "active" : ""}`}
              >
                <span>{label}</span>
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
