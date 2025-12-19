import type { Component } from "solid-js";
import { For, createSignal, onMount, onCleanup } from "solid-js";
import PlusIcon from "lucide-solid/icons/plus";
import XIcon from "lucide-solid/icons/x";
import ChevronDownIcon from "lucide-solid/icons/chevron-down";
import PlayIcon from "lucide-solid/icons/play";
import PencilIcon from "lucide-solid/icons/pencil";
import SaveIcon from "lucide-solid/icons/save";
import { cn } from "@/libs/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TextFieldRoot } from "@/components/ui/textfield";
import { TextArea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { EditItemDialog } from "@/components/sidebar/EditItemDialog";
import { SaveQueryDialog } from "@/components/SaveQueryDialog";
import { CloseQueryDialog } from "@/components/CloseQueryDialog";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { Sidebar } from "@/components/sidebar";
import { useStore } from "@/store";

export default function App() {
  const store = useStore();
  const [editingTabId, setEditingTabId] = createSignal<string | null>(null);
  const [savingQueryId, setSavingQueryId] = createSignal<string | null>(null);
  const [closingQueryId, setClosingQueryId] = createSignal<string | null>(null);
  const [showWelcomeDialog, setShowWelcomeDialog] = createSignal(false);

  const handleEditTab = (tabId: string) => {
    setEditingTabId(tabId);
  };

  const handleSaveEdit = (newName: string) => {
    const tabId = editingTabId();
    if (tabId) {
      const query = store.state.queries.find((q) => q.id === tabId);
      // If query is unsaved, automatically save it when renamed
      if (query && !query.saved) {
        store.updateQuery(tabId, { name: newName, saved: true });
      } else {
        store.updateQuery(tabId, { name: newName });
      }
      setEditingTabId(null);
    }
  };

  const editingTab = () => {
    const tabId = editingTabId();
    return tabId ? store.state.queries.find((q) => q.id === tabId) : null;
  };

  const savingQuery = () => {
    const queryId = savingQueryId();
    return queryId ? store.state.queries.find((q) => q.id === queryId) : null;
  };

  const closingQuery = () => {
    const queryId = closingQueryId();
    return queryId ? store.state.queries.find((q) => q.id === queryId) : null;
  };

  const handleCloseQuery = (queryId: string) => {
    const query = store.state.queries.find((q) => q.id === queryId);
    if (!query) return;

    // If query is saved, just close it normally
    if (query.saved) {
      store.closeQuery(queryId);
      return;
    }

    // If query is unsaved, check if it has content
    const hasContent = query.content.trim().length > 0;

    if (hasContent) {
      // Show confirmation dialog
      setClosingQueryId(queryId);
    } else {
      // No content, delete it completely
      store.deleteQuery(queryId);
    }
  };

  const handleConfirmClose = () => {
    const queryId = closingQueryId();
    if (queryId) {
      // Delete the unsaved query completely since it can't be recovered
      store.deleteQuery(queryId);
      setClosingQueryId(null);
    }
  };

  const handleSaveClick = (queryId: string) => {
    const query = store.state.queries.find((q) => q.id === queryId);
    if (!query) return;

    // If query is already saved, no need to do anything
    if (query.saved) {
      return;
    }

    // For unsaved queries, show dialog
    setSavingQueryId(queryId);
  };

  const handleSaveQuery = (name: string) => {
    const queryId = savingQueryId();
    if (queryId) {
      store.saveQuery(queryId, name);
      setSavingQueryId(null);
    }
  };

  // Check if this is the first time opening the app
  onMount(() => {
    if (store.isFirstTime()) {
      setShowWelcomeDialog(true);
    }
  });

  const handleUseDemo = () => {
    store.loadDemoState();
    store.markFirstTimeComplete();
  };

  const handleStartEmpty = () => {
    store.markFirstTimeComplete();
  };

  // Handle keyboard shortcuts
  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+S (or Cmd+S on Mac) - Save query
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        const activeTab = store.state.activeTab;
        if (activeTab) {
          handleSaveClick(activeTab);
        }
      }

      // Check for Ctrl+Shift+R (or Cmd+Shift+R on Mac) - Reset state (dev only)
      if (import.meta.env.DEV && (e.ctrlKey || e.metaKey) && e.key === ">") {
        e.preventDefault();
        if (confirm("Reset all state to defaults? This cannot be undone.")) {
          store.resetState();
          console.log("State reset to defaults");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
    });
  });

  // Get open queries (queries that are currently open as tabs)
  // Sorted in the order they were added (order in openQueryIds)
  const openQueries = () => {
    const queryMap = new Map(store.state.queries.map((q) => [q.id, q]));
    return store.state.openQueryIds
      .map((id) => queryMap.get(id))
      .filter((q): q is NonNullable<typeof q> => q !== undefined);
  };

  return (
    <div class="flex h-screen bg-background text-foreground">
      <Sidebar />

      <main class="flex-1 flex flex-col overflow-auto bg-background">
        <Tabs value={store.state.activeTab} onChange={store.setActiveTab}>
          <TabsList class="flex w-full gap-1 pb-0 px-1 pt-1 rounded-none bg-accent overflow-x-auto">
            <For each={openQueries()}>
              {(q) => (
                <ContextMenu>
                  <ContextMenuTrigger as="div">
                    <div
                      class={cn(
                        "group flex flex-row items-center flex-shrink min-w-fit p-2 justify-start text-sm font-medium transition-colors border-t-2 border-b-0 border-t-accent rounded-t-md bg-accent text-accent-foreground hover:bg-gray",
                        store.state.activeTab === q.id &&
                          "bg-background text-foreground border-t-teal-700 "
                      )}
                    >
                      <TabsTrigger
                        value={q.id}
                        class="justify-start w-auto flex-shrink-0"
                        onClick={(e) => {
                          // Explicitly handle click to ensure it works even with ContextMenuTrigger
                          e.stopPropagation();
                          store.setActiveTab(q.id);
                        }}
                      >
                        {q.name}
                      </TabsTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        class={cn(
                          "w-6 h-6 aspect-square transition-all",
                          store.state.activeTab != q.id && "opacity-0",
                          "group-hover:opacity-100"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseQuery(q.id);
                        }}
                      >
                        <XIcon class="w-4" />
                      </Button>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onSelect={() => handleEditTab(q.id)}>
                      <PencilIcon class="mr-2 h-4 w-4" />
                      Edit Name
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              )}
            </For>
            <div class="">
              <Button
                size="icon"
                variant="ghost"
                class="rounded-md self-center"
                onClick={() => store.addQuery()}
              >
                <PlusIcon class="w-4" />
              </Button>
            </div>
          </TabsList>

          <For each={openQueries()}>
            {(q) => {
              const activeDataSource = () =>
                store.state.dataSources.find(
                  (ds) => ds.id === q.dataSourceId
                ) || store.state.dataSources[0];

              return (
                <TabsContent value={q.id} class="mt-4 p-4 bg-background">
                  <div class="flex flex-col gap-3">
                    {/* Toolbar */}
                    <div class="flex items-center gap-2 pb-2 border-b">
                      <Button
                        variant="outline"
                        class="flex items-center gap-2"
                        onClick={() => handleSaveClick(q.id)}
                        title="Save query (Ctrl+S)"
                      >
                        <SaveIcon class="w-4 h-4" />
                        Save
                      </Button>
                      <Button
                        variant="default"
                        class="flex items-center gap-2"
                        onClick={() => {
                          // TODO: Implement run query functionality
                          console.log("Run query:", q.content);
                        }}
                      >
                        <PlayIcon class="w-4 h-4" />
                        Run
                      </Button>
                    </div>
                    <TextFieldRoot>
                      <TextArea
                        class="bg-card"
                        placeholder="Write your query here..."
                        value={q.content}
                        onInput={(e) =>
                          store.updateQuery(q.id, {
                            content: e.currentTarget.value,
                          })
                        }
                      />
                    </TextFieldRoot>
                  </div>
                  <div class="mt-6 border rounded-lg p-4 bg-card">
                    <h3 class="text-md font-semibold mb-2">Output</h3>
                    <div class="rounded-md p-3 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                      Rendered markdown or JSON output will appear here.
                    </div>
                  </div>
                </TabsContent>
              );
            }}
          </For>
        </Tabs>
        <EditItemDialog
          open={editingTabId() !== null}
          title="Edit Query Name"
          description="Update the name of your query tab."
          itemName={editingTab()?.name || ""}
          onOpenChange={(open) => setEditingTabId(open ? editingTabId() : null)}
          onSave={handleSaveEdit}
        />
        <SaveQueryDialog
          open={savingQueryId() !== null}
          defaultName={store.getNextUntitledName()}
          onOpenChange={(open) =>
            setSavingQueryId(open ? savingQueryId() : null)
          }
          onSave={handleSaveQuery}
        />
        <CloseQueryDialog
          open={closingQueryId() !== null}
          queryName={closingQuery()?.name || "Untitled"}
          onOpenChange={(open) =>
            setClosingQueryId(open ? closingQueryId() : null)
          }
          onConfirm={handleConfirmClose}
        />
        <WelcomeDialog
          open={showWelcomeDialog()}
          onOpenChange={setShowWelcomeDialog}
          onUseDemo={handleUseDemo}
          onStartEmpty={handleStartEmpty}
        />
      </main>
    </div>
  );
}
