import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * AstraLogo — uses the official supplied artwork from /public/Astra-Logo/SVG/.
 *
 * version:
 *   'full'      — logo + wordmark + tagline   (hero, covers, website header)
 *   'no-tagline'— logo + wordmark only        (headers, email, sidebar)
 *   'mark'      — mark only                   (avatars, favicons, app icons)
 *
 * variant:
 *   'black'     — on light backgrounds (default)
 *   'white'     — on dark backgrounds and photographs
 *   'silver'    — on plain obsidian only (hero version)
 */

type LogoVersion = 'full' | 'no-tagline' | 'mark'
type LogoVariant = 'black' | 'white' | 'silver'

const SVG_MAP: Record<LogoVersion, Record<LogoVariant, string>> = {
  full: {
    black:  '/Astra-Logo/SVG/astra-logo-black.svg',
    white:  '/Astra-Logo/SVG/astra-logo-white.svg',
    silver: '/Astra-Logo/SVG/astra-logo-silver.svg',
  },
  'no-tagline': {
    black:  '/Astra-Logo/SVG/astra-logo-black-no-tagline.svg',
    white:  '/Astra-Logo/SVG/astra-logo-white-no-tagline.svg',
    silver: '/Astra-Logo/SVG/astra-logo-silver-no-tagline.svg',
  },
  mark: {
    black:  '/Astra-Logo/SVG/astra-mark-black.svg',
    white:  '/Astra-Logo/SVG/astra-mark-white.svg',
    silver: '/Astra-Logo/SVG/astra-mark-silver.svg',
  },
}

// Natural dimensions of the supplied artwork (px at 1×)
const DIMENSIONS: Record<LogoVersion, { w: number; h: number }> = {
  full:         { w: 208, h: 100 },  // viewBox 874.2 × 420  → ratio 2.08
  'no-tagline': { w: 239, h: 100 },  // viewBox 874.2 × 366  → ratio 2.39
  mark:         { w: 197, h: 100 },  // viewBox 490   × 249  → ratio 1.97
}

export function AstraLogo({
  version  = 'no-tagline',
  variant  = 'black',
  href     = '/',
  height,
  className,
}: {
  version?:  LogoVersion
  variant?:  LogoVariant
  href?:     string
  /** Override the rendered height in px. Width scales proportionally. */
  height?:   number
  className?: string
}) {
  const src  = SVG_MAP[version][variant]
  const dim  = DIMENSIONS[version]
  const h    = height ?? dim.h
  const w    = Math.round((dim.w / dim.h) * h)

  return (
    <Link
      href={href}
      className={cn('inline-flex shrink-0 items-center', className)}
      aria-label="Astra Technologies"
    >
      <Image
        src={src}
        alt="Astra Technologies"
        width={w}
        height={h}
        priority
        style={{ width: w, height: h }}
      />
    </Link>
  )
}

/**
 * AstraMark — just the orbital mark, no wordmark.
 * Use for avatars, favicons, sidebar collapsed state.
 */
export function AstraMark({
  variant = 'black',
  size    = 32,
  className,
}: {
  variant?:  LogoVariant
  size?:     number
  className?: string
}) {
  return (
    <Image
      src={SVG_MAP.mark[variant]}
      alt="Astra mark"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={className}
    />
  )
}
