import Header from "./components/common/Header";
import RippleGrid from "./components/landing/RippleGrid";
import HeroSection from "./components/landing/HeroSection";
import PhaseSection from "./components/landing/PhaseSection";
import RegisterSection from "./components/landing/RegisterSection";

export default function Home() {
    return (
        <>
            <div className="fixed inset-0 z-0 w-full h-full overflow-hidden">
                <RippleGrid />
            </div>
            <Header />
            <HeroSection />
            <PhaseSection />
            <RegisterSection />

        </>
    );
}
