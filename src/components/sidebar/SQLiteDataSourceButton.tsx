import { useState } from "react";
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
import { Pencil, Trash2, MoreVertical, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";

interface SQLiteDataSourceButtonProps {
  id: string;
  name: string;
  tables: string[];
  schemaName: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTableClick?: (schemaName: string, tableName: string) => void;
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

export function SQLiteDataSourceButton({
  id,
  name,
  tables,
  schemaName,
  onEdit,
  onDelete,
  onTableClick,
}: SQLiteDataSourceButtonProps) {
  const [open, setOpen] = useState(false);

  const handleEdit = () => {
    onEdit?.(id);
  };

  const handleDelete = () => {
    onDelete?.(id);
  };

  const handleTableClick = (tableName: string) => {
    onTableClick?.(schemaName, tableName);
  };

  return (
    <CollapsiblePrimitive.Root open={open} onOpenChange={setOpen}>
      <div className="group flex flex-col w-full rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
        <div className="flex flex-row items-center w-full">
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className="flex-1 flex items-center">
                <CollapsiblePrimitive.Trigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-transparent"
                    aria-label={open ? "Collapse" : "Expand"}
                  >
                    {open ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </Button>
                </CollapsiblePrimitive.Trigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start hover:bg-transparent cursor-pointer text-xs h-6"
                  onClick={() => setOpen(!open)}
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
                size="icon-xs"
                className={cn(
                  "transition-all opacity-0 group-hover:opacity-100 hover:bg-transparent cursor-pointer"
                )}
                aria-label="More options"
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItems onEdit={handleEdit} onDelete={handleDelete} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CollapsiblePrimitive.Content className="overflow-hidden">
          <ul className="pl-6 space-y-0.5 py-1">
            {tables.map((tableName) => (
              <li key={tableName}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start hover:bg-transparent cursor-pointer text-xs h-6 text-muted-foreground hover:text-foreground"
                  onClick={() => handleTableClick(tableName)}
                >
                  {tableName}
                </Button>
              </li>
            ))}
          </ul>
        </CollapsiblePrimitive.Content>
      </div>
    </CollapsiblePrimitive.Root>
  );
}
