'use client';

import React from 'react'

interface DialProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  label: string
  description: string
  color?: string
}

export function Dial({ value, min = 1, max = 5, onChange, label, description, color = 'hsl(var(--primary))' }: DialProps) {
  const percentage = ((value - min) / (max - min)) * 100
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const x = e.clientX - rect.left - centerX
    const y = e.clientY - rect.top - centerY

    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90
    if (angle < 0) angle += 360

    // Map angle (0-360) to value (min-max), starting from bottom and going clockwise
    const normalizedAngle = angle - 45
    if (normalizedAngle >= 0 && normalizedAngle <= 270) {
      const newValue = Math.round(min + (normalizedAngle / 270) * (max - min))
      onChange(Math.max(min, Math.min(max, newValue)))
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center mb-2">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        className="cursor-pointer"
        onClick={handleClick}
      >
        {/* Background circle */}
        <circle cx="70" cy="70" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />

        {/* Progress circle */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px' }}
        />

        {/* Center value display */}
        <text
          x="70"
          y="75"
          textAnchor="middle"
          fontSize="32"
          fontWeight="bold"
          fill="currentColor"
          className="text-foreground pointer-events-none"
        >
          {value}
        </text>
        <text
          x="70"
          y="95"
          textAnchor="middle"
          fontSize="12"
          fill="currentColor"
          className="text-muted-foreground pointer-events-none"
        >
          / {max}
        </text>
      </svg>

      {/* Range labels */}
      <div className="flex justify-between w-full text-xs text-muted-foreground mt-2">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  )
}
