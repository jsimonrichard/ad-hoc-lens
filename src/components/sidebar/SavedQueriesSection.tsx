import type { Component } from "solid-js";
import { For, createSignal } from "solid-js";
import { DataSourceButton } from "@/components/sidebar/DataSourceButton";
import { AddItemDialog } from "@/components/sidebar/AddItemDialog";
import { EditItemDialog } from "@/components/sidebar/EditItemDialog";
import { ConfirmDeleteDialog } from "@/components/sidebar/ConfirmDeleteDialog";
import { useStore } from "@/store";

export const SavedQueriesSection: Component = () => {
  const store = useStore();
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleSaveEdit = (id: string, newName: string) => {
    store.updateQuery(id, { name: newName });
    setEditingId(null);
  };

  const handleConfirmDelete = (id: string) => {
    store.deleteQuery(id);
    setDeletingId(null);
  };

  const editingItem = () => {
    const id = editingId();
    return id ? store.state.queries.find((q) => q.id === id) : null;
  };

  const deletingItem = () => {
    const id = deletingId();
    return id ? store.state.queries.find((q) => q.id === id) : null;
  };

  const isQueryOpen = (queryId: string) => {
    return store.state.openQueryIds.includes(queryId);
  };

  return (
    <div class="flex-1 flex flex-col border-t-2 border-accent pt-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Saved Queries</h2>
        <AddItemDialog
          title="Add Query"
          description="Create a new query."
          placeholder="Query configuration will go here."
          onAdd={() => {
            store.addQuery();
          }}
        />
      </div>
      <ul class="space-y-1">
        <For each={store.state.queries}>
          {(query) => (
            <DataSourceButton
              id={query.id}
              name={query.name}
              onClick={() => store.openQuery(query.id)}
              onEdit={() => handleEdit(query.id)}
              onDelete={() => handleDelete(query.id)}
            />
          )}
        </For>
      </ul>
      <EditItemDialog
        open={editingId() !== null}
        title="Edit Query"
        description="Update the name of your query."
        itemName={editingItem()?.name || ""}
        onOpenChange={(open) => setEditingId(open ? editingId() : null)}
        onSave={(newName) => {
          const id = editingId();
          if (id) handleSaveEdit(id, newName);
        }}
      />
      <ConfirmDeleteDialog
        open={deletingId() !== null}
        title="Delete Query"
        description="This will permanently delete the query."
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
