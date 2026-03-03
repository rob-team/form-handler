import type { Metadata } from "next"
import { loadDoc } from "@/lib/markdown"
import DocPage from "@/components/docs/doc-page"

const BASE_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const doc = loadDoc(locale, "form-endpoints")
  const isZh = locale === "zh"

  return {
    title: doc.title,
    description: doc.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/docs/form-endpoints`,
      languages: {
        en: `${BASE_URL}/en/docs/form-endpoints`,
        zh: `${BASE_URL}/zh/docs/form-endpoints`,
      },
    },
    openGraph: {
      title: doc.title,
      description: doc.description,
      url: `${BASE_URL}/${locale}/docs/form-endpoints`,
      type: "article",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.description,
    },
  }
}

export default async function FormEndpointsDocPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isZh = locale === "zh"
  const doc = loadDoc(locale, "form-endpoints")

  return (
    <DocPage
      locale={locale}
      doc={doc}
      tocTitle={isZh ? "目录" : "On this page"}
      backLabel={isZh ? "← 返回首页" : "← Back to Home"}
    />
  )
}
