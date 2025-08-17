"use client";

import { useState, useEffect } from "react";
import {
    Clock,
    RefreshCw,
    Loader2,
    AlertCircle,
    Trophy,
    Play,
    CheckCircle,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
}

// We can keep this interface but we'll get user from session
interface User {
    id: string;
    name: string;
    email?: string;
}

interface QuizSession {
    id: string;
    title?: string;
    status: "pending" | "live" | "completed";
    currentQuestionIndex: number;
    timePerQuestion: number;
    totalQuestions: number;
    participant_count?: number;
}

interface QuizParticipant {
    id: string;
    quiz_session_id: string;
    user_id: string;
    user_name: string;
    score: number;
    total_questions_answered: number;
}

export default function LiveQuizPage() {
    const { data: session, isPending: isSessionLoading } = useSession();
    const currentUser = session?.user;
    const router = useRouter();

    useEffect(() => {
        if (!isSessionLoading && session === null) {
            router.push("/login");
        }
    }, [session, isSessionLoading, router]);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
    const [participants, setParticipants] = useState<QuizParticipant[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkingForQuiz, setCheckingForQuiz] = useState(false);

    // Quiz state
    const [isJoined, setIsJoined] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Toast state
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const currentQuestion = questions[currentQuestionIndex];

    // Debug logging
    console.log("Quiz Debug:", {
        questionsCount: questions.length,
        currentQuestionIndex,
        currentQuestion: currentQuestion?.question,
        sessionStatus: currentSession?.status,
        sessionQuestionIndex: currentSession?.currentQuestionIndex,
        timeLeft,
        hasAnswered,
    });

    // Load initial data
    useEffect(() => {
        loadInitialData();
    }, []);

    // Auto-join quiz when session and user are available
    useEffect(() => {
        if (currentSession?.status === "live" && currentUser && !isJoined) {
            joinQuiz();
        }
    }, [currentSession, currentUser, isJoined]);

    // Check for active quiz sessions
    useEffect(() => {
        const interval = setInterval(() => {
            checkForActiveQuiz();
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    // Monitor session changes and sync question index
    useEffect(() => {
        if (currentSession && currentSession.status === "live") {
            const sessionQuestionIndex =
                currentSession.currentQuestionIndex || 0;

            if (sessionQuestionIndex !== currentQuestionIndex) {
                // Admin moved to different question, sync up
                setCurrentQuestionIndex(sessionQuestionIndex);
                setTimeLeft(currentSession.timePerQuestion || 10);
                setSelectedAnswer(null);
                setHasAnswered(false);
            }
        }
    }, [currentSession?.currentQuestionIndex]);

    // Quiz timer - counts down from timeLeft
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (currentSession?.status === "live" && timeLeft > 0 && !hasAnswered) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Time's up, auto-submit or mark as no answer
                        if (selectedAnswer !== null) {
                            submitAnswer(selectedAnswer);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [currentSession, timeLeft, hasAnswered, selectedAnswer]);

    // Load participants when session is active
    useEffect(() => {
        if (currentSession && currentSession.status === "live") {
            const interval = setInterval(() => {
                loadParticipants(currentSession.id);
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [currentSession]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            // Only need to load questions now
            const questionsRes = await fetch("/api/questions");

            if (questionsRes.ok) {
                const questionsData = await questionsRes.json();
                console.log("Loaded questions:", questionsData);
                setQuestions(questionsData);
            } else {
                console.error("Failed to load questions:", questionsRes.status);
                showToast("Failed to load questions", "error");
            }

            // Also check for active quiz immediately
            await checkForActiveQuiz();
        } catch (error) {
            console.error("Error loading data:", error);
            showToast("Failed to load initial data", "error");
        } finally {
            setLoading(false);
        }
    };

    const checkForActiveQuiz = async () => {
        try {
            setCheckingForQuiz(true);

            // Get all quiz sessions and find the active one
            const response = await fetch("/api/quiz-sessions");

            if (response.ok) {
                const sessions = await response.json();
                const activeSession = sessions.find(
                    (s: QuizSession) => s.status === "live"
                );
                const completedSession = sessions.find(
                    (s: QuizSession) => s.status === "completed"
                );

                if (activeSession) {
                    setCurrentSession(activeSession);

                    // Sync question index and timer
                    const sessionQuestionIndex = activeSession.currentQuestionIndex || 0;
                    const timePerQuestion = activeSession.timePerQuestion || 10;

                    if (sessionQuestionIndex !== currentQuestionIndex) {
                        setCurrentQuestionIndex(sessionQuestionIndex);
                        setTimeLeft(timePerQuestion);
                        setSelectedAnswer(null);
                        setHasAnswered(false);
                    }
                } else if (completedSession && !activeSession) {
                    setCurrentSession(completedSession);
                } else {
                    setCurrentSession(null);
                    setIsJoined(false);
                }
            }
        } catch (error) {
            console.error("Error checking for active quiz:", error);
        } finally {
            setCheckingForQuiz(false);
        }
    };

    const loadParticipants = async (sessionId: string) => {
        try {
            const response = await fetch(
                `/api/quiz-sessions/${sessionId}/participants`
            );
            if (response.ok) {
                const data = await response.json();
                setParticipants(data);
            }
        } catch (error) {
            console.error("Error loading participants:", error);
        }
    };

    const joinQuiz = async () => {
        if (!currentUser || !currentSession) {
            showToast("You must be logged in to join", "error");
            return;
        }

        try {
            const response = await fetch(
                `/api/quiz-sessions/${currentSession.id}/participants`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: currentUser.id }),
                }
            );

            if (response.ok) {
                setIsJoined(true);
                await loadParticipants(currentSession.id);
                showToast("Successfully joined the quiz!", "success");
            } else {
                showToast("Failed to join quiz", "error");
            }
        } catch (error) {
            console.error("Error joining quiz:", error);
            showToast("Failed to join quiz", "error");
        }
    };

    const submitAnswer = async (answerIndex: number) => {
        if (!currentUser || !currentSession || !currentQuestion || hasAnswered)
            return;

        try {
            const isCorrect = answerIndex === currentQuestion.correctAnswer;

            // Submit answer to server
            const response = await fetch("/api/user-answers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUser.id,
                    sessionId: currentSession.id,
                    questionId: currentQuestion.id,
                    selectedAnswer: answerIndex,
                    isCorrect,
                    responseTime:
                        (currentSession.timePerQuestion || 10) - timeLeft,
                }),
            });

            if (response.ok) {
                setHasAnswered(true);

                // Update participant score if correct
                if (isCorrect) {
                    // Refresh participants to get updated score
                    await loadParticipants(currentSession.id);
                }

                showToast(
                    isCorrect ? "Correct!" : "Incorrect",
                    isCorrect ? "success" : "error"
                );
            } else {
                showToast("Failed to submit answer", "error");
            }
        } catch (error) {
            console.error("Error submitting answer:", error);
            showToast("Failed to submit answer", "error");
        }
    };

    const resetForNewQuiz = () => {
        setCurrentSession(null);
        setSelectedAnswer(null);
        setHasAnswered(false);
        setIsJoined(false);
        setTimeLeft(10);
        setCurrentQuestionIndex(0);
        setParticipants([]);
    };

    if (isSessionLoading || loading) {
        return (
            <div className="snap-end min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center pt-20 pb-20">
                <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading Quiz...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="snap-end min-h-screen bg-gray-900 py-8 mt-20">
            <div className="max-w-4xl mx-auto px-4">
                {/* Toast Notification */}
                {toast && (
                    <div
                        className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${
                            toast.type === "success"
                                ? "bg-green-600"
                                : "bg-red-600"
                        }`}
                    >
                        {toast.message}
                    </div>
                )}

                {/* User Info Panel - Simplified */}
                <div className="bg-gray-800 rounded-lg border border-gray-600 shadow-sm mb-6">
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-300">
                                    Logged in as:
                                </span>
                                <span className="font-medium text-white">
                                    {currentUser?.name || "Unknown User"}
                                </span>
                            </div>
                            
                            {currentSession?.status === "live" && !isJoined && (
                                <button
                                    onClick={joinQuiz}
                                    className="px-3 py-1 bg-gradient-to-r from-pink-600 to-pink-800 text-white text-sm rounded-md hover:from-pink-700 hover:to-pink-900 transition-all"
                                >
                                    Join Quiz
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quiz Status Panel */}
                <div className="bg-gray-800 rounded-lg border border-gray-600 shadow-sm mb-6">
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {checkingForQuiz ? (
                                    <Loader2 className="h-5 w-5 text-pink-500 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-5 w-5 text-gray-400" />
                                )}
                                <span className="text-sm text-gray-300">
                                    Quiz Status:
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        currentSession?.status === "live"
                                            ? "bg-green-900/50 text-green-200"
                                            : currentSession?.status ===
                                              "completed"
                                            ? "bg-yellow-900/40 text-yellow-200"
                                            : "bg-gray-700 text-gray-300"
                                    }`}
                                >
                                    {currentSession?.status === "live"
                                        ? "LIVE"
                                        : currentSession?.status === "completed"
                                        ? "COMPLETED"
                                        : "WAITING"}
                                </span>
                            </div>

                            {currentSession?.status === "live" && (
                                <div className="text-sm text-gray-300">
                                    Question {currentQuestionIndex + 1} of{" "}
                                    {questions.length}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Quiz Interface - Rest of the component remains the same */}
                <div className="bg-gray-800 rounded-lg border border-gray-600 shadow-sm">
                    <div className="p-6 border-b border-gray-600">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Play className="h-5 w-5 text-pink-400" />
                            Live Quiz
                        </h2>
                    </div>

                    <div className="p-6">
                        {/* Waiting State */}
                        {!currentSession?.status ||
                            (currentSession?.status === "pending" && (
                                <div className="text-center py-12">
                                    <Clock className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        Waiting for Quiz to Start
                                    </h3>
                                    <p className="text-gray-400 mb-4">
                                        The admin will start the quiz shortly.
                                    </p>
                                    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 max-w-md mx-auto">
                                        <div className="flex items-center gap-2 text-pink-300">
                                            <span className="font-medium">
                                                Ready to play!
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {/* Live Quiz */}
                        {currentSession?.status === "live" &&
                            currentQuestion && (
                                <div className="space-y-6">
                                    {/* Timer and Progress */}
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-300">
                                            Question {currentQuestionIndex + 1}{" "}
                                            of {questions.length}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span
                                                className={`font-mono text-lg font-bold ${
                                                    timeLeft <= 3
                                                        ? "text-red-400"
                                                        : "text-white"
                                                }`}
                                            >
                                                {timeLeft}s
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-1000 ${
                                                timeLeft <= 3
                                                    ? "bg-red-500"
                                                    : "bg-pink-600"
                                            }`}
                                            style={{
                                                width: `${
                                                    (((currentSession.timePerQuestion ||
                                                        10) -
                                                        timeLeft) /
                                                        (currentSession.timePerQuestion ||
                                                            10)) *
                                                    100
                                                }%`,
                                            }}
                                        />
                                    </div>

                                    {/* Question */}
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-4">
                                            {currentQuestion.question}
                                        </h3>

                                        <div className="space-y-3">
                                            {currentQuestion.options.map(
                                                (option, index) => (
                                                    <label
                                                        key={index}
                                                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                            hasAnswered
                                                                ? index ===
                                                                  currentQuestion.correctAnswer
                                                                    ? "bg-green-900/40 border-green-600 text-green-200"
                                                                    : selectedAnswer ===
                                                                      index
                                                                    ? "bg-red-900/40 border-red-600 text-red-200"
                                                                    : "bg-gray-700 border-gray-600 text-gray-300"
                                                                : selectedAnswer ===
                                                                  index
                                                                ? "bg-pink-900/30 border-pink-600 text-white"
                                                                : "hover:bg-gray-600 border-gray-600 text-gray-300"
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="answer"
                                                            value={index}
                                                            checked={
                                                                selectedAnswer ===
                                                                index
                                                            }
                                                            onChange={() =>
                                                                !hasAnswered &&
                                                                setSelectedAnswer(
                                                                    index
                                                                )
                                                            }
                                                            disabled={
                                                                hasAnswered
                                                            }
                                                            className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                                                        />
                                                        <span className="flex-1">
                                                            {option}
                                                        </span>
                                                        {hasAnswered &&
                                                            index ===
                                                                currentQuestion.correctAnswer && (
                                                                <CheckCircle className="h-5 w-5 text-green-400" />
                                                            )}
                                                    </label>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            selectedAnswer !== null &&
                                            submitAnswer(selectedAnswer)
                                        }
                                        disabled={
                                            selectedAnswer === null ||
                                            hasAnswered ||
                                            !isJoined
                                        }
                                        className="w-full bg-gradient-to-r from-pink-600 to-pink-800 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-700 hover:to-pink-900 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all"
                                    >
                                        {!isJoined
                                            ? "Join Quiz First"
                                            : hasAnswered
                                            ? "Answer Submitted"
                                            : "Submit Answer"}
                                    </button>
                                </div>
                            )}

                        {/* Quiz Completed */}
                        {currentSession?.status === "completed" && (
                            <div className="text-center py-12">
                                <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Quiz Completed!
                                </h3>
                                <p className="text-gray-400 mb-4">
                                    Your final score:{" "}
                                    <strong className="text-2xl text-pink-300">
                                        {participants.find(
                                            (p) => p.user_id === currentUser?.id
                                        )?.score || 0}{" "}
                                        points
                                    </strong>
                                </p>
                                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 max-w-md mx-auto mb-4">
                                    <p className="text-sm text-gray-300">
                                        Questions answered:{" "}
                                        {participants.find(
                                            (p) => p.user_id === currentUser?.id
                                        )?.total_questions_answered || 0}
                                        /{questions.length}
                                    </p>
                                </div>
                                <button
                                    onClick={resetForNewQuiz}
                                    className="bg-gradient-to-r from-pink-600 to-pink-800 text-white py-2 px-4 rounded-lg font-medium hover:from-pink-700 hover:to-pink-900 transition-all"
                                >
                                    Ready for Next Quiz
                                </button>
                            </div>
                        )}

                        {/* Error State */}
                        {currentSession?.status === "live" &&
                            !currentQuestion && (
                                <div className="text-center py-12">
                                    <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
                                    <h3 className="text-xl font-semibold mb-2 text-red-400">
                                        Question Not Available
                                    </h3>
                                    <p className="text-gray-400 mb-4">
                                        There seems to be an issue loading the
                                        current question.
                                    </p>
                                    <button
                                        onClick={checkForActiveQuiz}
                                        className="bg-gradient-to-r from-pink-600 to-pink-800 text-white py-2 px-4 rounded-lg font-medium hover:from-pink-700 hover:to-pink-900 transition-all"
                                    >
                                        Refresh
                                    </button>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}
