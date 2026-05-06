import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ChevronRight, HelpCircle, Loader2, Mail, MessageCircle, Phone, Star } from 'lucide-react'
import { toast } from 'sonner'
import { platformApi } from '../../lib/api/platform'
import { useAuth } from '../../lib/auth/AuthContext'
import { getErrorMessage } from '../../lib/utils/error'

export default function SupportPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const commonIssues = [
    { title: 'Payment Processing', desc: 'Issues with M-Pesa or Card payments.', icon: AlertCircle },
    { title: 'Inventory Sync', desc: 'Stock levels not updating correctly.', icon: MessageCircle },
    { title: 'Payout Status', desc: 'When will I receive my funds?', icon: HelpCircle },
  ]

  const { data: myReview, isLoading: reviewLoading } = useQuery({
    queryKey: ['platform-review', 'me'],
    queryFn: platformApi.getMyReview,
    enabled: user?.role === 'PROVIDER',
  })

  useEffect(() => {
    if (!myReview?.data) return

    setRating(myReview.data.rating)
    setComment(myReview.data.comment)
  }, [myReview])

  const submitReviewMutation = useMutation({
    mutationFn: platformApi.submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-review', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['platform-reviews'] })
      toast.success('Your provider review is now live in the auth showcase.')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Need Help?</h1>
          <p className="text-gray-500 font-medium">We&apos;re here to help your business grow</p>
        </div>
        <button className="bg-[#0D4A3E] text-white h-12 px-6 rounded-xl font-bold text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2">
          Contact Support
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ContactMethod icon={Phone} title="Call Us" value="+254 700 000 000" sub="Mon - Fri, 8am - 5pm" />
        <ContactMethod icon={Mail} title="Email Us" value="info@hlynk.co.ke" sub="24/7 Response time" />
        <ContactMethod icon={MessageCircle} title="Live Chat" value="Start Chat" sub="Average wait: 2 mins" isAction />
      </div>

      <div className="bg-white rounded-[14px] border border-gray-100 shadow-sm p-8">
        <h3 className="text-xl font-black text-gray-900 mb-8">Common Questions</h3>
        <div className="space-y-4">
          {commonIssues.map((issue, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-6 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <issue.icon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{issue.title}</h4>
                  <p className="text-sm text-gray-500 font-medium">{issue.desc}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-600 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {user?.role === 'PROVIDER' && (
        <div className="bg-white rounded-[14px] border border-gray-100 shadow-sm p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Public Testimonial</p>
              <h3 className="mt-2 text-xl font-black text-gray-900">Share how the portal is working for you</h3>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-gray-500">
                This review is stored centrally and can appear in the sign-in and sign-up sections for new providers to see.
              </p>
            </div>
            {reviewLoading && <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />}
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Your Rating</p>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="rounded-xl p-2 transition hover:bg-amber-50"
                    >
                      <Star
                        size={22}
                        className={value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share what the portal has helped you do better in your business."
                rows={5}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
              />
              <p className="text-xs text-gray-400">Between 12 and 280 characters.</p>
            </div>

            <button
              type="button"
              onClick={() => submitReviewMutation.mutate({ rating, comment })}
              disabled={submitReviewMutation.isPending || comment.trim().length < 12}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0D4A3E] px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-[#0A3D33] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitReviewMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
              {myReview?.data ? 'Update Public Review' : 'Publish Public Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ContactMethod({ icon: Icon, title, value, sub, isAction = false }: any) {
  return (
    <div className="bg-white p-8 rounded-[14px] border border-gray-100 shadow-sm text-center space-y-3 hover:shadow-md transition-all">
      <div className="h-16 w-16 rounded-[14px] bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
        <Icon size={32} />
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
      <h3 className={`text-lg font-black ${isAction ? 'text-emerald-600' : 'text-gray-900'}`}>{value}</h3>
      <p className="text-[10px] text-gray-500 font-bold">{sub}</p>
    </div>
  )
}
