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
import { useQuery, useUpdateQuery } from "@/store/queries";

// Context for edit query name dialog
interface EditQueryNameDialogProps {
  editQueryId: () => string | null;
  setEditQueryId: (id: string | null) => void;
}

export const EditQueryNameDialog: Component<EditQueryNameDialogProps> = (
  props
) => {
  const { editQueryId, setEditQueryId } = props;
  const updateQuery = useUpdateQuery();
  const open = () => editQueryId() !== null;

  const query = useQuery(editQueryId() ?? undefined);

  const currentName = () => query()?.name || "";
  const [editedName, setEditedName] = createSignal(currentName());

  // Reset the edited name when dialog opens with a new item
  createEffect(() => {
    if (open()) {
      setEditedName(currentName());
    }
  });

  const handleSave = () => {
    if (editedName().trim()) {
      const tabId = editQueryId();
      if (!tabId) {
        throw new Error("Editing tab ID is null");
      }
      updateQuery(tabId, { name: editedName().trim(), saved: true });
      setEditQueryId(null);
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
      onOpenChange={(isOpen) => !isOpen && setEditQueryId(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Query Name</DialogTitle>
          <DialogDescription>
            Update the name of your query tab.
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <TextFieldRoot>
            <TextField
              value={editedName()}
              onInput={(e) => setEditedName(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter name"
              autofocus
            />
          </TextFieldRoot>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditQueryId(null)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!editedName().trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
