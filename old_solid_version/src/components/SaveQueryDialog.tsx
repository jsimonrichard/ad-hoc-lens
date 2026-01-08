import type { Component } from "solid-js";
import {
  createSignal,
  createEffect,
  createContext,
  useContext,
} from "solid-js";
import { Button } from "@/components/ui/button";
import { TextFieldRoot, TextField } from "@/components/ui/textfield";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetUntitledName, useUpdateQuery } from "@/store/queries";

// Context for save query dialog
interface SaveQueryDialogProps {
  saveQueryId: () => string | null;
  setSaveQueryId: (id: string | null) => void;
}

export const SaveQueryDialog: Component<SaveQueryDialogProps> = (props) => {
  const { saveQueryId, setSaveQueryId } = props;
  const open = () => saveQueryId() !== null;
  const getUntitledName = useGetUntitledName();
  const [queryName, setQueryName] = createSignal("");
  const updateQuery = useUpdateQuery();

  // Reset the query name when dialog opens with a new default name
  createEffect(() => {
    if (open()) {
      setQueryName(getUntitledName());
    }
  });

  const handleSave = () => {
    if (queryName().trim()) {
      const queryId = saveQueryId();
      if (queryId) {
        updateQuery(queryId, { name: queryName().trim(), saved: true });
        setSaveQueryId(null);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog
      open={open()}
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
        <div class="py-4">
          <TextFieldRoot>
            <TextField
              value={queryName()}
              onInput={(e) => setQueryName(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter query name"
              autofocus
            />
          </TextFieldRoot>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSaveQueryId(null)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!queryName().trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
