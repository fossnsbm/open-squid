import HeroSection from "./components/landing/HeroSection";
import PhaseSection from "./components/landing/PhaseSection";
import AboutUsSection from "./components/landing/AboutUsSection";
import RegisterSection from "./components/landing/RegisterSection";
import FAQSection from "./components/common/Faq";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import LeaderboardTable, {TeamMarks} from "./components/admin/Leaderboard";

export default function Home() {

    const teams: TeamMarks[] = [
        { id: "1", name: "Team Alpha", puzzle: 5, que: 8, ai: 10 },
        { id: "2", name: "Team Beta", puzzle: 10, que: 7, ai: 5 },
        { id: "3", name: "Team Gamma", puzzle: 2, que: 5, ai: 15 },
        { id: "4", name: "Team Delta", puzzle: 8, que: 6, ai: 6 },
        { id: "5", name: "Team Epsilon", puzzle: 6, que: 9, ai: 4 },
        { id: "6", name: "Team Zeta", puzzle: 7, que: 10, ai: 3 },
        { id: "7", name: "Team Eta", puzzle: 4, que: 8, ai: 9 },
        { id: "8", name: "Team Theta", puzzle: 9, que: 5, ai: 2 },
        { id: "9", name: "Team Iota", puzzle: 3, que: 4, ai: 12 },
        { id: "10", name: "Team Kappa", puzzle: 1, que: 2, ai: 14 },
        { id: "11", name: "Team Lambda", puzzle: 11, que: 3, ai: 1 },
        { id: "12", name: "Team Mu", puzzle: 12, que: 1, ai: 0 }
    ];

    return (
        <>

            {/* <Header /> */}
            {/* <HeroSection /> */}
            {/* <PhaseSection /> */}
            {/* <AboutUsSection /> */}
            {/* <RegisterSection /> */}
            {/* <FAQSection /> */}
            {/* <Footer /> */}
            <LeaderboardTable 
                teams={teams}
                limit={3}
            />

        </>
    );
}
