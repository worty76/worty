"use client"

import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "./components/navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
      </head>
      <body
        suppressHydrationWarning={true}
        className={inter.className}
        style={{backgroundColor:  "rgb(38 34 35)"}}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
