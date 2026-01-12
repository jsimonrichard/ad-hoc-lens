import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { AppState } from "./types";
import { loadState, STORAGE_KEY, demoState } from "./start";
import { uploadDataSource } from "@/db";
import { getAllFiles, deleteFile } from "@/db/indexeddb";
import { sanitizeTableName } from "@/utils/table-name";
import type * as duckdb from "@duckdb/duckdb-wasm";

export type { AppState, Query, DataSource } from "./types";

// Internal context that exposes state and setState
interface StoreContextValue {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

// Create context (non-reactive)
const StoreContext = createContext<StoreContextValue | null>(null);

// Provider component (contains all reactive code)
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Create the store with initial state from localStorage
  const [state, setState] = useState<AppState>(loadState);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }, [state]);

  // Ensure activeTab always matches an open tab
  useEffect(() => {
    const activeTabValue = state.activeTab;
    const openIds = state.openQueryIds;

    if (openIds.length > 0) {
      // If there are open tabs but none are active, select the first open tab
      // Only update if activeTab is truly empty/undefined or not in the list
      if (
        !activeTabValue ||
        activeTabValue === "" ||
        !openIds.includes(activeTabValue)
      ) {
        setState((prev) => ({ ...prev, activeTab: openIds[0] }));
      }
    } else if (activeTabValue) {
      // If there are no open tabs but activeTab is set, clear it
      setState((prev) => ({ ...prev, activeTab: "" }));
    }
  }, [state.activeTab, state.openQueryIds]);

  return (
    <StoreContext.Provider value={{ state, setState }}>
      {children}
    </StoreContext.Provider>
  );
};

// Internal hook to access the store context
export function useStoreContext(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStoreContext must be used within a StoreProvider");
  }
  return context;
}

export function useResetState() {
  const { setState } = useStoreContext();
  return useCallback(async () => {
    if (typeof window !== "undefined") {
      // Clear IndexedDB files
      try {
        const files = await getAllFiles();
        for (const file of files) {
          await deleteFile(file.id);
        }
      } catch (error) {
        console.error("Failed to clear IndexedDB:", error);
      }

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("ad-hoc-lens-first-time");

      // Reload the page to show the welcome dialog again
      window.location.reload();
    } else {
      setState({ ...loadState() });
    }
  }, [setState]);
}

export function useLoadDemoState() {
  const { setState } = useStoreContext();

  return useCallback(
    async (db: duckdb.AsyncDuckDB) => {
      try {
        // Fetch the example dataset from the public folder
        const response = await fetch("/rayon-rs__rayon_dataset.jsonl");
        if (!response.ok) {
          throw new Error("Failed to fetch demo dataset");
        }

        const blob = await response.blob();
        const file = new File([blob], "rayon-rs__rayon_dataset.jsonl", {
          type: "application/jsonl",
        });

        // Generate ID for the demo data source
        const dataSourceId = "1";
        // Sanitize the filename to create a valid table name
        const rawName = "rayon-rs__rayon_dataset";
        const dataSourceName = sanitizeTableName(rawName);

        // Upload the file using the upload function
        await uploadDataSource(db, file, dataSourceName, dataSourceId);

        // Set the demo state (queries, etc.) - this will include the data source
        // But we need to update it with the sanitized name
        const updatedDemoState = {
          ...demoState,
          dataSources: {
            "1": { name: dataSourceName },
          },
        };
        setState(updatedDemoState);
      } catch (error) {
        console.error("Failed to load demo data:", error);
        // Still set the demo state even if file upload fails
        setState({ ...demoState });
      }
    },
    [setState]
  );
}
