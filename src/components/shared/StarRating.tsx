import { Star, StarHalf } from 'lucide-react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: number
  className?: string
  showText?: boolean
  count?: number
}

export default function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 16, 
  className = '',
  showText = false,
  count
}: StarRatingProps) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5 text-amber-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-current" />
        ))}
        {hasHalfStar && <StarHalf size={size} className="fill-current" />}
        {[...Array(Math.max(0, emptyStars))].map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-slate-200" />
        ))}
      </div>
      
      {showText && (
        <span className="text-sm font-black text-slate-900 ml-1">
          {rating.toFixed(1)}
          {count !== undefined && (
            <span className="text-slate-400 font-medium text-[10px] ml-1">
              ({count} reviews)
            </span>
          )}
        </span>
      )}
    </div>
  )
}
