import Navbar from "@/components/navbar";
import Hero from "@/components/sections/hero";
import TrustBar from "@/components/sections/trust-bar";
import Services from "@/components/sections/services";
import WhyUs from "@/components/sections/why-us";
import BbbSection from "@/components/sections/bbb";
import ServiceAreas from "@/components/sections/service-areas";
import CtaBanner from "@/components/sections/cta";
import QuoteForm from "@/components/sections/quote-form";
import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Snow Removal, Lawn Care & Property Maintenance in WNY",
  description:
    "NYS MBE-certified exterior maintenance for homes and commercial properties across Buffalo and Western New York.",
  keywords: [
    "Buffalo snow removal",
    "Western New York landscaping",
    "commercial property maintenance",
    "NYS MBE certified contractor"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Neat Curb LLC | Snow, Lawn & Property Maintenance",
    description:
      "Reliable year-round groundskeeping, seasonal cleanup, and winter safety services in Western New York.",
    url: "https://www.neatcurbllc.com",
    type: "website"
  }
};

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <BbbSection />
        <Services />
        <WhyUs />
        <ServiceAreas />
        <CtaBanner />
        <QuoteForm />
      </main>
      <Footer />
    </div>
  );
}
