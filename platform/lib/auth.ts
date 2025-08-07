import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/app/db";

export const auth = betterAuth({
    trustedOrigins: [
        "https://open-squid.netlify.app",
        "https://opensquid.fossnsbm.org",
        "http://localhost:3000"
    ],
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        autoSignIn: false,
    },
    user: {
        modelName: "team",
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "user",
                input: false,
            },
            contactNumber: {
                type: "string",
                required: true,
            },
            team_members: {
                type: "string",
                required: true,
            }
        }
    },
    session: {
        modelName: "team_session",
    }
});


type Session = typeof auth.$Infer.Session
