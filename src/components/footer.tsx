"use client";

import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

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
        <p>Phone: {copy.footer.phone}</p>
        <p>Email: {copy.footer.email}</p>
        <p>Service Area: {copy.footer.serviceArea}</p>
      </div>
    </footer>
  );
}
