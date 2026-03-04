import Script from "next/script"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getDictionary, type Locale } from "@/lib/dictionaries"
import LandingHeader from "@/components/landing/landing-header"
import Hero from "@/components/landing/hero"
import PainPoints from "@/components/landing/pain-points"
import Solution from "@/components/landing/solution"
import UseCases from "@/components/landing/use-cases"
import DeploySteps from "@/components/landing/deploy-steps"
import ComparisonTable from "@/components/landing/comparison-table"
import TechSecurity from "@/components/landing/tech-security"
import FaqSection from "@/components/landing/faq-section"
import ContactForm from "@/components/landing/contact-form"
import FinalCta from "@/components/landing/final-cta"
import LandingFooter from "@/components/landing/landing-footer"

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Redirect authenticated users to dashboard
  const cookieStore = await cookies()
  const pbAuth = cookieStore.get("pb_auth")
  if (pbAuth?.value) {
    redirect("/dashboard")
  }

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
      <main>
        <Hero
          headline={dict.hero.headline}
          subheadline={dict.hero.subheadline}
          tagline={dict.hero.tagline}
          cta={dict.hero.cta}
        />

        <PainPoints
          title={dict.painPoints.title}
          intro={dict.painPoints.intro}
          items={dict.painPoints.items}
          conclusion={dict.painPoints.conclusion}
        />

        <Solution
          title={dict.solution.title}
          subtitle={dict.solution.subtitle}
          features={dict.solution.features}
        />

        <UseCases
          title={dict.useCases.title}
          items={dict.useCases.items}
          bestForLabel={dict.useCases.bestForLabel}
          bestForItems={dict.useCases.bestForItems}
        />

        <DeploySteps
          sectionTitle={dict.steps.sectionTitle}
          title={dict.steps.title}
          items={dict.steps.items}
          conclusion={dict.steps.conclusion}
        />

        <ComparisonTable
          title={dict.comparison.title}
          headers={dict.comparison.headers}
          rows={dict.comparison.rows}
        />

        <TechSecurity
          title={dict.techSecurity.title}
          items={dict.techSecurity.items}
          compatibility={dict.techSecurity.compatibility}
        />

        <FaqSection
          title={dict.faq.title}
          items={dict.faq.items}
        />

        <section id="contact" className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-5xl space-y-6 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              {dict.contact.title}
            </h2>
            <p className="text-muted-foreground">
              {dict.contact.subtitle}
            </p>
            <ContactForm
              namePlaceholder={dict.contact.namePlaceholder}
              emailPlaceholder={dict.contact.emailPlaceholder}
              messagePlaceholder={dict.contact.messagePlaceholder}
              submitLabel={dict.contact.submit}
              successMessage={dict.contact.success}
              errorMessage={dict.contact.error}
            />
          </div>
        </section>

        <FinalCta
          title={dict.finalCta.title}
          subtitle={dict.finalCta.subtitle}
          cta={dict.finalCta.cta}
        />

        <LandingFooter
          copyright={dict.footer.copyright}
          brand={dict.footer.brand}
          tagline={dict.footer.tagline}
        />
      </main>

      {process.env.NEXT_PUBLIC_LANDING_WIDGET_ID && process.env.NEXT_PUBLIC_WIDGET_URL && (
        <>
          <Script id="formhandler-widget-config" strategy="afterInteractive">
            {`window.FormHandler = { widgetId: "${process.env.NEXT_PUBLIC_LANDING_WIDGET_ID}", apiBase: "${process.env.NEXT_PUBLIC_POCKETBASE_URL}" };`}
          </Script>
          <Script
            src={`${process.env.NEXT_PUBLIC_WIDGET_URL}/widget.js`}
            strategy="afterInteractive"
          />
        </>
      )}
    </>
  )
}
