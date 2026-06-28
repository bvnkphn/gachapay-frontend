"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const hiddenPaths = ["/login", "/register", "/admin"];

export default function FooterWrapper() {
  const pathname = usePathname();

  if (!pathname) return null;

  const shouldHide = hiddenPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (shouldHide) return null;

  return <Footer />;
}
