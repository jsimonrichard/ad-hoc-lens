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

interface CloseQueryDialogProps {
  closingQueryId: string | null;
  setClosingQueryId: (id: string | null) => void;
}

export function CloseQueryDialog({ closingQueryId, setClosingQueryId }: CloseQueryDialogProps) {
  const closeQueryTab = useCloseQueryTab();
  const open = closingQueryId !== null;

  const query = useQuery(closingQueryId ?? undefined);

  const handleConfirm = () => {
    if (closingQueryId) {
      // This will delete the unsaved query completely
      closeQueryTab(closingQueryId);
      setClosingQueryId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && setClosingQueryId(null)}
    >
      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Close Unsaved Query</DialogTitle>
          <DialogDescription>
            Are you sure you want to close{" "}
            <strong>"{query?.name || "Untitled"}"</strong>? Your unsaved
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
}

