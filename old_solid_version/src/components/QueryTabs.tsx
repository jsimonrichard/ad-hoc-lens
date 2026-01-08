import type { Component } from "solid-js";
import { createEffect, createSignal, For } from "solid-js";
import XIcon from "lucide-solid/icons/x";
import PlusIcon from "lucide-solid/icons/plus";
import PencilIcon from "lucide-solid/icons/pencil";
import { cn } from "@/libs/cn";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  useActiveTab,
  useCloseQueryTab,
  useCreateUnsavedQuery,
  useOpenQuery,
  useOpenQueryIds,
  useQueries,
} from "@/store/queries";
import { CloseQueryDialog } from "./CloseQueryDialog";
import { EditQueryNameDialog } from "./EditQueryNameDialog";

export const QueryTabs: Component = () => {
  const queries = useQueries();
  const openQueryIds = useOpenQueryIds();
  const [activeTab, setActiveTab] = useActiveTab();
  const closeQueryTab = useCloseQueryTab();
  const [closingQueryId, setClosingQueryId] = createSignal<string | null>(null);
  const [editingQueryId, setEditingQueryId] = createSignal<string | null>(null);
  const createUnsavedQuery = useCreateUnsavedQuery();
  const openQuery = useOpenQuery();

  const handleCloseTab = (tabId: string) => {
    const query = queries()[tabId];
    if (!query) return;

    // If query is saved, just close it normally
    if (query.saved) {
      closeQueryTab(tabId);
      return;
    }

    // If query is unsaved, check if it has content
    const hasContent = query.content.trim().length > 0;

    if (hasContent) {
      // Show confirmation dialog
      setClosingQueryId(tabId);
    } else {
      closeQueryTab(tabId);
    }
  };

  return (
    <>
      <TabsList class="flex w-full gap-1 pb-0 px-1 pt-1 rounded-none bg-accent overflow-x-auto">
        <For each={openQueryIds()}>
          {(queryId) => {
            const query = queries()[queryId];
            if (!query) return null;
            return (
              <ContextMenu>
                <ContextMenuTrigger as="div">
                  <div
                    class={cn(
                      "group flex flex-row items-center flex-shrink min-w-fit p-2 justify-start text-sm font-medium transition-colors border-t-2 border-b-0 border-t-accent rounded-t-md bg-accent text-accent-foreground hover:bg-gray",
                      activeTab() === queryId &&
                        "bg-background text-foreground border-t-teal-700 "
                    )}
                  >
                    <TabsTrigger
                      value={queryId}
                      class="justify-start w-auto flex-shrink-0"
                      onClick={(e) => {
                        // Handle tab selection explicitly since ContextMenuTrigger might interfere
                        // Don't stop propagation to let Tabs component also handle it, but ensure our handler runs
                        setActiveTab(queryId);
                      }}
                    >
                      {query.name}
                    </TabsTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      class={cn(
                        "w-6 h-6 aspect-square transition-all",
                        activeTab() !== queryId && "opacity-0",
                        "group-hover:opacity-100"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseTab(queryId);
                      }}
                    >
                      <XIcon class="w-4" />
                    </Button>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onSelect={() => setEditingQueryId(queryId)}>
                    <PencilIcon class="mr-2 h-4 w-4" />
                    Edit Name
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          }}
        </For>
        <div class="">
          <Button
            size="icon"
            variant="ghost"
            class="rounded-md self-center"
            onClick={() => {
              const newId = createUnsavedQuery();
              openQuery(newId);
            }}
          >
            <PlusIcon class="w-4" />
          </Button>
        </div>
      </TabsList>
      <CloseQueryDialog
        closingQueryId={closingQueryId}
        setClosingQueryId={setClosingQueryId}
      />
      <EditQueryNameDialog
        editQueryId={editingQueryId}
        setEditQueryId={setEditingQueryId}
      />
    </>
  );
};
