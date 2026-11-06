import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Star } from 'lucide-react'
import Pagination from '../../components/shared/Pagination'
import InlineLoader from '../../components/shared/InlineLoader'

const STATUS_STYLE: Record<number, { label: string; text: string; dot: string }> = {
  0: { label: 'Pending', text: 'text-amber-700', dot: 'bg-amber-500' },
  1: { label: 'Approved', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  2: { label: 'Hidden', text: 'text-slate-600', dot: 'bg-slate-400' },
}

const statusStyle = (status: number) => STATUS_STYLE[status] || STATUS_STYLE[0]

export default function ReviewsPage() {
  const [status, setStatus] = useState<string>('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data: reviewsRes, isLoading } = useQuery<any>({
    queryKey: ['admin-reviews', status, page],
    queryFn: () => adminApi.getReviews({ status: status === '' ? undefined : Number(status), page, limit: 10 }),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) => adminApi.updateReviewStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      const action = variables.status === 1 ? 'approved' : 'hidden'
      toast.success(`Review ${action}`)
    },
    onError: () => {
      toast.error('Failed to update review')
    },
  })

  const reviews = reviewsRes?.data?.items || []
  const pagination = reviewsRes?.data?.pagination || { total: 0, pages: 1 }
  const isFiltered = status !== ''

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pt-2 animate-in fade-in duration-500">
      {/* Header */}
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs text-slate-500">
          {pagination.total} {pagination.total === 1 ? 'review' : 'reviews'}
          {isFiltered ? ' in this view' : ''}
        </p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight text-slate-900">Reviews</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-500">
          Approved reviews appear on the public sign-in page. Hidden reviews don't.
        </p>
      </header>

      {/* Registry */}
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-slate-900">All reviews</h2>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            aria-label="Filter by status"
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0D4A3E]"
          >
            <option value="">All statuses</option>
            <option value="0">Pending approval</option>
            <option value="1">Approved (public)</option>
            <option value="2">Hidden</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="px-6 py-3 font-medium">Reviewer</th>
                <th className="px-6 py-3 font-medium">Review</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 text-right font-medium">Moderate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <InlineLoader message="Loading reviews..." />
                  </td>
                </tr>
              ) : reviews.length > 0 ? (
                reviews.map((r: any) => {
                  const st = statusStyle(r.status)
                  const owner = r.ownerName || 'Unknown'
                  return (
                    <tr key={r.id} className="align-top transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-sm font-semibold text-slate-600">
                            {owner.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{owner}</p>
                            <p className="truncate text-xs text-slate-400">{r.businessName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-md px-6 py-4">
                        <div className="mb-1.5 flex gap-0.5" role="img" aria-label={`${r.rating} out of 5 stars`}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={13}
                              className={r.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                            />
                          ))}
                        </div>
                        <p className="line-clamp-3 text-sm leading-relaxed text-slate-700">{r.reviewText}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 text-sm ${st.text}`}>
                          <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm tabular-nums text-slate-700">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-4">
                          {r.status !== 1 && (
                            <button
                              disabled={updateStatusMutation.isPending}
                              onClick={() => updateStatusMutation.mutate({ id: r.id, status: 1 })}
                              className="text-sm font-medium text-[#0D4A3E] hover:underline disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {r.status !== 2 && (
                            <button
                              disabled={updateStatusMutation.isPending}
                              onClick={() => updateStatusMutation.mutate({ id: r.id, status: 2 })}
                              className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                            >
                              Hide
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-sm text-slate-400">
                    {isFiltered ? 'No reviews with this status.' : 'No reviews yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-xs text-slate-500">
          <span>
            {pagination.total} {pagination.total === 1 ? 'review' : 'reviews'}
          </span>
          {isFiltered && (
            <button
              onClick={() => {
                setStatus('')
                setPage(1)
              }}
              className="font-medium text-[#0D4A3E] hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="border-t border-slate-200 px-6 py-4">
            <Pagination page={page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} label="Review" />
          </div>
        )}
      </section>
    </div>
  )
}