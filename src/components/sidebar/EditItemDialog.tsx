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

interface EditItemDialogProps {
  open: boolean;
  title: string;
  description: string;
  itemName: string;
  onOpenChange: (open: boolean) => void;
  onSave: (newName: string) => void;
}

export function EditItemDialog({
  open,
  title,
  description,
  itemName,
  onOpenChange,
  onSave,
}: EditItemDialogProps) {
  const [editedName, setEditedName] = useState(itemName);

  // Reset the edited name when dialog opens with a new item
  useEffect(() => {
    if (open) {
      setEditedName(itemName);
    }
  }, [open, itemName]);

  const handleSave = () => {
    if (editedName.trim()) {
      onSave(editedName.trim());
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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

