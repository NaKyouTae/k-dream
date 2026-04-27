import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "K-DREAM Study Abroad Agency | 입학에서 정주까지",
  description:
    "비수도권 취업·정주 연계형 외국인 유학생 풀케어 플랫폼. 우즈베키스탄·몽골·베트남·중국 타깃, 사립 전문대/4년제 공대/관광·외식 파트너로 입학~정주까지 원스톱 지원.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Script
          src="https://www.gstatic.com/firebasejs/12.12.1/firebase-app-compat.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics-compat.js"
          strategy="beforeInteractive"
        />
        <Script id="firebase-init" strategy="afterInteractive">
          {`
            const firebaseConfig = {
              apiKey: "AIzaSyCzhy3swXAl0jCG5rJhzM9VlCVLZMaYjFI",
              authDomain: "k-dream-b893b.firebaseapp.com",
              projectId: "k-dream-b893b",
              storageBucket: "k-dream-b893b.firebasestorage.app",
              messagingSenderId: "304421096115",
              appId: "1:304421096115:web:2b2590178ed620acccfec6",
              measurementId: "G-MYCV4PVJZW"
            };
            firebase.initializeApp(firebaseConfig);
            firebase.analytics();
          `}
        </Script>
      </body>
    </html>
  );
}
