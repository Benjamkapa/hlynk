interface TablePaginationProps {
  page: number
  pages: number
  onPrevious: () => void
  onNext: () => void
  className?: string
}

export default function TablePagination({
  page,
  pages,
  onPrevious,
  onNext,
  className = '',
}: TablePaginationProps) {
  if (pages <= 1) return null

  return (
    <div className={`flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 ${className}`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        Page {page} of {pages}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={page <= 1}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= pages}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
