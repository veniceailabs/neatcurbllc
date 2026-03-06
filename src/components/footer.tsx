"use client";

import { useEffect, useState } from "react";
import { ContactRound, Instagram } from "lucide-react";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export default function Footer() {
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [instagramHandle, setInstagramHandle] = useState(SITE.instagram.handle);
  const cleanInstagramHandle = instagramHandle.replace(/^@/, "");
  const phoneDigits = copy.footer.phone.replace(/\D/g, "");
  const phoneHref =
    phoneDigits.length === 10 ? `tel:+1${phoneDigits}` : `tel:${phoneDigits}`;

  useEffect(() => {
    const saved = window.localStorage.getItem("neatcurb-instagram-handle");
    if (saved) setInstagramHandle(saved);
  }, []);

  return (
    <footer className="footer">
      <div className="footer-col footer-brand">
        <h3>{copy.footer.name}</h3>
        <p>{copy.footer.tagline}</p>
      </div>
      <div className="footer-col">
        <h4>{copy.footer.quickLinks}</h4>
        <div className="footer-link-list">
          <a href="/services">{copy.footer.links.services}</a>
          <a href="/request-quote">{copy.footer.links.requestQuote}</a>
          <a href="/admin/login">{copy.footer.links.login}</a>
        </div>
      </div>
      <div className="footer-col footer-contact">
        <h4>{copy.footer.contact}</h4>
        <div className="footer-contact-list">
          <p>
            <span>{copy.footer.phoneLabel}</span>
            <a href={phoneHref}>{copy.footer.phone}</a>
          </p>
          <p>
            <span>{copy.footer.emailLabel}</span>
            <a href={`mailto:${copy.footer.email}`}>{copy.footer.email}</a>
          </p>
          <p>
            <span>{copy.footer.serviceAreaLabel}</span>
            <strong>{copy.footer.serviceArea}</strong>
          </p>
        </div>
        <div className="footer-social-list">
          <a
            className="social-link"
            href={`https://instagram.com/${cleanInstagramHandle}`}
            target="_blank"
            rel="noreferrer"
          >
            <Instagram size={16} />
            {copy.footer.instagramLabel} @{cleanInstagramHandle}
          </a>
          <a
            className="social-link"
            href={SITE.dot.url}
            target="_blank"
            rel="noreferrer"
          >
            <ContactRound size={16} />
            {copy.footer.dotLabel} · dot.cards/{SITE.dot.slug}
          </a>
        </div>
      </div>
    </footer>
  );
}
