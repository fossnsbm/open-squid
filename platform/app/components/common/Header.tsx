"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "LeaderBoard", href: "/" },
    { name: "Playground", href: "/" },
];

const mobileLinks = [
    { name: "Home", href: "/" },
    { name: "LeaderBoard", href: "/" },
    { name: "Playground", href: "/" },
];

const registerLink = { name: "Register Now", href: "/#register" };

const truncateEmail = (email: string, maxLength: number = 20) => {
    if (!email || email.length <= maxLength) return email;

    const atIndex = email.indexOf('@');

    if (atIndex <= 0) return email.substring(0, maxLength) + '...';

    const localPart = email.substring(0, atIndex);
    const domainPart = email.substring(atIndex);

    if (localPart.length <= maxLength / 2) {
        const availableLength = maxLength - localPart.length - 3;
        return localPart + domainPart.substring(0, availableLength) + '...';
    }

    return localPart.substring(0, maxLength - 3) + '...' + domainPart;
};

const Header: React.FC = () => {
    const { data: session, isPending } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const handleLogout = async () => {
        await signOut();
        window.location.href = '/'
    };

    const userEmail = session?.user?.email ? truncateEmail(session.user.email) : '';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-center gap-64 h-16 px-4">
                <div className="flex-shrink-0">
                    <Link href="/">
                        <Image
                            src="/logo.png"
                            alt="Open Squid Logo"
                            width={120}
                            height={40}
                            className="h-18 w-auto"
                        />
                    </Link>
                </div>

                <div className="hidden md:block">
                    <div className="flex items-baseline space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-white hover:text-pink-700 py-2 text-xl font-squid transition-colors duration-200 uppercase"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="hidden md:block">
                    {(!session) ? (
                        <Link
                            href="/#register"
                            className="text-pink-600 hover:text-pink-700 py-2 text-xl font-squid transition-colors duration-200 uppercase"
                        >
                            Register Now
                        </Link>
                    ) : (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={toggleUserMenu}
                                className="text-pink-600 hover:text-pink-700 py-2 text-xl font-squid cursor-pointer transition-colors duration-200 uppercase flex items-center"
                            >
                                {session.user?.name || "User"}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`ml-2 h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* User Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-pink-800 rounded-md shadow-lg py-1 z-50">
                                    <div className="px-4 py-2 text-sm text-gray-300 border-b border-pink-800/30">
                                        <div className="font-medium">Signed in as</div>
                                        <div className="font-bold text-pink-400 truncate" title={session.user?.email || ""}>
                                            {userEmail}
                                        </div>
                                    </div>

                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 text-sm text-white hover:bg-pink-800 hover:text-white transition-colors"
                                    >
                                        Team Profile
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/50 hover:text-red-200 transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile menu toggle */}
                <div className="md:hidden">
                    <button
                        type="button"
                        onClick={toggleMobileMenu}
                        className="text-white hover:text-gray-300 inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-200"
                    >
                        <span className="sr-only">Open main menu</span>
                        <svg
                            className={`block h-6 w-6 transform transition-transform duration-200 ${isMobileMenuOpen ? "rotate-90" : ""}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMobileMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                id="mobile-menu"
            >
                <div className="px-2 pt-2 pb-3 space-y-1 bg-black bg-opacity-90 backdrop-blur-sm">
                    {mobileLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-white hover:text-gray-300 block px-3 py-2 text-base font-medium font-squid uppercase transition-colors duration-200"
                        >
                            {link.name}
                        </Link>
                    ))}

                    {!session && (
                        <Link
                            key={registerLink.name}
                            href={registerLink.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-pink-600 hover:text-pink-700 block px-3 py-2 text-base font-medium font-squid uppercase transition-colors duration-200"
                        >
                            {registerLink.name}
                        </Link>
                    )}

                    {session && (
                        <button
                            onClick={handleLogout}
                            className="text-red-400 hover:text-red-300 w-full text-left block px-3 py-2 text-base font-medium font-squid uppercase transition-colors duration-200"
                        >
                            SIGN OUT
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Header;
