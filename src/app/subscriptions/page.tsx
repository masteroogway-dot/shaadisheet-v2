"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function SubscriptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ShaadiSheet" style={{ height: "55px", width: "auto" }} />
        </Link>
        <Link href="/dashboard" className="text-xs sm:text-sm font-medium text-gray-600 hover:text-maroon transition-colors cursor-pointer">
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-hard-hat text-amber-500 text-3xl" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Under Construction</h1>
        <p className="text-gray-500 text-sm md:text-base mb-8 max-w-md mx-auto">
          We&apos;re working on bringing you flexible subscription plans with secure payment gateways. Stay tuned!
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-maroon text-white text-sm font-semibold rounded-xl hover:bg-maroon-dark transition-colors cursor-pointer"
        >
          <i className="fas fa-arrow-left text-xs" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
