import type { Metadata } from "next";
import { Space_Grotesk, Schibsted_Grotesk } from "next/font/google";
import ToastProvider from "@/components/ui/Toast";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-display",
});
const body = Schibsted_Grotesk({ 
  subsets: ["latin"], 
  weight: ["400", "500", "700"],
  variable: "--font-body" 
});
const mono = Schibsted_Grotesk({ 
  subsets: ["latin"], 
  weight: ["400", "500", "700"],
  variable: "--font-mono" 
});

export const metadata: Metadata = {
  title: "QueryMind",
  description: "Connect your database. Ask questions in plain English. Get answers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-full bg-graphite font-body text-ink antialiased" suppressHydrationWarning>
        <ToastProvider>
          <PageTransition>{children}</PageTransition>
        </ToastProvider>
      </body>
    </html>
  );
}