"use client"

import React from 'react';
import Image from 'next/image';

const HeroSection: React.FC = () => {
    return (

        <div className="relative h-screen inset-0 flex items-center justify-center z-10 pointer-events-none">


            <div className="text-center pointer-events-auto">
                <h1 className="text-white text-7xl md:text-8xl lg:text-9xl tracking-wider mb-4 font-squid">
                    <span className="block -translate-x-4 md:-translate-x-8">open</span>
                    <span className="block text-white translate-x-8 md:translate-x-11 lg:translate-x-16">squid</span>
                </h1>
            </div>

            <div className="absolute left-0 bottom-32 md:left-0 md:bottom-32 lg:left-72 lg:bottom-32  pointer-events-auto">
                <div className="p-4 w-60 md:w-80">
                    <Image
                        src="/card.png"
                        alt="Card"
                        width={450}
                        height={450}
                        className="w-auto h-auto"
                    />
                </div>
            </div>

            <div className="absolute right-0 top-36 md:right-10 md:top-28 lg:right-72 lg:top-28 pointer-events-auto">
                <div className="p-4 w-60 md:w-80">
                    <Image
                        src="/mask.png"
                        alt="Mask"
                        width={450}
                        height={450}
                        className="w-auto h-auto"
                    />
                </div>
            </div>

            <div className="absolute bottom-72 md:bottom-36 md:right-80 pointer-events-auto">
                <a
                    href="/#register"
                    className="bg-transparent border-2 md:border border-pink-900 text-white hover:bg-pink-700 px-6 py-3 text-lg font-medium rounded transition-colors duration-200 font-inter"
                >
                    Register Now
                </a>
            </div>

        </div>
    );
};

export default HeroSection;
