"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Refreshes server components every 5 minutes so scores stay live
export default function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [router]);

  return null;
}
