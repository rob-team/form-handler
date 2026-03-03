export type Locale = "en" | "zh"

export interface Dictionary {
  metadata: {
    title: string
    description: string
  }
  header: {
    services: string
    contact: string
    login: string
    getStarted: string
    docs: string
    formEndpointsDocs: string
    inquiryWidgetDocs: string
  }
  hero: {
    headline: string
    subheadline: string
    cta: string
  }
  services: {
    sectionTitle: string
    form: {
      title: string
      description: string
      benefits: string[]
      cta: string
      docsLabel: string
    }
    widget: {
      title: string
      description: string
      benefits: string[]
      cta: string
      docsLabel: string
    }
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
  footer: {
    copyright: string
  }
}

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("../dictionaries/en.json").then((m) => m.default as Dictionary),
  zh: () => import("../dictionaries/zh.json").then((m) => m.default as Dictionary),
}

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]()
