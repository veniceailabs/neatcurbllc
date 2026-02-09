"use client";

import { Instagram } from "lucide-react";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export default function Footer() {
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <footer className="footer">
      <div>
        <h3>{copy.footer.name}</h3>
        <p>{copy.footer.tagline}</p>
      </div>
      <div>
        <h4>{copy.footer.quickLinks}</h4>
        <a href="/services">{copy.footer.links.services}</a>
        <a href="/request-quote">{copy.footer.links.requestQuote}</a>
        <a href="/admin/login">{copy.footer.links.login}</a>
      </div>
      <div>
        <h4>{copy.footer.contact}</h4>
        <p>
          {copy.footer.phoneLabel}: {copy.footer.phone}
        </p>
        <p>
          {copy.footer.emailLabel}: {copy.footer.email}
        </p>
        <p>
          {copy.footer.serviceAreaLabel}: {copy.footer.serviceArea}
        </p>
        <a
          className="social-link"
          href={SITE.instagram.url}
          target="_blank"
          rel="noreferrer"
        >
          <Instagram size={16} />
          {copy.footer.instagramLabel} @{SITE.instagram.handle}
        </a>
      </div>
    </footer>
  );
}
