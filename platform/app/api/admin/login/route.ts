import { db } from "@/app/db";
import { teams } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const userFromDb = await db
            .select({ role: teams.role })
            .from(teams)
            .where(eq(teams.email, email))

        if (!userFromDb.length) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const { role } = userFromDb[0]

        if (role !== 'admin') {
            return NextResponse.json(
                { error: "Access Denied" },
                { status: 403 }
            );
        }

        const loginResponse = await auth.api.signInEmail({
            body: {
                email,
                password,
            },
            asResponse: true
        });

        console.log(loginResponse)

        if (!loginResponse.ok) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Admin login successful",
            redirectUrl: "/admin"
        }, { status: 200 });

    } catch (error) {
        console.error("Admin login error:", error);
        return NextResponse.json(
            { error: "Authentication failed", details: (error as Error).message },
            { status: 500 }
        );
    }
}
