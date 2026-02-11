"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function QuoteSuccessPage() {
  const { language } = useLanguage();
  const copy = getCopy(language);

  return (
    <main className="success-shell">
      <motion.section
        className="success-card"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="success-icon-wrap"
          animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <CheckCircle2 size={44} />
        </motion.div>
        <h1>{copy.success.title}</h1>
        <p>{copy.success.subtitle}</p>

        <div className="success-timeline">
          {copy.success.steps.map((step, index) => (
            <motion.div
              key={step}
              className="success-step"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.08 }}
            >
              <span className="success-dot" />
              <span>{step}</span>
            </motion.div>
          ))}
        </div>

        <div className="success-actions">
          <a className="btn-primary" href="/admin/login">
            {copy.success.login}
          </a>
          <a className="btn-secondary" href="/">
            {copy.success.home}
          </a>
        </div>
      </motion.section>
    </main>
  );
}
