import type { Component } from "solid-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CloseQueryDialogProps {
  open: boolean;
  queryName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const CloseQueryDialog: Component<CloseQueryDialogProps> = (props) => {
  const handleConfirm = () => {
    props.onConfirm();
    props.onOpenChange(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Close Unsaved Query</DialogTitle>
          <DialogDescription>
            Are you sure you want to close <strong>"{props.queryName}"</strong>?
            Your unsaved changes will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
