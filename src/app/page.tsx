import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SignatureZoom from "@/components/SignatureZoom";
import ProductShowcase from "@/components/ProductShowcase";
import Craftsmanship from "@/components/Craftsmanship";
import LookbookGrid from "@/components/LookbookGrid";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <SignatureZoom />
        <ProductShowcase />
        <Craftsmanship />
        <LookbookGrid />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
