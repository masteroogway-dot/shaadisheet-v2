"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "fa-chart-line", href: "/admin" },
  { id: "users", label: "Users", icon: "fa-users", href: "/admin/users" },
  { id: "weddings", label: "Weddings", icon: "fa-heart", href: "/admin/weddings" },
  { id: "ai", label: "AI Usage", icon: "fa-robot", href: "/admin/ai" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
    if (status === "authenticated" && session?.user?.role !== "admin") router.push("/dashboard");
  }, [session, status, router]);

  if (status === "loading" || !session || session.user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-2xl text-maroon" />
          <p className="mt-2 text-gray-500 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const active = navItems.find((n) => pathname === n.href)?.id || "dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
            <i className="fas fa-arrow-left mr-2" />
            Back to App
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded uppercase">Admin</span>
          <span className="text-sm font-medium">{session.user.name || session.user.email}</span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-56 bg-gray-900 text-gray-300 min-h-[calc(100vh-48px)] shrink-0 hidden md:block">
          <div className="p-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Admin Panel</h2>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    active === item.id
                      ? "bg-white/10 text-white font-medium"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <i className={`fas ${item.icon} w-5 text-center`} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 flex">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2.5 text-[10px] ${
                active === item.id ? "text-white" : "text-gray-500"
              }`}
            >
              <i className={`fas ${item.icon} text-base mb-0.5`} />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</div>
      </div>
    </div>
  );
}
