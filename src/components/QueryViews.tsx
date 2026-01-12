import { useState } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SaveQueryDialog } from "./SaveQueryDialog";
import { useActiveTab, useOpenQueryIds, useQueries } from "@/store/queries";
import { QueryView } from "./QueryView";
import { useResetState } from "@/store";

export function QueryViews() {
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
    onReset: async () => {
      await resetState();
    },
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
        <QueryView
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
