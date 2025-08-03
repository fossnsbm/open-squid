import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";

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
                <div className="min-h-screen">
                    {children}
                </div>
            </body>
        </html>
    );
}
