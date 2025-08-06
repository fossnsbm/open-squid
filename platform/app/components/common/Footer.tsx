"use client";

import Image from "next/image";
import React from "react";

export default function Footer() {
    return (
        <footer className="relative text-white font-inter mt-2 overflow-hidden flex flex-col items-center">
            <div className="w-full flex md:justify-between px-10 items-center justify-center">
              

                <div className="relative w-[160px] h-[80px] md:w-[320px] md:h-[160px] ">
                   <Image
                    src="/open-squid-logo.png"
                    alt="Open Squid Logo"
                   fill
                    className="object-contain"
                    priority
                />
                </div>

                <div className="md:grid grid-cols-4 gap-8 opacity-60 mt-6 hidden ">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <span
                            key={i}
                            className="w-1 h-1 bg-white rounded-full"
                        ></span>
                    ))}
                </div>
            </div>

            <div className="relative w-full flex flex-col items-center mt-4">
                <span className="mb-2 text-sm font-squid ">
                    MADE WITH <span className="text-white ">🤍</span> by FOSS
                    NSBM
                </span>

                <div className="w-[940px] h-[1px] bg-pink-600" />
            </div>

            <div className="flex gap-12 mt-6 mb-8 items-center ">
                <div className="relative w-[50px] h-[22px] md:w-[99px] md:h-[44px]">
                   <Image
                    src="/nsbm-logo.svg"
                    alt="NSBM Green University logo"
                   fill
                    className="object-contain"
                    priority
                />
                </div>
               
                <div className="relative md:w-[100px] md:h-[52px] w-[54px] h-[26px]">
                    <Image
                        src="/foss-logo.png"
                        alt="FOSS NSBM community logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <div className="relative md:w-[75px] md:h-[36px] w-[54px] h-[20px]">
                   <Image
                    src="/womenfoss-log.png"
                    alt="Women in FOSS NSBM logo"
                   fill
                    className="object-contain"
                    priority
                />
               
                </div>

            </div>
        </footer>
    );
}
