import type { Metadata } from "next";
import { Gafata } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const gafata = Gafata({
    weight: "400",
    variable: "--font-gafata",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Open Squid 25",
    description: "TBA",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${gafata.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
