"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/app/components/common/Toast";
import { useSession } from "@/lib/auth-client";

export default function AdminLogin() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isPending) {
            return;
        }

        if (session && session.user?.role === 'admin') {
            router.push("/admin");
        }
    }, [session, isPending, router]);

    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const [showToast, setShowToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const showToastMessage = (message: string, type: "success" | "error") => {
        setShowToast({ message, type });
    };

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!credentials.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!credentials.password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validate()) {
            setIsSubmitting(true);

            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Login failed");
                }

                showToastMessage("Login successful!", "success");

                // Give the session time to fully establish before redirecting
                setTimeout(() => {
                    // Force a hard navigation to ensure clean state
                    window.location.href = "/admin";
                }, 1500);

            } catch (error: any) {
                console.error("Login error:", error);
                showToastMessage(error.message || "Login failed!", "error");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // Don't render login form while checking session
    if (isPending) {
        return (
            <div className="snap-end min-h-screen flex flex-col items-center justify-center px-4 bg-background">
                <div className="loader p-5 text-pink-500">Checking session...</div>
            </div>
        );
    }

    // Only render the login form if user is not already logged in as admin
    return (
        <div className="snap-end min-h-screen flex flex-col items-center justify-center px-4 bg-background">
            {showToast && (
                <Toast
                    message={showToast.message}
                    type={showToast.type}
                    onClose={() => setShowToast(null)}
                />
            )}

            <div className="w-full max-w-md mb-8">

                <h1 className="text-3xl font-bold text-center text-white mb-2 font-squid uppercase">
                    Admin Access
                </h1>

                <form
                    className="bg-transparent p-6 rounded-xl border-2 border-pink-800 w-full space-y-4 shadow-lg"
                    onSubmit={handleSubmit}
                >
                    <div>
                        <label className="block text-gray-300 text-xs text-left mb-1 tracking-wide font-squid uppercase">
                            EMAIL
                        </label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 transition-colors text-sm font-inter"
                            placeholder="admin@opensquid.org"
                            value={credentials.email}
                            onChange={(e) =>
                                setCredentials({ ...credentials, email: e.target.value })
                            }
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1 font-inter">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-300 text-xs text-left mb-1 tracking-wide font-squid uppercase">
                            PASSWORD
                        </label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 transition-colors text-sm font-inter"
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={(e) =>
                                setCredentials({ ...credentials, password: e.target.value })
                            }
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1 font-inter">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-gradient-to-r from-pink-600 to-pink-900 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-pink-800 hover:to-pink-900'
                            } text-white py-3 px-4 rounded-md font-semibold tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-600 text-sm cursor-pointer font-squid mt-4`}
                    >
                        {isSubmitting ? "LOGGING IN..." : "LOGIN"}
                    </button>

                    {/* Back Link */}
                    <div className="text-center mt-4">
                        <a
                            href="/"
                            className="text-gray-400 hover:text-pink-500 text-sm transition-colors duration-200 font-inter"
                        >
                            Return to homepage
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
