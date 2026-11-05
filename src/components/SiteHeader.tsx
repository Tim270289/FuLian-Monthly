import Image from "next/image";
import Link from "next/link";

// 全站共用頁首：左邊是富聯 Logo＋站名（連回首頁），右邊放各頁自己的連結
export default function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/Logo.png"
            alt="富聯 FULIAN CHAPTER"
            width={3176}
            height={830}
            sizes="160px"
            loading="eager"
            className="h-9 w-auto sm:h-10"
          />
          <span className="text-base font-bold tracking-wide text-stone-900 sm:text-lg">富聯商務月刊</span>
        </Link>
        {children}
      </div>
    </header>
  );
}
