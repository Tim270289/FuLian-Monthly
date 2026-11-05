import type { Credit } from "@/data/issues";

// 閱讀頁下方的「本期製作團隊」，類似雜誌的版權頁
export default function IssueCredits({ credits }: { credits: Credit[] }) {
  return (
    <section className="mx-auto mt-12 max-w-2xl">
      <h2 className="flex items-center gap-4 text-sm font-semibold tracking-widest text-stone-500">
        <span className="h-px flex-1 bg-stone-300" />
        本期製作團隊
        <span className="h-px flex-1 bg-stone-300" />
      </h2>
      <dl className="mt-6 flex flex-wrap justify-center gap-x-12 gap-y-5 text-center">
        {credits.map((c) => (
          <div key={`${c.role}-${c.name}`}>
            <dt className="text-xs text-stone-500">{c.role}</dt>
            <dd className="mt-1 text-base font-semibold text-stone-900">{c.name}</dd>
            {c.note && <dd className="mt-0.5 text-xs text-stone-500">{c.note}</dd>}
          </div>
        ))}
      </dl>
    </section>
  );
}
