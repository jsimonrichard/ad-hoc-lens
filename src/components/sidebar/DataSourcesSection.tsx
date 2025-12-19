import type { Component } from "solid-js";
import { For, createSignal } from "solid-js";
import { DataSourceButton } from "@/components/sidebar/DataSourceButton";
import { AddItemDialog } from "@/components/sidebar/AddItemDialog";
import { EditItemDialog } from "@/components/sidebar/EditItemDialog";
import { ConfirmDeleteDialog } from "@/components/sidebar/ConfirmDeleteDialog";

interface DataSource {
  id: string;
  name: string;
}

interface DataSourcesSectionProps {
  dataSources: DataSource[];
  onEdit?: (id: string, newName: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export const DataSourcesSection: Component<DataSourcesSectionProps> = (
  props
) => {
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleSaveEdit = (id: string, newName: string) => {
    props.onEdit?.(id, newName);
    setEditingId(null);
  };

  const handleConfirmDelete = (id: string) => {
    props.onDelete?.(id);
    setDeletingId(null);
  };

  const editingItem = () => {
    const id = editingId();
    return id ? props.dataSources.find((ds) => ds.id === id) : null;
  };

  const deletingItem = () => {
    const id = deletingId();
    return id ? props.dataSources.find((ds) => ds.id === id) : null;
  };

  return (
    <div class="flex-1 flex flex-col mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Data Sources</h2>
        <AddItemDialog
          title="Add Data Source"
          description="Add a new data source to your workspace."
          placeholder="Data source configuration will go here."
          onAdd={() => props.onAdd?.()}
        />
      </div>
      <ul class="space-y-1">
        <For each={props.dataSources}>
          {(ds) => (
            <DataSourceButton
              id={ds.id}
              name={ds.name}
              onEdit={() => handleEdit(ds.id)}
              onDelete={() => handleDelete(ds.id)}
            />
          )}
        </For>
      </ul>
      <EditItemDialog
        open={editingId() !== null}
        title="Edit Data Source"
        description="Update the name of your data source."
        itemName={editingItem()?.name || ""}
        onOpenChange={(open) => setEditingId(open ? editingId() : null)}
        onSave={(newName) => {
          const id = editingId();
          if (id) handleSaveEdit(id, newName);
        }}
      />
      <ConfirmDeleteDialog
        open={deletingId() !== null}
        title="Delete Data Source"
        description="This will permanently delete the data source."
        itemName={deletingItem()?.name || ""}
        onOpenChange={(open) => setDeletingId(open ? deletingId() : null)}
        onConfirm={() => {
          const id = deletingId();
          if (id) handleConfirmDelete(id);
        }}
      />
    </div>
  );
};
