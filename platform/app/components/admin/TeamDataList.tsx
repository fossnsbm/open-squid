"use client";

import { type Team } from "@/app/admin/page";


interface TeamsListProps {
    teams: Team[];
}

export default function TeamsDataList({ teams }: TeamsListProps) {


    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-pink-900 ">
            <h2 className="text-2xl font-bold mb-4 font-squid text-pink-400">REGISTERED TEAMS</h2>

            <div className="overflow-x-auto max-w-4xl max-h-[80vh] overflow-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-pink-800">
                        <tr>
                            <th className="py-3 px-4 font-squid text-pink-300 uppercase">#</th>
                            <th className="py-3 px-4 font-squid text-pink-300 uppercase">name</th>
                            <th className="py-3 px-4 font-squid text-pink-300 uppercase">email</th>
                            <th className="py-3 px-4 font-squid text-pink-300 uppercase">joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-4 px-4 text-center text-gray-400">
                                    No teams registered yet
                                </td>
                            </tr>
                        ) : (
                            teams.map((team, index) => (
                                <tr key={team.id} className="border-b border-gray-700 hover:bg-gray-700">
                                    <td className="py-3 px-4">{index+1}</td>
                                    <td className="py-3 px-4">{team.name}</td>
                                    <td className="py-3 px-4">{team.email}</td>
                                    <td className="py-3 px-4">
                                        {new Date(team.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
