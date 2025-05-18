import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BioScout Islamabad",
  description: "Document and discover biodiversity in Pakistan's capital city",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#1A1A1A" />
      </head>
      <body className={`${inter.className} min-h-screen pt-20`}>
        {children}
      </body>
    </html>
  );
}