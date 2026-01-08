import { useState } from "react";
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

export function DataSourcesSection() {
  const dataSources = useDataSources();
  const updateDataSource = useUpdateDataSource();
  const deleteDataSource = useDeleteDataSource();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const editingSource = useDataSource(editingId ?? undefined);
  const deletingSource = useDataSource(deletingId ?? undefined);

  const handleSaveEdit = (id: string, newName: string) => {
    updateDataSource(id, { name: newName });
    setEditingId(null);
  };

  const handleConfirmDelete = (id: string) => {
    deleteDataSource(id);
    setDeletingId(null);
  };

  return (
    <div className="flex-1 flex flex-col mb-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Data Sources</h2>
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
      <ul className="space-y-0.5">
        {Object.entries(dataSources).map(([id, ds]) => (
          <DataSourceButton
            key={id}
            id={id}
            name={ds.name}
            onEdit={() => setEditingId(id)}
            onDelete={() => setDeletingId(id)}
          />
        ))}
      </ul>
      <EditItemDialog
        open={editingId !== null}
        title="Edit Data Source"
        description="Update the name of your data source."
        itemName={editingSource?.name || ""}
        onOpenChange={(open) => setEditingId(open ? editingId : null)}
        onSave={(newName) => {
          if (editingId) handleSaveEdit(editingId, newName);
        }}
      />
      <ConfirmDeleteDialog
        open={deletingId !== null}
        title="Delete Data Source"
        description="This will permanently delete the data source."
        itemName={deletingSource?.name || ""}
        onOpenChange={(open) => setDeletingId(open ? deletingId : null)}
        onConfirm={() => {
          if (deletingId) handleConfirmDelete(deletingId);
        }}
      />
    </div>
  );
}

