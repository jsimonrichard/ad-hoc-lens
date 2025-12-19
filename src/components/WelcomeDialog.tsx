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

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseDemo: () => void;
  onStartEmpty: () => void;
}

export const WelcomeDialog: Component<WelcomeDialogProps> = (props) => {
  const handleUseDemo = () => {
    props.onUseDemo();
    props.onOpenChange(false);
  };

  const handleStartEmpty = () => {
    props.onStartEmpty();
    props.onOpenChange(false);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to Ad-Hoc Lens</DialogTitle>
          <DialogDescription>
            Would you like to start with demo data and example queries, or start
            with an empty workspace?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleStartEmpty}
            class="w-full sm:w-auto"
          >
            Start Empty
          </Button>
          <Button onClick={handleUseDemo} class="w-full sm:w-auto">
            Use Demo Values
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
