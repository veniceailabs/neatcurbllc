"use client";

import { useState } from "react";
import Image from "next/image";
import ThemeToggle from "@/components/theme-toggle";
import LanguageToggle from "@/components/language-toggle";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Image
          src="/brand/neat-curb-logo-full.svg"
          alt="Neat Curb LLC logo"
          width={120}
          height={90}
          priority
        />
      </div>
      <button
        className="nav-toggle"
        type="button"
        aria-label="Toggle navigation"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className={`navbar-links ${open ? "open" : ""}`}>
        <div className="navbar-links-main">
          <a href="/">{copy.nav.home}</a>
          <a href="/services">{copy.nav.services}</a>
          <a href="/#areas">{copy.nav.serviceAreas}</a>
          <a href="/#quote">{copy.nav.requestQuote}</a>
        </div>
        <div className="navbar-links-actions">
          <a className="btn-secondary" href="/admin/login">
            {copy.nav.login}
          </a>
          <a className="btn-primary" href="/request-quote">
            {copy.nav.requestQuote}
          </a>
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}
