"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, authClient } from "@/lib/auth-client";
import { useTeamsData } from "../hooks/useTeamsData";
import TeamsList from "@/app/components/admin/TeamsList";
import { teamMarks } from "./data";
import LeaderboardTable from "../components/admin/Leaderboard";
import ChallengeCard from "../components/admin/ChallengeCard";


export interface TeamMember {
    name: string;
    email?: string;
    studentId?: string;
}

export interface Team {
    id: string;
    name: string;
    email: string;
    contactNumber?: string;
    role?: string;
    createdAt: Date;
    online?: boolean;
    members?: TeamMember[];
    puzzleProgress?: string;
    queProgress?: string;
    aiProgress?: string;
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
        <div className="min-h-screen flex flex-col bg-gray-900 text-white">
            {/* Fixed Header */}
            <header className="sticky top-0 z-40 bg-gray-800 shadow-md py-4 px-6 border-b border-pink-800">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-pink-500 font-squid">
                        ADMIN DASHBOARD
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-pink-700 hover:bg-pink-800 rounded-md transition-colors text-white font-squid"
                    >
                        LOGOUT
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow p-6 pt-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-6">
                    {/* Leaderboard Section */}
                    <section className="mb-8">
                        <LeaderboardTable teams={teamMarks} limit={5} />
                    </section>

                    {/* Teams Details Section */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 font-squid text-pink-400 text-center uppercase">
                            TEAMS DETAILS
                        </h2>
                        <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-pink-900">
                            {/* Team Stats Summary */}
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-900 p-4 rounded-md border border-pink-800/50">
                                    <span className="text-gray-400 text-sm mb-1 block">Registered Teams</span>
                                    <span className="font-squid text-2xl text-pink-400">
                                        {teams?.length || 0} TEAMS
                                    </span>
                                </div>

                                <div className="bg-gray-900 p-4 rounded-md border border-pink-800/50">
                                    <span className="text-gray-400 text-sm mb-1 block">Online Teams</span>
                                    <span className="font-squid text-2xl text-pink-400">
                                        {teams?.filter(t => t.online)?.length || 0} TEAMS
                                    </span>
                                </div>
                            </div>
                            <TeamsList teams={teams} />
                        </div>
                    </section>

                    {/* Challenges Section */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 font-squid text-pink-400 text-center uppercase">
                            CHALLENGES
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    </section>
                </div>
            </main >

            {/* Teams Popup */}
            {
                showTeamsPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
                        <div className="bg-gray-900 rounded-lg p-6 max-w-3xl max-h-[80vh] overflow-auto relative border-2 border-pink-800">
                            <button
                                className="absolute top-4 right-4 text-pink-400 hover:text-pink-100 hover:bg-pink-800 text-xl font-bold bg-gray-800 w-12 h-12 border rounded-full flex items-center justify-center"
                                onClick={handleClosePopup}
                            >
                                ✕
                            </button>
                            <TeamsList teams={teams} />
                        </div>
                    </div>
                )
            }
        </div >
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

