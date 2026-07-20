"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-maroon to-maroon-dark text-white p-16 flex-col justify-center relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-[radial-gradient(circle,rgba(212,175,55,0.1)_0%,transparent_60%)] pointer-events-none" />
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold mb-16 relative z-10">
          <span className="text-2xl tracking-tight">|||</span>
          <span className="text-white">ShaadiSheet</span>
        </Link>
        <div className="relative z-10 mb-12">
          <h1 className="text-[2.8rem] font-extrabold leading-[1.15] mb-4">
            Plan Your Indian Wedding<br />
            <span className="bg-gradient-to-br from-gold-light to-gold bg-clip-text text-transparent">Without the Chaos</span>
          </h1>
          <p className="text-lg opacity-85 leading-relaxed">Budget tracking. Vendor management. Ritual checklists. AI assistance.</p>
        </div>
        <div className="flex flex-col gap-4 relative z-10">
          {["Pre-filled for Indian weddings", "Real-time collaboration", "AI-powered suggestions", "Works on any device"].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-[0.95rem] opacity-90">
              <i className="fas fa-check-circle text-gold text-lg" /> {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login */}
      <div className="flex-1 flex items-center justify-center p-16 bg-cream">
        <div className="w-full max-w-[420px]">
          <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Log in to your ShaadiSheet account</p>

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-500 hover:shadow-sm transition-all cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-gray-400">or continue with email</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); signIn("google", { callbackUrl: "/dashboard" }); }}>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input type="email" placeholder="you@example.com" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[0.95rem] focus:outline-none focus:border-maroon transition-colors" />
            </div>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[0.95rem] focus:outline-none focus:border-maroon transition-colors" />
            </div>
            <button type="submit" className="w-full py-3.5 text-white font-bold bg-gradient-to-br from-maroon to-maroon-light rounded-lg shadow-[0_4px_15px_rgba(139,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(139,0,0,0.4)] transition-all cursor-pointer">
              Log In
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="text-maroon font-semibold hover:underline">
              Sign Up Free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
