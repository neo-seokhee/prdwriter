import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AccessCodeProvider } from "@/context/AccessCodeContext";
import { Header } from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PRD Writer - AI 기반 제품 요구사항 문서 작성",
  description: "AI의 도움으로 제품 요구사항 문서를 작성하고 고도화하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 text-gray-900`}
      >
        <AccessCodeProvider>
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </AccessCodeProvider>
      </body>
    </html>
  );
}
