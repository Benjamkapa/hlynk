import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Star, CheckCircle2, XCircle } from 'lucide-react'
import Pagination from '../../components/shared/Pagination'
import InlineLoader from '../../components/shared/InlineLoader'

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
    <div className="space-y-8 animate-in fade-in duration-500 pt-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Community Reviews</h1>
        <p className="text-gray-400 text-sm mt-0.5">Moderate provider feedback for the public auth portal</p>
      </div>

      <div className="bg-white rounded-[.5rem] border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-slate-50 flex items-center justify-center text-emerald-600">
              <Star size={14} className="fill-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Vetting station</h3>
              <p className="text-xs text-gray-400 mt-0.5">Public showcase control</p>
            </div>
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-slate-50 border-none rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 min-w-[170px] transition-all"
          >
            <option value="">All statuses</option>
            <option value="0">Pending approval</option>
            <option value="1">Approved (public)</option>
            <option value="2">Rejected (hidden)</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Provider</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Review Content</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <InlineLoader message="Loading reviews table content..." />
                  </td>
                </tr>
              ) : reviews.length > 0 ? reviews.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50/30 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        {r.userId ? (
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(r.ownerName)}&background=random`}
                            className="h-full w-full object-cover"
                            alt=""
                          />
                        ) : (
                          <Star size={14} className="text-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{r.ownerName}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{r.businessName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 max-w-md">
                    <div className="flex gap-0.5 mb-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={10}
                          className={r.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{r.reviewText}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      r.status === 1 ? 'bg-emerald-100 text-emerald-700' : r.status === 2 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {r.status === 1 ? 'Approved' : r.status === 2 ? 'Rejected' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right text-xs text-gray-400 hl-mono">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       {r.status !== 1 && (
                         <button
                           onClick={() => updateStatusMutation.mutate({ id: r.id, status: 1 })}
                           className="h-8 px-3 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-1.5"
                         >
                           <CheckCircle2 size={12} /> Approve
                         </button>
                       )}
                       {r.status !== 2 && (
                         <button
                           onClick={() => updateStatusMutation.mutate({ id: r.id, status: 2 })}
                           className="h-8 px-3 bg-red-50 text-red-600 rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-1.5"
                         >
                           <XCircle size={12} /> Hide
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No reviews found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-50 p-6">
          <Pagination
            page={page}
            pages={pagination.pages}
            total={pagination.total}
            onPageChange={setPage}
            label="Review"
          />
        </div>
      </div>
    </div>
  )
}