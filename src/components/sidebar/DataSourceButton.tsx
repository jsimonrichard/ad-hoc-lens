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
import { Pencil, Trash2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataSourceButtonProps {
  id: string;
  name: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}

const MenuItems: React.FC<{
  onEdit: () => void;
  onDelete: () => void;
}> = ({ onEdit, onDelete }) => (
  <>
    <ContextMenuItem onSelect={onEdit} className="cursor-pointer">
      <Pencil className="mr-2 h-4 w-4" />
      Edit
    </ContextMenuItem>
    <ContextMenuItem
      onSelect={onDelete}
      className="text-destructive focus:text-destructive cursor-pointer"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </ContextMenuItem>
  </>
);

const DropdownMenuItems: React.FC<{
  onEdit: () => void;
  onDelete: () => void;
}> = ({ onEdit, onDelete }) => (
  <>
    <DropdownMenuItem onSelect={onEdit} className="cursor-pointer">
      <Pencil className="mr-2 h-4 w-4" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem
      onSelect={onDelete}
      className="text-destructive focus:text-destructive cursor-pointer"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
  </>
);

export function DataSourceButton({ id, name, onEdit, onDelete, onClick }: DataSourceButtonProps) {
  const handleEdit = () => {
    onEdit?.(id);
  };

  const handleDelete = () => {
    onDelete?.(id);
  };

  const handleClick = () => {
    onClick?.(id);
  };

  return (
    <div className="group flex flex-row items-center w-full rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="flex-1">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-transparent cursor-pointer"
              onClick={handleClick}
            >
              {name}
            </Button>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <MenuItems onEdit={handleEdit} onDelete={handleDelete} />
        </ContextMenuContent>
      </ContextMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-6 h-6 aspect-square transition-all opacity-0 group-hover:opacity-100 hover:bg-transparent cursor-pointer"
            )}
            aria-label="More options"
          >
            <MoreVertical className="w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItems onEdit={handleEdit} onDelete={handleDelete} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

