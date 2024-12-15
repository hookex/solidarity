import type { Metadata } from "next";
import Head from 'next/head';
import { Montserrat, Noto_Sans, Fira_Code } from 'next/font/google';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

const notoSans = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-noto-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
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
    <html lang="en" className={`${notoSans.variable} ${montserrat.variable} ${firaCode.variable}`}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0,user-scalable=no"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"/>
        <link href="https://fonts.font.im/css2?family=Rubik+Distressed&display=swap"
              rel="stylesheet"/>
      </Head>

      <body>{children}</body>
    </html>
  );
}
