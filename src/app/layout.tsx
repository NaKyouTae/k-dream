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
  title: "K-Dream",
  description: "K-Dream",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
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
