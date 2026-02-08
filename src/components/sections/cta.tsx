"use client";

import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function CtaBanner() {
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <section className="cta-banner">
      <div>
        <h2>{copy.cta.title}</h2>
        <p>{copy.cta.body}</p>
      </div>
      <a className="btn-primary" href="/request-quote">
        {copy.cta.button}
      </a>
    </section>
  );
}
