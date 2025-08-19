import { NextRequest, NextResponse } from "next/server";
import { checkPromptSubmission } from "@/app/db/queries";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (!userId || !sessionId) {
        return NextResponse.json(
            { error: "Missing userId or sessionId" },
            { status: 400 }
        );
    }

    try {
        const existing = await checkPromptSubmission(userId, sessionId);

        return NextResponse.json(
            { exists: existing !== undefined && existing !== null },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error checking submission:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
