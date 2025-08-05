"use client";
import React, { useState } from "react";

export default function RegistrationForm() {
    type TeamMember = {
        id: string;
        name: string;
        studentId: string;
    };

    type Team = {
        teamName: string;
        teamEmail: string;
        contactNumber: string;
        password: string;
        confirmPassword: string;
        members: TeamMember[];
    };

    const [team, setTeam] = useState<Team>({
        teamName: "",
        teamEmail: "",
        contactNumber: "",
        password: "",
        confirmPassword: "",
        members: Array(4).fill({ id: "", name: "", studentId: "" }),
    });

    const [currentMemberIndex, setCurrentMemberIndex] = useState(0);

    const [errors, setErrors] = useState<{
        teamName?: string;
        teamEmail?: string;
        contactNumber?: string;
        password?: string;
        confirmPassword?: string;
        members?: { id?: string; name?: string; studentId?: string }[];
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

    const nextMember = () => {
        if (currentMemberIndex < team.members.length - 1) {
            setCurrentMemberIndex(currentMemberIndex + 1);
        }
    };

    const prevMember = () => {
        if (currentMemberIndex > 0) {
            setCurrentMemberIndex(currentMemberIndex - 1);
        }
    };

    const addMember = () => {
        if (team.members.length < 5) {
            setTeam({
                ...team,
                members: [...team.members, { id: "", name: "", studentId: "" }],
            });
        }
    };

    const removeMember = () => {
        if (team.members.length > 1) {
            const updatedMembers = team.members.filter((_, i) => i !== currentMemberIndex);
            setTeam({ ...team, members: updatedMembers });
            // Adjust current index if needed
            if (currentMemberIndex >= updatedMembers.length) {
                setCurrentMemberIndex(updatedMembers.length - 1);
            }
        }
    };

    const validate = () => {
        const newErrors: typeof errors = {};

        // Team name validation
        if (!team.teamName.trim()) {
            newErrors.teamName = "Team name is required";
        }

        // Team email validation
        if (!team.teamEmail.trim()) {
            newErrors.teamEmail = "Team email is required";
        } else if (!/\S+@\S+\.\S+/.test(team.teamEmail)) {
            newErrors.teamEmail = "Invalid email format";
        }

        // Contact number validation
        if (!team.contactNumber.trim()) {
            newErrors.contactNumber = "Contact number is required";
        } else if (!/^\d{10}$/.test(team.contactNumber)) {
            newErrors.contactNumber = "Contact number must be 10 digits";
        }

        // Password validation
        if (!team.password) {
            newErrors.password = "Password is required";
        } else if (team.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        // Confirm password validation
        if (!team.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (team.password !== team.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Members validation
        const memberErrors = team.members.map((member) => {
            const memberError: { id?: string; name?: string; studentId?: string } = {};
            if (!member.name.trim()) {
                memberError.name = "Name is required";
            }
            if (!member.studentId.trim()) {
                memberError.studentId = "Student ID is required";
            }
            return memberError;
        });

        newErrors.members = memberErrors;
        setErrors(newErrors);

        return (
            !newErrors.teamName &&
            !newErrors.teamEmail &&
            !newErrors.contactNumber &&
            !newErrors.password &&
            !newErrors.confirmPassword &&
            memberErrors.every((e) => !e.id && !e.name && !e.studentId)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            console.log("Submitted Team Data:", team);
            // TODO: Integrate with Better Auth signup
        }
    };

    const currentMember = team.members[currentMemberIndex];

    return (
        <div className="flex items-center justify-center px-4 font-squid">
            <form
                className="bg-transparent p-4 rounded-xl border-2 border-pink-800 w-full max-w-md lg:max-w-xl space-y-3 shadow-lg"
                onSubmit={handleSubmit}
            >
                {/* Team Name */}
                <div>
                    <label className="block text-gray-300 text-xs text-left mb-1 tracking-wide">
                        TEAM NAME
                    </label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 transition-colors text-sm font-inter"
                        placeholder="CYBER WIZARDS"
                        value={team.teamName}
                        onChange={(e) =>
                            setTeam({ ...team, teamName: e.target.value })
                        }
                    />
                    {errors.teamName && (
                        <p className="text-red-500 text-xs mt-1 font-inter">
                            {errors.teamName}
                        </p>
                    )}
                </div>

                {/* Team Email */}
                <div>
                    <label className="block text-gray-300 text-xs text-left mb-1 tracking-wide">
                        TEAM EMAIL
                    </label>
                    <input
                        type="email"
                        className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 transition-colors text-sm font-inter"
                        placeholder="user@students.nsbm.ac.lk"
                        value={team.teamEmail}
                        onChange={(e) =>
                            setTeam({ ...team, teamEmail: e.target.value })
                        }
                    />
                    {errors.teamEmail && (
                        <p className="text-red-500 text-xs mt-1 font-inter">
                            {errors.teamEmail}
                        </p>
                    )}
                </div>

                {/* Contact Number */}
                <div>
                    <label className="block text-gray-300 text-xs text-left mb-1 tracking-wide">
                        TEAM CONTACT NO.
                    </label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 transition-colors text-sm font-inter"
                        placeholder="07XXXXXXXXX"
                        value={team.contactNumber}
                        onChange={(e) =>
                            setTeam({ ...team, contactNumber: e.target.value })
                        }
                    />
                    {errors.contactNumber && (
                        <p className="text-red-500 text-xs mt-1 font-inter">
                            {errors.contactNumber}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label className="block text-gray-300 text-xs text-left mb-1 tracking-wide">
                        TEAM PASSWORD
                    </label>
                    <input
                        type="password"
                        className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 transition-colors text-sm font-inter"
                        placeholder="••••••••"
                        value={team.password}
                        onChange={(e) =>
                            setTeam({ ...team, password: e.target.value })
                        }
                    />
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1 font-inter">
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-gray-300 text-xs text-left mb-1 tracking-wide">
                        CONFIRM PASSWORD
                    </label>
                    <input
                        type="password"
                        className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 transition-colors text-sm font-inter"
                        placeholder="••••••••"
                        value={team.confirmPassword}
                        onChange={(e) =>
                            setTeam({ ...team, confirmPassword: e.target.value })
                        }
                    />
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1 font-inter">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                {/* Team Members Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="text-purple-200 px-3 py-1 rounded-md font-semibold tracking-wide text-sm">
                            TEAM MEMBERS
                        </div>
                        {team.members.length < 5 && (
                            <button
                                type="button"
                                onClick={addMember}
                                className="bg-pink-800 hover:bg-pink-900 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
                            >
                                ADD MEMBER
                            </button>
                        )}
                    </div>

                    <p className="text-gray-400 text-xs text-center">
                        MAXIMUM 5 MEMBERS ALLOWED
                    </p>

                    {/* Member Navigation */}
                    <div className="bg-gray-800 border border-gray-600 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium text-sm text-left">
                                {currentMemberIndex === 0 ? "TEAM LEADER" : `MEMBER ${currentMemberIndex + 1}`}
                            </h4>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={prevMember}
                                    disabled={currentMemberIndex === 0}
                                    className="text-white hover:text-pink-400 disabled:text-gray-500 disabled:cursor-default transition-colors text-xl cursor-pointer p-1 rounded hover:bg-gray-700 disabled:hover:bg-transparent"
                                >
                                    ‹
                                </button>
                                <div className="text-gray-400 text-sm px-2">
                                    {currentMemberIndex + 1} / {team.members.length}
                                </div>
                                <button
                                    type="button"
                                    onClick={nextMember}
                                    disabled={currentMemberIndex === team.members.length - 1}
                                    className="text-white hover:text-pink-400 disabled:text-gray-500 disabled:cursor-default transition-colors text-xl cursor-pointer p-1 rounded hover:bg-gray-700 disabled:hover:bg-transparent"
                                >
                                    ›
                                </button>
                            </div>
                        </div>

                        {/* Current Member Form - Two Columns */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-gray-300 text-xs text-left mb-1">
                                    NAME
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-2 py-1 rounded-md bg-gray-700 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-pink-600 focus:border-pink-600 transition-colors text-xs font-inter"
                                    placeholder="FULL NAME"
                                    value={currentMember?.name || ""}
                                    onChange={(e) =>
                                        handleInputChange(currentMemberIndex, "name", e.target.value)
                                    }
                                />
                                {errors.members?.[currentMemberIndex]?.name && (
                                    <p className="text-red-500 text-xs mt-1 font-inter">
                                        {errors.members[currentMemberIndex].name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-300 text-xs text-left mb-1">
                                    STUDENT ID
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-2 py-1 rounded-md bg-gray-700 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-pink-600 focus:border-pink-600 transition-colors text-xs font-inter"
                                    placeholder="STUDENT ID NUMBER"
                                    value={currentMember?.studentId || ""}
                                    onChange={(e) =>
                                        handleInputChange(currentMemberIndex, "studentId", e.target.value)
                                    }
                                />
                                {errors.members?.[currentMemberIndex]?.studentId && (
                                    <p className="text-red-500 text-xs mt-1 font-inter">
                                        {errors.members[currentMemberIndex].studentId}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Remove Member Button */}
                        {team.members.length > 4 && currentMemberIndex === team.members.length - 1 && (
                            <button
                                type="button"
                                onClick={removeMember}
                                className="mt-2 text-red-400 hover:text-red-300 text-xs"
                            >
                                Remove Member
                            </button>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-600 to-pink-900 hover:from-pink-800 hover:to-pink-900 text-white py-2 px-4 rounded-md font-semibold tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-600 text-sm cursor-pointer"
                >
                    REGISTER TEAM
                </button>
            </form>
        </div>
    );
}
