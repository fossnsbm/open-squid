"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

interface ChallengeCardProps {
    title?: string;
    link?: string;
    imgUrl?: string;
}

const PuzzleCard: React.FC<ChallengeCardProps> = ({
    title = "PUZZLE",
    link = "#",
    imgUrl = "/games/circle.png",
}) => {
    const router = useRouter(); 

    const handleClick = () => {
        router.push(link || "/");
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-pink-900 w-full shadow-lg hover:shadow-pink-900 hover:shadow-2xl ">
            <h2 className="w-full text-2xl font-bold mb-4 font-squid text-pink-400">
                {title}
            </h2>
            <div className="flex flex-col gap-2 items-center">
                <Image
                    src={imgUrl}
                    width={200}
                    height={200}
                    alt={title}
                    className="hover:animate-bounce cursor-pointer rounded-full"
                    onClick={handleClick}
                />
                <button
                    onClick={handleClick}
                    className="bg-pink-700 cursor-pointer rounded-lg w-full shadow-xl border hover:bg-pink-900 border-pink-900 py-2 font-bold"
                >
                    Manage
                </button>
            </div>
        </div>
    );
};

export default PuzzleCard;
