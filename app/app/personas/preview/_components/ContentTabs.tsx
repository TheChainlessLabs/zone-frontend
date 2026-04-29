"use client";

/**
 * ContentTabs — Manifesto / Critique / Inspirations / Redesign source.
 * Manifesto is shown above the tabs (so it's always visible as the
 * persona's TLDR); the tabs hold the longer artefacts.
 */

import * as React from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Markdown } from "./Markdown";
import { CodeBlock } from "./CodeBlock";

export function ContentTabs({
  critique,
  inspirations,
  redesignSource,
  redesignFile,
}: {
  critique: string;
  inspirations: string;
  redesignSource: string;
  redesignFile: string;
}) {
  return (
    <Tabs defaultValue="critique" className="w-full">
      <TabsList>
        <TabsTrigger value="critique">Critique</TabsTrigger>
        <TabsTrigger value="inspirations">Inspirations</TabsTrigger>
        <TabsTrigger value="redesign">Redesign source</TabsTrigger>
      </TabsList>
      <TabsContent value="critique">
        <Markdown source={critique} />
      </TabsContent>
      <TabsContent value="inspirations">
        <Markdown source={inspirations} />
      </TabsContent>
      <TabsContent value="redesign">
        <CodeBlock source={redesignSource} filename={redesignFile} />
      </TabsContent>
    </Tabs>
  );
}
