import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { TRPCReactProvider } from "~/trpc/react";
import LayoutWrapper from "./_components/layout-wrapper";

export const metadata: Metadata = {
  title: "TechPickHub - Browse Tech Projects, Developers, and Top Agencies",
  description: "A platform to explore tech projects, connect with developers, and find top agencies.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
