import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";
import Header from "./components/common/Header";

const inter = Inter({
    display: "swap",
    variable: "--font-inter",
    subsets: ["latin"],
});

const squid = localFont({
    src: '../public/fonts/Game Of Squids.ttf',
    display: 'swap',
    variable: "--font-squid"
})

export const metadata: Metadata = {
    title: "Open Squid 25",
    description: "TBA",
    icons: {
        icon: '/icon.ico',
        apple: '/apple-touch-icon.png'
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${squid.variable} antialiased`}>
                <main className="fixed top-0 left-0 w-dvw h-dvh z-10 flex flex-col">
                    <div className="min-h-screen snap-y snap-mandatory overflow-y-auto scroll-smooth">
                        <Header />
                        {children}
                    </div>
                </main>
            </body>
        </html>
    );
}
