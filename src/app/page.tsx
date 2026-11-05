import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { coverOf, issues, type Issue } from "@/data/issues";

// 桌機版第一排的封面數量，這些封面優先載入
const FIRST_ROW = 5;

function IssueCard({ issue, isLatest, eager }: { issue: Issue; isLatest: boolean; eager: boolean }) {
  const content = (
    <>
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
    </>
  );

  return (
    <li>
      <Link href={`/issues/${issue.id}`} className="group block">
        {content}
      </Link>
    </li>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-stone-50">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <section>
          <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">月刊發佈區</h1>
          <p className="mt-3 max-w-2xl text-stone-600">
            每月更新一期富聯商務月刊，點選封面即可閱讀當期內容。
          </p>
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-xl font-semibold text-stone-900">歷期月刊</h2>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {issues.map((issue, i) => (
              <IssueCard key={issue.id} issue={issue} isLatest={i === 0} eager={i < FIRST_ROW} />
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
