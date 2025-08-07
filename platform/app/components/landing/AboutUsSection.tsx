'use client';

import Image from 'next/image';
import Section from '../common/Section';

const AboutUsSection: React.FC = () => {
    return (
        <Section id="about">
            <div className="relative w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex flex-col bg-cardbackground/20 backdrop-blur-md items-center justify-center 
                p-6 sm:p-8 md:p-12 lg:p-16 font-squid
                border-4 sm:border-6 border-b-pink-900 border-r-pink-900 border-t-white/10 border-l-white/10 
                rounded-lg shadow-lg pointer-events-auto
                w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl
                mx-auto my-4 sm:my-6 md:my-8 relative z-10 transition duration-500 hover:shadow-[0_0_20px_5px_rgba(255,0,128,0.7)]">

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 md:mb-12 lg:mb-16 text-center">
                        About Us
                    </h1>

                    <div className="mb-6 sm:mb-8 md:mb-12 lg:mb-16 w-full">
                        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-3 md:mb-4 text-center sm:text-left">
                            WHAT IS OPEN SQUID
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base lg:text-md max-w-full uppercase leading-relaxed text-center sm:text-left">
                            Welcome to Open Squid, a thrilling tech carnival by the NSBM FOSS Community!
                            Inspired by Squid Game and fueled by open-source spirit, freshers face four exciting digital challenges
                            testing speed, logic, knowledge, and curiosity — all on a custom-built platform by NSBM students.
                        </p>
                    </div>

                    <div className="w-full">
                        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-3 md:mb-4 text-center sm:text-right">
                            WHY OPEN SQUID ?
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base lg:text-md max-w-full uppercase leading-relaxed text-center sm:text-right">
                            Where freshers enter a world of mystery, logic, and speed — inspired by the intensity of Squid Game,
                            but powered by the spirit of open-source freedom. Dive into a series of four exciting digital challenges,
                            each designed to test your typing speed, problem-solving skills, tech knowledge, and curiosity —
                            all through a custom-built platform designed by NSBM students, for students.
                        </p>
                    </div>
                </div>
                <div className="hidden absolute left-4 bottom-25 md:block md:left-0 md:bottom-20 lg:block lg:left-28 lg:bottom-8 pointer-events-auto z-20">
                    <div className="w-32 md:w-40 lg:w-64">
                        <Image
                            src="/card.png"
                            alt="Card"
                            width={450}
                            height={450}
                            className="w-full h-auto object-contain transform -rotate-12"
                        />
                    </div>
                </div>
                <div className="absolute right-0 top-25 md:right-0 md:top-20 lg:right-70 lg:top-12 pointer-events-auto z-10">
                    <div className="w-32 md:w-40 lg:w-64">
                        <Image
                            src="/mask.png"
                            alt="Mask"
                            width={450}
                            height={450}
                            className="w-full h-auto object-contain"
                        />
                    </div>
                </div>
            </div>
        </Section>
    )
}
export default AboutUsSection;
