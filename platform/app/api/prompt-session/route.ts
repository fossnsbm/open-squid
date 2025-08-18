import { type NextRequest, NextResponse } from "next/server";
import { getPromptSessions, createPromptSession } from "@/app/db/queries";

export async function GET() {
    try {
        const session = await getPromptSessions();
        return NextResponse.json(session);
    } catch (error) {
        console.error("Error fetching questions:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch questions",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, action, duration } = body;

        if (!action || !title || !duration) {
            return NextResponse.json(
                { error: "Missing required fields: action, title, duration" },
                { status: 400 }
            );
        }

        const newPromptSession = await createPromptSession(
            title,
            action,
            duration
        );

        return NextResponse.json(newPromptSession, { status: 201 });
    } catch (error) {
        console.error("Error creating session:", error);
        return NextResponse.json(
            {
                error: "Failed to create session",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
