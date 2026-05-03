// SSE streaming endpoint for site analysis
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { AnalysisOrchestrator } from '@/lib/seo/orchestrator'
import type { CrawlConfig } from '@/types/seo/crawler'

export const maxDuration = 300 // 5 minutes for Vercel

const QuerySchema = z.object({
  url: z.string().url('Invalid URL'),
  maxPages: z.coerce.number().int().min(1).max(100).default(25),
  maxDepth: z.coerce.number().int().min(1).max(3).default(2),
  includeSitemap: z.coerce.boolean().default(false),
})

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export async function GET(request: NextRequest) {
  // ── Validate query params ──────────────────────────────────────────────────
  const { searchParams } = request.nextUrl
  const parsed = QuerySchema.safeParse({
    url: searchParams.get('url'),
    maxPages: searchParams.get('maxPages'),
    maxDepth: searchParams.get('maxDepth'),
    includeSitemap: searchParams.get('includeSitemap'),
  })

  if (!parsed.success) {
    return new Response(
      sseEvent('error', { message: parsed.error.issues.map(i => i.message).join(', ') }),
      { status: 400, headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  const { url, maxPages, maxDepth, includeSitemap } = parsed.data

  const config: CrawlConfig = {
    startUrl: url,
    maxPages,
    maxDepth,
    respectRobotsTxt: false,
    includeSitemap,
    concurrency: 3,
    timeout: 15000,
    generateAiRecommendations: true,
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        try {
          controller.enqueue(encoder.encode(sseEvent(event, data)))
        } catch {
          // Client disconnected
        }
      }

      const orchestrator = new AnalysisOrchestrator(config)

      orchestrator.on('state-change', ({ from, to, timestamp }) => {
        send('state', { from, to, timestamp })
      })

      orchestrator.on('crawl-progress', (progress) => {
        send('progress', progress)
      })

      orchestrator.on('page-analyzed', ({ url: pageUrl, scores }) => {
        send('page', { url: pageUrl, scores })
      })

      orchestrator.on('error', (err) => {
        send('fail', { phase: err.phase, message: err.message, url: err.url })
      })

      request.signal.addEventListener('abort', () => {
        console.log('[Stream] CLIENT DISCONNECTED — aborting analysis for', url)
        orchestrator.cancel()
      })

      console.log('[Stream] Starting analysis for:', url, '| maxPages:', maxPages, '| maxDepth:', maxDepth)

      try {
        const analysis = await orchestrator.start()

        console.log('[Stream] Analysis complete — pages:', analysis.pages.length, '| scores:', analysis.scores)

        const serialized = JSON.parse(JSON.stringify(analysis))
        send('complete', serialized)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Analysis failed'
        console.error('[Stream] FATAL ERROR:', msg)
        send('fail', { message: msg })
      } finally {
        console.log('[Stream] Stream closing for:', url)
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
