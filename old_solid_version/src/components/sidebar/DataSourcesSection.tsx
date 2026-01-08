import type { Component } from "solid-js";
import { For, createSignal } from "solid-js";
import { DataSourceButton } from "@/components/sidebar/DataSourceButton";
import { AddItemDialog } from "@/components/sidebar/AddItemDialog";
import { EditItemDialog } from "@/components/sidebar/EditItemDialog";
import { ConfirmDeleteDialog } from "@/components/sidebar/ConfirmDeleteDialog";
import {
  useDataSource,
  useDataSources,
  useDeleteDataSource,
  useUpdateDataSource,
} from "@/store/dataSources";

export const DataSourcesSection: Component = () => {
  const dataSources = useDataSources();
  const updateDataSource = useUpdateDataSource();
  const deleteDataSource = useDeleteDataSource();
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);
  const editingSource = useDataSource(editingId() ?? undefined);
  const deletingSource = useDataSource(deletingId() ?? undefined);

  const handleSaveEdit = (id: string, newName: string) => {
    updateDataSource(id, { name: newName });
    setEditingId(null);
  };

  const handleConfirmDelete = (id: string) => {
    deleteDataSource(id);
    setDeletingId(null);
  };

  return (
    <div class="flex-1 flex flex-col mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Data Sources</h2>
        <AddItemDialog
          title="Add Data Source"
          description="Add a new data source to your workspace."
          placeholder="Data source configuration will go here."
          onAdd={() => {
            // TODO: Implement add data source functionality
            console.log("Add data source");
          }}
        />
      </div>
      <ul class="space-y-1">
        <For each={Object.entries(dataSources())}>
          {([id, ds]) => (
            <DataSourceButton
              id={id}
              name={ds.name}
              onEdit={() => setEditingId(id)}
              onDelete={() => setDeletingId(id)}
            />
          )}
        </For>
      </ul>
      <EditItemDialog
        open={editingId() !== null}
        title="Edit Data Source"
        description="Update the name of your data source."
        itemName={editingSource()?.name || ""}
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
        itemName={deletingSource()?.name || ""}
        onOpenChange={(open) => setDeletingId(open ? deletingId() : null)}
        onConfirm={() => {
          const id = deletingId();
          if (id) handleConfirmDelete(id);
        }}
      />
    </div>
  );
};
