"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, authClient } from "@/lib/auth-client";
import { useTeamsData } from "../hooks/useTeamsData";
import TeamsList from "@/app/components/admin/TeamsList";
import { teamMarks } from "./data";
import LeaderboardTable from "../components/admin/Leaderboard";
import ChallengeCard from "../components/admin/ChallengeCard";
import TeamsDataList from "../components/admin/TeamDataList";
import SummaryCard from "../components/admin/SummaryCard";


export interface Team {
    id: string;
    name: string;
    email: string;
    role?: string;
    createdAt: Date;
}

interface Session {
    user?: {
        id: string;
        email: string;
        name?: string;
        role?: string;
    };
}

function AdminContent({ session }: { session: Session }) {
    const router = useRouter();
    const { teams, isLoading, error } = useTeamsData();
    const [showTeamsPopup, setShowTeamsPopup] = useState(false);
    const handleLogout = async () => {
        await signOut();
        router.push("/admin/login");
    };

    const handleClosePopup = () => {
        setShowTeamsPopup((prev) => !prev);
    };

    if (isLoading) {
        return (
            <div className="snap-end flex justify-center items-center min-h-screen bg-gray-900">
                <div className="loader p-5 text-pink-500">Loading teams...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="snap-end flex justify-center items-center min-h-screen bg-gray-900 text-red-500">
                <div className="error-message p-5">{error}</div>
            </div>
        );
    }

    return (
        <div className="snap-end min-h-screen flex flex-col justify-center bg-gray-900 p-6 text-white pt-18">
            <div className=" mx-auto flex flex-col gap-6">
                <div className="flex flex-col gap-6 mb-6">
                    <div className="flex justify-between items-center mb-8 gap-4">
                        <h1 className="text-3xl font-bold text-pink-500 font-squid">
                            ADMIN DASHBOARD
                        </h1>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-pink-700 hover:bg-pink-800 rounded-md transition-colors text-white font-squid"
                        >
                            LOGOUT
                        </button>
                    </div>
                    <LeaderboardTable teams={teamMarks} limit={5} />
                </div>
                <h2 className="w-full text-2xl font-bold mb-4 font-squid text-pink-400 text-center uppercase">
                    TEAMS details
                </h2>
                <div className="grid grid-col md:grid-row gap-6 grid-cols-1 md:grid-cols-2 mb-8">
                    <SummaryCard />
                    <div className="flex flex-col justify-around bg-gray-800 rounded-lg p-6 shadow-xl border border-pink-900 w-full">

                        <button
                            onClick={handleClosePopup}
                            className=" bg-gray-800 cursor-pointer rounded-lg p-6 shadow-xl border border-pink-400 w-full hover:shadow-pink-900"
                        >
                            <h2 className="w-full text-2xl font-bold font-squid text-pink-400 uppercase hover:border-b-2">
                                show teams Details
                            </h2>
                        </button>
                        <button
                            onClick={handleClosePopup}
                            className=" bg-gray-800 cursor-pointer rounded-lg p-6 shadow-xl border border-pink-400 w-full hover:shadow-pink-900"
                        >
                            <h2 className="w-full text-2xl font-bold font-squid text-pink-400 uppercase hover:border-b-2">
                                show Online teams
                            </h2>
                        </button>
                    </div>
                </div>

                <h2 className="w-full text-2xl font-bold mb-4 font-squid text-pink-400 text-center">
                    CHALLENGES
                </h2>
                <div className="grid grid-col md:grid-row gap-6 grid-cols-1 md:grid-cols-3 mb-8">
                    <ChallengeCard
                        title="PUZZLE"
                        link="/data"
                        imgUrl="/games/circle.png"
                    />
                    <ChallengeCard
                        title="QUESTIONNAIRE"
                        link=""
                        imgUrl="/games/triangle.png"
                    />
                    <ChallengeCard
                        title="AI_PROMPT"
                        link=""
                        imgUrl="/games/square.png"
                    />
                </div>

                {/* <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-pink-500 font-squid">ADMIN DASHBOARD</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-pink-700 hover:bg-pink-800 rounded-md transition-colors text-white font-squid"
                    >
                        LOGOUT
                    </button>
                </div> */}

                {/* <TeamsList teams={teams} /> */}
            </div>
            {showTeamsPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
                    <div className="bg-gray-900/10 rounded-lg p-6  max-w-4xl  overflow-auto relative">
                        <button
                            className="absolute top-4 right-4 text-pink-400 hover:text-pink-100 hover:bg-pink-800 text-xl font-bold bg-gray-800 w-12 h-12 border rounded-full "
                            onClick={handleClosePopup}
                        >
                            ✕
                        </button>
                        <TeamsDataList teams={teams} />
                    </div>
                </div>
            )}
        </div>
    );
}
export default function AdminDashboard() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        if (!isPending) {
            if (!session) {
                console.log("No session detected, redirecting to login");
                router.push("/admin/login");
            } else if (session.user?.role !== "admin") {
                console.log("User is not admin, signing out");
                signOut().then(() => router.push("/admin/login"));
            } else {
                console.log("Admin session confirmed");
                setAuthChecked(true);
            }
        }
    }, [session, isPending, router]);

    if (isPending || (!authChecked && session?.user?.role === "admin")) {
        return (
            <div className="snap-end flex justify-center items-center min-h-screen bg-gray-900">
                <div className="loader p-5 text-pink-500">
                    Verifying admin session...
                </div>
            </div>
        );
    }

    if (authChecked && session?.user?.role === "admin") {
        return <AdminContent session={session} />;
    }

    return (
        <div className="snap-end flex justify-center items-center min-h-screen bg-gray-900">
            <div className="loader p-5 text-pink-500">Redirecting...</div>
        </div>
    );
}

