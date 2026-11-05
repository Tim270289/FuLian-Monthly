import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import FlipBook from "@/components/FlipBook";
import IssueCredits from "@/components/IssueCredits";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { issues, ogImageOf, pagesOf } from "@/data/issues";

export function generateStaticParams() {
  return issues.map((issue) => ({ id: issue.id }));
}

export async function generateMetadata({ params }: PageProps<"/issues/[id]">): Promise<Metadata> {
  const { id } = await params;
  const issue = issues.find((i) => i.id === id);
  if (!issue) return { title: "富聯商務月刊" };

  const title = `${issue.title}｜富聯商務月刊`;
  const description = `線上翻閱${issue.title}，掌握富聯最新商務動態。`;
  return {
    title,
    description,
    openGraph: {
      type: "article",
      locale: "zh_TW",
      siteName: "富聯商務月刊",
      title,
      description,
      url: `/issues/${issue.id}`,
      images: [{ url: ogImageOf(issue), width: 1200, height: 630 }],
    },
  };
}

async function IssueReader({ params }: { params: PageProps<"/issues/[id]">["params"] }) {
  const { id } = await params;
  const issue = issues.find((i) => i.id === id);
  if (!issue) notFound();

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold text-stone-900">{issue.title}</h1>
      <FlipBook pages={pagesOf(issue)} />
      {issue.credits && issue.credits.length > 0 && <IssueCredits credits={issue.credits} />}
    </>
  );
}

export default function IssuePage({ params }: PageProps<"/issues/[id]">) {
  return (
    <div className="flex flex-1 flex-col bg-stone-100">
      <SiteHeader>
        <Link href="/" className="shrink-0 text-sm text-stone-600 hover:text-stone-900">
          ← 返回<span className="hidden sm:inline">歷期月刊</span>
        </Link>
      </SiteHeader>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Suspense fallback={<p className="py-24 text-center text-stone-600">月刊載入中…</p>}>
          <IssueReader params={params} />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
