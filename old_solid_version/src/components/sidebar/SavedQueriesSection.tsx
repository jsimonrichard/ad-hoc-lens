import type { Component } from "solid-js";
import { For, createSignal } from "solid-js";
import PlusIcon from "lucide-solid/icons/plus";
import { Button } from "@/components/ui/button";
import { DataSourceButton } from "@/components/sidebar/DataSourceButton";
import { EditItemDialog } from "@/components/sidebar/EditItemDialog";
import { ConfirmDeleteDialog } from "@/components/sidebar/ConfirmDeleteDialog";
import {
  useCreateUnsavedQuery,
  useDeleteQuery,
  useOpenQuery,
  useQueries,
  useQuery,
  useUpdateQuery,
} from "@/store/queries";

export const SavedQueriesSection: Component = () => {
  const queries = useQueries();
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);
  const editingQuery = useQuery(editingId() ?? undefined);
  const deletingQuery = useQuery(deletingId() ?? undefined);
  const openQuery = useOpenQuery();
  const createUnsavedQuery = useCreateUnsavedQuery();
  const updateQuery = useUpdateQuery();
  const deleteQuery = useDeleteQuery();

  const handleSaveEdit = (id: string, newName: string) => {
    updateQuery(id, { name: newName });
    setEditingId(null);
  };

  const handleConfirmDelete = (id: string) => {
    deleteQuery(id);
    setDeletingId(null);
  };

  // Only show saved queries in the sidebar
  const savedQueries = () =>
    Object.entries(queries()).filter(([_, query]) => query.saved);

  return (
    <div class="flex-1 flex flex-col border-t-2 border-accent pt-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Queries</h2>
        <Button
          variant="ghost"
          size="icon"
          class="h-6 w-6"
          onClick={() => {
            const newId = createUnsavedQuery();
            openQuery(newId);
          }}
        >
          <PlusIcon class="w-4 h-4" />
        </Button>
      </div>
      <ul class="space-y-1">
        <For each={savedQueries()}>
          {([id, query]) => (
            <DataSourceButton
              id={id}
              name={query.name}
              onClick={() => openQuery(id)}
              onEdit={() => setEditingId(id)}
              onDelete={() => setDeletingId(id)}
            />
          )}
        </For>
      </ul>
      <EditItemDialog
        open={editingId() !== null}
        title="Edit Query"
        description="Update the name of your query."
        itemName={editingQuery()?.name || ""}
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
        itemName={deletingQuery()?.name || ""}
        onOpenChange={(open) => setDeletingId(open ? deletingId() : null)}
        onConfirm={() => {
          const id = deletingId();
          if (id) handleConfirmDelete(id);
        }}
      />
    </div>
  );
};
