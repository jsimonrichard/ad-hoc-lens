import type { Component } from "solid-js";
import PlayIcon from "lucide-solid/icons/play";
import SaveIcon from "lucide-solid/icons/save";
import { Button } from "@/components/ui/button";
import { TextFieldRoot } from "@/components/ui/textfield";
import { TextArea } from "@/components/ui/textarea";
import { TabsContent } from "@/components/ui/tabs";
import type { Query } from "@/store";
import { useQuery, useUpdateQuery } from "@/store/queries";

interface QueryEditorProps {
  queryId: string;
  onSave: () => void;
}

export const QueryEditor: Component<QueryEditorProps> = (props) => {
  const { queryId, onSave } = props;
  const query = useQuery(queryId);
  const updateQuery = useUpdateQuery();

  return (
    <TabsContent value={queryId} class="mt-4 p-4 bg-background">
      <div class="flex flex-col gap-3">
        {/* Toolbar */}
        <div class="flex items-center gap-2 pb-2 border-b">
          <Button
            variant="outline"
            class="flex items-center gap-2"
            onClick={onSave}
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
              console.log("Run query:", query()?.content || "");
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
            value={query()?.content || ""}
            onInput={(e) =>
              updateQuery(queryId, { content: e.currentTarget.value })
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
};
