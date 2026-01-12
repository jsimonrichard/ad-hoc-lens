import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataSourceButton } from "@/components/sidebar/DataSourceButton";
import { EditItemDialog } from "@/components/sidebar/EditItemDialog";
import { ConfirmDeleteDialog } from "@/components/sidebar/ConfirmDeleteDialog";
import {
  useCreateAndOpenUnsavedQuery,
  useDeleteQuery,
  useOpenQuery,
  useQueries,
  useQuery,
  useUpdateQuery,
} from "@/store/queries";

export function SavedQueriesSection() {
  const queries = useQueries();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const editingQuery = useQuery(editingId ?? undefined);
  const deletingQuery = useQuery(deletingId ?? undefined);
  const openQuery = useOpenQuery();
  const createAndOpenUnsavedQuery = useCreateAndOpenUnsavedQuery();
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
  const savedQueries = Object.entries(queries).filter(([_, query]) => query.saved);

  return (
    <div className="flex-1 flex flex-col border-t-2 border-accent pt-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Queries</h2>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => {
            createAndOpenUnsavedQuery();
          }}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <ul className="space-y-0.5">
        {savedQueries.map(([id, query]) => (
          <DataSourceButton
            key={id}
            id={id}
            name={query.name}
            onClick={() => openQuery(id)}
            onEdit={() => setEditingId(id)}
            onDelete={() => setDeletingId(id)}
          />
        ))}
      </ul>
      <EditItemDialog
        open={editingId !== null}
        title="Edit Query"
        description="Update the name of your query."
        itemName={editingQuery?.name || ""}
        onOpenChange={(open) => setEditingId(open ? editingId : null)}
        onSave={(newName) => {
          if (editingId) handleSaveEdit(editingId, newName);
        }}
      />
      <ConfirmDeleteDialog
        open={deletingId !== null}
        title="Delete Query"
        description="This will permanently delete the query."
        itemName={deletingQuery?.name || ""}
        onOpenChange={(open) => setDeletingId(open ? deletingId : null)}
        onConfirm={() => {
          if (deletingId) handleConfirmDelete(deletingId);
        }}
      />
    </div>
  );
}

