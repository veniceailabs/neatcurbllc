import Navbar from "@/components/navbar";
import Services from "@/components/sections/services";
import WhyUs from "@/components/sections/why-us";
import CtaBanner from "@/components/sections/cta";
import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore Neat Curb LLC services: lawn maintenance, landscape design/install, seasonal cleanup, snow plow, and ice management in WNY.",
  keywords: [
    "landscape services Buffalo",
    "seasonal cleanup",
    "snow plow and ice management",
    "lawn maintenance WNY"
  ],
  alternates: {
    canonical: "/services"
  },
  openGraph: {
    title: "Neat Curb LLC Services",
    description:
      "Comprehensive residential and commercial exterior maintenance delivered in-house across Western New York.",
    url: "https://www.neatcurbllc.com/services",
    type: "website"
  }
};

export default function ServicesPage() {
  return (
    <div className="landing-shell">
      <Navbar />
      <main>
        <Services />
        <WhyUs />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
