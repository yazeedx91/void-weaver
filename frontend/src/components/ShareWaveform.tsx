import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface ShareWaveformProps {
  hexacoScores: {
    HonestyHumility: number
    Emotionality: number
    Extraversion: number
    Agreeableness: number
    Conscientiousness: number
    OpennessToExperience: number
  }
  dassScores: {
    Depression: number
    Anxiety: number
    Stress: number
  }
  stabilityScore: number
  amplitudeLabel: string
}

const TRAITS = ['Honesty', 'Emotion', 'Extra', 'Agree', 'Conscien', 'Open']
const TRAIT_KEYS: (keyof ShareWaveformProps['hexacoScores'])[] = [
  'HonestyHumility', 'Emotionality', 'Extraversion',
  'Agreeableness', 'Conscientiousness', 'OpennessToExperience'
]

function setLetterSpacing(ctx: CanvasRenderingContext2D, spacing: string) {
  try {
    (ctx as any).letterSpacing = spacing
  } catch {}
}

function drawRadarPolygon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  values: number[],
  maxVal: number,
  strokeColor: string,
  fillColor: string,
  lineWidth: number
) {
  const n = values.length
  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const r = (values[i] / maxVal) * radius
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = fillColor
  ctx.fill()
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = lineWidth
  ctx.stroke()
}

function drawScoreCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  score: number,
  amplitudeLabel: string,
  size: number,
  format: 'story' | 'post'
) {
  const outerRadius = size
  const glowColor = amplitudeLabel === 'Balanced Range' ? 'rgba(52, 211, 153, 0.3)' :
    amplitudeLabel === 'High Amplitude' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(129, 140, 248, 0.3)'
  const accentColor = amplitudeLabel === 'Balanced Range' ? '#34D399' :
    amplitudeLabel === 'High Amplitude' ? '#FBBF24' : '#818CF8'

  const outerGlow = ctx.createRadialGradient(cx, cy, outerRadius * 0.6, cx, cy, outerRadius * 1.4)
  outerGlow.addColorStop(0, glowColor)
  outerGlow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = outerGlow
  ctx.fillRect(cx - outerRadius * 1.5, cy - outerRadius * 1.5, outerRadius * 3, outerRadius * 3)

  ctx.beginPath()
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, outerRadius * 0.85, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
  ctx.fill()
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 2
  ctx.stroke()

  const progress = Math.min(score / 100, 1)
  const startAngle = -Math.PI / 2
  const endAngle = startAngle + progress * Math.PI * 2
  ctx.beginPath()
  ctx.arc(cx, cy, outerRadius, startAngle, endAngle)
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.stroke()

  ctx.fillStyle = '#E2E8F0'
  ctx.font = `800 ${format === 'story' ? 56 : 44}px Inter, system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${score}`, cx, cy - (format === 'story' ? 8 : 6))

  ctx.fillStyle = '#94A3B8'
  ctx.font = `400 ${format === 'story' ? 11 : 9}px Inter, system-ui, sans-serif`
  setLetterSpacing(ctx, '0.15em')
  ctx.fillText('DYNAMIC RANGE', cx, cy + (format === 'story' ? 24 : 18))
  setLetterSpacing(ctx, '0')

  ctx.fillStyle = accentColor
  ctx.font = `600 ${format === 'story' ? 13 : 11}px Inter, system-ui, sans-serif`
  setLetterSpacing(ctx, '0.1em')
  ctx.fillText(amplitudeLabel.toUpperCase(), cx, cy + (format === 'story' ? 44 : 36))
  setLetterSpacing(ctx, '0')
}

