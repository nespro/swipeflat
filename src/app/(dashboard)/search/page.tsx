"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Search page — merged into /swipe. Client-side redirect for backwards compatibility.
 */
export default function SearchPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/swipe");
  }, [router]);
  return null;
}
