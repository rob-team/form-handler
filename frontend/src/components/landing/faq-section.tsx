"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FaqSectionProps {
  title: string
  items: { q: string; a: string }[]
}

export default function FaqSection({ title, items }: FaqSectionProps) {
  return (
    <section id="faq" className="px-4 py-12 md:py-16 bg-muted/30">
      <div className="mx-auto max-w-3xl space-y-8">
        <h2 className="text-2xl font-bold text-center md:text-3xl">
          {title}
        </h2>
        <Accordion type="multiple" className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
