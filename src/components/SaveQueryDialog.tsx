import type { Component } from "solid-js";
import { createSignal, createEffect } from "solid-js";
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

interface SaveQueryDialogProps {
  open: boolean;
  defaultName: string;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
}

export const SaveQueryDialog: Component<SaveQueryDialogProps> = (props) => {
  const [queryName, setQueryName] = createSignal(props.defaultName);

  // Reset the query name when dialog opens with a new default name
  createEffect(() => {
    if (props.open) {
      setQueryName(props.defaultName);
    }
  });

  const handleSave = () => {
    if (queryName().trim()) {
      props.onSave(queryName().trim());
      props.onOpenChange(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
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
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>
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
