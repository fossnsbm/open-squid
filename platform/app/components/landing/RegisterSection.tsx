import React from 'react';
import RegistrationForm from '../common/RegistrationForm';

const RegisterSection: React.FC = () => {
    return (
        <section id="register" className="relative min-h-screen py-20 px-4">

            <div className="relative h-screen z-10 max-w-7xl mx-auto">
                <div className="text-center">
                    <h1 className="text-white text-2xl md:text-3xl lg:text-4xl tracking-wider mb-4 font-squid">
                        REGISTRATION
                    </h1>
                </div>

                <div className="flex justify-center">
                    <div className="w-full max-w-2xl">
                        <RegistrationForm />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RegisterSection;
