import Navbar from "@/components/navbar";
import QuoteForm from "@/components/sections/quote-form";
import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Quote",
  alternates: {
    canonical: "/request-quote"
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
