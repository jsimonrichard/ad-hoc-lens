import { DataSourcesSection } from "@/components/sidebar/DataSourcesSection";
import { SavedQueriesSection } from "@/components/sidebar/SavedQueriesSection";
import { SidebarActionsSection } from "@/components/sidebar/SidebarActionsSection";

export function Sidebar() {
  return (
    <aside className="h-full border-r border-accent p-2 flex flex-col">
      <DataSourcesSection />
      <SavedQueriesSection />
      <SidebarActionsSection />
    </aside>
  );
}
