"use client";
import React, { useState } from "react";

export default function RegistrationForm() {
    type TeamMember = {
        id: string;
        name: string;
    };

    type Team = {
        contactNumber: string;
        teamName: string;
        members: TeamMember[];
    };

    const [team, setTeam] = useState<Team>({
        contactNumber: "",
        teamName: "",
        members: Array(4).fill({ id: "", name: "" }),
    });

    const [errors, setErrors] = useState<{
        contactNumber?: string;
        teamName?: string;
        members?: { id?: string; name?: string }[];
    }>({});

    const handleInputChange = (
        index: number,
        field: keyof TeamMember,
        value: string
    ) => {
        const updatedMembers = [...team.members];
        updatedMembers[index] = {
            ...updatedMembers[index],
            [field]: value,
        };
        setTeam({ ...team, members: updatedMembers });
    };

    const validate = () => {
        const newErrors: typeof errors = {};
        const memberErrors: { id?: string; name?: string }[] = [];

        if (!/^\d{10}$/.test(team.contactNumber)) {
            newErrors.contactNumber =
                "Contact number must be exactly 10 digits";
        }

        if (team.teamName.trim().length <= 4) {
            newErrors.teamName = "Team name must be longer than 4 characters";
        }

        team.members.forEach((member, i) => {
            const memberError: { id?: string; name?: string } = {};
            if (!/^\d{5}$/.test(member.id)) {
                memberError.id = `Member ${i + 1} ID must be exactly 5 digits`;
            }
            if (member.name.trim().length < 4) {
                memberError.name = `Member ${
                    i + 1
                } name must be at least 4 characters`;
            }
            memberErrors.push(memberError);
        });

        newErrors.members = memberErrors;
        setErrors(newErrors);

        return (
            !newErrors.contactNumber &&
            !newErrors.teamName &&
            memberErrors.every((e) => !e.id && !e.name)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            console.log("Submitted Team Data:", team);
            // submission logic here
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <form
                className="bg-gray-800 p-8 rounded-xl w-full max-w-md space-y-6 shadow-lg"
                onSubmit={handleSubmit}
            >
                {/* Contact Number */}
                <div>
                    <input
                        type="text"
                        className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="CONTACT NUMBER"
                        value={team.contactNumber}
                        onChange={(e) =>
                            setTeam({ ...team, contactNumber: e.target.value })
                        }
                    />
                    {errors.contactNumber && (
                        <p className="text-red-500 text-sm mt-1 text-center">
                            {errors.contactNumber}
                        </p>
                    )}
                </div>

                {/* Team Name */}
                <div>
                    <input
                        type="text"
                        className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="TEAM NAME"
                        value={team.teamName}
                        onChange={(e) =>
                            setTeam({ ...team, teamName: e.target.value })
                        }
                    />
                    {errors.teamName && (
                        <p className="text-red-500 text-sm mt-1 text-center">
                            {errors.teamName}
                        </p>
                    )}
                </div>

                {/* Section Title */}
                <div className="bg-pink-800 text-purple-200 text-center py-2 rounded-md font-semibold tracking-wide">
                    TEAM MEMBER'S DETAILS
                </div>

                {/* Team Member Inputs */}
                <div className="grid grid-cols-1 grid-rows-4 gap-4">
                    {team.members.map((member, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-2 grid-rows-1 gap-4"
                        >
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder={`Member ${i + 1} ID`}
                                value={member.id}
                                onChange={(e) =>
                                    handleInputChange(i, "id", e.target.value)
                                }
                            />
                            {errors.members?.[i]?.id && (
                                <p className="text-red-500 text-sm">
                                    {errors.members[i].id}
                                </p>
                            )}
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder={`Member ${i + 1} Name`}
                                value={member.name}
                                onChange={(e) =>
                                    handleInputChange(i, "name", e.target.value)
                                }
                            />
                            {errors.members?.[i]?.name && (
                                <p className="text-red-500 text-sm">
                                    {errors.members[i].name}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="w-full px-16">
                    <button
                        type="submit"
                        className="w-full py-2 bg-pink-800 text-purple-200 rounded-md font-semibold tracking-wide hover:bg-purple-600 transition"
                    >
                        SUBMIT
                    </button>
                </div>
            </form>
        </div>
    );
}
