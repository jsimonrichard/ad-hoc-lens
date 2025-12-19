import type { Component } from "solid-js";
import { For, createSignal } from "solid-js";
import PlusIcon from "lucide-solid/icons/plus";
import XIcon from "lucide-solid/icons/x";
import ChevronDownIcon from "lucide-solid/icons/chevron-down";
import PlayIcon from "lucide-solid/icons/play";
import PencilIcon from "lucide-solid/icons/pencil";
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
import { Sidebar } from "@/components/sidebar";
import { useStore } from "@/store";

export default function App() {
  const store = useStore();
  const [editingTabId, setEditingTabId] = createSignal<string | null>(null);

  const handleEditTab = (tabId: string) => {
    setEditingTabId(tabId);
  };

  const handleSaveEdit = (newName: string) => {
    const tabId = editingTabId();
    if (tabId) {
      store.updateQuery(tabId, { name: newName });
      setEditingTabId(null);
    }
  };

  const editingTab = () => {
    const tabId = editingTabId();
    return tabId ? store.state.queries.find((q) => q.id === tabId) : null;
  };

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
                        "group flex-0 flex flex-row items-center min-w-64 p-2 justify-start text-sm font-medium transition-colors border-t-2 border-b-0 border-t-accent rounded-t-md bg-accent text-accent-foreground hover:bg-gray",
                        store.state.activeTab === q.id &&
                          "bg-background text-foreground border-t-teal-700 "
                      )}
                    >
                      <TabsTrigger value={q.id} class="justify-start">
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
                        onClick={() => store.closeQuery(q.id)}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          as={Button}
                          variant="outline"
                          class="flex items-center gap-2"
                        >
                          <span class="text-sm">
                            {activeDataSource()?.name || "Select data source"}
                          </span>
                          <ChevronDownIcon class="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <For each={store.state.dataSources}>
                            {(ds) => (
                              <DropdownMenuItem
                                onSelect={() =>
                                  store.updateQuery(q.id, {
                                    dataSourceId: ds.id,
                                  })
                                }
                              >
                                {ds.name}
                              </DropdownMenuItem>
                            )}
                          </For>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
      </main>
    </div>
  );
}
