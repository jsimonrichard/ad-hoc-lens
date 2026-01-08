import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetUntitledName, useUpdateQuery } from "@/store/queries";

interface SaveQueryDialogProps {
  saveQueryId: string | null;
  setSaveQueryId: (id: string | null) => void;
}

export function SaveQueryDialog({ saveQueryId, setSaveQueryId }: SaveQueryDialogProps) {
  const open = saveQueryId !== null;
  const getUntitledName = useGetUntitledName();
  const [queryName, setQueryName] = useState("");
  const updateQuery = useUpdateQuery();

  // Reset the query name when dialog opens with a new default name
  useEffect(() => {
    if (open) {
      setQueryName(getUntitledName());
    }
  }, [open, getUntitledName]);

  const handleSave = () => {
    if (queryName.trim()) {
      if (saveQueryId) {
        updateQuery(saveQueryId, { name: queryName.trim(), saved: true });
        setSaveQueryId(null);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && setSaveQueryId(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Query</DialogTitle>
          <DialogDescription>
            Enter a name for your query. It will be saved and appear in the
            Queries section.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter query name"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSaveQueryId(null)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!queryName.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

