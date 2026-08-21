"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "../lib/api/endpoints";
import { clearSession, getToken, isTokenExpired } from "../lib/api/session";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let active = true;
    async function validate() {
      const token = getToken();
      if (!token || isTokenExpired()) {
        clearSession();
        router.replace("/login");
        return;
      }
      try {
        await getProfile();
        if (active) setVerified(true);
      } catch {
        if (active) {
          clearSession();
          router.replace("/login");
        }
      }
    }
    validate();
    return () => {
      active = false;
    };
  }, [router]);

  if (!verified) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
