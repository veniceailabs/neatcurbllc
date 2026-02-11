"use client";

import Image from "next/image";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function BbbSection() {
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <section className="section" id="bbb">
      <div className="section-header">
        <div className="section-eyebrow">{copy.bbb.eyebrow}</div>
        <h2>{copy.bbb.title}</h2>
        <p className="section-sub">{copy.bbb.subtitle}</p>
      </div>
      <div className="bbb-grid">
        <div className="bbb-card">
          <div className="bbb-meta">
            <Image
              src="https://m.bbb.org/terminuscontent/dist/img/ab-seal-vertical.svg?tx=w_74"
              alt="BBB Accredited Business badge"
              className="bbb-badge"
              width={74}
              height={112}
              loading="lazy"
              unoptimized
            />
            <div>
              <div className="bbb-title">{copy.bbb.accredited}</div>
              <div className="bbb-founded">{copy.bbb.founded}</div>
              <div className="bbb-rating">{copy.bbb.rating}</div>
              <div className="bbb-note">{copy.bbb.accreditedSince}</div>
            </div>
          </div>
          <a
            className="btn-secondary"
            href={copy.bbb.profileUrl}
            target="_blank"
            rel="noreferrer"
          >
            {copy.bbb.readReviews}
          </a>
        </div>
        <div className="bbb-reviews">
          {copy.bbb.reviews.map((review) => (
            <div key={review.name} className="review-card">
              <div className="review-quote">“{review.quote}”</div>
              <div className="review-name">{review.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
