import type { Metadata } from "next";
import Head from 'next/head';
import localFont from "next/font/local";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

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
  title: "像素背后",
  description: "Pixels is blowing in the wind",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"/>
      <link href="https://fonts.font.im/css2?family=Rubik+Distressed&display=swap"
            rel="stylesheet"/>
    </Head>

    <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
    <SpeedInsights/>
    <Analytics/>
    {children}
    </body>
    </html>
  );
}
