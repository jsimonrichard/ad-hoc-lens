import { createSignal, For } from "solid-js";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import { TextArea } from "./ui/textarea";
import { TextField, TextFieldRoot } from "./ui/textfield";
import { PlusIcon, XIcon } from "lucide-solid";
import { cn } from "@/libs/cn";

interface DataSource {
  id: string;
  name: string;
}

const mockDataSources: DataSource[] = [
  { id: "1", name: "rayon_dataset.jsonl" },
  { id: "2", name: "example_data.json" },
];

export default function Layout() {
  const [activeTab, setActiveTab] = createSignal("query1");
  const [queries, setQueries] = createSignal([
    { id: "query1", name: "Query 1", content: "" },
  ]);

  const addQuery = () => {
    const newId = `query${queries().length + 1}`;
    setQueries([
      ...queries(),
      { id: newId, name: `Query ${queries().length + 1}`, content: "" },
    ]);
    setActiveTab(newId);
  };

  return (
    <div class="flex h-screen bg-gray-50 text-gray-900">
      <aside class="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <h2 class="text-lg font-semibold mb-4">Data Sources</h2>
        <ul class="space-y-1">
          <For each={mockDataSources}>
            {(ds) => (
              <li class="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer">
                {ds.name}
              </li>
            )}
          </For>
        </ul>
      </aside>

      <main class="flex-1 flex flex-col overflow-auto bg-background">
        <Tabs value={activeTab()} onChange={setActiveTab}>
          <TabsList class="flex w-full gap-1 pb-0 px-1 pt-1 rounded-none bg-accent overflow-x-auto">
            <For each={queries()}>
              {(q) => (
                <div
                  class={cn(
                    "group flex-0 flex flex-row items-center min-w-64 p-2 justify-start text-sm font-medium transition-colors border-t-2 border-b-0 border-t-accent rounded-t-md bg-accent text-accent-foreground hover:bg-gray",
                    activeTab() === q.id &&
                      "bg-background text-foreground border-t-blue-500 "
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
                      activeTab() != q.id && "opacity-0",
                      "group-hover:opacity-100"
                    )}
                  >
                    <XIcon class="w-4" />
                  </Button>
                </div>
              )}
            </For>
            <div class="">
              <Button
                size="icon"
                variant="ghost"
                class="rounded-md self-center"
                onClick={addQuery}
              >
                <PlusIcon class="w-4" />
              </Button>
            </div>
          </TabsList>

          <For each={queries()}>
            {(q) => (
              <TabsContent value={q.id} class="mt-4 p-4 bg-background">
                <div class="flex flex-col gap-3">
                  <TextFieldRoot>
                    <TextArea placeholder="Write your query here..." />
                  </TextFieldRoot>
                  <Button variant="default" class="self-start">
                    Run
                  </Button>
                </div>
                <div class="mt-6 bg-white border border-gray-200 rounded-lg p-4">
                  <h3 class="text-md font-semibold mb-2">Output</h3>
                  <div class="bg-gray-50 rounded-md p-3 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                    Rendered markdown or JSON output will appear here.
                  </div>
                </div>
              </TabsContent>
            )}
          </For>
        </Tabs>
      </main>
    </div>
  );
}
