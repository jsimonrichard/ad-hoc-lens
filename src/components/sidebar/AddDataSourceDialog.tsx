import { useState, useRef, useCallback } from "react";
import { Upload, Clipboard, X, File as FileIcon } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { sanitizeTableName } from "@/utils/table-name";

type DataFormat = "csv" | "tsv" | "json" | "jsonl";

interface AddDataSourceDialogProps {
  onAdd: (name: string, file: File) => Promise<void>;
}

interface FormProps {
  onAdd: (name: string, file: File) => Promise<void>;
  onSuccess: () => void;
}

/**
 * Detect the format of pasted text
 */
function detectFormat(text: string): DataFormat {
  if (!text.trim()) {
    return "csv";
  }

  const trimmedText = text.trim();

  // Check for JSON/JSONL
  if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
    // Check if it's JSONL (newline-delimited JSON)
    const lines = trimmedText.split("\n").filter((line) => line.trim());
    if (
      lines.length > 1 &&
      lines.every((line) => line.trim().startsWith("{"))
    ) {
      return "jsonl";
    } else {
      // Try to parse as JSON
      try {
        JSON.parse(trimmedText);
        return "json";
      } catch {
        // Not valid JSON, might be CSV
      }
    }
  } else {
    // Check for TSV (tab-separated)
    const firstLine = trimmedText.split("\n")[0];
    if (firstLine.includes("\t") && firstLine.split("\t").length > 1) {
      return "tsv";
    }
  }

  // Default to CSV
  return "csv";
}

/**
 * Create a File object from text using the specified format
 */
function createFileFromText(
  text: string,
  fileName: string,
  format: DataFormat
): File | null {
  if (!text.trim()) {
    return null;
  }

  const formatMap: Record<DataFormat, { extension: string; mimeType: string }> =
    {
      csv: { extension: "csv", mimeType: "text/csv" },
      tsv: { extension: "tsv", mimeType: "text/tab-separated-values" },
      json: { extension: "json", mimeType: "application/json" },
      jsonl: { extension: "jsonl", mimeType: "application/jsonl" },
    };

  const { extension, mimeType } = formatMap[format];
  const blob = new Blob([text], { type: mimeType });
  return new File([blob], `${fileName}.${extension}`, { type: mimeType });
}

