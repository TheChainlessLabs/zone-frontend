import type { Metadata } from "next";

import { ResearchIndex } from "@/components/research/research-index";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Public notes on Omega Markets, private price discovery, and design partner requirements.",
};

export default function ResearchPage() {
  return <ResearchIndex />;
}
