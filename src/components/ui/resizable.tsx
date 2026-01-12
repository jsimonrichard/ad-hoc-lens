import * as React from "react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Group>) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full group/resizable-panel-group data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  );
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizablePanelSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator>) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "bg-border relative flex items-center justify-center outline-none",
        "group-data-[orientation=horizontal]/resizable-panel-group:w-px group-data-[orientation=horizontal]/resizable-panel-group:after:absolute group-data-[orientation=horizontal]/resizable-panel-group:after:inset-y-0 group-data-[orientation=horizontal]/resizable-panel-group:after:left-1/2 group-data-[orientation=horizontal]/resizable-panel-group:after:w-1 group-data-[orientation=horizontal]/resizable-panel-group:after:-translate-x-1/2",
        "group-data-[orientation=vertical]/resizable-panel-group:h-px group-data-[orientation=vertical]/resizable-panel-group:w-full group-data-[orientation=vertical]/resizable-panel-group:after:absolute group-data-[orientation=vertical]/resizable-panel-group:after:inset-x-0 group-data-[orientation=vertical]/resizable-panel-group:after:top-1/2 group-data-[orientation=vertical]/resizable-panel-group:after:h-1 group-data-[orientation=vertical]/resizable-panel-group:after:w-full group-data-[orientation=vertical]/resizable-panel-group:after:-translate-y-1/2",
        className
      )}
      {...props}
    />
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizablePanelSeparator };
