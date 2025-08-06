"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);
    return isMobile;
}
import Image from "next/image";
import TiltedCard from "@/app/components/common/TiltedCard";

const PhaseSection: React.FC = () => {
    const isMobile = useIsMobile();
    const cards = [
        {
            imageSrc: "./games/circle.png",
            altText: "QUIZ SURVIVAL",
            captionText: "A battle of minds. Fast thinking earns points. Every second counts.",
            overlayContent: (
                <p className="tilted-card-demo-text font-bold">QUIZ SURVIVAL </p>
            ),
        },
        {
            imageSrc: "./games/square.png",
            altText: "ECHO PROMPT",
            captionText: "Put your speed and imagination to the test. Type with purpose  your words matter.",
            overlayContent: (
                <p className="tilted-card-demo-text font-bold">ECHO PROMPT</p>
            ),
        },
        {
            imageSrc: "./games/triangle.png",
            altText: "THE SQUID CLUE",
            captionText: "The game starts with a search. What you find will lead the way. Stay sharp.",
            overlayContent: (
                <p className="tilted-card-demo-text font-bold">THE SQUID CLUE</p>
            ),
        },
    ];

    const [current, setCurrent] = useState(0);

    const handlePrev = () =>
        setCurrent((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
    const handleNext = () =>
        setCurrent((prev) => (prev === cards.length - 1 ? 0 : prev + 1));

    return (
        <div className="relative h-screen flex mt-64 ">
            <div className="flex justify-center items-center absolute inset-0 z-10 flex-col space-y-20">
                <div>
                    <h1 className="text-white text-2xl md:text-3xl lg:text-4xl tracking-wider mb-4 font-squid">
                        Three Phases of Success
                    </h1>
                </div>
                {/* Carousel for mobile, row for desktop */}
                {isMobile ? (
                    <div className="w-full flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center w-full">
                            <button
                                aria-label="Previous"
                                onClick={handlePrev}
                                className="text-white mr-4 shadow hover:text-pink-600 transition-colors duration-200 flex items-center justify-center "
                            >
                                <ChevronLeft size={48} />
                            </button>
                            <TiltedCard
                                imageSrc={cards[current].imageSrc}
                                altText={cards[current].altText}
                                captionText={cards[current].captionText}
                                containerHeight="250px"
                                containerWidth="250px"
                                imageHeight="250px"
                                imageWidth="250px"
                                rotateAmplitude={12}
                                scaleOnHover={1.2}
                                showMobileWarning={false}
                                showTooltip={true}
                                displayOverlayContent={true}
                                overlayContent={cards[current].overlayContent}
                            />
                            <button
                                aria-label="Next"
                                onClick={handleNext}
                                className="text-white ml-4 shadow hover:text-pink-600 transition-colors duration-200 flex items-center justify-center"
                            >
                                <ChevronRight size={48} />
                            </button>
                        </div>
                        <div className="flex justify-center mt-4 space-x-2">
                            {cards.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`inline-block w-2 h-2 rounded-full ${idx === current
                                        ? "bg-pink-600"
                                        : "bg-gray-300"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-10 md:gap-24 w-full items-center justify-center">
                        {cards.map((card, idx) => (
                            <TiltedCard
                                key={idx}
                                imageSrc={card.imageSrc}
                                altText={card.altText}
                                captionText={card.captionText}
                                containerHeight="250px"
                                containerWidth="250px"
                                imageHeight="250px"
                                imageWidth="250px"
                                rotateAmplitude={12}
                                scaleOnHover={1.2}
                                showMobileWarning={false}
                                showTooltip={true}
                                displayOverlayContent={true}
                                overlayContent={card.overlayContent}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhaseSection;
