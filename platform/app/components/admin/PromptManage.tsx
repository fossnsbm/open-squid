"use client";

import { use, useEffect, useState } from "react";
import Toast from "../common/Toast";
import { Play,Trash2, Image as ImageIcon } from "lucide-react";

interface Submission {
    sessionId: string;
    id: string;
    imageUrl: string;
    description: string;
    userName: string;
    userId: string;
    createdAt: string;
    score?: number;
}

interface Session {
    id: string;
    isLive: boolean;
    startTime: string | null;
    endTime: string | null;
}


export default function EchoPromptDashboard() {
    const [selectedSubmission, setSelectedSubmission] =  useState<Submission | null>(null);
    const [promptState, setPromptState] = useState<{
        isLive: boolean;
        sessionId: string | null;
        timeLeft: number | null;
    }>({
        isLive: false,
        sessionId: null,
        timeLeft: null,
    });
    
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const showToastMessage = (message: string, type: "success" | "error") => {
        setShowToast({ message, type });
    };

    const loadSession = async () => {
        try {
            const res = await fetch("/api/prompt-session");
            const sessionData = await res.json();

            setPromptState({
                isLive: sessionData.isLive,
                sessionId: sessionData.id || null,
                timeLeft: sessionData.isLive ? 30 : null,
            });
        } catch (error) {
            console.error("Failed to load session:", error);
            showToastMessage("Failed to load session", "error");
        }
    };

    
    const loadSubmissions = async () => {
        try {
            const res = await fetch("/api/prompt-submission");
            const submissionsData = await res.json();
            setSubmissions(submissionsData);
            console.log("Loaded submissions:", submissionsData);
        } catch (error) {
            console.error("Failed to load submissions:", error);
            showToastMessage("Failed to load submissions", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubmissions();

        const interval = setInterval(() => {
            if (promptState.isLive) {
                // loadSession();
                loadSubmissions();
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [promptState.isLive]);

    const startSession = async () => {
        try {
            console.log("Starting EchoPrompt session...");

            const response = await fetch("/api/prompt-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: `Echo Session ${new Date().toLocaleString()}`,
                    action: "pending",
                    duration: 600,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create session");
            }

            const session: Session = await response.json();
            console.log("Created session:", session);

            const updateResponse = await fetch(
                `/api/prompt-session/${session.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "live" }),
                }
            );

            if (updateResponse.ok) {
                console.log("Session marked as live");

                setPromptState({
                    isLive: true,
                    sessionId: session.id,
                    timeLeft: 600,
                });

                const countdown = setInterval(() => {
                    setPromptState((prev) => {
                        if (prev.timeLeft === 1) {
                            clearInterval(countdown);
                            return { ...prev, timeLeft: 0 };
                        }
                        return { ...prev, timeLeft: (prev.timeLeft || 0) - 1 };
                    });
                }, 1000);

                showToastMessage("EchoPrompt session is now LIVE!", "success");
            } else {
                throw new Error("Failed to update session status to live");
            }
        } catch (error) {
            console.error("Error starting session:", error);
            showToastMessage("Failed to start session", "error");
        }
    };

    const stopSession = async () => {
        if (!promptState.sessionId) return;

        try {
            const response = await fetch(
                `/api/prompt-session/${promptState.sessionId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "stopped" }),
                }
            );

            if (response.ok) {
                setPromptState({
                    isLive: false,
                    sessionId: null,
                    timeLeft: null,
                });
                showToastMessage("EchoPrompt session ended.", "success");
                await loadSession();
            } else {
                throw new Error("Failed to stop session");
            }
        } catch (error) {
            console.error("Error stopping session:", error);
            showToastMessage("Could not end session", "error");
        }
    };

    const toggleSession = async () => {
        if (promptState.isLive) {
            await stopSession();
        } else {
            await startSession();
        }
    };

    const deleteSubmission = async (id: string) => {
        if (!confirm("Delete this submission permanently?")) return;

        try {
            const res = await fetch(`/api/echo-submissions/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setSubmissions((subs) => subs.filter((s) => s.id !== id));
                showToastMessage("Submission deleted", "success");
            } else {
                throw new Error("Failed to delete");
            }
        } catch (err) {
            showToastMessage("Could not delete submission", "error");
        }
    };

    const updateScore = async () => {
        if (!selectedSubmission) return;
        try {
            const res = await fetch("/api/prompt-submission", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedSubmission.userId,
                    sessionId: submissions[0].sessionId, // Assuming all submissions are from the same session
                    score: selectedSubmission.score,
                }),
            });

            if (res.ok) {
                showToastMessage("Score updated successfully", "success");
                setSelectedSubmission(null);
            } else {
                throw new Error("Failed to update score");
            }
        } catch (error) {
            console.error("Error updating score:", error);
            showToastMessage("Failed to update score", "error");
        }
    };

    return (
        <div className="flex items-center justify-center px-4 font-squid min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-10 pb-20 uppercase">
            {/* Modal for viewing submission */}
            {selectedSubmission && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedSubmission(null)}
                >
                    <div
                        className="bg-gray-600 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative">
                            <img
                                src={selectedSubmission.imageUrl}
                                alt="Submission"
                                className="w-full h-96 object-contain rounded-t-lg bg-black"
                            />
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="absolute top-3 right-3 bg-black bg-opacity-60 text-white rounded-full p-2 hover:bg-opacity-80 transition"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-semibold text-pink-200">
                                    {selectedSubmission.userName}
                                </h3>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        placeholder="Score"
                                        className="w-20 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        onChange={(e) =>
                                            setSelectedSubmission({
                                                ...selectedSubmission,
                                                score: Number(e.target.value),
                                            })
                                        }
                                    />
                                    <button
                                        className="py-2 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                                        onClick={updateScore}
                                    >
                                        Submit Score
                                    </button>
                                </div>
                            </div>

                            {selectedSubmission.description ? (
                                <p className="text-gray-300 leading-relaxed text-base">
                                    {selectedSubmission.description}
                                </p>
                            ) : (
                                <p className="text-gray-500 italic">
                                    No description provided.
                                </p>
                            )}
                            <p className="text-sm text-gray-400">
                                Submitted on:{" "}
                                {new Date(
                                    selectedSubmission.createdAt
                                ).toLocaleString()}
                            </p>
                            <div className="pt-4 border-t border-gray-700">
                                <button
                                    onClick={() =>
                                        deleteSubmission(selectedSubmission.id)
                                    }
                                    disabled={!promptState.isLive}
                                    className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50 flex items-center gap-2 font-medium"
                                >
                                    <Trash2 className="h-5 w-5" /> Delete
                                    Submission
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showToast && (
                <Toast
                    message={showToast.message}
                    type={showToast.type}
                    onClose={() => setShowToast(null)}
                />
            )}

            <div className="max-w-6xl mx-auto px-4">
                <div className="bg-transparent border border-pink-800 rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-pink-800 text-white px-6 py-4">
                        <h2 className="text-xl font-bold text-center">
                            EchoPrompt Dashboard
                        </h2>
                        <p className="text-pink-100 text-center text-sm mt-1">
                            Manage live prompt and view submissions
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 mb-6 p-4">
                        {/* Session Control */}
                        <div className="bg-gray-700 rounded-lg border-2 border-gray-600 p-4 shadow-md">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-semibold text-pink-600">
                                    Session Control
                                </h3>
                                <p className="text-white mt-1">
                                    Active session
                                </p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={toggleSession}
                                        disabled={loading}
                                        className={`flex items-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                                            promptState.isLive
                                                ? "bg-red-600 hover:bg-red-700"
                                                : "bg-green-600 hover:bg-green-700"
                                        } text-white disabled:bg-gray-500`}
                                    >
                                        <Play className="h-4 w-4" />
                                        {promptState.isLive
                                            ? "END SESSION"
                                            : "START SESSION"}
                                    </button>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-white">
                                            Status:
                                        </span>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                promptState.isLive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {promptState.isLive
                                                ? "LIVE"
                                                : "OFFLINE"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white">
                                            Total Submissions:
                                        </span>
                                        <span className="font-medium">
                                            {submissions.length}
                                        </span>
                                    </div>

                                    {promptState.isLive &&
                                        promptState.timeLeft !== null && (
                                            <div className="flex justify-between">
                                                <span className="text-white">
                                                    Time Left:
                                                </span>
                                                <span className="font-medium text-yellow-400">
                                                    {promptState.timeLeft}s
                                                </span>
                                            </div>
                                        )}

                                    <div className="flex justify-between">
                                        <span className="text-white">
                                            Duration:
                                        </span>
                                        <span className="font-medium">
                                            {promptState.isLive
                                                ? "600s Active"
                                                : "Idle"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-gray-700 rounded-lg border-2 border-gray-600 p-4 shadow-md">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-semibold text-pink-600">
                                    Instructions
                                </h3>
                                <p className="text-white mt-1">How it works</p>
                            </div>
                            <div className="p-6 space-y-3 text-sm text-gray-300">
                                <p>
                                    • Start the session to allow users to submit
                                    images.
                                </p>
                                <p>• Submissions appear in real time.</p>
                                <p>• You can add marks for submitted images.</p>
                            </div>
                        </div>
                    </div>

                    {/* Submissions Gallery */}
                    <div className="bg-gray-700 rounded-lg shadow-md p-4 m-4">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold text-white">
                                Submissions ({submissions.length})
                            </h3>
                            <p className="text-gray-400 mt-1">
                                View all user-submitted images
                            </p>
                        </div>

                        <div className="p-6">
                            {submissions.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">
                                        No submissions yet
                                    </p>
                                    <p className="text-sm">
                                        Start the session and wait for user
                                        uploads
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {submissions.map((sub) => (
                                        <div
                                            key={sub.id}
                                            className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                                            onClick={() =>
                                                setSelectedSubmission(sub)
                                            }
                                        >
                                            <img
                                                src={sub.imageUrl}
                                                alt="User submission"
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="p-4 space-y-2">
                                                <h4 className="font-medium text-pink-200">
                                                    {sub.userName}
                                                </h4>

                                                <div className="text-xs text-gray-500 mt-2">
                                                    {new Date(
                                                        sub.createdAt
                                                    ).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
