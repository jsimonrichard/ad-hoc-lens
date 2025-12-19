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
import { useCloseQueryTab, useQuery } from "@/store/queries";

// Context for close query dialog
interface CloseQueryDialogProps {
  closingQueryId: () => string | null;
  setClosingQueryId: (id: string | null) => void;
}

export const CloseQueryDialog: Component<CloseQueryDialogProps> = (props) => {
  const closeQueryTab = useCloseQueryTab();
  const { closingQueryId, setClosingQueryId } = props;
  const open = () => closingQueryId() !== null;

  const query = useQuery(closingQueryId() ?? undefined);

  const handleConfirm = () => {
    const queryId = closingQueryId();
    if (queryId) {
      // This will delete the unsaved query completely
      closeQueryTab(queryId);
      setClosingQueryId(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog
      open={open()}
      onOpenChange={(isOpen) => !isOpen && setClosingQueryId(null)}
    >
      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Close Unsaved Query</DialogTitle>
          <DialogDescription>
            Are you sure you want to close{" "}
            <strong>"{query()?.name || "Untitled"}"</strong>? Your unsaved
            changes will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setClosingQueryId(null)}>
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
