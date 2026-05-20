import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Star, CheckCircle2, XCircle, Clock, ShieldCheck, Search, Filter } from 'lucide-react'
import Pagination from '../../components/shared/Pagination'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReviewsPage() {
  const [status, setStatus] = useState<string>('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data: reviewsRes, isLoading } = useQuery<any>({
    queryKey: ['admin-reviews', status, page],
    queryFn: () => adminApi.getReviews({ status: status === '' ? undefined : Number(status), page, limit: 10 })
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: number }) => adminApi.updateReviewStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      const action = variables.status === 1 ? 'approved' : 'hidden'
      toast.success(`Review ${action} successfully`)
    },
    onError: () => {
      toast.error('Failed to update review status')
    }
  })

  const reviews = reviewsRes?.data?.items || []
  const pagination = reviewsRes?.data?.pagination || { total: 0, pages: 1 }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Community Reviews</h1>
          <p className="text-gray-500 font-medium">Moderate provider feedback for the public auth portal</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                <Star size={20} className="fill-white" />
             </div>
             <div>
                <h3 className="text-lg font-black text-slate-900">Vetting Station</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Public Showcase Control</p>
             </div>
          </div>
          <div className="flex gap-4">
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 min-w-[180px] transition-all"
            >
              <option value="">All Statuses</option>
              <option value="0">Pending Approval</option>
              <option value="1">Approved (Public)</option>
              <option value="2">Rejected (Hidden)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Provider</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rating</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Review Content</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : reviews.length > 0 ? reviews.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        {r.userId ? (
                          <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(r.ownerName)}&background=random`} 
                            className="h-full w-full object-cover"
                            alt=""
                          />
                        ) : (
                          <Star size={16} className="text-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900">{r.ownerName}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{r.businessName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={12} 
                          className={r.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} 
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5 max-w-md">
                    <p className="text-sm text-gray-600 line-clamp-2 italic">"{r.reviewText}"</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      r.status === 1 ? 'bg-emerald-100 text-emerald-700' : r.status === 2 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {r.status === 1 ? 'Approved' : r.status === 2 ? 'Rejected' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right text-xs font-bold text-gray-400 hl-mono">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       {r.status !== 1 && (
                         <button 
                           onClick={() => updateStatusMutation.mutate({ id: r.id, status: 1 })}
                           className="h-8 px-3 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-1.5"
                         >
                           <CheckCircle2 size={12} /> Approve
                         </button>
                       )}
                       {r.status !== 2 && (
                         <button 
                           onClick={() => updateStatusMutation.mutate({ id: r.id, status: 2 })}
                           className="h-8 px-3 bg-red-50 text-red-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-1.5"
                         >
                           <XCircle size={12} /> Hide
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No reviews found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          page={page} 
          pages={pagination.pages} 
          total={pagination.total} 
          onPageChange={setPage}
          label="Review"
        />
      </div>
    </div>
  )
}
