import { useState, useRef, useCallback } from "react";
import { Upload, X, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { sanitizeTableName } from "@/utils/table-name";

interface AddDataSourceDialogProps {
  onAdd: (name: string, file: File) => Promise<void>;
}

export function AddDataSourceDialog({ onAdd }: AddDataSourceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resetForm = useCallback(() => {
    setFile(null);
    setName("");
    setError(null);
    setIsUploading(false);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);

    // Auto-populate name from filename (without extension, sanitized)
    if (!name) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setName(sanitizeTableName(nameWithoutExt));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleAdd = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const trimmedName = name.trim();
      await onAdd(trimmedName, file);
      setIsOpen(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add data source"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isUploading) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-xs">
          <Upload className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Data Source</DialogTitle>
          <DialogDescription>
            Upload a file to add as a data source. Supported formats: CSV, JSON,
            Parquet, SQLite, and more.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label htmlFor="file-input">File</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
                file && "border-primary/50 bg-primary/5"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                id="file-input"
                type="file"
                className="hidden"
                accept=".csv,.json,.jsonl,.parquet,.tsv,.txt,.db,.sqlite,.sqlite3"
                onChange={handleFileInputChange}
              />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <File className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </div>
                  <div className="text-xs text-muted-foreground">
                    CSV, JSON(L), Parquet, SQLite, TSV, TXT
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name-input">Name</Label>
            <Input
              id="name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter data source name"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              This name will be used for display and as the table name in SQL
              queries (automatically sanitized).
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!file || !name.trim() || isUploading}
          >
            {isUploading ? "Uploading..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
