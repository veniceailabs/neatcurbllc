import Navbar from "@/components/navbar";
import QuoteForm from "@/components/sections/quote-form";
import Footer from "@/components/footer";

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
