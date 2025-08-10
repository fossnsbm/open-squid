"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, authClient } from "@/lib/auth-client";
import { useTeamsData } from "../hooks/useTeamsData";
import TeamsList from "@/app/components/admin/TeamsList";

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

    const handleLogout = async () => {
        await signOut();
        router.push("/admin/login");
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
        <div className="snap-end min-h-screen flex flex-col justify-center bg-gray-900 p-6 text-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-pink-500 font-squid">ADMIN DASHBOARD</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-pink-700 hover:bg-pink-800 rounded-md transition-colors text-white font-squid"
                    >
                        LOGOUT
                    </button>
                </div>

                <TeamsList teams={teams} />
            </div>
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
            } else if (session.user?.role !== 'admin') {
                console.log("User is not admin, signing out");
                signOut().then(() => router.push("/admin/login"));
            } else {
                console.log("Admin session confirmed");
                setAuthChecked(true);
            }
        }
    }, [session, isPending, router]);

    if (isPending || (!authChecked && session?.user?.role === 'admin')) {
        return (
            <div className="snap-end flex justify-center items-center min-h-screen bg-gray-900">
                <div className="loader p-5 text-pink-500">
                    Verifying admin session...
                </div>
            </div>
        );
    }

    if (authChecked && session?.user?.role === 'admin') {
        return <AdminContent session={session} />;
    }

    return (
        <div className="snap-end flex justify-center items-center min-h-screen bg-gray-900">
            <div className="loader p-5 text-pink-500">
                Redirecting...
            </div>
        </div>
    );
}