function drawCard(
  canvas: HTMLCanvasElement,
  props: ShareWaveformProps,
  format: 'story' | 'post'
) {
  const dpr = 2
  const width = format === 'story' ? 1080 : 1200
  const height = format === 'story' ? 1920 : 1200
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const bg = ctx.createLinearGradient(0, 0, width, height)
  bg.addColorStop(0, '#020617')
  bg.addColorStop(0.5, '#0F172A')
  bg.addColorStop(1, '#020617')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  const glowGrad = ctx.createRadialGradient(width / 2, height * 0.35, 0, width / 2, height * 0.35, width * 0.6)
  glowGrad.addColorStop(0, 'rgba(79, 70, 229, 0.08)')
  glowGrad.addColorStop(1, 'rgba(79, 70, 229, 0)')
  ctx.fillStyle = glowGrad
  ctx.fillRect(0, 0, width, height)

  const topY = format === 'story' ? 100 : 60
  ctx.fillStyle = '#E2E8F0'
  ctx.font = `700 ${format === 'story' ? 28 : 22}px Inter, system-ui, sans-serif`
  setLetterSpacing(ctx, '0.3em')
  ctx.textAlign = 'center'
  ctx.fillText('F L U X - D N A', width / 2, topY)
  setLetterSpacing(ctx, '0')

  ctx.fillStyle = '#4F46E5'
  ctx.font = `400 ${format === 'story' ? 14 : 12}px Inter, system-ui, sans-serif`
  const subtitleSpacing = format === 'story' ? 36 : 28
  ctx.fillText('D Y N A M I C   R A N G E   P R O F I L E', width / 2, topY + subtitleSpacing)

  if (format === 'story') {
    drawScoreCircle(ctx, width / 2, height * 0.17, props.stabilityScore, props.amplitudeLabel, 90, format)

    const radarCenterY = height * 0.38
    const radarRadius = 200
    const radarCenterX = width / 2
    drawRadarSection(ctx, radarCenterX, radarCenterY, radarRadius, props, format)

    const waveY = height * 0.58
    drawWaveformSection(ctx, width, waveY, props, format)

    drawHexacoBarSection(ctx, width, height * 0.68, props, format)

    drawFooter(ctx, width, height, format)
  } else {
    drawScoreCircle(ctx, width / 2, height * 0.2, props.stabilityScore, props.amplitudeLabel, 75, format)

    const leftX = width * 0.28
    const rightX = width * 0.72
    const chartY = height * 0.52

    drawRadarSection(ctx, leftX, chartY, 150, props, format)

    const waveY = chartY + 20
    drawWaveformSectionCompact(ctx, rightX, waveY, props, format)

    drawHexacoBarSection(ctx, width, height * 0.82, props, format)

    drawFooter(ctx, width, height, format)
  }
}

function drawRadarSection(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  props: ShareWaveformProps,
  format: 'story' | 'post'
) {
  const n = 6

  for (let ring = 4; ring >= 1; ring--) {
    const r = (ring / 4) * radius
    ctx.beginPath()
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = `rgba(51, 65, 85, ${0.3 + ring * 0.1})`
    ctx.lineWidth = 1
    ctx.stroke()
  }

  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(x, y)
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  const values = TRAIT_KEYS.map(k => props.hexacoScores[k])
  drawRadarPolygon(ctx, centerX, centerY, radius, values, 5, '#4F46E5', 'rgba(79, 70, 229, 0.15)', 2.5)

  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const val = values[i]
    const r = (val / 5) * radius
    const x = centerX + r * Math.cos(angle)
    const y = centerY + r * Math.sin(angle)

    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#818CF8'
    ctx.fill()
    ctx.strokeStyle = '#4F46E5'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  const labelRadius = radius + (format === 'story' ? 28 : 22)
  ctx.font = `500 ${format === 'story' ? 12 : 10}px Inter, system-ui, sans-serif`
  ctx.fillStyle = '#94A3B8'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const lx = centerX + labelRadius * Math.cos(angle)
    const ly = centerY + labelRadius * Math.sin(angle)
    ctx.fillText(TRAITS[i], lx, ly)
  }
}

