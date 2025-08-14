"use client";
import React from "react";
import { useEffect, useState } from "react";

export interface TeamMarks {
    id: string;
    name: string;
    puzzle: number;
    que: number;
    ai: number;
}

interface LeaderboardProps {
    teams: TeamMarks[];
    limit?: number;
}

function LeaderboardTable({ teams, limit = 10 }: LeaderboardProps) {
    const [sortedTeams, setSortedTeams] = useState<
        (TeamMarks & { total: number })[]
    >([]);
    const [viewLimit, setViewLimit] = useState<number>(limit);

    useEffect(() => {
        const sorted = [...teams]
            .map((team) => ({
                ...team,
                total: team.puzzle + team.que + team.ai,
            }))
            .sort((a, b) => b.total - a.total);

        setSortedTeams(sorted);
    }, [teams]);

    const handleViewMore = (more: number) => {
        setViewLimit((prev) => {
            let newLimit = prev + more;
            if (newLimit < 10) newLimit = 10;
            if (newLimit > teams.length) newLimit = teams.length;
            return newLimit;
        });
    };

    return (
        <section className="relative w-full flex flex-col items-center justify-center font-squid px-4 sm:px-6 lg:px-8 py-20">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 md:mb-12 lg:mb-16 text-center">
                LEADERBOARD
            </h2>
            <div className="overflow-hidden rounded-md border-2 text-md sm:text-lg md:text-xl lg:text-2xl border-pink-900 w-full shadow-[0_0_10px_2px_rgba(255,0,128,0.7)] p-4">
                <div className="bg-cardbackground/20 backdrop-blur-md items-center justify-center">
                    <div className="grid grid-cols-12 items-center py-4 px-6">
                        <div className="col-span-2 text-center text-pink-500 font-bold">
                            Rank
                        </div>
                        <div className="col-span-8 text-center text-pink-500 font-bold">
                            Team Name
                        </div>
                        <div className="col-span-2 text-center text-pink-500 font-bold">
                            Score
                        </div>
                    </div>
                </div>
                <div className="bg-cardbackground/20 backdrop-blur-md divide-y divide-pink-900/30 uppercase">
                    {sortedTeams.length === 0 ? (
                        <div className="grid grid-cols-12 items-center py-4 px-6">
                            <div className="col-span-12 text-center text-white">
                                No teams available
                            </div>
                        </div>
                    ) : (
                        sortedTeams.slice(0, viewLimit).map((team, index) => {
                            const total = team.total ?? 0;
                            return (
                                <div
                                    className="grid grid-cols-12 items-center py-4 px-6"
                                    key={team.id}
                                >
                                    <div className="col-span-2 text-center text-white">
                                        {index + 1}
                                    </div>
                                    <div className="col-span-8 text-center text-white">
                                        {team.name}
                                    </div>
                                    <div className="col-span-2 text-center text-white">
                                        {total}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <div className="mt-6 flex items-center justify-center">
                <button
                    className="bg-black border-2 border-white text-white px-4 py-2 rounded-md hover:bg-pink-700 hover:border-black transition duration-300"
                    onClick={() => handleViewMore(-2)}
                    disabled={viewLimit <= 10}
                >
                    View Less
                </button>
                <button
                    className="ml-4 bg-black border-2 border-white text-white px-4 py-2 rounded-md hover:bg-pink-700 hover:border-black transition duration-300"
                    onClick={() => handleViewMore(2)}
                    disabled={viewLimit >= teams.length}
                >
                    View More
                </button>
            </div>
        </section>
    );
}

export default LeaderboardTable;
