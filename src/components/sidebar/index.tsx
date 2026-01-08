import { DataSourcesSection } from "@/components/sidebar/DataSourcesSection";
import { SavedQueriesSection } from "@/components/sidebar/SavedQueriesSection";

export function Sidebar() {
  return (
    <aside className="w-64 border-r-2 border-accent p-4 flex flex-col">
      <DataSourcesSection />
      <SavedQueriesSection />
    </aside>
  );
}

