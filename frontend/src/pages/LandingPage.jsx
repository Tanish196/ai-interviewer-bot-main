import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import EditorialQuoteSection from '../components/EditorialQuoteSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface selection:bg-primary/30 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(circle_at_10%_0%,rgba(74,112,169,0.22),transparent_35%),radial-gradient(circle_at_90%_90%,rgba(143,171,212,0.18),transparent_40%)]" />
      <Navbar />
      <main className="relative overflow-hidden z-10">
        <HeroSection />
        <FeaturesSection />
        <EditorialQuoteSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;

