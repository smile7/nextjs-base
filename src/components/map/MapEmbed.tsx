'use client'

import { useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'

type MapEmbedProps = {
  /** Google Maps embed address from Site settings. */
  embedUrl: string
  /** Accessible name of the iframe. */
  title: string
  loadLabel: string
  notice: string
  /** The placeholder shown until the click: the editor's preview image or the styled fallback. */
  children: ReactNode
}

function focusOnMount(node: HTMLIFrameElement | null) {
  node?.focus()
}

/** Click-to-load Google map: nothing is requested from Google until the visitor asks for it. */
export function MapEmbed({ embedUrl, title, loadLabel, notice, children }: MapEmbedProps) {
  const [loaded, setLoaded] = useState(false)

  if (loaded) {
    return (
      <iframe
        ref={focusOnMount}
        src={embedUrl}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="aspect-square w-full rounded-card border border-border sm:aspect-video"
      />
    )
  }

  return (
    <div className="relative isolate flex aspect-square w-full flex-col items-center justify-end overflow-hidden rounded-card border border-border bg-surface-muted p-4 sm:aspect-video sm:p-6">
      <div className="absolute inset-0 -z-10">{children}</div>
      <div className="flex max-w-sm flex-col items-center gap-2 rounded-card bg-surface p-4 text-center shadow-sm">
        <Button type="button" onClick={() => setLoaded(true)}>
          {loadLabel}
        </Button>
        <p className="text-step--1 text-fg-muted">{notice}</p>
      </div>
    </div>
  )
}
