"use client";
import { useState, useEffect } from "react";
import EchoPrompt from "../components/playground/EchoPrompt";
import Toast from "../components/common/Toast";
import QuizSurvival from "../components/playground/QuizSurvival";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function GameSelection() {

    const { data: session, isPending: isSessionLoading } = useSession();
    const currentUser = session?.user;
    const router = useRouter();

    useEffect(() => {
        if (!isSessionLoading && session === null) {
            router.push("/login");
        }
    }, [session, isSessionLoading, router]);

    const [showToast, setShowToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const [activeGame, setActiveGame] = useState<"quiz survival" | "echo prompt" | "squid clue">("quiz survival");
    const games = ["quiz survival", "echo prompt", "squid clue"] as const;

    return (
        <div>

            {showToast && (
                <Toast
                    message={showToast.message}
                    type={showToast.type}
                    onClose={() => setShowToast(null)}
                />
            )}

            <div className="snap-end min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-10 px-4 font-squid uppercase">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-center text-white mb-10">
                        PlayGround
                    </h1>


                    <div className="relative flex justify-center mb-8 ">
                        <div className="flex bg-gray-800 rounded-full shadow-md p-1 relative">
                            {games.map((game) => (
                                <button
                                    key={game}
                                    onClick={() => setActiveGame(game)}
                                    className={`relative z-10 px-6 py-2 rounded-full font-medium transition-all duration-300  uppercase text-sm md:text-lg
                  ${activeGame === game
                                            ? "text-white"
                                            : "text-gray-600 hover:text-pink-600"
                                        }
                `}
                                >
                                    {game}
                                </button>
                            ))}


                            <div
                                className="absolute top-1 bottom-1 left-1 bg-pink-600 rounded-full shadow-xl transition-all duration-300 "
                                style={{
                                    width: `${100 / games.length}%`,
                                    transform: `translateX(${games.indexOf(activeGame) * 100}%)`,
                                }}
                            ></div>
                        </div>
                    </div>

                    <div className="boarder-1 bg-pink-700 rounded-xl shadow-lg p-0.5 transition-all duration-500">
                        {activeGame === "quiz survival" && <QuizSurvival currentUser={currentUser} isSessionLoading={isSessionLoading} />}
                        {activeGame === "echo prompt" && <EchoPrompt />}
                        {activeGame === "squid clue" && <Game3Section />}
                    </div>
                </div>
            </div>
        </div>
    );
}


function Game1Section() {
    return <p className="text-gray-700">Game 1 content...</p>;
}

function Game3Section() {
    return <p className="text-gray-700">Game 3 content...</p>;
}
