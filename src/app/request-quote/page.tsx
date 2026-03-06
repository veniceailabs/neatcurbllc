import Navbar from "@/components/navbar";
import QuoteForm from "@/components/sections/quote-form";
import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Quote",
  description:
    "Request a fast quote for snow removal, lawn care, and property maintenance services in Buffalo and Western New York.",
  keywords: [
    "request landscaping quote",
    "snow removal estimate Buffalo",
    "property maintenance quote",
    "commercial groundskeeping proposal"
  ],
  alternates: {
    canonical: "/request-quote"
  },
  openGraph: {
    title: "Request a Quote | Neat Curb LLC",
    description:
      "Tell us about your property and get a responsive quote from a trusted NYS MBE-certified team.",
    url: "https://www.neatcurbllc.com/request-quote",
    type: "website"
  }
};

export default function RequestQuotePage() {
  return (
    <div className="landing-shell">
      <Navbar />
      <main>
        <QuoteForm />
      </main>
      <Footer />
    </div>
  );
}
