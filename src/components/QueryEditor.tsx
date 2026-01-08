import { Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TabsContent } from "@/components/ui/tabs";
import { useQuery, useUpdateQuery } from "@/store/queries";

interface QueryEditorProps {
  queryId: string;
  onSave: () => void;
}

export function QueryEditor({ queryId, onSave }: QueryEditorProps) {
  const query = useQuery(queryId);
  const updateQuery = useUpdateQuery();

  return (
    <TabsContent value={queryId} className="bg-background">
      <div className="flex flex-col gap-3">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-2 border-b">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={onSave}
            title="Save query (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button
            variant="default"
            className="flex items-center gap-2"
            onClick={() => {
              // TODO: Implement run query functionality
              console.log("Run query:", query?.content || "");
            }}
          >
            <Play className="w-4 h-4" />
            Run
          </Button>
        </div>
        <Textarea
          className="bg-card"
          placeholder="Write your query here..."
          value={query?.content || ""}
          onChange={(e) =>
            updateQuery(queryId, { content: e.target.value })
          }
        />
      </div>
      <div className="mt-6 border rounded-lg p-4 bg-card mx-4">
        <h3 className="text-md font-semibold mb-2">Output</h3>
        <div className="rounded-md p-3 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
          Rendered markdown or JSON output will appear here.
        </div>
      </div>
    </TabsContent>
  );
}

