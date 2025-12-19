import type { Component } from "solid-js";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PencilIcon from "lucide-solid/icons/pencil";
import TrashIcon from "lucide-solid/icons/trash-2";
import MoreVerticalIcon from "lucide-solid/icons/more-vertical";
import { cn } from "@/libs/cn";

interface DataSourceButtonProps {
  id: string;
  name: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}

const MenuItems: Component<{
  onEdit: () => void;
  onDelete: () => void;
}> = (props) => (
  <>
    <ContextMenuItem onSelect={props.onEdit}>
      <PencilIcon class="mr-2 h-4 w-4" />
      Edit
    </ContextMenuItem>
    <ContextMenuItem
      onSelect={props.onDelete}
      class="text-destructive focus:text-destructive"
    >
      <TrashIcon class="mr-2 h-4 w-4" />
      Delete
    </ContextMenuItem>
  </>
);

const DropdownMenuItems: Component<{
  onEdit: () => void;
  onDelete: () => void;
}> = (props) => (
  <>
    <DropdownMenuItem onSelect={props.onEdit}>
      <PencilIcon class="mr-2 h-4 w-4" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem
      onSelect={props.onDelete}
      class="text-destructive focus:text-destructive"
    >
      <TrashIcon class="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
  </>
);

export const DataSourceButton: Component<DataSourceButtonProps> = (props) => {
  const handleEdit = () => {
    props.onEdit?.(props.id);
  };

  const handleDelete = () => {
    props.onDelete?.(props.id);
  };

  const handleClick = () => {
    props.onClick?.(props.id);
  };

  return (
    <div class="group flex flex-row items-center w-full rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
      <ContextMenu>
        <ContextMenuTrigger as="div" class="flex-1">
          <Button
            variant="ghost"
            class="w-full justify-start hover:bg-transparent"
            onClick={handleClick}
          >
            {props.name}
          </Button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <MenuItems onEdit={handleEdit} onDelete={handleDelete} />
        </ContextMenuContent>
      </ContextMenu>
      <DropdownMenu>
        <DropdownMenuTrigger
          as={Button}
          variant="ghost"
          size="icon"
          class={cn(
            "w-6 h-6 aspect-square transition-all opacity-0 group-hover:opacity-100 hover:bg-transparent"
          )}
          aria-label="More options"
        >
          <MoreVerticalIcon class="w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItems onEdit={handleEdit} onDelete={handleDelete} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