function drawWaveformSection(
  ctx: CanvasRenderingContext2D,
  width: number,
  waveY: number,
  props: ShareWaveformProps,
  format: 'story' | 'post'
) {
  const waveHeight = format === 'story' ? 110 : 80
  const waveWidth = width * 0.7
  const waveStartX = (width - waveWidth) / 2

  ctx.fillStyle = '#E2E8F0'
  ctx.font = `600 ${format === 'story' ? 13 : 11}px Inter, system-ui, sans-serif`
  ctx.textAlign = 'left'
  setLetterSpacing(ctx, '0.15em')
  ctx.fillText('DASS-21 WAVEFORM', waveStartX, waveY - waveHeight - 16)
  setLetterSpacing(ctx, '0')

  const dassKeys = ['Depression', 'Anxiety', 'Stress'] as const
  const dassLabels = ['DEP', 'ANX', 'STR']
  const maxDass = 42

  const points: [number, number][] = dassKeys.map((key, i) => {
    const x = waveStartX + (i / (dassKeys.length - 1)) * waveWidth
    const val = props.dassScores[key]
    const y = waveY - (val / maxDass) * waveHeight
    return [x, y]
  })

  ctx.beginPath()
  ctx.moveTo(points[0][0], waveY)
  for (const [px, py] of points) ctx.lineTo(px, py)
  ctx.lineTo(points[points.length - 1][0], waveY)
  ctx.closePath()
  const waveGrad = ctx.createLinearGradient(0, waveY - waveHeight, 0, waveY)
  waveGrad.addColorStop(0, 'rgba(79, 70, 229, 0.3)')
  waveGrad.addColorStop(1, 'rgba(79, 70, 229, 0.02)')
  ctx.fillStyle = waveGrad
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1])
  ctx.strokeStyle = '#4F46E5'
  ctx.lineWidth = 3
  ctx.stroke()

  for (let i = 0; i < points.length; i++) {
    const [px, py] = points[i]
    ctx.beginPath()
    ctx.arc(px, py, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#818CF8'
    ctx.fill()
    ctx.strokeStyle = '#4F46E5'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = '#94A3B8'
    ctx.font = `500 ${format === 'story' ? 11 : 9}px Inter, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(dassLabels[i], px, waveY + 16)
    ctx.fillStyle = '#E2E8F0'
    ctx.font = `700 ${format === 'story' ? 14 : 12}px Inter, system-ui, sans-serif`
    ctx.fillText(`${props.dassScores[dassKeys[i]]}`, px, waveY + 34)
  }
}

function drawWaveformSectionCompact(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  props: ShareWaveformProps,
  format: 'story' | 'post'
) {
  const barWidth = 50
  const maxBarH = 120
  const gap = 30
  const dassKeys = ['Depression', 'Anxiety', 'Stress'] as const
  const dassLabels = ['DEP', 'ANX', 'STR']
  const maxDass = 42
  const totalW = barWidth * 3 + gap * 2
  const startX = centerX - totalW / 2
  const baseY = centerY + maxBarH / 2

  ctx.fillStyle = '#E2E8F0'
  ctx.font = `600 10px Inter, system-ui, sans-serif`
  ctx.textAlign = 'center'
  setLetterSpacing(ctx, '0.15em')
  ctx.fillText('DASS-21', centerX, centerY - maxBarH / 2 - 24)
  setLetterSpacing(ctx, '0')

  for (let i = 0; i < 3; i++) {
    const val = props.dassScores[dassKeys[i]]
    const barH = (val / maxDass) * maxBarH
    const x = startX + i * (barWidth + gap)

    const barGrad = ctx.createLinearGradient(x, baseY - barH, x, baseY)
    barGrad.addColorStop(0, val > 28 ? '#EF4444' : val > 14 ? '#FBBF24' : '#4F46E5')
    barGrad.addColorStop(1, 'rgba(79, 70, 229, 0.1)')
    ctx.fillStyle = barGrad

    const cornerR = 4
    ctx.beginPath()
    ctx.moveTo(x + cornerR, baseY - barH)
    ctx.lineTo(x + barWidth - cornerR, baseY - barH)
    ctx.quadraticCurveTo(x + barWidth, baseY - barH, x + barWidth, baseY - barH + cornerR)
    ctx.lineTo(x + barWidth, baseY)
    ctx.lineTo(x, baseY)
    ctx.lineTo(x, baseY - barH + cornerR)
    ctx.quadraticCurveTo(x, baseY - barH, x + cornerR, baseY - barH)
    ctx.fill()

    ctx.fillStyle = '#94A3B8'
    ctx.font = '500 9px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(dassLabels[i], x + barWidth / 2, baseY + 16)
    ctx.fillStyle = '#E2E8F0'
    ctx.font = '700 12px Inter, system-ui, sans-serif'
    ctx.fillText(`${val}`, x + barWidth / 2, baseY - barH - 10)
  }
}

function drawHexacoBarSection(
  ctx: CanvasRenderingContext2D,
  width: number,
  startY: number,
  props: ShareWaveformProps,
  format: 'story' | 'post'
) {
  const barAreaWidth = width * 0.65
  const barStartX = (width - barAreaWidth) / 2
  const barHeight = format === 'story' ? 10 : 8
  const barGap = format === 'story' ? 26 : 20
  const fullLabels = ['Honesty-Humility', 'Emotionality', 'Extraversion', 'Agreeableness', 'Conscientiousness', 'Openness']

  ctx.beginPath()
  ctx.moveTo(barStartX, startY - 12)
  ctx.lineTo(barStartX + barAreaWidth, startY - 12)
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = '#E2E8F0'
  ctx.font = `600 ${format === 'story' ? 13 : 10}px Inter, system-ui, sans-serif`
  ctx.textAlign = 'left'
  setLetterSpacing(ctx, '0.15em')
  ctx.fillText('HEXACO-60 BLUEPRINT', barStartX, startY + 4)
  setLetterSpacing(ctx, '0')

  for (let i = 0; i < 6; i++) {
    const y = startY + 24 + i * barGap
    const val = props.hexacoScores[TRAIT_KEYS[i]]
    const pct = val / 5

    ctx.fillStyle = '#64748B'
    ctx.font = `400 ${format === 'story' ? 11 : 9}px Inter, system-ui, sans-serif`
    ctx.textAlign = 'left'
    ctx.fillText(fullLabels[i], barStartX, y - 2)

    ctx.fillStyle = '#E2E8F0'
    ctx.font = `600 ${format === 'story' ? 11 : 9}px Inter, system-ui, sans-serif`
    ctx.textAlign = 'right'
    ctx.fillText(val.toFixed(1), barStartX + barAreaWidth, y - 2)

    ctx.fillStyle = 'rgba(51, 65, 85, 0.3)'
    ctx.fillRect(barStartX, y + 4, barAreaWidth, barHeight)

    const barGrad = ctx.createLinearGradient(barStartX, y, barStartX + barAreaWidth * pct, y)
    barGrad.addColorStop(0, '#4F46E5')
    barGrad.addColorStop(1, '#818CF8')
    ctx.fillStyle = barGrad
    ctx.fillRect(barStartX, y + 4, barAreaWidth * pct, barHeight)
  }
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  format: 'story' | 'post'
) {
  const footerY = format === 'story' ? height - 100 : height - 50
  const waveWidth = width * 0.65
  const waveStartX = (width - waveWidth) / 2

  ctx.beginPath()
  ctx.moveTo(waveStartX, footerY - 16)
  ctx.lineTo(waveStartX + waveWidth, footerY - 16)
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = '#64748B'
  ctx.font = `400 ${format === 'story' ? 13 : 11}px Inter, system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('flux-dna.com', width / 2, footerY + 4)
  ctx.fillStyle = '#475569'
  ctx.font = `400 ${format === 'story' ? 11 : 9}px Inter, system-ui, sans-serif`
  ctx.fillText('Dynamic Range Over Static Stability', width / 2, footerY + 22)
}

export default function ShareWaveform({ hexacoScores, dassScores, stabilityScore, amplitudeLabel }: ShareWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [format, setFormat] = useState<'story' | 'post'>('post')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateImage = useCallback((fmt: 'story' | 'post') => {
    if (!canvasRef.current) return
    setFormat(fmt)
    setIsGenerating(true)

    requestAnimationFrame(() => {
      drawCard(canvasRef.current!, { hexacoScores, dassScores, stabilityScore, amplitudeLabel }, fmt)
      const dataUrl = canvasRef.current!.toDataURL('image/png')
      setPreviewDataUrl(dataUrl)
      setShowPreview(true)
      setIsGenerating(false)
    })
  }, [hexacoScores, dassScores, stabilityScore, amplitudeLabel])

  const downloadImage = useCallback(() => {
    if (!previewDataUrl) return
    try {
      const link = document.createElement('a')
      link.download = `flux-dna-waveform-${format}.png`
      link.href = previewDataUrl
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => document.body.removeChild(link), 100)
    } catch {
      window.open(previewDataUrl, '_blank')
    }
  }, [format, previewDataUrl])

  const shareImage = useCallback(async () => {
    if (!previewDataUrl) return

    try {
      const response = await fetch(previewDataUrl)
      const blob = await response.blob()

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'flux-dna-waveform.png', { type: 'image/png' })
        const shareData = { files: [file], title: 'My FLUX-DNA Waveform', text: 'My dynamic range profile from flux-dna.com' }
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
          return
        }
      }

      downloadImage()
    } catch {
      downloadImage()
    }
  }, [downloadImage, previewDataUrl])

  return (
    <>
      <motion.div
        className="backdrop-blur-xl bg-slate-900/40 border border-flux-glass-border rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm text-flux-silver mb-1 tracking-widest font-semibold">SHARE YOUR WAVEFORM</h3>
        <p className="text-xs text-slate-400 mb-4">Generate a high-resolution image of your dynamic range profile</p>
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => generateImage('post')}
            className="bg-flux-indigo hover:bg-flux-indigo-light text-sm min-h-[44px]"
            disabled={isGenerating}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {isGenerating && format === 'post' ? 'Generating...' : 'Square Post (1200×1200)'}
          </Button>
          <Button
            onClick={() => generateImage('story')}
            variant="outline"
            className="border-flux-glass-border text-slate-400 hover:text-flux-silver bg-transparent text-sm min-h-[44px]"
            disabled={isGenerating}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {isGenerating && format === 'story' ? 'Generating...' : 'Story (1080×1920)'}
          </Button>
        </div>
      </motion.div>

      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence>
        {showPreview && previewDataUrl && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              className="bg-slate-900 border border-flux-glass-border rounded-2xl p-4 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-flux-silver text-sm font-medium tracking-wider">YOUR WAVEFORM CARD</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className={`relative w-full ${format === 'story' ? 'aspect-[9/16]' : 'aspect-square'} mb-4 rounded-lg overflow-hidden bg-slate-950`}>
                <img
                  src={previewDataUrl}
                  alt="FLUX-DNA Waveform Card"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={shareImage}
                  className="flex-1 bg-flux-indigo hover:bg-flux-indigo-light text-sm min-h-[44px]"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </Button>
                <Button
                  onClick={downloadImage}
                  variant="outline"
                  className="flex-1 border-flux-glass-border text-slate-400 hover:text-flux-silver bg-transparent text-sm min-h-[44px]"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
