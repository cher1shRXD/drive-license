import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "운전면허 필기시험 학습 플랫폼",
  description: "40분 모의고사와 유형별 맞춤 학습으로 운전면허 필기시험을 준비하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="min-h-screen bg-[#080808] text-zinc-50 antialiased">
        {children}
      </body>
    </html>
  );
}
