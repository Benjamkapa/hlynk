import { useState, useEffect } from 'react'

interface CountUpProps {
  end: number
  duration?: number
  formatter?: (value: number) => string
  className?: string
}

export default function CountUp({ end, duration = 1500, formatter, className }: CountUpProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Easing function (easeOutExpo)
      const easeValue = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      
      setCount(Math.floor(easeValue * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      }
    }

    animationFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return (
    <span className={className}>
      {formatter ? formatter(count) : count.toLocaleString()}
    </span>
  )
}
