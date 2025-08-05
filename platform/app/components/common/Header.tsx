"use client"

import React, { useState } from 'react';
import Image from 'next/image';

const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
            <div className="flex items-center justify-between h-16 px-4">
                <div className="flex-shrink-0">
                    <a href='/'>
                        <Image
                            src="/logo.png"
                            alt="Open Squid Logo"
                            width={120}
                            height={40}
                            className="h-12 w-auto"
                        />
                    </a>
                </div>

                <div className="hidden md:block">
                    <div className="flex items-baseline space-x-8 font-inter">
                        <a
                            href="/"
                            className="text-white hover:text-pink-700 py-2 text-md font-light transition-colors duration-200"
                        >
                            Home
                        </a>
                        <a
                            href="/#phases"
                            className="text-white hover:text-pink-700 py-2 text-md font-light transition-colors duration-200"
                        >
                            Phases
                        </a>
                        <a
                            href="/#about"
                            className="text-white hover:text-pink-700 py-2 text-md font-light transition-colors duration-200"
                        >
                            About us
                        </a>
                        <a
                            href="/#register"
                            className="text-white hover:text-pink-700 py-2 text-md font-light transition-colors duration-200"
                        >
                            Register Now
                        </a>
                    </div>
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
                            className={`block h-6 w-6 transform transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''
                                }`}
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
                    ? 'max-h-64 opacity-100'
                    : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
                id="mobile-menu"
            >
                <div className="px-2 pt-2 pb-3 space-y-1 bg-black bg-opacity-90 backdrop-blur-sm">
                    <a
                        href="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-white hover:text-gray-300 block px-3 py-2 text-base font-medium font-inter transition-colors duration-200"
                    >
                        Home
                    </a>
                    <a
                        href="/#about"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-white hover:text-gray-300 block px-3 py-2 text-base font-medium font-inter transition-colors duration-200"
                    >
                        About us
                    </a>
                    <a
                        href="/#register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-white hover:text-gray-300 block px-3 py-2 text-base font-medium font-inter transition-colors duration-200"
                    >
                        Register Now
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Header;
