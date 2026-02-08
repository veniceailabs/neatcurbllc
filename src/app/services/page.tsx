import Navbar from "@/components/navbar";
import Services from "@/components/sections/services";
import WhyUs from "@/components/sections/why-us";
import CtaBanner from "@/components/sections/cta";
import Footer from "@/components/footer";

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
