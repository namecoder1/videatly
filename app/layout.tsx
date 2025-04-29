import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Videatly",
  description: "Videatly helps you create video ideas and scripts for your YouTube channel. It's free and easy to use. Just answer a few questions and we'll generate a video idea and script for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
