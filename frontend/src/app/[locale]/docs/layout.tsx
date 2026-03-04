import { getDictionary, type Locale } from "@/lib/dictionaries"
import LandingHeader from "@/components/landing/landing-header"
import LandingFooter from "@/components/landing/landing-footer"

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale as Locale)

  return (
    <>
      <LandingHeader
        locale={locale}
        featuresLabel={dict.header.features}
        faqLabel={dict.header.faq}
        loginLabel={dict.header.login}
        docsLabel={dict.header.docs}
        formEndpointsDocsLabel={dict.header.formEndpointsDocs}
        inquiryWidgetDocsLabel={dict.header.inquiryWidgetDocs}
      />
      <main className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        {children}
      </main>
      <LandingFooter
        copyright={dict.footer.copyright}
        brand={dict.footer.brand}
        tagline={dict.footer.tagline}
      />
    </>
  )
}
