import { useState } from 'react'
import { cn } from '@/lib/cn'

/** Image avec fondu « blur-up » au chargement (zéro saccade, rendu fluide). */
export function Img({
  src,
  alt,
  className,
  imgClassName,
}: {
  src: string
  alt: string
  className?: string
  imgClassName?: string
}) {
  const [loaded, setLoaded] = useState(false)
  return (
    <span className={cn('block overflow-hidden bg-rose-100/50', className)}>
      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full object-cover transition-all duration-[400ms] ease-out will-change-transform',
          loaded ? 'scale-100 opacity-100 blur-0' : 'scale-[1.06] opacity-0 blur-md',
          imgClassName,
        )}
      />
    </span>
  )
}
