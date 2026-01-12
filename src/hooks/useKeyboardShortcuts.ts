import { useEffect } from "react";

interface KeyboardShortcutsOptions {
  onSave: () => void;
  onReset?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+S (or Cmd+S on Mac) - Save query
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        options.onSave();
      }

      // Check for Ctrl+Shift+R (or Cmd+Shift+R on Mac) - Reset state (dev only)
      if (import.meta.env.DEV && (e.ctrlKey || e.metaKey) && e.key === ">") {
        e.preventDefault();
        if (
          options.onReset &&
          confirm("Reset all state to defaults? This cannot be undone.")
        ) {
          options.onReset();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [options]);
}

