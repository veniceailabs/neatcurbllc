"use client";

import { useState } from "react";
import ThemeToggle from "@/components/theme-toggle";
import LanguageToggle from "@/components/language-toggle";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img
          src="/brand/neat-curb-logo-full.svg"
          alt="Neat Curb LLC logo"
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
        <a href="/">Home</a>
        <a href="/services">Services</a>
        <a href="/#areas">Service Areas</a>
        <a href="/#quote">Request Quote</a>
        <a className="btn-secondary" href="/admin/login">
          Login
        </a>
        <a className="btn-primary" href="/request-quote">
          Request Quote
        </a>
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </nav>
  );
}
