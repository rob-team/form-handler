import type { Metadata } from "next"
import { getDictionary, type Locale } from "@/lib/dictionaries"

export const dynamicParams = false

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }]
}

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale as Locale)

  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        en: `${BASE_URL}/en`,
        zh: `${BASE_URL}/zh`,
      },
    },
    openGraph: {
      title: dict.metadata.title,
      description: dict.metadata.description,
      url: `${BASE_URL}/${locale}`,
      type: "website",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      alternateLocale: locale === "zh" ? "en_US" : "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.metadata.title,
      description: dict.metadata.description,
    },
  }
}

function JsonLd({ locale }: { locale: string }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "FormHandler",
        url: BASE_URL,
        description:
          locale === "zh"
            ? "B2B卖家获客工具平台"
            : "Lead generation tools for B2B sellers",
      },
      {
        "@type": "SoftwareApplication",
        name: "FormHandler",
        url: BASE_URL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          locale === "zh"
            ? "轻松收集网站访客的询盘和表单提交。两大强力工具，帮助B2B卖家更快获取客户。"
            : "Collect inquiries and form submissions from your website visitors effortlessly. Two powerful services for B2B sellers.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <>
      <JsonLd locale={locale} />
      {children}
    </>
  )
}
