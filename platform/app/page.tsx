import HeroSection from "./components/landing/HeroSection";
import PhaseSection from "./components/landing/PhaseSection";
import AboutUsSection from "./components/landing/AboutUsSection";
import RegisterSection from "./components/landing/RegisterSection";
import FAQSection from "./components/common/Faq";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

export default function Home() {
    return (
        <>

            <Header />
            <HeroSection />
            <PhaseSection />
            <AboutUsSection />
            <RegisterSection />
            <FAQSection />
            <Footer />

        </>
    );
}
