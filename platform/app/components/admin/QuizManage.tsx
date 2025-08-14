"use client";

import { useState, useEffect } from "react";
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
    const [questions, setQuestions] = useState<Question[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [participants, setParticipants] = useState<QuizParticipant[]>([]);
    const [loading, setLoading] = useState(true);
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

    // Toast function
    const showToastMessage = (message: string, type: "success" | "error") => {
        setShowToast({ message, type });
    };

    // Load initial data
    useEffect(() => {
        loadData();
    }, []);

    // Monitor quiz session and participants
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (currentSession && quizState.isLive) {
            interval = setInterval(() => {
                loadParticipants(currentSession.id);
            }, 3000); // Update participants every 3 seconds
        }
        return () => clearInterval(interval);
    }, [currentSession, quizState.isLive]);

    // Timer for quiz questions
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
        } else if (quizState.isLive && quizState.timeLeft === 0) {
            // Auto-advance to next question
            moveToNextQuestion();
        }

        return () => clearInterval(interval);
    }, [quizState.isLive, quizState.timeLeft, quizState.isFinished]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [questionsRes, usersRes] = await Promise.all([
                fetch("/api/questions"),
                fetch("/api/users"),
            ]);

            if (questionsRes.ok) {
                const questionsData = await questionsRes.json();
                setQuestions(questionsData);
            }

            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(usersData);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            showToastMessage("Failed to load data from database", "error");
        } finally {
            setLoading(false);
        }
    };

    const loadParticipants = async (sessionId: string) => {
        try {
            const response = await fetch(
                `/api/quiz-sessions/${sessionId}/participants`
                // `/api/users`
            );
            if (response.ok) {
                const data = await response.json();
                setParticipants(data);
                console.log("Loaded participants:", data);
            }
        } catch (error) {
            console.error("Error loading participants:", error);
        }
    };

    const startQuiz = async () => {
        if (questions.length === 0) {
            showToastMessage(
                "Please add questions before starting the quiz",
                "error"
            );
            return;
        }

        try {
            console.log("Starting quiz with", questions.length, "questions");

            // Create new quiz session
            const response = await fetch("/api/quiz-sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: `Quiz Session ${new Date().toLocaleString()}`,
                    timePerQuestion: 10,
                }),
            });

            if (response.ok) {
                const session = await response.json();
                console.log("Created session:", session);
                setCurrentSession(session);

                // Update session status to live
                const updateResponse = await fetch(
                    `/api/quiz-sessions/${session.id}`,
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
                    console.log("Session marked as live");


                    //add users as participants to quiz

                    // await Promise.all(
                    //     users.map((user) =>
                    //         fetch(
                    //             `/api/quiz-sessions/${session.id}/participants`,
                    //             {
                    //                 method: "POST",
                    //                 headers: {
                    //                     "Content-Type": "application/json",
                    //                 },
                    //                 body: JSON.stringify({ userId: user.id }),
                    //             }
                    //         ).catch((error) =>
                    //             console.error(
                    //                 `Failed to add user ${user.id}`,
                    //                 error
                    //             )
                    //         )
                    //     )
                    // );

                    setQuizState({
                        isLive: true,
                        currentQuestionIndex: 0,
                        timeLeft: 10,
                        isFinished: false,
                        sessionId: session.id,
                    });

                    // Load initial participants
                    await loadParticipants(session.id);

                    showToastMessage(
                        `Quiz is now LIVE! ${questions.length} questions ready.`,
                        "success"
                    );
                } else {
                    console.error("Failed to update session status");
                    showToastMessage(
                        "Failed to start quiz - status update failed",
                        "error"
                    );
                }
            } else {
                console.error("Failed to create session");
                showToastMessage("Failed to create quiz session", "error");
            }
        } catch (error) {
            console.error("Error starting quiz:", error);
            showToastMessage("Failed to start quiz", "error");
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

                showToastMessage(
                    "Quiz has been stopped successfully.",
                    "success"
                );
            } catch (error) {
                console.error("Error stopping quiz:", error);
                showToastMessage("Failed to stop quiz", "error");
            }
        }
    };

    const moveToNextQuestion = async () => {
        if (!currentSession) return;

        if (quizState.currentQuestionIndex < questions.length - 1) {
            const newIndex = quizState.currentQuestionIndex + 1;

            try {
                // Update session in database
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
                    timeLeft: 10,
                }));

                showToastMessage(
                    `Question ${newIndex + 1} of ${questions.length}`,
                    "success"
                );
            } catch (error) {
                console.error("Error moving to next question:", error);
            }
        } else {
            // Quiz finished
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

                showToastMessage("Quiz completed!", "success");
            } catch (error) {
                console.error("Error completing quiz:", error);
            }
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
            console.error("Error adding question:", error);
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
            console.error("Error deleting question:", error);
            showToastMessage("Failed to delete question", "error");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center pt-20 pb-20">
                <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading Admin Panel...</p>
                </div>
            </div>
        );
    }

    // const regularUsers = users.filter((user) => !user.email?.includes("admin"));
    // const currentQuestion = questions[quizState.currentQuestionIndex];

    return (
        <div className="flex items-center justify-center px-4 font-squid min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-10 pb-20 uppercase ">
            {showToast && (
                <Toast
                    message={showToast.message}
                    type={showToast.type}
                    onClose={() => setShowToast(null)}
                />
            )}

            <div className="max-w-6xl mx-auto px-4 ">
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
                    <div className="grid gap-6 md:grid-cols-2 mb-6 p-4">
                        {/* Quiz Control */}
                        <div className="bg-gray-700 rounded-lg border-2 border-gray-600 p-4 shadow-md ">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-semibold text-pink-600">
                                    Quiz Control
                                </h3>
                                <p className="text-white mt-1 up">
                                    Manage live quiz sessions
                                </p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={startQuiz}
                                        disabled={
                                            quizState.isLive ||
                                            questions.length === 0
                                        }
                                        className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Play className="h-4 w-4" />
                                        Start Quiz
                                    </button>
                                    <button
                                        onClick={stopQuiz}
                                        disabled={!quizState.isLive}
                                        className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Square className="h-4 w-4" />
                                        Stop Quiz
                                    </button>
                                </div>

                                {questions.length === 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <p className="text-yellow-800 text-sm">
                                            ⚠️ Add questions before starting the
                                            quiz
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-white">
                                            Status:
                                        </span>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                quizState.isLive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {quizState.isLive
                                                ? "LIVE"
                                                : "OFFLINE"}
                                        </span>
                                    </div>
                                    {quizState.isLive && (
                                        <div className="flex justify-between">
                                            <span className="text-white">
                                                Current Question:
                                            </span>
                                            <span className="font-medium">
                                                {quizState.currentQuestionIndex +
                                                    1}{" "}
                                                of {questions.length}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-white">
                                            Participants:
                                        </span>
                                        <span className="font-medium">
                                            {participants.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Add New Question */}
                        <div className="bg-gray-700 rounded-lg borde-2 border-gray-600 p-4 shadow-md ">
                            <div className="p-6 border-b">
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
                                    <label className="block text-sm font-medium text-gray-700">
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
                                                <label className="flex items-center gap-1 text-sm text-gray-600">
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
                                    <p className="text-xs text-gray-500">
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

                    {/* Participants List */}
                    {quizState.isLive && participants.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm mb-6">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-semibold">
                                    Live Participants ({participants.length})
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid gap-3">
                                    {participants
                                        .sort((a, b) => b.score - a.score)
                                        .map((participant, index) => (
                                            <div
                                                key={participant.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold text-gray-600">
                                                        #{index + 1}
                                                    </span>
                                                    <span className="font-medium">
                                                        {participant.user_name}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-blue-600">
                                                        {participant.score} pts
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {
                                                            participant.total_questions_answered
                                                        }{" "}
                                                        answered
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Question Bank */}
                    <div className="bg-gray-700 rounded-lg  shadow-md p-4 m-4 ">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold">
                                Question Bank ({questions.length} questions)
                            </h3>
                            <p className="text-gray-400 mt-1">
                                Manage your quiz questions
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {questions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        className="border rounded-lg p-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium">
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
                                                                        : "bg-gray-600"
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
                                                className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    <div className="text-center py-8 text-gray-500">
                                        <Database className="h-12 w-12 mx-auto mb-3 text-gray-400" />
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
