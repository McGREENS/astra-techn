'use client'

interface Bar { label: string; value: number }

export function BarChart({
  data,
  height = 120,
  color = '#0B0B0D',
}: {
  data: Bar[]
  height?: number
  color?: string
}) {
  if (!data.length) return null

  const max    = Math.max(...data.map(d => d.value), 1)
  const barW   = 100 / data.length
  const pad    = barW * 0.25
  const filled = barW - pad * 2

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        aria-label="Bar chart"
      >
        {data.map((d, i) => {
          const barH   = (d.value / max) * (height - 20)
          const x      = i * barW + pad
          const y      = height - 20 - barH

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={filled}
                height={Math.max(barH, 1)}
                fill={d.value === 0 ? '#E9E9EA' : color}
                opacity={d.value === 0 ? 0.5 : 1}
              />
              {/* Value label above bar */}
              {d.value > 0 && (
                <text
                  x={x + filled / 2}
                  y={y - 3}
                  textAnchor="middle"
                  fontSize="4"
                  fill="#8D8E91"
                >
                  {d.value}
                </text>
              )}
              {/* Day label below */}
              <text
                x={x + filled / 2}
                y={height - 4}
                textAnchor="middle"
                fontSize="4"
                fill="#C9CACD"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
