import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import PlusIcon from "lucide-solid/icons/plus";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddItemDialogProps {
  title: string;
  description: string;
  placeholder?: string;
  onAdd: () => void;
}

export const AddItemDialog: Component<AddItemDialogProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const handleAdd = () => {
    props.onAdd();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen()} onOpenChange={setIsOpen}>
      <DialogTrigger as={Button} variant="ghost" size="icon" class="h-6 w-6">
        <PlusIcon class="w-4 h-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <p class="text-sm text-muted-foreground">
            {props.placeholder || "Configuration will go here."}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