function UploadDataSourceForm({ onAdd, onSuccess }: FormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      file: null as File | null,
    },
    onSubmit: async ({ value }) => {
      if (!value.file) {
        form.setFieldMeta("file", (meta) => ({
          ...meta,
          errorMap: { onBlur: "Please select a file" },
        }));
        return;
      }

      if (!value.name.trim()) {
        form.setFieldMeta("name", (meta) => ({
          ...meta,
          errorMap: { onBlur: "Please enter a name" },
        }));
        return;
      }

      setIsUploading(true);

      try {
        const trimmedName = value.name.trim();
        await onAdd(trimmedName, value.file);
        form.reset();
        onSuccess();
      } catch (err) {
        form.setFieldMeta("name", (meta) => ({
          ...meta,
          errorMap: {
            onBlur:
              err instanceof Error ? err.message : "Failed to add data source",
          },
        }));
      } finally {
        setIsUploading(false);
      }
    },
  });

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      form.setFieldValue("file", selectedFile);
      form.setFieldMeta("file", (meta) => ({ ...meta, errorMap: {} }));

      // Auto-populate name from filename (without extension, sanitized)
      const currentName = form.getFieldValue("name");
      if (!currentName) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        form.setFieldValue("name", sanitizeTableName(nameWithoutExt));
      }
    },
    [form]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="space-y-4">
        <form.Field name="file">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="file-input">File</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50",
                  field.state.value && "border-primary/50 bg-primary/5"
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
                  accept=".csv,.json,.jsonl,.parquet,.tsv,.txt"
                  onChange={handleFileInputChange}
                />
                {field.state.value ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileIcon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">
                      {field.state.value.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        field.handleChange(null);
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
                      CSV, JSON(L), Parquet, TSV, TXT
                    </div>
                  </div>
                )}
              </div>
              {field.state.meta.errorMap?.onBlur && (
                <p className="text-xs text-destructive">
                  {field.state.meta.errorMap.onBlur}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="name-input">Name</Label>
              <Input
                id="name-input"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter data source name"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                This name will be used for display and as the table name in SQL
                queries (automatically sanitized).
              </p>
              {field.state.meta.errorMap?.onBlur && (
                <p className="text-xs text-destructive">
                  {field.state.meta.errorMap.onBlur}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>
      <DialogFooter className="mt-4">
        <form.Subscribe
          selector={(state) => ({
            isSubmitting: state.isSubmitting,
            file: state.values.file,
            name: state.values.name,
          })}
        >
          {({ isSubmitting, file, name }) => (
            <Button
              type="submit"
              disabled={!file || !name?.trim() || isUploading || isSubmitting}
            >
              {isUploading || isSubmitting ? "Uploading..." : "Add"}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}

function PasteDataSourceForm({ onAdd, onSuccess }: FormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isFormatManuallySet, setIsFormatManuallySet] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      pastedText: "",
      format: null as DataFormat | null,
    },
    onSubmit: async ({ value }) => {
      if (!value.pastedText.trim()) {
        form.setFieldMeta("pastedText", (meta) => ({
          ...meta,
          errorMap: { onBlur: "Please paste some text content" },
        }));
        return;
      }

      if (!value.name.trim()) {
        form.setFieldMeta("name", (meta) => ({
          ...meta,
          errorMap: { onBlur: "Please enter a name" },
        }));
        return;
      }

      // Use selected format or auto-detect if not set
      const format = value.format || detectFormat(value.pastedText);
      const detectedFile = createFileFromText(
        value.pastedText,
        value.name || "pasted_data",
        format
      );
      if (!detectedFile) {
        form.setFieldMeta("pastedText", (meta) => ({
          ...meta,
          errorMap: { onBlur: "Could not create file from pasted text" },
        }));
        return;
      }

      setIsUploading(true);

      try {
        const trimmedName = value.name.trim();
        await onAdd(trimmedName, detectedFile);
        form.reset();
        setIsFormatManuallySet(false);
        onSuccess();
      } catch (err) {
        form.setFieldMeta("name", (meta) => ({
          ...meta,
          errorMap: {
            onBlur:
              err instanceof Error ? err.message : "Failed to add data source",
          },
        }));
      } finally {
        setIsUploading(false);
      }
    },
  });

  const handlePasteChange = useCallback(
    (text: string) => {
      form.setFieldValue("pastedText", text);
      form.setFieldMeta("pastedText", (meta) => ({ ...meta, errorMap: {} }));

      // Auto-detect and set format when text changes (only if format not manually set)
      if (text.trim()) {
        const detectedFormat = detectFormat(text);
        // Only auto-update format if user hasn't manually set it
        if (!isFormatManuallySet) {
          form.setFieldValue("format", detectedFormat);
        }

        // Auto-populate name if not set
        const currentName = form.getFieldValue("name");
        if (!currentName) {
          const formatMap: Record<DataFormat, string> = {
            csv: "pasted_data",
            tsv: "pasted_data",
            json: "pasted_data",
            jsonl: "pasted_data",
          };
          const baseName = formatMap[detectedFormat];
          const sanitizedName = sanitizeTableName(baseName);
          form.setFieldValue("name", sanitizedName);
        }
      } else {
        // Clear format when text is empty
        form.setFieldValue("format", null);
        setIsFormatManuallySet(false);
      }
    },
    [form, isFormatManuallySet]
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="space-y-4">
        <form.Field name="pastedText">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="paste-input">Paste Text Content</Label>
              <Textarea
                id="paste-input"
                value={field.state.value}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder="Paste CSV, TSV, JSON, or JSONL content here..."
                className="min-h-[200px] font-mono text-xs"
              />
              {field.state.meta.errorMap?.onBlur && (
                <p className="text-xs text-destructive">
                  {field.state.meta.errorMap.onBlur}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="format">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="format-select">Data Format</Label>
              <Select
                value={field.state.value || undefined}
                onValueChange={(value) => {
                  field.handleChange(value as DataFormat);
                  setIsFormatManuallySet(true);
                }}
                disabled={!form.getFieldValue("pastedText")?.trim()}
              >
                <SelectTrigger id="format-select" className="w-full">
                  <SelectValue
                    placeholder={
                      form.getFieldValue("pastedText")?.trim()
                        ? "Auto-detecting..."
                        : "Paste text to detect format"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Comma-separated)</SelectItem>
                  <SelectItem value="tsv">TSV (Tab-separated)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="jsonl">
                    JSONL (Newline-delimited JSON)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {form.getFieldValue("pastedText")?.trim()
                  ? "Format is auto-detected, but you can manually select a different format if needed."
                  : "Paste text content above to auto-detect the format."}
              </p>
            </div>
          )}
        </form.Field>

        <form.Field name="name">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="name-input">Name</Label>
              <Input
                id="name-input"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter data source name"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                This name will be used for display and as the table name in SQL
                queries (automatically sanitized).
              </p>
              {field.state.meta.errorMap?.onBlur && (
                <p className="text-xs text-destructive">
                  {field.state.meta.errorMap.onBlur}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>
      <DialogFooter className="mt-4">
        <form.Subscribe
          selector={(state) => ({
            isSubmitting: state.isSubmitting,
            pastedText: state.values.pastedText,
            name: state.values.name,
          })}
        >
          {({ isSubmitting, pastedText, name }) => {
            const disabled =
              !pastedText?.trim() ||
              !name?.trim() ||
              isUploading ||
              isSubmitting;

            return (
              <Button type="submit" disabled={disabled}>
                {isUploading || isSubmitting ? "Uploading..." : "Add"}
              </Button>
            );
          }}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}

export function AddDataSourceDialog({ onAdd }: AddDataSourceDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-xs">
          <Upload className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Data Source</DialogTitle>
          <DialogDescription>
            Upload a file or paste text content to add as a data source.
            Supported formats: CSV, JSON, Parquet, and more.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "upload" | "paste")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="w-3 h-3 mr-1.5" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="paste">
              <Clipboard className="w-3 h-3 mr-1.5" />
              Paste Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <UploadDataSourceForm
              onAdd={onAdd}
              onSuccess={() => setIsOpen(false)}
            />
          </TabsContent>

          <TabsContent value="paste" className="mt-4">
            <PasteDataSourceForm
              onAdd={onAdd}
              onSuccess={() => setIsOpen(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
