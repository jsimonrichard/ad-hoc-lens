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
import { useQuery, useUpdateQuery } from "@/store/queries";

interface EditQueryNameDialogProps {
  editQueryId: string | null;
  setEditQueryId: (id: string | null) => void;
}

export function EditQueryNameDialog({ editQueryId, setEditQueryId }: EditQueryNameDialogProps) {
  const updateQuery = useUpdateQuery();
  const open = editQueryId !== null;

  const query = useQuery(editQueryId ?? undefined);

  const currentName = query?.name || "";
  const [editedName, setEditedName] = useState(currentName);

  // Reset the edited name when dialog opens with a new item
  useEffect(() => {
    if (open) {
      setEditedName(currentName);
    }
  }, [open, currentName]);

  const handleSave = () => {
    if (editedName.trim()) {
      if (!editQueryId) {
        throw new Error("Editing tab ID is null");
      }
      updateQuery(editQueryId, { name: editedName.trim(), saved: true });
      setEditQueryId(null);
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
      onOpenChange={(isOpen) => !isOpen && setEditQueryId(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Query Name</DialogTitle>
          <DialogDescription>
            Update the name of your query tab.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter name"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditQueryId(null)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!editedName.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

