import Link from "next/link";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ShaadiSheet" style={{ height: "45px", width: "auto" }} />
        </Link>
        <Link href="/" className="text-xs sm:text-sm font-medium text-gray-600 hover:text-maroon transition-colors cursor-pointer">
          Back to Home
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Blog</h1>
        <p className="text-gray-500 mb-8 text-sm md:text-base">Tips, guides, and stories for Indian wedding planning.</p>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            We&apos;re working on wedding planning guides, budget tips, and vendor management advice.
            Check back soon for our latest articles.
          </p>
        </div>
      </div>
    </div>
  );
}
