import ThemeToggle from "@/components/theme-toggle";
import LanguageToggle from "@/components/language-toggle";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img
          src="/brand/neat-curb-logo-full.svg"
          alt="Neat Curb LLC logo"
        />
      </div>
      <div className="navbar-links">
        <a href="/services">Services</a>
        <a href="/#areas">Service Areas</a>
        <a className="btn-primary" href="/request-quote">
          Request Quote
        </a>
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </nav>
  );
}
