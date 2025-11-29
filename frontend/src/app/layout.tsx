import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const displayFont = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const codeFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LLM Logbook",
  description: "Explore benchmark runs and conversations across multiple LLMs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${codeFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
