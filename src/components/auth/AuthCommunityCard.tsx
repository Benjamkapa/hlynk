import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageSquareQuote } from 'lucide-react'
import { platformApi, type PlatformReview } from '../../lib/api/platform'
import StarRating from '../shared/StarRating'

const FALLBACK_REVIEWS: PlatformReview[] = [
  {
    id: 'fallback-1',
    userId: 'fallback-1',
    tenantId: 'fallback-1',
    name: 'Mercy Wanjiku',
    businessName: 'GreenGlow Salon',
    role: 'PROVIDER',
    rating: 5,
    comment: 'hlynk made it easier to track sales and keep my salon team accountable every day.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-2',
    userId: 'fallback-2',
    tenantId: 'fallback-2',
    name: 'Brian Otieno',
    businessName: 'Boma Auto Care',
    role: 'PROVIDER',
    rating: 5,
    comment: 'The portal is simple, fast, and my daily reporting finally feels clear instead of stressful.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-3',
    userId: 'fallback-3',
    tenantId: 'fallback-3',
    name: 'Fatma Hassan',
    businessName: 'SwiftClean Services',
    role: 'PROVIDER',
    rating: 4,
    comment: 'I like how quickly I can review performance and keep the business side organized in one place.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

interface AuthCommunityCardProps {
  className?: string
}

export default function AuthCommunityCard({ className = '' }: AuthCommunityCardProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const { data } = useQuery({
    queryKey: ['platform-reviews', 'auth-community'],
    queryFn: () => platformApi.getReviews({ limit: 8 }),
    staleTime: 60_000,
    retry: 1,
  })

  const reviews = data?.items?.length ? data.items : FALLBACK_REVIEWS
  const activeReview = reviews[activeIndex % reviews.length]

  const summary = useMemo(() => {
    if (data?.items?.length) return data.summary

    const totalReviews = FALLBACK_REVIEWS.length
    const averageRating = Number(
      (FALLBACK_REVIEWS.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1),
    )

    return { averageRating, totalReviews }
  }, [data])

  useEffect(() => {
    if (reviews.length <= 1) return

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % reviews.length)
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [reviews.length])

  return (
    <div className={`rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.26em] text-emerald-700">Community Rating</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {summary.averageRating.toFixed(1)}
            <span className="ml-2 text-base text-slate-400">/ 5.0</span>
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Based on {summary.totalReviews} provider review{summary.totalReviews === 1 ? '' : 's'}
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
          <MessageSquareQuote size={22} />
        </div>
      </div>

      <StarRating rating={summary.averageRating} size={16} className="mt-5" />

      <div className="mt-5 rounded-3xl bg-slate-50 p-5">
        <StarRating rating={activeReview.rating} size={12} className="mb-2" />
        <p className="text-sm leading-7 text-slate-700">"{activeReview.comment}"</p>
        <div className="mt-4 flex items-center gap-3">
          {activeReview.photoUrl ? (
            <img 
              src={activeReview.photoUrl} 
              alt={activeReview.name} 
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
              {activeReview.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-black text-slate-900">{activeReview.name}</p>
            <p className="text-xs font-medium text-slate-500">{activeReview.businessName}</p>
          </div>
        </div>
      </div>

      {reviews.length > 1 && (
        <div className="mt-5 flex items-center gap-2">
          {reviews.map((review: PlatformReview, index: number) => (
            <button
              key={review.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label={`Show review ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
