export type Locale = "en" | "zh"

export interface Dictionary {
  metadata: {
    title: string
    description: string
  }
  header: {
    features: string
    faq: string
    login: string
    docs: string
    formEndpointsDocs: string
    inquiryWidgetDocs: string
  }
  hero: {
    headline: string
    subheadline: string
    tagline: string
    cta: string
    demo: string
  }
  demo: {
    title: string
  }
  painPoints: {
    title: string
    intro: string
    items: string[]
    conclusion: string
  }
  solution: {
    title: string
    subtitle: string
    features: {
      title: string
      description: string
      items: string[]
      summary: string
    }[]
  }
  useCases: {
    title: string
    items: string[]
    bestForLabel: string
    bestForItems: string[]
  }
  steps: {
    title: string
    sectionTitle: string
    items: string[]
    conclusion: string
  }
  comparison: {
    title: string
    headers: string[]
    rows: string[][]
  }
  techSecurity: {
    title: string
    items: string[]
    compatibility: string
  }
  faq: {
    title: string
    items: { q: string; a: string }[]
  }
  contact: {
    title: string
    subtitle: string
    namePlaceholder: string
    emailPlaceholder: string
    messagePlaceholder: string
    submit: string
    success: string
    error: string
  }
  finalCta: {
    title: string
    subtitle: string
    cta: string
    login: string
  }
  footer: {
    copyright: string
    brand: string
    tagline: string
  }
}

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("../dictionaries/en.json").then((m) => m.default as Dictionary),
  zh: () => import("../dictionaries/zh.json").then((m) => m.default as Dictionary),
}

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]()
