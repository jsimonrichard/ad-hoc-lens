import type { Component } from "solid-js";
import { For, createSignal } from "solid-js";
import { DataSourceButton } from "@/components/sidebar/DataSourceButton";
import { AddItemDialog } from "@/components/sidebar/AddItemDialog";
import { EditItemDialog } from "@/components/sidebar/EditItemDialog";
import { ConfirmDeleteDialog } from "@/components/sidebar/ConfirmDeleteDialog";

interface SavedQuery {
  id: string;
  name: string;
  content: string;
}

interface SavedQueriesSectionProps {
  savedQueries: SavedQuery[];
  onEdit?: (id: string, newName: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export const SavedQueriesSection: Component<SavedQueriesSectionProps> = (
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
    return id ? props.savedQueries.find((q) => q.id === id) : null;
  };

  const deletingItem = () => {
    const id = deletingId();
    return id ? props.savedQueries.find((q) => q.id === id) : null;
  };

  return (
    <div class="flex-1 flex flex-col border-t-2 border-accent pt-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Saved Queries</h2>
        <AddItemDialog
          title="Add Saved Query"
          description="Save a query for quick access."
          placeholder="Query configuration will go here."
          onAdd={() => props.onAdd?.()}
        />
      </div>
      <ul class="space-y-1">
        <For each={props.savedQueries}>
          {(query) => (
            <DataSourceButton
              id={query.id}
              name={query.name}
              onEdit={() => handleEdit(query.id)}
              onDelete={() => handleDelete(query.id)}
            />
          )}
        </For>
      </ul>
      <EditItemDialog
        open={editingId() !== null}
        title="Edit Saved Query"
        description="Update the name of your saved query."
        itemName={editingItem()?.name || ""}
        onOpenChange={(open) => setEditingId(open ? editingId() : null)}
        onSave={(newName) => {
          const id = editingId();
          if (id) handleSaveEdit(id, newName);
        }}
      />
      <ConfirmDeleteDialog
        open={deletingId() !== null}
        title="Delete Saved Query"
        description="This will permanently delete the saved query."
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
