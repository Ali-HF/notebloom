import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/ToastContainer";
import CursorInk from "@/components/CursorInk";
import MobileFeedback from "@/components/MobileFeedback";

export const metadata: Metadata = {
  title: "Notebloom — Aesthetic Korean stationery, journals, and pens",
  description:
    "An independent online shop for aesthetic stationery, journals, planners, and pens. Beautiful tools to hold your thoughts, sketch ideas, and organize your day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CursorInk />
        <MobileFeedback />
        <ToastContainer />
      </body>
    </html>
  );
}