import Header from "./components/common/Header";
import RippleGrid from "./components/landing/RippleGrid";
import HeroSection from "./components/landing/HeroSection";

export default function Home() {
    return (
        <>
            <RippleGrid />
            <Header />
            <HeroSection />
        </>
    );
}
