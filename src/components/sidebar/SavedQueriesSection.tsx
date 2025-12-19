import type { Component } from "solid-js";
import { For, createSignal } from "solid-js";
import PlusIcon from "lucide-solid/icons/plus";
import { Button } from "@/components/ui/button";
import { DataSourceButton } from "@/components/sidebar/DataSourceButton";
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

  // Only show saved queries in the sidebar
  const savedQueries = () => store.state.queries.filter((q) => q.saved);

  return (
    <div class="flex-1 flex flex-col border-t-2 border-accent pt-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Queries</h2>
        <Button
          variant="ghost"
          size="icon"
          class="h-6 w-6"
          onClick={() => {
            const newId = store.createUnsavedQuery();
            store.openQuery(newId);
          }}
        >
          <PlusIcon class="w-4 h-4" />
        </Button>
      </div>
      <ul class="space-y-1">
        <For each={savedQueries()}>
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
