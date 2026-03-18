"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Root page — redirects to the swipe interface.
 */
export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/swipe");
  }, [router]);
  return null;
}
