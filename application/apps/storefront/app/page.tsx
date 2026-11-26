"use client";

import dynamic from "next/dynamic";

const StorefrontApp = dynamic(() => import("@/App"), {
  ssr: false,
  loading: () => (
    <main
      aria-busy="true"
      className="flex min-h-screen items-center justify-center bg-[#f5f3ee] text-[#171714]"
    >
      <p className="text-sm tracking-wide">Loading Neweix Shop…</p>
    </main>
  ),
});

export default function StorefrontPage() {
  return <StorefrontApp />;
}
