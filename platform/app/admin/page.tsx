"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, authClient } from "@/lib/auth-client";
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
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTeams() {
            try {
                const { data: users, error: usersError } = await authClient.admin.listUsers({
                    query: {
                        sortBy: "createdAt",
                        sortDirection: "desc",
                        filterField: "role",
                        filterValue: "admin",
                        filterOperator: "ne",
                    }
                });

                if (usersError) {
                    throw new Error(usersError.message || "Failed to fetch users");
                }

                if (users) {
                    const formattedTeams = users.users.map(user => ({
                        id: user.id,
                        name: user.name || "No Name",
                        email: user.email || "No Email",
                        createdAt: user.createdAt
                    }));

                    setTeams(formattedTeams);
                }
            } catch (error: any) {
                console.error("Error fetching teams:", error);
                setError(error.message || "Failed to load teams data");
            } finally {
                setIsLoading(false);
            }
        }

        loadTeams();
    }, []);

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

                {/* Use the TeamsList component */}
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
