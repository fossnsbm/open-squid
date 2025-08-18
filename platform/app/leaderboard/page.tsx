"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
    id: string;
    name: string;
    score: number;
    rank: number;
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch("/api/leaderboard", { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to load leaderboard");
            const data: LeaderboardEntry[] = await res.json();
            setEntries(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();

        const interval = setInterval(fetchLeaderboard, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex  px-4 font-squid min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-16 pb-20 uppercase tracking-wider">
            <div className="max-w-4xl w-full mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-pink-800 animate-pulse">
                        Leaderboard
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">
                        Open-squiz top teams{" "}
                    </p>
                </div>

                <div className="bg-gray-800 border border-pink-700/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-gradient-to-b from-gray-900 to-gray-800 border-b border-pink-800/30">
                        {entries.slice(0, 3).map((entry, index) => {
                            const isGold = index === 0;
                            const isSilver = index === 1;
                            const isBronze = index === 2;

                            return (
                                <div
                                    key={entry.id}
                                    className={`
                      relative p-6 rounded-xl text-center transform transition-all hover:scale-105
                      ${
                          isGold
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-400/30"
                              : isSilver
                              ? "bg-gradient-to-br from-gray-300 to-gray-500 text-black shadow-lg shadow-gray-400/30"
                              : "bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-lg shadow-orange-500/30"
                      }
                    `}
                                >
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <div
                                            className={`
                          w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                          ${isGold ? "bg-yellow-600 text-yellow-900" : ""}
                          ${isSilver ? "bg-gray-600 text-gray-900" : ""}
                          ${isBronze ? "bg-orange-800 text-orange-100" : ""}
                        `}
                                        >
                                            {index + 1}
                                        </div>
                                    </div>

                                    <h2 className="font-bold text-xl mt-4">
                                        {entry.name}
                                    </h2>
                                    <p className={`font-black text-3xl mt-1
                        ${isGold ? "text-yellow-900" : ""}
                        ${isSilver ? "text-gray-900" : ""}
                        ${isBronze ? "text-orange-100" : ""}
                      `}>
                                        {entry.score}
                                    </p>

                                    <p className="text-sm opacity-90">Points</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-gray-800/90">
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-lg animate-pulse">
                                    Loading rankings...
                                </p>
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-lg">No teams yet</p>
                                <p className="text-sm">
                                    Scores will appear once teams participate.
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-700">
                                {entries.slice(3).map((entry, index) => (
                                    <li
                                        key={entry.id}
                                        className="flex items-center justify-between p-5 hover:bg-gray-700/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="w-10 text-gray-500 font-bold text-sm group-hover:text-pink-400 transition">
                                                #{entry.rank}
                                            </span>
                                            <span className="font-semibold text-white">
                                                {entry.name}
                                            </span>
                                        </div>
                                        <span className="py-1 px-4 bg-pink-900/40 text-pink-200 rounded-full text-sm font-bold border border-pink-800/50">
                                            {entry.score}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="bg-gray-900/50 px-6 py-4 text-center border-t border-gray-700">
                        <p className="text-gray-500 text-xs"> Last updated: {new Date().toLocaleTimeString()}  </p>
                    </div>
                    
                </div>

                <div className="fixed -z-10 pointer-events-none">
                    <div className="absolute top-1/4 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
                    <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
                </div>
            </div>
        </div>
    );
}
