"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
    Play,
    Square,
    Plus,
    Trash2,
    ChevronDown,
    Users,
    Database,
    Settings,
    Clock,
    RefreshCw,
    Loader2,
    PlusCircle,
    Calendar,
    ListFilter,
    ShieldAlert,
} from "lucide-react";
import Toast from "@/app/components/common/Toast";

interface Question {
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
}

interface User {
    id: string;
    name: string;
    email?: string;
}

interface QuizSession {
    id: string;
    title?: string;
    status: "pending" | "live" | "completed";
    current_question_index: number;
    time_per_question: number;
    total_questions: number;
    participant_count?: number;
    created_at?: string;
}

interface QuizParticipant {
    id: string;
    quiz_session_id: string;
    user_id: string;
    user_name: string;
    score: number;
    total_questions_answered: number;
}

interface QuizState {
    isLive: boolean;
    currentQuestionIndex: number;
    timeLeft: number;
    isFinished: boolean;
    sessionId?: string;
}

export default function QuizManage() {
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

    const [questions, setQuestions] = useState<Question[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [participants, setParticipants] = useState<QuizParticipant[]>([]);
    const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentSession, setCurrentSession] = useState<QuizSession | null>(
        null
    );
    const [showToast, setShowToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const [quizState, setQuizState] = useState<QuizState>({
        isLive: false,
        currentQuestionIndex: 0,
        timeLeft: 10,
        isFinished: false,
    });

    const [newQuestion, setNewQuestion] = useState({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
    });

    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [newSessionTitle, setNewSessionTitle] = useState("");
    const [newSessionTimePerQuestion, setNewSessionTimePerQuestion] = useState(10);

    const showToastMessage = (message: string, type: "success" | "error") => {
        setShowToast({ message, type });
    };

    useEffect(() => {
        if (authChecked && session?.user?.role === "admin") {
            loadData();
        }
    }, [authChecked, session]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (currentSession && quizState.isLive) {
            interval = setInterval(() => {
                loadParticipants(currentSession.id);
            }, 3000); // Update participants every 3 seconds
        }
        return () => clearInterval(interval);
    }, [currentSession, quizState.isLive]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (
            quizState.isLive &&
            !quizState.isFinished &&
            quizState.timeLeft > 0
        ) {
            interval = setInterval(() => {
                setQuizState((prev) => ({
                    ...prev,
                    timeLeft: prev.timeLeft - 1,
                }));
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [quizState.isLive, quizState.timeLeft, quizState.isFinished]);
    
    const [responsesForCurrentQuestion, setResponsesForCurrentQuestion] = useState(0);
    
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (currentSession && quizState.isLive) {
            const fetchResponses = async () => {
                try {
                    const response = await fetch(
                        `/api/quiz-sessions/${currentSession.id}/responses?questionIndex=${quizState.currentQuestionIndex}`
                    );
                    
                    if (response.ok) {
                        const answersData = await response.json();
                        setResponsesForCurrentQuestion(answersData.length);
                    }
                } catch (error) {
                }
            };
            
            fetchResponses();
            interval = setInterval(fetchResponses, 3000);
        }
        
        return () => clearInterval(interval);
    }, [currentSession?.id, quizState.isLive, quizState.currentQuestionIndex]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [questionsRes, usersRes, sessionsRes] = await Promise.all([
                fetch("/api/questions"),
                fetch("/api/users"),
                fetch("/api/quiz-sessions"),
            ]);

            if (questionsRes.ok) {
                const questionsData = await questionsRes.json();
                setQuestions(questionsData);
            }

            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(usersData);
            }

            if (sessionsRes.ok) {
                const sessionsData = await sessionsRes.json();
                setQuizSessions(sessionsData);
                
                const liveSession = sessionsData.find(
                    (s: QuizSession) => s.status === "live"
                );
                
                if (liveSession) {
                    setCurrentSession(liveSession);
                    setQuizState({
                        isLive: true,
                        currentQuestionIndex: liveSession.current_question_index,
                        timeLeft: liveSession.time_per_question,
                        isFinished: false,
                        sessionId: liveSession.id,
                    });
                    loadParticipants(liveSession.id);
                }
            }
        } catch (error) {
            showToastMessage("Failed to load data from database", "error");
        } finally {
            setLoading(false);
        }
    };

    const refreshSessions = async () => {
        try {
            setRefreshing(true);
            const response = await fetch("/api/quiz-sessions");
            
            if (response.ok) {
                const sessions = await response.json();
                setQuizSessions(sessions);
                
                if (currentSession) {
                    const updatedSession = sessions.find(
                        (s: QuizSession) => s.id === currentSession.id
                    );
                    
                    if (updatedSession) {
                        setCurrentSession(updatedSession);
                    }
                }
            }
        } catch (error) {
        } finally {
            setRefreshing(false);
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
        }
    };

    const createQuizSession = async () => {
        if (questions.length === 0) {
            showToastMessage(
                "Please add questions before creating a quiz session",
                "error"
            );
            return;
        }

        if (!newSessionTitle.trim()) {
            showToastMessage("Please enter a title for the quiz session", "error");
            return;
        }

        try {
            const response = await fetch("/api/quiz-sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newSessionTitle,
                    timePerQuestion: newSessionTimePerQuestion,
                    totalQuestions: questions.length,
                    status: "pending", // Create in pending state
                    currentQuestionIndex: 0
                }),
            });

            if (response.ok) {
                const session = await response.json();
                setIsCreatingSession(false);
                setNewSessionTitle("");
                
                await refreshSessions();
                
                showToastMessage(
                    `Quiz session "${newSessionTitle}" created successfully! Users can now join.`,
                    "success"
                );
            } else {
                showToastMessage("Failed to create quiz session", "error");
            }
        } catch (error) {
            showToastMessage("Failed to create quiz session", "error");
        }
    };

    const startQuiz = async () => {
        if (currentSession) {
            try {
                const updateResponse = await fetch(
                    `/api/quiz-sessions/${currentSession.id}`,
                    {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            status: "live",
                            currentQuestionIndex: 0,
                        }),
                    }
                );

                if (updateResponse.ok) {
                    
                    const updatedSession = await updateResponse.json();
                    setCurrentSession(updatedSession);

                    setQuizState({
                        isLive: true,
                        currentQuestionIndex: 0,
                        timeLeft: currentSession.time_per_question || 10,
                        isFinished: false,
                        sessionId: currentSession.id,
                    });

                    await loadParticipants(currentSession.id);
                    await refreshSessions();

                    showToastMessage(
                        `Quiz "${currentSession.title}" is now LIVE! ${questions.length} questions ready.`,
                        "success"
                    );
                }
            } catch (error) {
                showToastMessage("Failed to start quiz", "error");
            }
        } else {
            showToastMessage("Please select a quiz session to start", "error");
        }
    };

    const stopQuiz = async () => {
        if (currentSession) {
            try {
                await fetch(`/api/quiz-sessions/${currentSession.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "completed" }),
                });

                setQuizState((prev) => ({
                    ...prev,
                    isLive: false,
                    isFinished: true,
                }));

                await refreshSessions();
                
                showToastMessage(
                    "Quiz has been stopped successfully.",
                    "success"
                );
            } catch (error) {
                showToastMessage("Failed to stop quiz", "error");
            }
        }
    };

    const moveToNextQuestion = async () => {
        if (!currentSession) return;

        if (quizState.currentQuestionIndex < questions.length - 1) {
            const newIndex = quizState.currentQuestionIndex + 1;

            try {
                await fetch(`/api/quiz-sessions/${currentSession.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: "live",
                        currentQuestionIndex: newIndex,
                    }),
                });

                setQuizState((prev) => ({
                    ...prev,
                    currentQuestionIndex: newIndex,
                    timeLeft: currentSession.time_per_question || 10,
                }));

                showToastMessage(
                    `Question ${newIndex + 1} of ${questions.length}`,
                    "success"
                );
            } catch (error) {
            }
        } else {
            try {
                await fetch(`/api/quiz-sessions/${currentSession.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "completed" }),
                });

                setQuizState((prev) => ({
                    ...prev,
                    isFinished: true,
                    isLive: false,
                }));

                await refreshSessions();
                
                showToastMessage("Quiz completed!", "success");
            } catch (error) {
            }
        }
    };

    const selectSession = (session: QuizSession) => {
        setCurrentSession(session);
        
        if (session.status === "live") {
            setQuizState({
                isLive: true,
                currentQuestionIndex: session.current_question_index,
                timeLeft: session.time_per_question,
                isFinished: false,
                sessionId: session.id,
            });
            
            loadParticipants(session.id);
        } else {
            setQuizState({
                isLive: false,
                currentQuestionIndex: 0,
                timeLeft: session.time_per_question,
                isFinished: session.status === "completed",
                sessionId: session.id,
            });
            
            if (session.status === "completed") {
                loadParticipants(session.id);
            }
        }
    };

    const deleteSession = async (id: string) => {
        if (quizState.isLive && currentSession?.id === id) {
            showToastMessage(
                "Cannot delete an active quiz session. Stop it first.",
                "error"
            );
            return;
        }

        try {
            const response = await fetch(`/api/quiz-sessions/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                if (currentSession?.id === id) {
                    setCurrentSession(null);
                }
                
                await refreshSessions();
                showToastMessage("Quiz session deleted successfully", "success");
            } else {
                showToastMessage("Failed to delete quiz session", "error");
            }
        } catch (error) {
            showToastMessage("Failed to delete quiz session", "error");
        }
    };

    const addQuestion = async () => {
        if (!newQuestion.question.trim()) {
            showToastMessage("Please enter a question", "error");
            return;
        }

        if (!newQuestion.options.every((opt) => opt.trim())) {
            showToastMessage("Please fill in all answer options", "error");
            return;
        }

        try {
            const response = await fetch("/api/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: newQuestion.question,
                    options: newQuestion.options,
                    correctAnswer: newQuestion.correctAnswer,
                }),
            });

            if (response.ok) {
                const question = await response.json();
                setQuestions((prev) => [question, ...prev]);
                setNewQuestion({
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: 0,
                });

                showToastMessage("Question added successfully!", "success");
            }
        } catch (error) {
            showToastMessage("Failed to add question", "error");
        }
    };

    const deleteQuestion = async (id: string) => {
        if (quizState.isLive) {
            showToastMessage(
                "Cannot delete questions while quiz is live",
                "error"
            );
            return;
        }

        try {
            const response = await fetch(`/api/questions/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setQuestions((prev) => prev.filter((q) => q.id !== id));
                showToastMessage("Question deleted successfully!", "success");
            }
        } catch (error) {
            showToastMessage("Failed to delete question", "error");
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

    const currentQuestion = questions[quizState.currentQuestionIndex];

    if (isSessionLoading || (session && !authChecked)) {
        return (
            <div className="snap-end min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-gray-300">Verifying access permissions...</p>
                </div>
            </div>
        );
    }

    if (!session || !authChecked) {
        return (
            <div className="snap-end min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center max-w-md">
                    <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl text-white font-bold mb-2">Access Restricted</h2>
                    <p className="text-gray-300 mb-4">
                        This area is only accessible to administrators. 
                        Redirecting to login page...
                    </p>
                    <div className="animate-pulse bg-gray-700 h-1 w-full rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="snap-end min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-10 pb-20 px-4 font-squid uppercase">
            {showToast && (
                <Toast
                    message={showToast.message}
                    type={showToast.type}
                    onClose={() => setShowToast(null)}
                />
            )}

            <div className="max-w-6xl mx-auto">
                <div className="bg-transparent border border-pink-800 rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-pink-800 text-white px-6 py-4">
                        <h2 className="text-xl font-bold text-center">
                            Quiz Management Dashboard
                        </h2>
                        <p className="text-pink-100 text-center text-sm mt-1">
                            Control your live quiz and manage questions
                        </p>
                    </div>
                    
                    {/* Main Grid */}
                    <div className="grid gap-6 md:grid-cols-2 mb-6 p-4">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Quiz Session Management */}
                            <div className="bg-gray-700 rounded-lg border-2 border-gray-600 p-4 shadow-md">
                                <div className="p-6 border-b border-gray-600">
                                    <h3 className="text-lg font-semibold text-pink-600">
                                        Quiz Sessions
                                    </h3>
                                    <p className="text-white mt-1">
                                        Create and manage your quiz sessions
                                    </p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setIsCreatingSession(true)}
                                            className="flex items-center gap-2 bg-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-pink-700 transition-colors"
                                        >
                                            <PlusCircle className="h-4 w-4" />
                                            Create New Session
                                        </button>
                                        <button
                                            onClick={refreshSessions}
                                            className="flex items-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-500 transition-colors"
                                            disabled={refreshing}
                                        >
                                            {refreshing ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="h-4 w-4" />
                                            )}
                                            Refresh
                                        </button>
                                    </div>
                                    
                                    {/* Session Creation Form */}
                                    {isCreatingSession && (
                                        <div className="bg-gray-800 rounded-lg border border-gray-600 p-4 mt-4">
                                            <h4 className="font-medium text-pink-500 mb-3">Create New Quiz Session</h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-white mb-1">
                                                        Quiz Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newSessionTitle}
                                                        onChange={(e) => setNewSessionTitle(e.target.value)}
                                                        placeholder="Enter quiz title"
                                                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-600"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-white mb-1">
                                                        Time Per Question (seconds)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={newSessionTimePerQuestion}
                                                        onChange={(e) => setNewSessionTimePerQuestion(parseInt(e.target.value) || 10)}
                                                        min="5"
                                                        max="120"
                                                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-600"
                                                    />
                                                </div>
                                                
                                                <div className="pt-2 flex gap-2">
                                                    <button
                                                        onClick={createQuizSession}
                                                        className="bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700"
                                                    >
                                                        Create
                                                    </button>
                                                    <button
                                                        onClick={() => setIsCreatingSession(false)}
                                                        className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-500"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Available Sessions List */}
                                    <div className="mt-4">
                                        <h4 className="text-white text-sm font-medium mb-2">Available Sessions</h4>
                                        {quizSessions.length === 0 ? (
                                            <div className="text-center py-4 text-gray-400">
                                                <Calendar className="h-8 w-8 mx-auto mb-2" />
                                                <p>No quiz sessions available</p>
                                                <p className="text-xs mt-1">Create your first session above</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                                {quizSessions.map(session => (
                                                    <div 
                                                        key={session.id} 
                                                        className={`flex items-center justify-between p-3 rounded-lg border ${
                                                            currentSession?.id === session.id
                                                                ? "bg-gray-600 border-pink-500"
                                                                : "bg-gray-800 border-gray-600 hover:border-gray-500"
                                                        } cursor-pointer`}
                                                        onClick={() => selectSession(session)}
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span 
                                                                    className={`w-3 h-3 rounded-full ${
                                                                        session.status === "live" 
                                                                            ? "bg-green-500" 
                                                                            : session.status === "pending" 
                                                                            ? "bg-blue-500" 
                                                                            : "bg-yellow-500"
                                                                    }`}
                                                                />
                                                                <span className="font-medium text-white">{session.title || "Unnamed Quiz"}</span>
                                                            </div>
                                                            <div className="text-xs text-gray-400 flex items-center mt-1">
                                                                <span className="mr-2">
                                                                    {session.status}
                                                                </span>
                                                                <span className="mx-1">•</span>
                                                                <span className="ml-1">{session.total_questions} questions</span>
                                                                {session.participant_count !== undefined && (
                                                                    <>
                                                                        <span className="mx-1">•</span>
                                                                        <Users className="h-3 w-3 mr-1" />
                                                                        <span>{session.participant_count}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {session.status !== "live" && (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteSession(session.id);
                                                                }}
                                                                className="text-gray-400 hover:text-red-400 p-1"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Quiz Control Panel */}
                            <div className="bg-gray-700 rounded-lg border-2 border-gray-600 p-4 shadow-md">
                                <div className="p-6 border-b border-gray-600">
                                    <h3 className="text-lg font-semibold text-pink-600">
                                        Quiz Control
                                    </h3>
                                    <p className="text-white mt-1">
                                        Manage the selected quiz session
                                    </p>
                                </div>
                                <div className="p-6 space-y-4">
                                    {currentSession ? (
                                        <>
                                            <div className="mb-4">
                                                <h4 className="text-white font-medium mb-1">
                                                    {currentSession.title || "Unnamed Quiz"}
                                                </h4>
                                                <div className="flex flex-wrap gap-2 text-sm">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            currentSession.status === "live"
                                                                ? "bg-green-100 text-green-800"
                                                                : currentSession.status === "pending"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                    >
                                                        {currentSession.status}
                                                    </span>
                                                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">
                                                        {currentSession.total_questions} questions
                                                    </span>
                                                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">
                                                        {currentSession.time_per_question}s per question
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-3">
                                                {currentSession.status === "pending" && (
                                                    <button
                                                        onClick={startQuiz}
                                                        className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                                                    >
                                                        <Play className="h-4 w-4" />
                                                        Start Quiz
                                                    </button>
                                                )}
                                                
                                                {currentSession.status === "live" && (
                                                    <>
                                                        <div className="flex flex-col gap-2 mb-4">
                                                            <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                                                                <div>
                                                                    <p className="text-gray-300">
                                                                        Question {quizState.currentQuestionIndex + 1} of {questions.length}
                                                                    </p>
                                                                    <p className="text-sm text-gray-400">
                                                                        Responses: <strong>{responsesForCurrentQuestion}</strong> / {participants.length} participants
                                                                    </p>
                                                                </div>
                                                                <div className="ml-2">
                                                                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                                                        quizState.timeLeft <= 3
                                                                            ? "bg-red-100 text-red-800"
                                                                            : "bg-blue-100 text-blue-800"
                                                                    }`}>
                                                                        {quizState.timeLeft > 0 ? `${quizState.timeLeft}s left` : "Time's up!"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <button
                                                                onClick={moveToNextQuestion}
                                                                disabled={quizState.currentQuestionIndex >= questions.length - 1}
                                                                className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                Next Question
                                                            </button>
                                                        </div>
                                                        
                                                        <button
                                                            onClick={stopQuiz}
                                                            className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                                                        >
                                                            <Square className="h-4 w-4" />
                                                            End Quiz
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                            
                                            {currentSession.status === "live" && (
                                                <div className="space-y-2 mt-4">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-white">Current Question:</span>
                                                        <span className="font-medium text-white">
                                                            {quizState.currentQuestionIndex + 1} of {questions.length}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-white">Time Left:</span>
                                                        <span className="font-medium text-white">
                                                            {quizState.timeLeft}s
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                                                        <div 
                                                            className={`h-2 rounded-full transition-all ${
                                                                quizState.timeLeft <= 3 ? "bg-red-500" : "bg-pink-500"
                                                            }`}
                                                            style={{ 
                                                                width: `${(quizState.timeLeft / currentSession.time_per_question) * 100}%`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-6 text-gray-400">
                                            <ListFilter className="h-10 w-10 mx-auto mb-2" />
                                            <p className="font-medium mb-1">No Session Selected</p>
                                            <p className="text-xs">
                                                Select a quiz session from the list above to manage it
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Current Question Display */}
                            {currentSession?.status === "live" && currentQuestion && (
                                <div className="bg-gray-700 rounded-lg border-2 border-gray-600 p-4 shadow-md">
                                    <div className="p-6 border-b border-gray-600">
                                        <h3 className="text-lg font-semibold text-pink-600">
                                            Current Question
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <h4 className="text-lg font-medium text-white mb-4">
                                            {currentQuestion.question}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                            {currentQuestion.options.map((option, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-3 rounded-lg ${
                                                        index === currentQuestion.correct_answer
                                                            ? "bg-green-100 text-green-800 border border-green-300"
                                                            : "bg-gray-600 text-white border border-gray-500"
                                                    }`}
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Add New Question */}
                            <div className="bg-gray-700 rounded-lg border-2 border-gray-600 p-4 shadow-md">
                                <div className="p-6 border-b border-gray-600">
                                    <h3 className="text-lg font-semibold text-pink-600">
                                        Add New Question
                                    </h3>
                                    <p className="text-white mt-1">
                                        Create questions for the quiz
                                    </p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label
                                            htmlFor="question"
                                            className="block text-sm font-medium text-white mb-1"
                                        >
                                            Question *
                                        </label>
                                        <textarea
                                            id="question"
                                            value={newQuestion.question}
                                            onChange={(e) =>
                                                setNewQuestion((prev) => ({
                                                    ...prev,
                                                    question: e.target.value,
                                                }))
                                            }
                                            placeholder="Enter your question..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Answer Options *
                                        </label>
                                        {newQuestion.options.map(
                                            (option, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2"
                                                >
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => {
                                                            const newOptions = [
                                                                ...newQuestion.options,
                                                            ];
                                                            newOptions[index] =
                                                                e.target.value;
                                                            setNewQuestion(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    options:
                                                                        newOptions,
                                                                })
                                                            );
                                                        }}
                                                        placeholder={`Option ${
                                                            index + 1
                                                        }`}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                    <label className="flex items-center gap-1 text-sm text-gray-300">
                                                        <input
                                                            type="radio"
                                                            name="correctAnswer"
                                                            checked={
                                                                newQuestion.correctAnswer ===
                                                                index
                                                            }
                                                            onChange={() =>
                                                                setNewQuestion(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        correctAnswer:
                                                                            index,
                                                                    })
                                                                )
                                                            }
                                                            className="w-4 h-4 text-pink-600"
                                                        />
                                                        Correct
                                                    </label>
                                                </div>
                                            )
                                        )}
                                        <p className="text-xs text-gray-400">
                                            Select the correct answer option
                                        </p>
                                    </div>

                                    <button
                                        onClick={addQuestion}
                                        className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Question
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Participants List */}
                    {currentSession && (currentSession.status === "live" || currentSession.status === "completed") && (
                        <div className="bg-gray-700 rounded-lg border-2 border-gray-600 p-4 shadow-md mx-4 mb-4">
                            <div className="p-6 border-b border-gray-600">
                                <h3 className="text-lg font-semibold text-pink-600 flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Participants ({participants.length})
                                </h3>
                            </div>
                            <div className="p-6">
                                {participants.length === 0 ? (
                                    <div className="text-center py-8 text-gray-300">
                                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                                        <p>No participants have joined yet</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {participants
                                            .sort((a, b) => b.score - a.score)
                                            .map((participant, index) => (
                                                <div
                                                    key={participant.id}
                                                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-600"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-semibold text-pink-500">
                                                            #{index + 1}
                                                        </span>
                                                        <span className="font-medium text-white">
                                                            {participant.user_name}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-pink-400">
                                                            {participant.score} pts
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {participant.total_questions_answered} answered
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Question Bank */}
                    <div className="bg-gray-700 rounded-lg shadow-md p-4 m-4">
                        <div className="p-6 border-b border-gray-600">
                            <h3 className="text-lg font-semibold text-pink-600">
                                Question Bank ({questions.length} questions)
                            </h3>
                            <p className="text-gray-300 mt-1">
                                Manage your quiz questions
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {questions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        className="border border-gray-600 rounded-lg p-4 bg-gray-800"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium text-white">
                                                        {index + 1}.{" "}
                                                        {question.question}
                                                    </h4>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    {question.options.map(
                                                        (option, optIndex) => (
                                                            <div
                                                                key={optIndex}
                                                                className={`p-2 rounded ${
                                                                    optIndex ===
                                                                    question.correct_answer
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-gray-600 text-white"
                                                                }`}
                                                            >
                                                                {option}{" "}
                                                                {optIndex ===
                                                                    question.correct_answer &&
                                                                    "✓"}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    deleteQuestion(question.id)
                                                }
                                                disabled={quizState.isLive}
                                                className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={
                                                    quizState.isLive
                                                        ? "Cannot delete during live quiz"
                                                        : "Delete question"
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {questions.length === 0 && (
                                    <div className="text-center py-8 text-gray-300">
                                        <Database className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                                        <p className="text-lg font-medium mb-1">
                                            No questions yet
                                        </p>
                                        <p className="text-sm">
                                            Create your first question using the
                                            form above
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
