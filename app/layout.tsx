import type { Metadata } from "next";
import "./globals.css";
import { Nunito, Raleway } from 'next/font/google'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
  weight: ['400', '500', '600', '700', '800', '900'],
})


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
      <body className={`${nunito.variable} ${raleway.variable} font-nunito`}>
        {children}
      </body>
    </html>
  );
}
