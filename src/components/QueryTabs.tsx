import { useState } from "react";
import { X, Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
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

export function QueryTabs() {
  const queries = useQueries();
  const openQueryIds = useOpenQueryIds();
  const [activeTab, setActiveTab] = useActiveTab();
  const closeQueryTab = useCloseQueryTab();
  const [closingQueryId, setClosingQueryId] = useState<string | null>(null);
  const [editingQueryId, setEditingQueryId] = useState<string | null>(null);
  const createUnsavedQuery = useCreateUnsavedQuery();
  const openQuery = useOpenQuery();

  const handleCloseTab = (tabId: string) => {
    const query = queries[tabId];
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
      <TabsList className="flex w-full gap-1 bg-accent overflow-x-auto flex-row justify-start items-center min-w-0 pb-0" variant="line">
        {openQueryIds.map((queryId) => {
          const query = queries[queryId];
          if (!query) return null;
          return (
            <ContextMenu key={queryId}>
              <ContextMenuTrigger asChild>
                <div
                  className={cn(
                    "group flex flex-row items-center flex-shrink-0 min-w-fit px-2 py-1 justify-start text-xs font-medium transition-colors border-t-2 border-b-0 border-t-accent rounded-t-md bg-accent text-accent-foreground hover:bg-gray cursor-pointer relative h-full",
                    activeTab === queryId &&
                      "bg-background text-foreground border-t-emerald-700 rounded-t-md z-10 before:absolute before:inset-[-2px_-2px_0_-2px] before:bg-background before:rounded-t-md before:z-[-1]"
                  )}
                >
                  <TabsTrigger
                    value={queryId}
                    className="justify-start w-auto flex-shrink-0 cursor-pointer text-xs h-full py-0"
                    onClick={() => {
                      // Handle tab selection explicitly since ContextMenuTrigger might interfere
                      // Don't stop propagation to let Tabs component also handle it, but ensure our handler runs
                      setActiveTab(queryId);
                    }}
                  >
                    {query.name}
                  </TabsTrigger>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className={cn(
                      "w-5 h-5 aspect-square transition-all cursor-pointer ml-1",
                      activeTab !== queryId && "opacity-0",
                      "group-hover:opacity-100"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseTab(queryId);
                    }}
                  >
                    <X className="w-4 h-4" strokeWidth={2.5} />
                  </Button>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onSelect={() => setEditingQueryId(queryId)} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Name
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
        <div className="">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-md self-center cursor-pointer"
            onClick={() => {
              const newId = createUnsavedQuery();
              openQuery(newId);
            }}
          >
            <Plus className="w-4" />
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
}

