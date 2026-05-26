import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  pages: number
  total?: number
  onPageChange: (page: number) => void
  label?: string
}

export default function Pagination({ page, pages, total, onPageChange, label = 'Items' }: PaginationProps) {
  if (pages <= 1) return null

  return (
    <div className="p-10 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between bg-slate-50/20 gap-6">
      <div className="flex flex-col">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          {label} Page {page} of {pages}
        </p>
        {total !== undefined && (
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Total Registry: {total.toLocaleString()} entries</p>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="h-12 px-8 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-900/5 disabled:opacity-20 transition-all flex items-center gap-2 group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Prev
        </button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, pages) }, (_, i) => {
            let pageNum = i + 1;
            if (pages > 5 && page > 3) {
              pageNum = page - 2 + i;
              if (pageNum > pages) pageNum = pages - (4 - i);
            }
            if (pageNum < 1) pageNum = i + 1;
            if (pageNum > pages) return null;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`h-10 w-10 rounded-[.5rem] text-[10px] font-black transition-all ${
                  page === pageNum 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        <button 
          onClick={() => onPageChange(Math.min(pages, page + 1))}
          disabled={page === pages}
          className="h-12 px-8 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-900/5 disabled:opacity-20 transition-all flex items-center gap-2 group"
        >
          Next
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
