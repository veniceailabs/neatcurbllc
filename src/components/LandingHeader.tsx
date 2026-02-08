import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LandingHeader() {
  return (
    <header className="landing-header">
      <div className="landing-brand">
        <img
          src="/brand/neat-curb-logo-full.svg"
          alt="Neat Curb LLC full color logo"
        />
        <div>
          <div className="landing-title">Neat Curb LLC</div>
          <div className="landing-subtitle">Crisp. Energetic. Seasonal.</div>
        </div>
      </div>
      <div className="landing-controls">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
