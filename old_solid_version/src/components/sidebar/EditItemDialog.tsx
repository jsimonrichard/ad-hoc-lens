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

interface EditItemDialogProps {
  open: boolean;
  title: string;
  description: string;
  itemName: string;
  onOpenChange: (open: boolean) => void;
  onSave: (newName: string) => void;
}

export const EditItemDialog: Component<EditItemDialogProps> = (props) => {
  const [editedName, setEditedName] = createSignal(props.itemName);

  // Reset the edited name when dialog opens with a new item
  createEffect(() => {
    if (props.open) {
      setEditedName(props.itemName);
    }
  });

  const handleSave = () => {
    if (editedName().trim()) {
      props.onSave(editedName().trim());
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
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
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
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>
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
