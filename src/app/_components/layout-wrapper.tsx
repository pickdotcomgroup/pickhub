"use client";

import { usePathname } from "next/navigation";
import Header from "./header";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Pages where we don't want to show the header
  const hideHeaderPaths = ["/auth"];
  const shouldShowHeader =
    !hideHeaderPaths.includes(pathname) &&
    !(pathname.startsWith("/client/projects/") && pathname !== "/client/projects/new") &&
    !pathname.startsWith("/talent/projects/") &&
    pathname !== "/talent/project";

  return (
    <>
      {shouldShowHeader && <Header />}
      {children}
    </>
  );
}
