import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import FlipBook from "@/components/FlipBook";
import { issues, pagesOf } from "@/data/issues";

export function generateStaticParams() {
  return issues.map((issue) => ({ id: issue.id }));
}

export async function generateMetadata({ params }: PageProps<"/issues/[id]">): Promise<Metadata> {
  const { id } = await params;
  const issue = issues.find((i) => i.id === id);
  return { title: issue ? `${issue.title}｜富聯商務月刊` : "富聯商務月刊" };
}

async function IssueReader({ params }: { params: PageProps<"/issues/[id]">["params"] }) {
  const { id } = await params;
  const issue = issues.find((i) => i.id === id);
  if (!issue) notFound();

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold text-stone-900">{issue.title}</h1>
      <FlipBook pages={pagesOf(issue)} />
    </>
  );
}

export default function IssuePage({ params }: PageProps<"/issues/[id]">) {
  return (
    <div className="flex flex-1 flex-col bg-stone-100">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-wide text-stone-900">
            富聯商務月刊
          </Link>
          <Link href="/" className="text-sm text-stone-600 hover:text-stone-900">
            ← 返回歷期月刊
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Suspense fallback={<p className="py-24 text-center text-stone-600">月刊載入中…</p>}>
          <IssueReader params={params} />
        </Suspense>
      </main>
    </div>
  );
}
