import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HabbitHero - Build Better Habits",
  description: "Track your habits, build streaks, and become the hero of your own story",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#0f0f23]">
      <body className={`${inter.variable} font-sans antialiased bg-[#0f0f23] text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
