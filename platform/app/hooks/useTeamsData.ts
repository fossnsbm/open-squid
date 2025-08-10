import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Team } from "@/app/admin/page";

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
                    const formattedTeams = users.users.map(user => ({
                        id: user.id,
                        name: user.name || "No Name",
                        email: user.email || "No Email",
                        createdAt: user.createdAt
                    }));

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
