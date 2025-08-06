"use client"

import React from 'react';
import Section from '../common/Section';
import RegistrationForm from '../common/RegistrationForm';

const RegistrationSection: React.FC = () => {
    return (
        <Section id="register">
            <div className="min-h-screen flex flex-col justify-center items-center py-16">
                <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-8 font-squid uppercase">
                        Registration
                    </h2>

                    <div className="mt-8">
                        <RegistrationForm />
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default RegistrationSection;
