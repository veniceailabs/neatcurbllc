import Navbar from "@/components/navbar";
import Hero from "@/components/sections/hero";
import Services from "@/components/sections/services";
import WhyUs from "@/components/sections/why-us";
import BbbSection from "@/components/sections/bbb";
import ServiceAreas from "@/components/sections/service-areas";
import CtaBanner from "@/components/sections/cta";
import QuoteForm from "@/components/sections/quote-form";
import Footer from "@/components/footer";

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <Navbar />
      <main>
        <Hero />
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
