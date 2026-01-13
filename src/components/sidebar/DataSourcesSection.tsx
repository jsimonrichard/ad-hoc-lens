import { useState } from "react";
import { DataSourceButton } from "@/components/sidebar/DataSourceButton";
import { SQLiteDataSourceButton } from "@/components/sidebar/SQLiteDataSourceButton";
import { AddDataSourceDialog } from "@/components/sidebar/AddDataSourceDialog";
import { EditItemDialog } from "@/components/sidebar/EditItemDialog";
import { ConfirmDeleteDialog } from "@/components/sidebar/ConfirmDeleteDialog";
import {
  useDataSource,
  useDataSources,
  useAddDataSource,
  useDeleteDataSource,
  useUpdateDataSource,
} from "@/store/dataSources";
import {
  useDuckDB,
  uploadDataSource,
  deleteDataSource as deleteDataSourceFromDB,
} from "@/db";
import { useOpenOrCreateDataSourceQuery } from "@/store/queries";

export function DataSourcesSection() {
  const dataSources = useDataSources();
  const addDataSource = useAddDataSource();
  const updateDataSource = useUpdateDataSource();
  const deleteDataSource = useDeleteDataSource();
  const db = useDuckDB();
  const openOrCreateDataSourceQuery = useOpenOrCreateDataSourceQuery();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const editingSource = useDataSource(editingId ?? undefined);
  const deletingSource = useDataSource(deletingId ?? undefined);

  const handleAddDataSource = async (name: string, file: File) => {
    // Generate a unique ID for the data source
    const id = `ds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Upload the file (stores in IndexedDB and registers with DuckDB)
    const metadata = await uploadDataSource(db, file, name, id);

    // Add the data source to the store with metadata
    addDataSource(id, name, metadata);
  };

  const handleSQLiteTableClick = (schemaName: string, tableName: string) => {
    // For SQLite tables, use schema.table format
    const fullTableName = `"${schemaName}"."${tableName}"`;
    openOrCreateDataSourceQuery(fullTableName);
  };

  const handleSaveEdit = (id: string, newName: string) => {
    updateDataSource(id, { name: newName });
    setEditingId(null);
  };

  const handleConfirmDelete = async (id: string) => {
    const dataSource = dataSources[id];
    if (dataSource) {
      // Delete from DuckDB and IndexedDB
      await deleteDataSourceFromDB(db, id, dataSource.name);
    }
    // Remove from store
    deleteDataSource(id);
    setDeletingId(null);
  };

  return (
    <div className="flex-1 flex flex-col mb-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Data Sources</h2>
        <AddDataSourceDialog onAdd={handleAddDataSource} />
      </div>
      <ul className="space-y-0.5">
        {Object.entries(dataSources).map(([id, ds]) => {
          if (ds.type === "sqlite") {
            return (
              <SQLiteDataSourceButton
                key={id}
                id={id}
                name={ds.name}
                tables={ds.tables}
                schemaName={ds.schemaName}
                onEdit={() => setEditingId(id)}
                onDelete={() => setDeletingId(id)}
                onTableClick={handleSQLiteTableClick}
              />
            );
          }
          return (
            <DataSourceButton
              key={id}
              id={id}
              name={ds.name}
              onEdit={() => setEditingId(id)}
              onDelete={() => setDeletingId(id)}
              onClick={() => openOrCreateDataSourceQuery(ds.name)}
            />
          );
        })}
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
