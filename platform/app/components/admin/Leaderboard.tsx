"use client";
import { a } from "framer-motion/client";
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
        if (more < 0 &&(viewLimit + more  < 3)){
            return
        }
        if(viewLimit> teams.length && more > 0){
            return
        }
        setViewLimit((prv) => prv + more);
    };

    return (
        <div className="w-full border-b-2 p-4 border-pink-800 ">
            <h2 className="w-full text-2xl font-bold mb-4 font-squid text-pink-400 text-center">
                LEADERBOARD overview
            </h2>

            <table className="w-full text-left text-sm table-auto border-separate border-spacing-y-2">
                <thead className="border-b border-pink-800 text-2xl">
                    <tr>
                        <th className="py-3 px-2 font-squid text-pink-300 uppercase">
                            RANK
                        </th>
                        <th className="py-3 px-2 font-squid text-pink-300 uppercase">
                            TEAM
                        </th>
                        <th className="py-3 px-2 font-squid text-pink-300 uppercase hidden md:table-cell">
                            PUZZLE
                        </th>
                        <th className="py-3 px-2 font-squid text-pink-300 uppercase hidden md:table-cell">
                            QUESTIONNAIRE
                        </th>
                        <th className="py-3 px-2 font-squid text-pink-300 uppercase hidden md:table-cell">
                            AI
                        </th>
                        <th className="py-3 px-2 font-squid text-pink-300 uppercase">
                            Total
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {sortedTeams.length === 0 ? (
                        <tr>
                            <td
                                colSpan={6}
                                className="py-4 px-4 text-center text-gray-400"
                            >
                                No teams registered yet
                            </td>
                        </tr>
                    ) : (
                        sortedTeams.map((team, index) => {
                            const puzzle = team.puzzle ?? 0;
                            const que = team.que ?? 0;
                            const ai = team.ai ?? 0;
                            const total = team.total ?? 0;

                            return (
                                <tr
                                    key={team.id}
                                    className={`border-b border-gray-700 hover:bg-gray-700 text-2xl font-bold
                                        ${
                                            index == 0
                                                ? "bg-pink-600 "
                                                : index == 1
                                                ? "bg-pink-700 "
                                                : index == 2
                                                ? "bg-pink-800 "
                                                : "bg-pink-900 font-normal"
                                        }`}
                                >
                                    <td className="py-3 px-4">{index + 1}</td>
                                    <td className="py-3 px-4">{team.name}</td>
                                    <td className="py-3 px-4 hidden md:table-cell">
                                        {puzzle || "_"}
                                    </td>
                                    <td className="py-3 px-4 hidden md:table-cell">
                                        {que || "_"}
                                    </td>
                                    <td className="py-3 px-4 hidden md:table-cell">
                                        {ai || "_"}
                                    </td>
                                    <td className="py-3 px-4">
                                        {total || "_"}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
            <div className="w-full items-center justify-between flex">
                <button
                    className="cursor-pointer border-b hover:text-pink-400 px-4 "
                    onClick={()=>handleViewMore(2)}
                >
                    view more
                </button>
            
                <button
                    className="cursor-pointer border-b hover:text-pink-400 px-4 "
                    onClick={()=>handleViewMore(-2)}
                >
                    view less
                </button></div>
            
        </div>
    );
};

export default LeaderboardTable;
