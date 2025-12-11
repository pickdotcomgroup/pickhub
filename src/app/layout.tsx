import { DM_Sans } from "next/font/google";
import "~/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { type Metadata } from "next";

import { SessionProvider } from "next-auth/react";

import { TRPCReactProvider } from "~/trpc/react";
import LayoutWrapper from "./_components/layout-wrapper";
import ToastProvider from "./_components/toast-provider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "TechPickHub - Browse Tech Projects, Developers, and Top Agencies",
  description: "A platform to explore tech projects, connect with developers, and find top agencies.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable}`}>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
            <ToastProvider />
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
