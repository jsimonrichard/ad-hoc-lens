import type { Component } from "solid-js";
import { createSignal, onMount } from "solid-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  isFirstTimeAppOpened,
  markFirstTimeAppOpenedComplete,
  useLoadDemoState,
} from "@/store/start";

export const WelcomeDialog: Component = () => {
  const [open, setOpen] = createSignal(false);
  const loadDemoState = useLoadDemoState();

  // Check if this is the first time opening the app
  onMount(() => {
    if (isFirstTimeAppOpened()) {
      setOpen(true);
    }
  });

  const handleUseDemo = () => {
    loadDemoState();
    markFirstTimeAppOpenedComplete();
    setOpen(false);
  };

  const handleStartEmpty = () => {
    markFirstTimeAppOpenedComplete();
    setOpen(false);
  };

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
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
