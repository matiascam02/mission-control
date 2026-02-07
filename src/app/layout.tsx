import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/Toast";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Mission Control | OpenClaw",
  description: "AI Agent coordination dashboard - real-time oversight for your squad",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#0c0c0c] antialiased`}>
        {/* Background layers */}
        <div className="fixed inset-0 bg-grid-pattern pointer-events-none" />
        <div className="fixed inset-0 gradient-radial-glow pointer-events-none" />

        {/* Content */}
        <ConvexClientProvider>
          <div className="relative">
            {children}
          </div>
        </ConvexClientProvider>

        {/* Toast notifications */}
        <ToastContainer />
      </body>
    </html>
  );
}
