import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";

const inter = Inter({
    display: "swap",
    variable: "--font-inter",
    subsets: ["latin"],
});

const squid = localFont({
    src: '../../public/fonts/Game Of Squids.ttf',
    display: 'swap',
    variable: "--font-squid"
})

export const metadata: Metadata = {
    title: "Admin | Open Squid 25",
    description: "Admin access - Open Squid platform",
};

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={`${inter.variable} ${squid.variable} antialiased`}>
            {children}
        </div>
    );
}
