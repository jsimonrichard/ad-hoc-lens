import { useEffect, useState } from "react";
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
} from "@/store/start";
import { useLoadDemoState } from "@/store";
import { useDuckDB } from "@/db";

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  const loadDemoState = useLoadDemoState();
  const db = useDuckDB();

  // Check if this is the first time opening the app
  useEffect(() => {
    if (isFirstTimeAppOpened()) {
      setOpen(true);
    }
  }, []);

  const handleUseDemo = async () => {
    await loadDemoState(db);
    markFirstTimeAppOpenedComplete();
    setOpen(false);
  };

  const handleStartEmpty = () => {
    markFirstTimeAppOpenedComplete();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to Ad-Hoc Lens</DialogTitle>
          <DialogDescription>
            Would you like to start with demo data and example queries, or start
            with an empty workspace?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleStartEmpty}
            className="w-full sm:w-auto"
          >
            Start Empty
          </Button>
          <Button onClick={handleUseDemo} className="w-full sm:w-auto">
            Use Demo Values
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
