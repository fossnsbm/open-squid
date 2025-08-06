import HeroSection from "./components/landing/HeroSection";
import PhaseSection from "./components/landing/PhaseSection";
import RegisterSection from "./components/landing/RegisterSection";
import FAQSection from "./components/common/Faq";
import Footer from "./components/common/Footer";
import AboutUsSection from "./components/landing/AboutUsSection";

export default function Home() {
    return (
        <>
            <HeroSection />
            <PhaseSection />
            <AboutUsSection />
            <RegisterSection />
            <FAQSection />
            <Footer />

        </>
    );
}
