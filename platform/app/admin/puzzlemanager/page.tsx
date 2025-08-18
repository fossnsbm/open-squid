"use client";

import { useEffect, useState } from "react";
import Toast from "@/app/components/common/Toast";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
interface User {
    id: string;
    name: string;
    score: number | null;
    createdAt: string | Date;
}

interface ToastState {
    message: string;
    type: "success" | "error";
}

export default function ScoreboardPage() {

      const { data: session, isPending: isSessionLoading } = useSession();
        const router = useRouter();
        const [authChecked, setAuthChecked] = useState(false);
    
        useEffect(() => {
            if (!isSessionLoading) {
                if (!session) {
                    router.push("/admin/login");
                } else if (session.user?.role !== "admin") {
                    router.push("/admin/login");
                } else {
                    setAuthChecked(true);
                }
            }
        }, [session, isSessionLoading, router]);

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showToast, setShowToast] = useState<ToastState | null>(null);
    const [saving, setSaving] = useState<boolean>(false);

     useEffect(() => {
        if (authChecked && session?.user?.role === "admin") {
            loadData();
        }
    }, [authChecked, session]);

    // Fetch users
    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            const data: User[] = await res.json();

            const formattedData = data.map((user) => ({
                ...user,
                createdAt: new Date(user.createdAt),
            }));
            setUsers(formattedData);
        } catch (error) {
            setShowToast({
                message: error instanceof Error ? error.message : "Unknown error",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("/api/users");
                if (!res.ok) throw new Error("Failed to fetch teams");
                const data: User[] = await res.json();

                const formattedData = data.map((user) => ({
                    ...user,
                    createdAt: new Date(user.createdAt),
                }));
                setUsers(formattedData);
            } catch (err) {
                setShowToast({
                    message:
                        err instanceof Error ? err.message : "Unknown error",
                    type: "error",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Handle individual score change (in-memory update only)
    const handleScoreChange = (id: string, value: string) => {
        const score = value === "" ? null : Number(value);

        if (score !== null && isNaN(score)) return;

        setUsers((prev) =>
            prev.map((user) =>
                user.id === id
                    ? {
                          ...user,
                          score: score,
                      }
                    : user
            )
        );
    };

    const saveAllScores = async () => {
        const updatedScores = users.map((user) => ({
            userId: user.id,
            score: user.score === null ? 0 : user.score,
        }));

        if (updatedScores.length === 0) {
            setShowToast({
                message: "No scores to save.",
                type: "error",
            });
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/puzzle-marks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ scores: updatedScores }),
            });

            const result = await res.json();

            if (res.ok || res.status === 207) {
                setShowToast({
                    message: result.message,
                    type: "success",
                });

                // Reset all scores to null after successful save
                setUsers((prev) =>
                    prev.map((user) => ({
                        ...user,
                        score: null,
                    }))
                );
            } else {
                throw new Error(result.message || "Failed to save scores");
            }
        } catch (err) {
            setShowToast({
                message: err instanceof Error ? err.message : "Save failed",
                type: "error",
            });
        } finally {
            setSaving(false);
        }
    };
     if (loading) {
        return (
            <div className="snap-end min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center pt-20 pb-20">
                <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading Admin Panel...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="flex items-center justify-center px-4 font-squid min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-10 pb-20 uppercase">
            {/* Toast Notification */}
            {showToast && (
                <Toast
                    message={showToast.message}
                    type={showToast.type}
                    onClose={() => setShowToast(null)}
                />
            )}

            {/* Main Container */}
            <div className="max-w-6xl mx-auto px-4 w-full">
                <div className="bg-transparent border border-pink-800 rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-pink-800 text-white px-6 py-4">
                        <h2 className="text-xl font-bold text-center">
                            Puzzle Dashboard
                        </h2>
                        <p className="text-pink-100 text-center text-sm mt-1">
                            Assign scores to teams
                        </p>
                    </div>

                    {/* Teams List */}
                    <div className="bg-gray-700 rounded-lg shadow-md p-4 m-4">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold text-white">
                                Teams ({users.length})
                            </h3>
                            <p className="text-gray-400 mt-1">
                                Add Marks to teams
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            {loading ? (
                                <div className="text-center py-10 text-gray-500">
                                    <p className="text-lg">Loading teams...</p>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <p className="text-lg font-medium">
                                        No teams found
                                    </p>
                                    <p className="text-sm">
                                        Start by adding teams via the API.
                                    </p>
                                </div>
                            ) : (
                                users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between bg-gray-800 border border-gray-600 rounded-lg p-4 hover:shadow transition-shadow"
                                    >
                                        <div>
                                            <h4 className="font-semibold text-pink-200 text-lg">
                                                {user.name}
                                            </h4>
                                            <p className="text-gray-500 text-sm">
                                                Joined:{" "}
                                                {new Date(
                                                    user.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <label className="text-gray-300 text-sm">
                                                Score:
                                            </label>
                                            <input
                                                type="number"
                                                value={user.score ?? ""}
                                                onChange={(e) =>
                                                    handleScoreChange(
                                                        user.id,
                                                        e.target.value
                                                    )
                                                }
                                                className="w-24 px-3 py-1 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Save All Button */}
                            <div className="mt-8 text-center">
                                <button
                                    onClick={saveAllScores}
                                    disabled={saving || loading}
                                    className={`py-3 px-8 font-semibold rounded-lg text-white transition
                    ${
                        saving || loading
                            ? "bg-gray-500 cursor-not-allowed"
                            : "bg-pink-600 hover:bg-pink-700"
                    }
                  `}
                                >
                                    {saving ? "Saving..." : "Save All "}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
