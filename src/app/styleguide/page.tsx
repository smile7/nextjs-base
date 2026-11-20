import { Container } from '@/components/primitives/Container'
import { Heading } from '@/components/primitives/Heading'
import { ComponentsDemo } from '@/components/styleguide/ComponentsDemo'
import { MotionDemo } from '@/components/styleguide/MotionDemo'

export default function StyleguidePage() {
  return (
    <main>
      <Container className="pt-12">
        <Heading as="h1" size="step-4">
          Styleguide
        </Heading>
      </Container>
      <ComponentsDemo />
      <MotionDemo />
    </main>
  )
}
