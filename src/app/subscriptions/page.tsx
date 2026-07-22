"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["1 wedding", "Basic budget tracking", "Guest list (up to 100)", "AI assistant (limited)"],
    current: true,
  },
  {
    name: "Premium",
    price: "₹499",
    period: "/month",
    features: ["Unlimited weddings", "Full budget + vendor tracking", "Unlimited guests", "Room allocation", "AI assistant (unlimited)", "Priority support"],
    popular: true,
  },
  {
    name: "Planner Pro",
    price: "₹2,999",
    period: "/month",
    features: ["Everything in Premium", "Multi-client management", "Team collaboration", "Custom branding", "Dedicated account manager", "API access"],
  },
];

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
      {/* Header */}
      <div className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ShaadiSheet" className="h-8 w-auto" />
        </Link>
        <Link href="/dashboard" className="text-xs sm:text-sm font-medium text-gray-600 hover:text-maroon transition-colors cursor-pointer">
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Current plan banner */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 mb-6 md:mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base md:text-lg font-bold text-gray-900">Current Plan: Free</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">You are on the Free plan. Upgrade to unlock all features.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Plans */}
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Choose Your Plan</h1>
        <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">Pick the plan that works best for your wedding planning needs.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl border-2 p-4 md:p-6 flex flex-col ${
                plan.popular ? "border-maroon shadow-lg relative" : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-maroon text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.current ? (
                <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  plan.popular
                    ? "bg-maroon text-white hover:bg-maroon-dark"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}>
                  Upgrade to {plan.name}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-10 md:mt-16">
          <h2 className="text-lg font-bold text-gray-900 mb-4 md:mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3 md:space-y-4">
            {[
              { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. Your plan will remain active until the end of the billing period." },
              { q: "Do you offer refunds?", a: "We offer a full refund within 7 days of purchase if you're not satisfied." },
              { q: "Can I switch plans?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing." },
            ].map((faq) => (
              <div key={faq.q} className="bg-white border border-gray-200 rounded-xl p-3 md:p-5">
                <h3 className="font-bold text-xs md:text-sm text-gray-900 mb-1">{faq.q}</h3>
                <p className="text-xs md:text-sm text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
