import Image from "next/image";
import Link from "next/link";
import IssueLikeCount from "@/components/IssueLikeCount";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SiteViews from "@/components/SiteViews";
import { coverOf, issues, type Issue } from "@/data/issues";

// 桌機版第一排的封面數量，這些封面優先載入
const FIRST_ROW = 5;

const DEFAULT_SUMMARY = "收錄富聯的商務故事、活動情報與會員動態，每月一期，線上翻閱。";

// 首頁主視覺：突顯最新一期
function LatestIssue({ issue }: { issue: Issue }) {
  const href = `/issues/${issue.id}`;
  const editor = issue.credits?.find((c) => c.role === "總編輯");

  return (
    <section className="relative overflow-hidden bg-[#132433] text-white">
      {/* 背景：模糊放大的封面，營造氛圍 */}
      <Image
        src={coverOf(issue)}
        alt=""
        fill
        sizes="100vw"
        className="scale-110 object-cover opacity-25 blur-2xl"
        loading="eager"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-[1fr_auto] md:gap-16">
        <div className="order-2 md:order-1">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#d9b46a]">最新一期・LATEST ISSUE</p>
          {/* 期名在「/」處分行，例如「富聯月刊001期」與「2026年11月」各一行 */}
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {issue.title.split("/").map((part, i) => (
              <span key={i} className="block">
                {part}
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            {issue.summary ?? DEFAULT_SUMMARY}
          </p>
          <p className="mt-4 text-sm text-white/60">
            共 {issue.pages} 頁
            {editor && `・總編輯 ${editor.name}`}
          </p>
          <Link
            href={href}
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#d9b46a] px-7 py-3 text-base font-semibold text-[#132433] shadow-lg transition hover:bg-[#e6c47f]"
          >
            立即閱讀
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <Link href={href} className="group order-1 mx-auto block w-56 sm:w-64 md:order-2 md:w-72 lg:w-80">
          <div className="relative aspect-[3/4] overflow-hidden rounded-md shadow-2xl ring-1 ring-white/20 transition group-hover:-translate-y-1">
            <Image
              src={coverOf(issue)}
              alt={`${issue.title} 封面`}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 768px) 288px, 256px"
              className="object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}

function IssueCard({ issue, isLatest, eager }: { issue: Issue; isLatest: boolean; eager: boolean }) {
  return (
    <li>
      <Link href={`/issues/${issue.id}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-stone-100 shadow-sm ring-1 ring-stone-200 transition group-hover:-translate-y-1 group-hover:shadow-lg">
          <Image
            src={coverOf(issue)}
            alt={`${issue.title} 封面`}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw"
            className="object-cover"
            loading={eager ? "eager" : "lazy"}
          />
          {isLatest && (
            <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
              最新
            </span>
          )}
        </div>
        <p className="mt-3 text-sm font-medium text-stone-800">{issue.title}</p>
        <IssueLikeCount issueId={issue.id} />
      </Link>
    </li>
  );
}

export default function Home() {
  const latest = issues[0];

  return (
    <div className="flex flex-1 flex-col bg-stone-50">
      <SiteHeader />

      {latest && <LatestIssue issue={latest} />}

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 sm:py-14">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold text-stone-900">歷期月刊</h2>
          <SiteViews />
        </div>
        <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {issues.map((issue, i) => (
            <IssueCard key={issue.id} issue={issue} isLatest={i === 0} eager={i < FIRST_ROW} />
          ))}
        </ul>
      </main>

      <SiteFooter />
    </div>
  );
}
