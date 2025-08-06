import HeroSection from "./components/landing/HeroSection";
import PhaseSection from "./components/landing/PhaseSection";
import AboutUsSection from "./components/landing/AboutUsSection";
import RegisterSection from "./components/landing/RegisterSection";
import FAQSection from "./components/common/Faq";

export default function Home() {
    return (
        <>
            <HeroSection />
            <PhaseSection />
            <AboutUsSection />
            <RegisterSection />
            <FAQSection />

        </>
    );
}
