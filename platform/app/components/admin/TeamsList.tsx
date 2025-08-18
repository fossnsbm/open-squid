"use client";

import { Fragment, useState } from "react";
import { type Team } from "@/app/admin/page";

interface TeamsListProps {
    teams: Team[];
}

export default function TeamsList({ teams }: TeamsListProps) {
    const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

    function toggleTeamExpansion(teamId: string) {
        setExpandedTeamId(prev =>
            prev === teamId ? null : teamId
        );
    }

    function isTeamExpanded(teamId: string) {
        return expandedTeamId === teamId;
    }

    return (
        <>
            <h2 className="text-2xl font-bold mb-4 font-squid text-pink-400">REGISTERED TEAMS</h2>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="border-b border-pink-800">
                        <tr>
                            <th className="py-3 px-4 font-squid text-pink-300 uppercase">name</th>
                            <th className="py-3 px-4 font-squid text-pink-300 uppercase">email</th>
                            <th className="py-3 px-4 font-squid text-pink-300 uppercase">joined</th>
                            <th className="py-3 px-4 font-squid text-pink-300 uppercase">members</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-4 px-4 text-center text-gray-400">
                                    No teams registered yet
                                </td>
                            </tr>
                        ) : (
                            teams.map((team) => (
                                <Fragment key={team.id}>
                                    <tr
                                        className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
                                        onClick={() => toggleTeamExpansion(team.id)}
                                    >
                                        <td className="py-3 px-4 font-medium">{team.name}</td>
                                        <td className="py-3 px-4">{team.email}</td>
                                        <td className="py-3 px-4">
                                            {new Date(team.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                className={`px-2 py-1 rounded text-xs ${isTeamExpanded(team.id) ? 'bg-pink-700' : 'bg-gray-700'}`}
                                            >
                                                {team.members?.length || 0} members
                                            </button>
                                        </td>
                                    </tr>
                                    {isTeamExpanded(team.id) && (
                                        <tr className="bg-gray-900">
                                            <td colSpan={4} className="py-2">
                                                <div className="px-8 py-3">
                                                    {/* Contact Information */}
                                                    <div className="mb-4 bg-gray-800/50 p-3 rounded-md">
                                                        <h4 className="text-sm font-bold mb-2 text-pink-300">Contact Information</h4>
                                                        <div className="flex items-center gap-6">
                                                            {team.contactNumber && (
                                                                <div className="flex flex-col">
                                                                    <span className="text-gray-400 text-sm">Phone</span>
                                                                    <span className="text-white">{team.contactNumber}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col">
                                                                <span className="text-gray-400 text-sm">Email</span>
                                                                <span className="text-white">{team.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Team Members Section */}
                                                    {team.members && team.members.length > 0 && (
                                                        <>
                                                            <h4 className="text-sm font-bold mb-2 text-pink-300">Team Members</h4>
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {team.members.map((member, index) => (
                                                                    <div
                                                                        key={`${team.id}-member-${index}`}
                                                                        className="bg-gray-800 rounded-md p-2 flex justify-between items-center"
                                                                    >
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{member.name}</span>
                                                                            {member.studentId && (
                                                                                <span className="text-gray-400 text-sm">Student ID: {member.studentId}</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))
                        )}
                    </tbody>

                </table>
            </div>
        </>
    );
}
