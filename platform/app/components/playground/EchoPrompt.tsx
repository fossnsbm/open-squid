"use client";
import { useState, useEffect } from "react";
import {
    Users,
    ChevronDown,
    RefreshCw,
    Loader2,
    Play,
    Clock,
} from "lucide-react";
import Toast from "../common/Toast";

interface User {
    id: string;
    name: string;
    email?: string;
}

interface Session {
    id: string;
    title?: string;
    action: "pending" | "live" | "completed";
    duration?: number;
    participant_count?: number;
}

interface SessionParticipant {
    id: string;
    session_id: string;
    user_id: string;
    user_name: string;
    score: number;
    total_questions_answered: number;
}

export default function EchoPrompt() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<{
        file?: string;
        description?: string;
    }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showToast, setShowToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [participants, setParticipants] = useState<SessionParticipant[]>([]);
    const [checkingForSession, setCheckingForSession] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isJoined, setIsJoined] = useState(false);

    const showToastMessage = (message: string, type: "success" | "error") => {
        setShowToast({ message, type });
    };

    useEffect(() => {
        loadUsers();
        checkForActiveSession();
    }, []);

    const checkExistingSubmission = async (): Promise<boolean> => {
        if (!currentUser?.id || !currentSession?.id) return false;

        try {
            const res = await fetch(
                `/api/prompt-submission/check?userId=${currentUser.id}&sessionId=${currentSession.id}`
            );

            if (!res.ok) return false;

            const { exists } = await res.json();
            return exists;
        } catch (error) {
            console.error("Error checking existing submission:", error);
            return false;
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            checkForActiveSession();
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (currentSession && currentSession.action === "live") {
            const interval = setInterval(() => {
                // loadParticipants(currentSession.id);
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [currentSession]);

    const loadUsers = async () => {
        try {
            const response = await fetch("/api/teams");
            if (response.ok) {
                const usersData = await response.json();
                setUsers(usersData);
            }
        } catch (error) {
            console.error("Error loading users:", error);
        }
    };

    const checkForActiveSession = async () => {
        try {
            setCheckingForSession(true);

            const response = await fetch("/api/prompt-session");

            if (response.ok) {
                const sessions = await response.json();
                const activeSession = sessions.find(
                    (s: Session) => s.action === "live"
                );

                if (activeSession) {
                    setCurrentSession(activeSession);
                } else {
                    setCurrentSession(null);
                    setIsJoined(false);
                }
            }
        } catch (error) {
            console.error("Error checking for active session:", error);
        } finally {
            setCheckingForSession(false);
        }
    };

    // const loadParticipants = async (sessionId: string) => {
    //     try {
    //         const response = await fetch(`/api/quiz-sessions/${sessionId}/participants`);
    //         if (response.ok) {
    //             const data = await response.json();
    //             setParticipants(data);
    //         }
    //     } catch (error) {
    //         console.error("Error loading participants:", error);
    //     }
    // };

    const joinSession = async () => {
        if (!currentUser || !currentSession) {
            showToastMessage("Please select a user first", "error");
            return;
        }

        try {
            const response = await fetch(
                `/api/prompt-session/${currentSession.id}/participants`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: currentUser.id }),
                }
            );

            if (response.ok) {
                setIsJoined(true);

                showToastMessage("Successfully joined the session!", "success");
            } else {
                showToastMessage("Failed to join session", "error");
            }
        } catch (error) {
            console.error("Error joining session:", error);
            showToastMessage("Failed to join session", "error");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        processFile(selectedFile);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0] || null;
        processFile(droppedFile);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const processFile = (file: File | null) => {
        setErrors((prev) => ({ ...prev, file: undefined }));

        if (!file) {
            setFile(null);
            setPreview(null);
            return;
        }

        if (!["image/jpeg", "image/png"].includes(file.type)) {
            setErrors((prev) => ({
                ...prev,
                file: "Only JPG and PNG files are allowed.",
            }));
            setFile(null);
            setPreview(null);
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            setErrors((prev) => ({
                ...prev,
                file: "File must be under 20MB.",
            }));
            setFile(null);
            setPreview(null);
            return;
        }

        setFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { file?: string; description?: string } = {};

        if (!file) newErrors.file = "An image is required.";

        if (!description.trim())
            newErrors.description = "Description is required.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const alreadySubmitted = await checkExistingSubmission();

            if (alreadySubmitted) {
                setErrors({
                    file: "You have already submitted for this session.",
                });
                showToastMessage("You can only submit once", "error");
                setIsSubmitting(false);
                return;
            }
        } catch (error) {
            setIsSubmitting(false);
            showToastMessage(
                "Failed to validate submission. Please try again.",
                "error"
            );
            return;
        }

        try {
            const response = await fetch("/api/prompt-submission", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUser?.id,
                    sessionId: currentSession?.id,
                    imageUrl: file,
                    description,
                }),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error);

            showToastMessage("Artwork submitted successfully!", "success");

            setDescription("");
            setFile(null);
            setPreview(null);
        } catch (error) {
            showToastMessage(
                error instanceof Error ? error.message : "Submission failed.",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 py-10 px-4 flex items-center justify-center">
            {showToast && (
                <Toast
                    message={showToast.message}
                    type={showToast.type}
                    onClose={() => setShowToast(null)}
                />
            )}

            <div className="max-h-[80vh] overflow-y-auto w-full max-w-md lg:max-w-xl space-y-6">
                {/* Session Status Panel */}
                <div className="bg-gray-800 rounded-xl border-2 border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {checkingForSession ? (
                                <Loader2 className="h-5 w-5 text-pink-500 animate-spin" />
                            ) : (
                                <RefreshCw className="h-5 w-5 text-gray-400" />
                            )}
                            <span className="text-sm text-gray-300">
                                Session Status:
                            </span>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    currentSession?.action === "live"
                                        ? "bg-green-900/50 text-green-200"
                                        : currentSession?.action === "pending"
                                        ? "bg-yellow-900/40 text-yellow-200"
                                        : "bg-gray-700 text-gray-300"
                                }`}
                            >
                                {currentSession?.action === "live"
                                    ? "LIVE"
                                    : currentSession?.action === "pending"
                                    ? "PENDING"
                                    : "NO ACTIVE SESSION"}
                            </span>
                        </div>
                    </div>

                    {/* User Selection */}
                    <div className="flex items-center gap-4 flex-wrap mb-4">
                        <span className="text-sm text-gray-300">
                            Playing as:
                        </span>
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setUserDropdownOpen(!userDropdownOpen)
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 border border-gray-500 rounded-lg text-sm font-medium text-white hover:bg-gray-600 transition-colors"
                            >
                                {currentUser?.name || "Select User"}
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {userDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10 min-w-48">
                                    {users.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => {
                                                setCurrentUser(user);
                                                setUserDropdownOpen(false);
                                                setIsJoined(false);
                                            }}
                                            className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                        >
                                            {user.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Join Session Button */}
                    {currentSession && !isJoined && currentUser && (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={joinSession}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-800 text-white text-sm rounded-md hover:from-pink-700 hover:to-pink-900 transition-all"
                            >
                                <Play className="h-4 w-4" />
                                Join Session
                            </button>
                        </div>
                    )}

                    {/* Joined Status */}
                    {isJoined && (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Joined session - Ready to participate!</span>
                        </div>
                    )}

                    {currentSession?.action === "pending" && (
                        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-300 text-sm">
                                <Clock className="h-4 w-4" />
                                <span>
                                    Session will start soon. Make sure to join!
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Form */}

                {isJoined && (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-transparent p-6 rounded-xl border-2 border-pink-800 space-y-5 shadow-2xl backdrop-blur-sm"
                    >
                        <h1 className="text-2xl font-bold text-center text-pink-200 tracking-wider font-mono uppercase">
                            Submit Image
                        </h1>

                        <div>
                            <label className="block text-gray-300 text-xs text-left mb-2 tracking-wide font-mono">
                                UPLOAD IMAGE (JPG/PNG)
                            </label>

                            <div
                                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 font-mono text-sm
                    ${
                        errors.file
                            ? "border-red-600 bg-red-900/20"
                            : file
                            ? "border-green-600 bg-green-900/20"
                            : "border-gray-600 hover:border-pink-500"
                    }
                  `}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                            >
                                {preview ? (
                                    <div className="space-y-3">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-full h-40 object-cover rounded-md mx-auto shadow-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFile(null);
                                                setPreview(null);
                                            }}
                                            className="text-red-400 hover:text-red-300 text-xs underline"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-gray-400">
                                            Drag & drop an image here
                                        </p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            or
                                        </p>
                                        <label className="mt-2 inline-block bg-pink-900 hover:bg-pink-800 text-white text-xs px-4 py-1.5 rounded-md cursor-pointer font-mono tracking-wide transition-colors">
                                            Browse Files
                                            <input
                                                type="file"
                                                className="sr-only"
                                                accept=".jpg,.jpeg,.png"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </>
                                )}
                            </div>

                            {errors.file && (
                                <p className="text-red-500 text-xs mt-2 font-mono">
                                    {errors.file}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-xs text-left mb-2 tracking-wide font-mono">
                                Prompt
                            </label>
                            <textarea
                                className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 transition-colors text-sm font-mono resize-none"
                                rows={4}
                                placeholder="Put your prompt"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-xs mt-1 font-mono">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full bg-gradient-to-r from-pink-600 to-pink-900 ${
                                isSubmitting
                                    ? "opacity-70 cursor-not-allowed"
                                    : "hover:from-pink-700 hover:to-pink-800"
                            } text-white py-2.5 px-4 rounded-md font-semibold tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-600 font-mono uppercase text-sm`}
                        >
                            {isSubmitting ? "UPLOADING..." : "SUBMIT "}
                        </button>

                        <div className="text-gray-500 text-xs text-center font-mono mt-4">
                            Max 20MB • JPG/PNG only
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
