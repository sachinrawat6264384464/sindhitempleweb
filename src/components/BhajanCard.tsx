import Link from "next/link";
import { ArrowRight, BookOpen, Tag } from "lucide-react";
import { SearchRecord, Bhajan } from "@/lib/types";

interface BhajanCardProps {
  bhajan: SearchRecord | Bhajan;
  categorySlug?: string;
  categoryName?: string;
}

export default function BhajanCard({ bhajan, categoryName }: BhajanCardProps) {
  const displayCategory =
    categoryName || ("categoryName" in bhajan ? bhajan.categoryName : bhajan.categoryId);

  return (
    <article className="group bg-white rounded-2xl p-6 border border-stone-200/90 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between">
      <div>
        {/* Header badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/60">
            <BookOpen className="w-3 h-3 text-amber-700" aria-hidden="true" />
            {displayCategory}
          </span>
          <div className="flex items-center gap-1 text-[11px] font-medium text-stone-500">
            <span className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200">
              Hindi
            </span>
            <span className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200">
              Roman
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors mb-1 leading-snug">
          <Link href={`/bhajans/${bhajan.slug}`} className="focus:outline-none focus:underline">
            {bhajan.title}
          </Link>
        </h3>

        {/* Roman Title */}
        <p className="text-sm font-medium text-stone-600 mb-3 italic">
          {bhajan.romanTitle}
        </p>

        {/* First Line Quote Preview */}
        <blockquote className="text-sm text-stone-700 bg-stone-50/80 p-3 rounded-lg border-l-2 border-amber-500 mb-4 font-serif leading-relaxed">
          &ldquo;{bhajan.firstLine}&rdquo;
        </blockquote>

        {/* Tags */}
        {bhajan.tags && bhajan.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4" aria-label="Tags">
            {bhajan.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-600"
              >
                <Tag className="w-2.5 h-2.5 text-stone-400" aria-hidden="true" />
                {tag}
              </span>
            ))}
            {bhajan.tags.length > 3 && (
              <span className="text-[11px] text-stone-400 self-center">
                +{bhajan.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-amber-800 group-hover:text-amber-900">
        <span className="text-[11px] text-stone-400 font-normal">Demo Sample</span>
        <Link
          href={`/bhajans/${bhajan.slug}`}
          className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
        >
          <span>Read lyrics</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
