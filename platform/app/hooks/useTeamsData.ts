import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Team, TeamMember } from "@/app/admin/page";

// Define an interface for the user data returned by the API
interface UserResponse {
    id: string;
    name?: string;
    email?: string;
    contactNumber?: string;
    createdAt: string | Date;
    team_members?: string;
}

export function useTeamsData() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTeams() {
            try {
                const { data: users, error: usersError } = await authClient.admin.listUsers({
                    query: {
                        sortBy: "createdAt",
                        sortDirection: "desc",
                        filterField: "role",
                        filterValue: "admin",
                        filterOperator: "ne",
                    }
                });

                if (usersError) {
                    throw new Error(usersError.message || "Failed to fetch users");
                }

                if (users) {
                    const formattedTeams = users.users.map((user: UserResponse) => {
                        let parsedMembers: TeamMember[] = [];
                        if (user.team_members) {
                            try {
                                parsedMembers = JSON.parse(user.team_members);
                            } catch (e) {
                                console.error(`Failed to parse team members for team ${user.id}:`, e);
                            }
                        }

                        return {
                            id: user.id,
                            name: user.name || "No Name",
                            email: user.email || "No Email",
                            contactNumber: user.contactNumber || "No contact number",
                            members: parsedMembers,
                            createdAt: new Date(user.createdAt),
                        };
                    });

                    console.log(formattedTeams);
                    setTeams(formattedTeams);
                }
            } catch (error: any) {
                console.error("Error fetching teams:", error);
                setError(error.message || "Failed to load teams data");
            } finally {
                setIsLoading(false);
            }
        }

        loadTeams();
    }, []);

    return { teams, isLoading, error };
}
