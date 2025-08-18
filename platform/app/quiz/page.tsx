"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Clock,
    Loader2,
    AlertCircle,
    Trophy,
    Play,
    CheckCircle,
    ListFilter,
    UserPlus,
    RefreshCw
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
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
    const [availableSessions, setAvailableSessions] = useState<QuizSession[]>([]);
    const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Quiz state
    const [isJoined, setIsJoined] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userScore, setUserScore] = useState(0);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);

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

    // Load initial data
    useEffect(() => {
        loadInitialData();
    }, []);

    // Monitor session changes and sync question index
    useEffect(() => {
        console.log("[DEBUG] Monitor effect - currentSession:", currentSession ? 
                  `ID: ${currentSession.id}, Status: ${currentSession.status}` : "null");
                  
        if (currentSession && currentSession.status === "live") {
            const sessionQuestionIndex =
                currentSession.currentQuestionIndex || 0;

            if (sessionQuestionIndex !== currentQuestionIndex) {
                console.log("[DEBUG] Syncing question index:", sessionQuestionIndex);
                // Admin moved to different question, sync up
                setCurrentQuestionIndex(sessionQuestionIndex);
                setTimeLeft(currentSession?.timePerQuestion || 10);
                setSelectedAnswer(null);
                setHasAnswered(false);
            }

            // Only check for updates when quiz is live
            const interval = setInterval(() => {
                if (currentSession) {
                    console.log("[DEBUG] Live polling update");
                    refreshCurrentSession(currentSession.id);
                }
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [currentSession?.currentQuestionIndex, currentSession?.status, currentSession?.id]);

        // Quiz timer - counts down from timeLeft
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (currentSession?.status === "live" && timeLeft > 0 && !hasAnswered) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // When timer reaches 0, auto-submit the selected answer
                        console.log("[DEBUG] Timer reached 0, preparing to submit answer");
                        
                        // Return 0 - the "time's up" effect will handle submission
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [currentSession, timeLeft, hasAnswered]);
    
    // Add a new effect to handle "locked" state when timer runs out
    useEffect(() => {
        if (timeLeft === 0 && !hasAnswered && currentSession?.status === "live") {
            console.log("[DEBUG] Time's up! Handling final answer");
            
            // Add a small delay to create a "locking in" feel
            const submissionTimeout = setTimeout(() => {
                // If time has run out and user hasn't answered, lock in their current selection
                // or mark as "no answer" if nothing selected
                if (selectedAnswer !== null) {
                    // Auto submit the selected answer when time runs out
                    submitAnswer(selectedAnswer);
                    showToast("Time's up! Answer submitted", "success");
                } else {
                    // Mark question as "answered" with no selection (user didn't choose anything)
                    setHasAnswered(true);
                    showToast("Time's up! No answer selected", "error");
                }
            }, 500); // Short delay for visual feedback
            
            return () => clearTimeout(submissionTimeout);
        }
    }, [timeLeft, hasAnswered, selectedAnswer, currentSession]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            // Load questions
            const questionsRes = await fetch("/api/questions");

            if (questionsRes.ok) {
                try {
                    const questionsData = await questionsRes.json();
                    
                    if (!questionsData || !Array.isArray(questionsData)) {
                        console.warn("Received invalid questions data");
                        showToast("Failed to load questions data", "error");
                        return;
                    }
                    
                    setQuestions(questionsData);
                } catch (err) {
                    console.error("Error parsing questions response:", err);
                    showToast("Failed to process questions data", "error");
                }
            } else {
                console.error("Failed to load questions:", questionsRes.status);
                showToast("Failed to load questions", "error");
            }

            // Load all available sessions (pending and live)
            await loadAvailableSessions();
            
        } catch (error) {
            console.error("Error loading data:", error);
            showToast("Failed to load initial data", "error");
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableSessions = async () => {
        try {
            setRefreshing(true);
            // Get all quiz sessions (pending and live)
            const response = await fetch("/api/quiz-sessions");

            if (response.ok) {
                let sessions;
                try {
                    sessions = await response.json();
                    if (!sessions || !Array.isArray(sessions)) {
                        console.warn("Received invalid sessions data:", sessions);
                        return;
                    }
                } catch (err) {
                    console.error("Error parsing sessions response:", err);
                    return;
                }
                
                // Filter sessions by status
                const pendingSessions = sessions.filter(
                    (s: QuizSession) => s?.status === "pending"
                );
                const liveSession = sessions.find(
                    (s: QuizSession) => s?.status === "live"
                );
                const completedSession = sessions.find(
                    (s: QuizSession) => s?.status === "completed" && !liveSession
                );

                // Store available sessions for selection
                setAvailableSessions([...pendingSessions]);

                // If there's a live session, prioritize it
                if (liveSession) {
                    setCurrentSession(liveSession);
                    
                    // Auto-join if user is logged in
                    if (currentUser && !isJoined && liveSession) {
                        joinQuiz(liveSession.id);
                    }
                    
                    // Sync question index and timer
                    const sessionQuestionIndex = liveSession?.currentQuestionIndex || 0;
                    setCurrentQuestionIndex(sessionQuestionIndex);
                    setTimeLeft(liveSession?.timePerQuestion || 10);
                    setSelectedAnswer(null);
                    setHasAnswered(false);
                } 
                // If no live session but there's a completed one
                else if (completedSession) {
                    setCurrentSession(completedSession);
                }
                // Otherwise, if there's no current session selected but pending ones exist
                else if (!currentSession && pendingSessions.length > 0) {
                    // Don't auto-select, let user choose
                }
            }
        } catch (error) {
            console.error("Error loading available sessions:", error);
        } finally {
            setRefreshing(false);
        }
    };

    let statusCheckInterval: NodeJS.Timeout;

    // Polling for pending session status
    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined;
        
        console.log("[DEBUG] Polling effect - isJoined:", isJoined, 
                    "currentSession:", currentSession ? 
                    `ID: ${currentSession.id}, Status: ${currentSession.status}` : "null");
        
        // Only poll when the user has joined a pending session
        if (isJoined && currentSession?.status === "pending" && currentSession) {
            console.log("Starting pending session polling");
            
            // Check more frequently (every 3 seconds) while waiting for the quiz to start
            intervalId = setInterval(() => {
                // Call the function to refresh the current session
                if (currentSession) {  // Add null check
                    refreshCurrentSession(currentSession.id);
                }
            }, 3000);
        }
        
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isJoined, currentSession?.status, currentSession?.id]);

    const refreshCurrentSession = async (sessionId: string) => {
        try {
            console.log("[DEBUG] Refreshing session with ID:", sessionId);
            
            // Make sure we're using the correct API endpoint format
            const response = await fetch(`/api/quiz-sessions/active`, {
                // Include no-cache headers to prevent browser caching
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (response.ok) {
                let updatedSession;
                try {
                    updatedSession = await response.json();
                    if (!updatedSession) {
                        console.warn("Received empty session data");
                        return;
                    }
                    
                    // Update session with latest data
                    setCurrentSession(updatedSession);
                    
                    console.log("Session refreshed:", updatedSession?.status);
                } catch (err) {
                    console.error("Error parsing session response:", err);
                    return;
                }
                
                // If status changed from pending to live, prepare the quiz
                if (updatedSession?.status === "live" && currentSession?.status === "pending") {
                    console.log("Quiz is now live! Preparing interface...");
                    
                    // Set up the quiz interface
                    setCurrentQuestionIndex(updatedSession?.currentQuestionIndex || 0);
                    setTimeLeft(updatedSession?.timePerQuestion || 10);
                    setSelectedAnswer(null);
                    setHasAnswered(false);
                    
                    // Show a toast notification
                    showToast("The quiz has started!", "success");
                }
            } else {
                console.error("Error refreshing session:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error refreshing session:", error);
        }
    };

    const joinQuiz = async (sessionId: string) => {
        if (!currentUser) {
            showToast("You must be logged in to join", "error");
            return;
        }

        try {
            const targetSession = availableSessions.find(s => s.id === sessionId) || currentSession;
            
            if (!targetSession) {
                showToast("Quiz session not found", "error");
                return;
            }

            const response = await fetch(
                `/api/quiz-sessions/${sessionId}/participants`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: currentUser.id }),
                }
            );

            if (response.ok) {
                setIsJoined(true);
                setCurrentSession(targetSession);
                showToast("Successfully joined the quiz!", "success");
                
                // Refresh the session data to get the latest info
                refreshCurrentSession(sessionId);
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

        // Set a visual indication that we're processing the answer
        setSelectedAnswer(answerIndex);
            
        try {
            console.log("[DEBUG] Submitting answer:", answerIndex);
            const isCorrect = answerIndex === currentQuestion.correctAnswer;

            // Prepare API requests
            const answerRequest = fetch("/api/user-answers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUser.id,
                    sessionId: currentSession.id,
                    questionId: currentQuestion.id,
                    selectedAnswer: answerIndex,
                    isCorrect,
                    responseTime:
                        (currentSession?.timePerQuestion || 10) - timeLeft,
                }),
            });
            
            // Prepare score update request if answer is correct
            let scoreUpdateRequest = Promise.resolve(new Response());
            if (isCorrect) {
                // Send PATCH request to update participant's score
                // The existing endpoint overwrites the score, so we need to maintain the existing score
                const currentScore = userScore + 10; // Calculate new score
                scoreUpdateRequest = fetch(
                    `/api/quiz-sessions/${currentSession.id}/participants/${currentUser.id}`, 
                    {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            score: currentScore // Update with the new total score
                        }),
                    }
                );
            }
            
            // Execute both requests in parallel
            const [response, scoreResponse] = await Promise.all([
                answerRequest,
                scoreUpdateRequest
            ]);

            if (response.ok) {
                setHasAnswered(true);
                setQuestionsAnswered(prev => prev + 1);

                // Update score locally if correct
                if (isCorrect) {
                    // First update local state
                    setUserScore(prev => prev + 10); // Updating by 10 points for each correct answer
                    console.log("[DEBUG] Score updated by +10 points");
                    
                    // Check if the score update API call was successful
                    if (!scoreResponse.ok) {
                        console.error("[DEBUG] Failed to update score on server:", await scoreResponse.text());
                    } else {
                        console.log("[DEBUG] Score successfully updated on server");
                    }
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
        setUserScore(0);
        setQuestionsAnswered(0);
        // Reload available sessions
        loadAvailableSessions();
    };

    // Show loading state while session is being established or data is loading
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
                        className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${toast.type === "success"
                            ? "bg-green-600"
                            : "bg-red-600"
                            }`}
                    >
                        {toast.message}
                    </div>
                )}

                {/* User Info Panel */}
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

                            <button
                                onClick={() => loadAvailableSessions()}
                                className="px-3 py-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm rounded-md hover:from-gray-700 hover:to-gray-800 transition-all flex items-center gap-1"
                                disabled={refreshing}
                            >
                                {refreshing ? 
                                    <Loader2 className="h-3 w-3 animate-spin" /> : 
                                    <RefreshCw className="h-3 w-3" />
                                }
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Available Sessions Panel (when not joined or in a quiz) */}
                {!isJoined && availableSessions.length > 0 && !currentSession?.status && (
                    <div className="bg-gray-800 rounded-lg border border-gray-600 shadow-sm mb-6">
                        <div className="p-4 border-b border-gray-600">
                            <h3 className="font-medium text-white flex items-center gap-2">
                                <ListFilter className="h-4 w-4 text-pink-400" />
                                Available Quiz Sessions
                            </h3>
                        </div>
                        <div className="p-4">
                            <div className="space-y-2">
                                {availableSessions.map(quizSession => (
                                    <div key={quizSession.id} className="flex items-center justify-between bg-gray-700/40 p-3 rounded-lg">
                                        <div>
                                            <div className="font-medium text-white">
                                                {quizSession.title || "Quiz Session"}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {quizSession.totalQuestions} questions · {quizSession.timePerQuestion}s per question
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => joinQuiz(quizSession.id)}
                                            className="px-3 py-1 bg-gradient-to-r from-pink-600 to-pink-800 text-white text-sm rounded-md hover:from-pink-700 hover:to-pink-900 transition-all flex items-center gap-1"
                                        >
                                            <UserPlus className="h-3 w-3" />
                                            <span>Join</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Quiz Status Panel */}
                {currentSession && (
                    <div className="bg-gray-800 rounded-lg border border-gray-600 shadow-sm mb-6">
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {refreshing ? (
                                        <Loader2 className="h-5 w-5 text-pink-500 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-5 w-5 text-gray-400" />
                                    )}
                                    <span className="text-sm text-gray-300">
                                        Quiz Status:
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${currentSession?.status === "live"
                                            ? "bg-green-900/50 text-green-200"
                                            : currentSession?.status === "pending"
                                                ? "bg-blue-900/40 text-blue-200"
                                                : currentSession?.status === "completed"
                                                ? "bg-yellow-900/40 text-yellow-200"
                                                : "bg-gray-700 text-gray-300"
                                            }`}
                                    >
                                        {currentSession?.status === "live"
                                            ? "LIVE"
                                            : currentSession?.status === "pending"
                                                ? "WAITING TO START"
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
                                
                                {currentSession?.status === "pending" && !isJoined && currentSession && (
                                    <button
                                        onClick={() => joinQuiz(currentSession.id)}
                                        className="px-3 py-1 bg-gradient-to-r from-pink-600 to-pink-800 text-white text-sm rounded-md hover:from-pink-700 hover:to-pink-900 transition-all"
                                    >
                                        Join Quiz
                                    </button>
                                )}
                            </div>
                            
                            {currentSession?.title && (
                                <div className="mt-2 text-lg font-medium text-white">
                                    {currentSession.title}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Quiz Interface */}
                <div className="bg-gray-800 rounded-lg border border-gray-600 shadow-sm">
                    <div className="p-6 border-b border-gray-600">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Play className="h-5 w-5 text-pink-400" />
                            Live Quiz
                        </h2>
                    </div>

                    <div className="p-6">
                        {/* No session selected or available */}
                        {!currentSession && availableSessions.length === 0 && (
                            <div className="text-center py-12">
                                <Clock className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    No Quiz Sessions Available
                                </h3>
                                <p className="text-gray-400 mb-4">
                                    There are currently no quiz sessions available.
                                </p>
                                <button
                                    onClick={() => loadAvailableSessions()}
                                    className="bg-gradient-to-r from-pink-600 to-pink-800 text-white py-2 px-4 rounded-lg font-medium hover:from-pink-700 hover:to-pink-900 transition-all flex items-center gap-2 mx-auto"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    <span>Refresh</span>
                                </button>
                            </div>
                        )}
                    
                        {/* Waiting for quiz to start */}
                        {currentSession?.status === "pending" && isJoined && (
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-2">
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                <span>Waiting for quiz to start...</span>
                            </div>
                        )}

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
                                                className={`font-mono text-lg font-bold ${timeLeft <= 3
                                                    ? "text-red-400"
                                                    : "text-white"
                                                    }`}
                                            >
                                                {timeLeft > 0 ? `${timeLeft}s` : "Time's up"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-1000 ${timeLeft <= 3
                                                ? "bg-red-500"
                                                : "bg-pink-600"
                                                }`}
                                            style={{
                                                width: `${(((currentSession?.timePerQuestion ||
                                                    10) -
                                                    timeLeft) /
                                                    (currentSession?.timePerQuestion ||
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
                                                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${hasAnswered
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
                                                                : "hover:bg-pink-900/20 hover:border-pink-500 border-gray-600 text-gray-300"
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
                                                            onChange={() => {
                                                                if (!hasAnswered) {
                                                                    // Only set the selected answer, don't submit yet
                                                                    setSelectedAnswer(index);
                                                                }
                                                            }}
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

                                    {/* Show answer status information */}
                                    <div className={`p-4 border rounded-lg text-center ${
                                        hasAnswered 
                                            ? "border-green-600 bg-gray-700" 
                                            : "border-gray-600 bg-gray-700/50"
                                    }`}>
                                        {hasAnswered ? (
                                            <>
                                                <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
                                                <p className="text-gray-300">Your answer has been submitted</p>
                                                <p className="text-sm text-gray-400 mt-1">Waiting for the admin to advance to the next question</p>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="h-6 w-6 text-pink-400 mx-auto mb-2" />
                                                <p className="text-gray-300">
                                                    {!isJoined 
                                                        ? "Join the quiz to answer" 
                                                        : selectedAnswer !== null 
                                                            ? "Answer selected - you can change until time's up" 
                                                            : "Select your answer before time runs out"}
                                                </p>
                                                {timeLeft > 0 ? (
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        Answer will be submitted in: <span className="font-bold">{timeLeft}</span> seconds
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-pink-400 mt-1">
                                                        Time's up! Submitting your answer...
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
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
                                        {userScore} points
                                    </strong>
                                </p>
                                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 max-w-md mx-auto mb-4">
                                    <p className="text-sm text-gray-300">
                                        Questions answered:{" "}
                                        {questionsAnswered}/{questions.length}
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
                                        onClick={() => currentSession && refreshCurrentSession(currentSession.id)}
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
