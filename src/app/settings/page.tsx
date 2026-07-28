"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import NoIndex from "@/components/NoIndex";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);

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

  const user = session?.user;
  const initial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
    <NoIndex />
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ShaadiSheet" style={{ height: "45px", width: "auto" }} />
        </Link>
        <Link href="/dashboard" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-maroon transition-colors cursor-pointer">
          <i className="fas fa-arrow-left text-xs" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-8">Settings</h1>

        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-maroon to-gold text-white text-2xl font-bold flex items-center justify-center shrink-0">
              {initial}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user?.name || "User"}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-maroon/10 text-maroon text-xs font-semibold rounded-full">
                <i className="fas fa-check-circle text-[10px]" />
                Verified
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Name</label>
              <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700">
                {user?.name || "Not set"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700">
                {user?.email || "Not set"}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Preferences</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-500 mt-0.5">Receive updates about your weddings</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${notifications ? "bg-maroon" : "bg-gray-300"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifications ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Currency</p>
                <p className="text-xs text-gray-500 mt-0.5">Display currency as Indian Rupees</p>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                <span className="text-maroon">₹</span> INR
              </span>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-2">Help</h2>
          <p className="text-sm text-gray-500 mb-4">Replay the feature walkthrough tutorial anytime.</p>
          <button
            onClick={() => {
              localStorage.removeItem("shaadisheet-tutorial-done");
              router.push("/dashboard");
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-maroon border border-maroon/30 rounded-xl hover:bg-maroon/5 transition-colors cursor-pointer"
          >
            <i className="fas fa-play-circle text-xs" />
            Replay Tutorial
          </button>
        </div>

        {/* Danger zone */}
        <div className="bg-white border border-red-200 rounded-2xl p-6 md:p-8">
          <h2 className="text-base font-bold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-5">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors cursor-pointer">
            <i className="fas fa-trash-can text-xs" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
