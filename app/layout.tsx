import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import Image from 'next/image';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AI PAT",
  description: "Generated by Ahmed Alaa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
            <div className="flex justify-between items-center p-4">
            <a href="/">
              <Image 
                src="/assets/AI_PAT.jpg" 
                alt="AI PAT" 
                width={50} 
                height={50} 
                className="rounded-full"
                draggable={false}
              />
            </a>
            <div>
              <SignedOut>
              <SignInButton />
              </SignedOut>
              <SignedIn>
              <UserButton />
              </SignedIn>
            </div>
            </div>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
