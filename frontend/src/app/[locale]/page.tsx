import Script from "next/script"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getDictionary, type Locale } from "@/lib/dictionaries"
import LandingHeader from "@/components/landing/landing-header"
import Hero from "@/components/landing/hero"
import ServiceCard from "@/components/landing/service-card"
import ContactForm from "@/components/landing/contact-form"
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
        servicesLabel={dict.header.services}
        contactLabel={dict.header.contact}
        loginLabel={dict.header.login}
        docsLabel={dict.header.docs}
        formEndpointsDocsLabel={dict.header.formEndpointsDocs}
        inquiryWidgetDocsLabel={dict.header.inquiryWidgetDocs}
      />
      <main>
        <Hero
        headline={dict.hero.headline}
        subheadline={dict.hero.subheadline}
        cta={dict.hero.cta}
      />

      <section id="services" className="px-4 py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-5xl space-y-12">
          <h2 className="text-2xl font-bold text-center md:text-3xl">
            {dict.services.sectionTitle}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <ServiceCard
              icon={
                <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                  <rect
                    x="4"
                    y="4"
                    width="24"
                    height="24"
                    rx="3"
                    className="stroke-primary"
                    strokeWidth="2"
                  />
                  <path
                    d="M10 13h12M10 17h8M10 21h10"
                    className="stroke-primary"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="7" cy="9" r="1" className="fill-primary" />
                  <circle cx="10" cy="9" r="1" className="fill-primary" />
                  <circle cx="13" cy="9" r="1" className="fill-primary" />
                </svg>
              }
              title={dict.services.form.title}
              description={dict.services.form.description}
              benefits={dict.services.form.benefits}
              ctaText={dict.services.form.cta}
              ctaHref="/login"
              docsText={dict.services.form.docsLabel}
              docsHref={`/${locale}/docs/form-endpoints`}
            />
            <ServiceCard
              icon={
                <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                  <path
                    d="M6 6h20a2 2 0 012 2v12a2 2 0 01-2 2H14l-6 5v-5H6a2 2 0 01-2-2V8a2 2 0 012-2z"
                    className="stroke-primary"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="11" cy="14" r="1.5" className="fill-primary" />
                  <circle cx="16" cy="14" r="1.5" className="fill-primary" />
                  <circle cx="21" cy="14" r="1.5" className="fill-primary" />
                </svg>
              }
              title={dict.services.widget.title}
              description={dict.services.widget.description}
              benefits={dict.services.widget.benefits}
              ctaText={dict.services.widget.cta}
              ctaHref="/login"
              docsText={dict.services.widget.docsLabel}
              docsHref={`/${locale}/docs/inquiry-widget`}
            />
          </div>
        </div>
      </section>

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

      <LandingFooter copyright={dict.footer.copyright} />
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
