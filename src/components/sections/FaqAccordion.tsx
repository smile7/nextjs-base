'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { RichText } from '@/lib/content'
import type { FaqItem } from '@/lib/content'

type FaqAccordionProps = {
  items: FaqItem[]
  idPrefix: string
}

export function FaqAccordion({ items, idPrefix }: FaqAccordionProps) {
  return (
    <Accordion className="mt-8">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger id={`${idPrefix}-${item.id}`}>{item.question}</AccordionTrigger>
          <AccordionContent>
            <div className="prose-theme">
              <RichText value={item.answer} />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}