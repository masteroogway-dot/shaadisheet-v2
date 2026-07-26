"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function ProfileMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U";
  const name = user?.name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-gradient-to-br from-maroon to-gold text-white text-sm font-bold flex items-center justify-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
      >
        {initial}
      </button>

      <div
        className={`absolute right-0 mt-2 w-60 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-[150] origin-top-right transition-all duration-200 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* User info */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-maroon to-gold text-white text-xs font-bold flex items-center justify-center shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
              <p className="text-xs text-gray-500 truncate">{email}</p>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-1">
          <Link
            href="/subscriptions"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 min-h-[40px] text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <i className="fas fa-credit-card w-4 text-center text-gray-400" />
            My Subscriptions
          </Link>

          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 min-h-[40px] text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <i className="fas fa-gear w-4 text-center text-gray-400" />
            Settings
          </Link>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 min-h-[40px] text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <i className="fas fa-shield-halved w-4 text-center text-red-400" />
              Admin Panel
            </Link>
          )}
        </div>

        <div className="border-t border-gray-100" />

        <div className="py-1">
          <button
            onClick={() => signOut({ callbackUrl: "/auth" })}
            className="flex items-center gap-3 px-4 py-2.5 min-h-[40px] text-sm text-red-600 hover:bg-red-50 transition-colors w-full cursor-pointer"
          >
            <i className="fas fa-right-from-bracket w-4 text-center text-red-400" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
