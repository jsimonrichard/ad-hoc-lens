import { Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { useQuery, useUpdateQuery } from "@/store/queries";
import { useDataSources } from "@/store/dataSources";
import { useDuckDB } from "@/db";
import { useState } from "react";
import { QueryEditor } from "./QueryEditor";
import { QueryTable } from "./QueryTable";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizablePanelSeparator,
} from "@/components/ui/resizable";

interface QueryViewProps {
  queryId: string;
  onSave: () => void;
}

export function QueryView({ queryId, onSave }: QueryViewProps) {
  const query = useQuery(queryId);
  const updateQuery = useUpdateQuery();
  const db = useDuckDB();
  const dataSources = useDataSources();
  const [queryResults, setQueryResults] = useState<unknown[]>([]);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const tableNames = Object.values(dataSources).map((ds) => ds.name);

  const handleRunQuery = async () => {
    const queryContent = query?.content?.trim();
    if (!queryContent) {
      console.log("No query to run");
      return;
    }

    setIsRunning(true);
    setQueryError(null);
    setQueryResults([]);

    try {
      const conn = await db.connect();
      try {
        const result = await conn.query(queryContent);
        // DuckDB-wasm returns Arrow tables. Use each row's toJSON() method
        // to properly serialize all data types (dates, timestamps, etc.)
        const arrowTable = result;
        const resultArray = arrowTable.toArray();

        // Use toJSON() on each row to properly serialize all DuckDB types
        const serialized = resultArray.map((row) => row.toJSON());

        setQueryResults(serialized);
      } finally {
        await conn.close();
      }
    } catch (error) {
      console.error("Query execution error:", error);
      setQueryError(
        error instanceof Error
          ? error.message
          : "An error occurred while executing the query"
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <TabsContent value={queryId} className="bg-background h-full flex flex-col">
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
          onClick={handleRunQuery}
          disabled={isRunning}
        >
          <Play className="w-4 h-4" />
          {isRunning ? "Running..." : "Run"}
        </Button>
      </div>
      {/* Resizable Layout: Editor and Results */}
      <div className="flex-1">
        <ResizablePanelGroup orientation="vertical">
          {/* Editor Section */}
          <ResizablePanel defaultSize="20em" minSize="12em" maxSize="40em">
            <div className="h-full overflow-auto flex flex-col border-b">
              <QueryEditor
                value={query?.content || ""}
                onChange={(value) => updateQuery(queryId, { content: value })}
                tableNames={tableNames}
              />
            </div>
          </ResizablePanel>
          <ResizablePanelSeparator />
          {/* Results Section */}
          <ResizablePanel minSize="12em">
            <QueryTable
              data={queryResults}
              error={queryError}
              isRunning={isRunning}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TabsContent>
  );
}
