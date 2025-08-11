"use client";
import React, { useEffect, useState } from "react";

export type TeamMarks = {
    id: string;
    name: string;
    puzzle?: number;
    que?: number;
    ai?: number;
    total?: number;
};

interface LeaderboardTableProps {
    teams: TeamMarks[];
    limit: number;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
    teams,
    limit,
}) => {
    const [sortedTeams, setSortedTeams] = useState<TeamMarks[]>([]);
    const [viewLimit, setViewLimit] = useState<number>(limit);

    useEffect(() => {
        const newTeams = [...teams]
            .map((team) => ({
                ...team,
                total: (team.puzzle ?? 0) + (team.que ?? 0) + (team.ai ?? 0),
            }))
            .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
            .slice(0, viewLimit);

        setSortedTeams(newTeams);
    }, [teams, viewLimit]);

    const handleViewMore = (more: number) => {
        if (more < 0 && viewLimit + more < 3) {
            return;
        }
        if (viewLimit > teams.length && more > 0) {
            return;
        }
        setViewLimit((prv) => prv + more);
    };

    return (
        <section className="mb-8">
            <h2 className="text-2xl font-bold mb-5 font-squid text-pink-400 text-center uppercase">
                LEADERBOARD
            </h2>

            <div className="overflow-hidden rounded-md border border-pink-800 shadow-lg">
                {/* Table Header */}
                <div className="bg-gray-700 border-b border-pink-800/70">
                    <div className="grid grid-cols-12 items-center py-4 px-6">
                        <div className="col-span-2 text-pink-400 font-squid text-lg">
                            RANK
                        </div>
                        <div className="col-span-8 text-pink-400 font-squid text-lg">
                            TEAM
                        </div>
                        <div className="col-span-2 text-pink-400 font-squid text-lg text-right">
                            SCORE
                        </div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="bg-gray-900 divide-y divide-pink-800/30">
                    {sortedTeams.length === 0 ? (
                        <div className="py-5 px-6 text-center text-gray-400 font-squid">
                            No teams registered yet
                        </div>
                    ) : (
                        sortedTeams.map((team, index) => {
                            const total = team.total ?? 0;

                            return (
                                <div
                                    key={team.id}
                                    className="grid grid-cols-12 items-center py-5 px-6 hover:bg-gray-800/60 transition-colors"
                                >
                                    <div className="col-span-2">
                                        <span className="font-bold font-squid text-xl text-pink-400">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div className="col-span-8 font-bold text-white">
                                        {team.name}
                                    </div>
                                    <div className="col-span-2 font-bold text-right text-pink-400">
                                        {total || "_"}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <div className="w-full items-center justify-between flex mt-4">
                <button
                    className="px-4 py-2 text-sm font-squid text-pink-300 hover:text-pink-400 hover:underline transition-all"
                    onClick={() => handleViewMore(2)}
                >
                    VIEW MORE
                </button>

                <button
                    className="px-4 py-2 text-sm font-squid text-pink-300 hover:text-pink-400 hover:underline transition-all"
                    onClick={() => handleViewMore(-2)}
                >
                    VIEW LESS
                </button>
            </div>
        </section>
    );
};

export default LeaderboardTable;
