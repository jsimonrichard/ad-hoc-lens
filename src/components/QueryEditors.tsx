import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SaveQueryDialog } from "./SaveQueryDialog";
import { createSignal, For } from "solid-js";
import { useActiveTab, useOpenQueryIds, useQuery } from "@/store/queries";
import { QueryEditor } from "./QueryEditor";
import { useResetState } from "@/store/start";

export default function QueryEditors() {
  const [activeTab] = useActiveTab();
  const openQueryIds = useOpenQueryIds();
  const [saveQueryId, setSaveQueryId] = createSignal<string | null>(null);
  const resetState = useResetState();

  // Handle keyboard shortcuts
  useKeyboardShortcuts({
    onSave: () => {
      const activeTabId = activeTab();
      if (activeTabId) {
        setSaveQueryId(activeTabId);
      }
    },
    onReset: () => resetState(),
  });

  const handleSaveClick = (queryId: string) => {
    const query = useQuery(queryId);
    // If query is already saved, no need to do anything
    if (query()?.saved) {
      return;
    }

    // For unsaved queries, show dialog
    setSaveQueryId(queryId);
  };

  return (
    <>
      <For each={openQueryIds()}>
        {(queryId) => (
          <QueryEditor
            queryId={queryId}
            onSave={() => handleSaveClick(queryId)}
          />
        )}
      </For>
      <SaveQueryDialog
        saveQueryId={saveQueryId}
        setSaveQueryId={setSaveQueryId}
      />
    </>
  );
}
