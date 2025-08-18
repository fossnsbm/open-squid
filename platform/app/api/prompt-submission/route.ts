import { type NextRequest, NextResponse } from "next/server";
import {
    saveUserPrompt,
    getPromptSubmissions,
    updatePromptScore,
} from "@/app/db/queries";

export async function POST(request: NextRequest) {
    try {
        const { userId, sessionId, imageUrl, description } =
            await request.json();

        const answer = await saveUserPrompt(
            userId,
            sessionId,
            imageUrl,
            description
        );

        return NextResponse.json(answer, { status: 201 });
    } catch (error) {
        console.error("Error saving user prompt:", error);
        return NextResponse.json(
            { error: "Failed to save user prompt" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const submissions = await getPromptSubmissions();

        return NextResponse.json(submissions, { status: 200 });
    } catch (error) {
        console.error("Error fetching prompt submissions:", error);
        return NextResponse.json(
            { error: "Failed to fetch prompt submissions" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { userId, sessionId, score } = await request.json();
        const updated = await updatePromptScore(userId, sessionId, score);

        if (!updated) {
            return NextResponse.json(
                { error: "Failed to update prompt score" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Prompt score updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating prompt score:", error);
        return NextResponse.json(
            { error: "Failed to update prompt score" },
            { status: 500 }
        );
    }
}
