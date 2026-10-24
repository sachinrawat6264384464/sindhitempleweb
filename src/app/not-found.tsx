import Link from "next/link";
import { BookOpen, Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto py-16 text-center space-y-8">
      <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-sm">
        <BookOpen className="w-8 h-8" aria-hidden="true" />
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
          Error 404
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
          Bhajan or Page Not Found
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          The devotional composition or category you are seeking does not exist or may have been
          moved.
        </p>
      </div>

      {/* Search Bar fallback */}
      <form action="/bhajans" method="GET" className="max-w-md mx-auto">
        <div className="relative">
          <input
            type="search"
            name="q"
            placeholder="Search bhajans by title or lyrics..."
            className="w-full pl-10 pr-24 py-3 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
          >
            Search
          </button>
        </div>
      </form>

      {/* Helpful links */}
      <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          href="/bhajans"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-medium hover:bg-amber-100 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Browse Library</span>
        </Link>
      </div>
    </div>
  );
}
