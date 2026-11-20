import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Container } from '@/components/primitives/Container'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import { ComponentsDemo } from '@/components/styleguide/ComponentsDemo'
import { MotionDemo } from '@/components/styleguide/MotionDemo'
import { PaletteDemo } from '@/components/styleguide/PaletteDemo'
import { ScalesDemo } from '@/components/styleguide/ScalesDemo'
import { TypeDemo } from '@/components/styleguide/TypeDemo'
import { readPublicEnv } from '@/env'

export const metadata: Metadata = {
  title: 'Styleguide',
  robots: { index: false, follow: false },
}

/** Internal sign-off and visual regression surface. 404 unless NEXT_PUBLIC_ENABLE_STYLEGUIDE=true. */
export default function StyleguidePage() {
  const { NEXT_PUBLIC_ENABLE_STYLEGUIDE } = readPublicEnv('NEXT_PUBLIC_ENABLE_STYLEGUIDE')
  if (!NEXT_PUBLIC_ENABLE_STYLEGUIDE) notFound()

  return (
    <main>
      <Container className="pt-12">
        <Heading as="h1" size="step-4">
          Styleguide
        </Heading>
        <Text tone="muted" className="mt-2 max-w-(--container-prose)">
          Tokens, type, components and motion for review. Header states arrive in Phase 05, page
          sections in Phase 06.
        </Text>
      </Container>
      <PaletteDemo />
      <TypeDemo />
      <ScalesDemo />
      <ComponentsDemo />
      <MotionDemo />
    </main>
  )
}
