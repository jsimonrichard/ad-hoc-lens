import type { Component } from "solid-js";
import { DataSourcesSection } from "@/components/sidebar/DataSourcesSection";
import { SavedQueriesSection } from "@/components/sidebar/SavedQueriesSection";

interface DataSource {
  id: string;
  name: string;
}

interface SavedQuery {
  id: string;
  name: string;
  content: string;
}

interface SidebarProps {
  dataSources: DataSource[];
  onEditDataSource?: (id: string, newName: string) => void;
  onDeleteDataSource?: (id: string) => void;
  onAddDataSource?: () => void;
  savedQueries?: SavedQuery[];
  onEditSavedQuery?: (id: string, newName: string) => void;
  onDeleteSavedQuery?: (id: string) => void;
  onAddSavedQuery?: () => void;
}

export const Sidebar: Component<SidebarProps> = (props) => {
  return (
    <aside class="w-64 border-r-2 border-accent p-4 flex flex-col">
      <DataSourcesSection
        dataSources={props.dataSources}
        onEdit={props.onEditDataSource}
        onDelete={props.onDeleteDataSource}
        onAdd={props.onAddDataSource}
      />
      <SavedQueriesSection
        savedQueries={props.savedQueries || []}
        onEdit={props.onEditSavedQuery}
        onDelete={props.onDeleteSavedQuery}
        onAdd={props.onAddSavedQuery}
      />
    </aside>
  );
};
