import type { Component } from "solid-js";
import { DataSourcesSection } from "@/components/sidebar/DataSourcesSection";
import { SavedQueriesSection } from "@/components/sidebar/SavedQueriesSection";

export const Sidebar: Component = () => {
  return (
    <aside class="w-64 border-r-2 border-accent p-4 flex flex-col">
      <DataSourcesSection />
      <SavedQueriesSection />
    </aside>
  );
};
