"use client";
import { useState, useRef } from "react";
import questions from "@/app/data/question";
import Section from "./Section";


interface QuestionItem {
    id: number;
    question: string;
    answer: string;
    show?: boolean;
}

const FAQSection = () => {

    const itemsRef = useRef<Array<HTMLDivElement | null>>([]);


    const [qSet, setQSet] = useState<QuestionItem[]>(
        questions.map((question) => ({
            ...question,
            show: false,
        }))
    );


    const handleAnswerClick = (id: number) => {
        const newQSet = qSet.map((question) =>
            question.id === id
                ? { ...question, show: !question.show }
                : { ...question, show: false }
        );
        setQSet(newQSet);
    };

    return (
        <Section id="faq">
            <div className="h-screen flex flex-col items-center justify-center gap-3 font-kharkiv px-5 mb-20 mt-5 font-squid py-20">
                {qSet.map(({ id, question, answer, show }, index) => (
                    <div
                        key={id}
                        onClick={() => handleAnswerClick(id)}
                        ref={(el) => {
                            itemsRef.current[index] = el;
                        }}
                        className={`${show
                            ? "bg-gradient-to-b from-pink-600/90 to-pink-900/10 "
                            : "bg-gradient-to-r from-pink-600 to-pink-900 hover:from-pink-800 hover:to-pink-900 opacity-80"
                            } border-primary border-2 py-3 px-5 flex gap-2 relative w-full justify-between cursor-pointer max-w-[900px] transition-all duration-300  rounded-xl`}
                    >
                        <div className="w-full flex flex-col gap-2">
                            <div className="flex justify-between items-center gap-2">
                                <h4
                                    className={`${show ? "text-primary" : "text-white"
                                        } md:text-2xl transition-all duration-300 `}
                                >
                                    {question}
                                </h4>
                            </div>
                            {show && (
                                <p className="text-white text-left mb-2 p-4 rounded-2xl font-bold bg-white-700/50">
                                    {answer}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};

export default FAQSection;
