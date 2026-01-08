import { useState } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SaveQueryDialog } from "./SaveQueryDialog";
import { useActiveTab, useOpenQueryIds, useQueries } from "@/store/queries";
import { QueryEditor } from "./QueryEditor";
import { useResetState } from "@/store";

export function QueryEditors() {
  const [activeTab] = useActiveTab();
  const openQueryIds = useOpenQueryIds();
  const queries = useQueries();
  const [saveQueryId, setSaveQueryId] = useState<string | null>(null);
  const resetState = useResetState();

  // Handle keyboard shortcuts
  useKeyboardShortcuts({
    onSave: () => {
      if (activeTab) {
        setSaveQueryId(activeTab);
      }
    },
    onReset: () => resetState(),
  });

  const handleSaveClick = (queryId: string) => {
    const query = queries[queryId];
    // If query is already saved, no need to do anything
    if (query?.saved) {
      return;
    }

    // For unsaved queries, show dialog
    setSaveQueryId(queryId);
  };

  return (
    <>
      {openQueryIds.map((queryId) => (
        <QueryEditor
          key={queryId}
          queryId={queryId}
          onSave={() => handleSaveClick(queryId)}
        />
      ))}
      <SaveQueryDialog
        saveQueryId={saveQueryId}
        setSaveQueryId={setSaveQueryId}
      />
    </>
  );
}

