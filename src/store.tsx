import { createStore, type Store } from "solid-js/store";
import {
  createEffect,
  createContext,
  useContext,
  type Component,
  type ParentProps,
} from "solid-js";

export interface DataSource {
  id: string;
  name: string;
  tableName: string;
}

export interface Query {
  id: string;
  name: string;
  content: string;
  dataSourceId?: string;
  saved?: boolean;
}

export interface AppState {
  activeTab?: string;
  queries: Query[];
  openQueryIds: string[];
  dataSources: DataSource[];
}

export interface StoreContextValue {
  state: Store<AppState>;
  setActiveTab: (tabId: string) => void;
  addQuery: () => void;
  createUnsavedQuery: () => string;
  saveQuery: (id: string, name?: string) => void;
  getNextUntitledName: () => string;
  updateQuery: (id: string, updates: Partial<Query>) => void;
  deleteQuery: (id: string) => void;
  openQuery: (queryId: string) => void;
  closeQuery: (queryId: string) => void;
  addDataSource: (dataSource: DataSource) => void;
  updateDataSource: (id: string, updates: Partial<DataSource>) => void;
  deleteDataSource: (id: string) => void;
}

const STORAGE_KEY = "ad-hoc-lens-state";

// Default initial state (non-reactive constant)
const defaultState: AppState = {
  activeTab: "query1",
  queries: [
    {
      id: "query1",
      name: "Untitled",
      content: "",
      dataSourceId: "1",
      saved: false,
    },
    {
      id: "saved-1",
      name: "Top 10 Records",
      content: "SELECT * FROM data LIMIT 10",
      saved: true,
    },
    {
      id: "saved-2",
      name: "Aggregate Statistics",
      content: "SELECT COUNT(*) as total, AVG(value) as avg_value FROM dataset",
      saved: true,
    },
    {
      id: "saved-3",
      name: "Filter by Date Range",
      content:
        "SELECT * FROM data WHERE date >= '2024-01-01' AND date <= '2024-12-31'",
      saved: true,
    },
    {
      id: "saved-4",
      name: "Group by Category",
      content:
        "SELECT category, COUNT(*) as count FROM items GROUP BY category ORDER BY count DESC",
      saved: true,
    },
  ],
  openQueryIds: ["query1"],
  dataSources: [
    { id: "1", name: "rayon_dataset.jsonl", tableName: "" },
    { id: "2", name: "example_data.json", tableName: "" },
  ],
};

// Helper function to get next "Untitled #" name
function getNextUntitledName(savedQueries: Query[]): string {
  const untitledPattern = /^Untitled(?: (\d+))?$/;
  let maxNum = 0;

  for (const query of savedQueries) {
    const match = query.name.match(untitledPattern);
    if (match) {
      const num = match[1] ? parseInt(match[1], 10) : 1;
      maxNum = Math.max(maxNum, num);
    }
  }

  return maxNum === 0 ? "Untitled" : `Untitled ${maxNum + 1}`;
}

// Load state from localStorage (non-reactive helper function)
function loadState(): AppState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      // TODO: I know this is n^2, but I'll worry about it later
      parsed.openQueryIds = parsed.openQueryIds.filter((id: string) =>
        parsed.queries.some((q: Query) => q.id === id)
      );

      return { ...defaultState, ...parsed };
    }
  } catch (error) {
    console.error("Failed to load state from localStorage:", error);
  }

  return defaultState;
}

// Create context (non-reactive)
const StoreContext = createContext<StoreContextValue>();

// Provider component (contains all reactive code)
export const StoreProvider: Component<ParentProps> = (props) => {
  // Create the store with initial state from localStorage
  const [state, setState] = createStore<AppState>(loadState());

  // Persist state to localStorage whenever it changes
  createEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  });

  // Ensure activeTab always matches an open tab
  createEffect(() => {
    if (state.openQueryIds.length > 0) {
      // If there are open tabs but none are active, select the first open tab
      if (!state.activeTab || !state.openQueryIds.includes(state.activeTab)) {
        setState("activeTab", state.openQueryIds[0]);
      }
    } else if (state.activeTab) {
      // If there are no open tabs but activeTab is set, clear it
      setState("activeTab", "");
    }
  });

  // Helper function for creating unsaved queries
  const createUnsavedQuery = (): string => {
    const newId = `query${Date.now()}`;
    const defaultDataSourceId =
      state.dataSources.length > 0 ? state.dataSources[0].id : undefined;
    setState("queries", (queries) => [
      ...queries,
      {
        id: newId,
        name: "Untitled",
        content: "",
        dataSourceId: defaultDataSourceId,
        saved: false,
      },
    ]);
    return newId;
  };

  // Must be called before the tab is actually removed from the openQueryIds list
  const updateActiveTabOnTabRemoved = (removedQueryId: string) => {
    if (state.activeTab !== removedQueryId) {
      return;
    }
    const pos = state.openQueryIds.indexOf(removedQueryId);

    console.log(
      "updateActiveTabOnTabRemoved",
      removedQueryId,
      state.openQueryIds,
      pos
    );
    if (pos === -1) {
      throw new Error(
        `Query not found in openQueryIds. \
        Make sure to call this function before the tab is actually \
        removed from the openQueryIds list.`
      );
    } else if (pos === 0) {
      if (state.openQueryIds.length <= 1) {
        setState("activeTab", "");
      } else {
        setState("activeTab", state.openQueryIds[1]);
      }
    } else {
      setState("activeTab", state.openQueryIds[pos - 1]);
    }
  };

  // Store actions
  const store: StoreContextValue = {
    get state() {
      return state;
    },

    // Query actions
    setActiveTab: (tabId: string) => {
      setState("activeTab", tabId);
    },

    addQuery: () => {
      const newId = createUnsavedQuery();
      setState("openQueryIds", (ids) => [...ids, newId]);
      setState("activeTab", newId);
    },

    createUnsavedQuery,

    saveQuery: (id: string, name?: string) => {
      const query = state.queries.find((q) => q.id === id);
      if (!query) return;

      // If query is already saved, no need to do anything
      if (query.saved && !name) {
        return;
      }

      // If name is provided, save with that name
      if (name) {
        setState("queries", (q) => q.id === id, {
          name: name.trim(),
          saved: true,
        });
        return;
      }

      // For unsaved queries without a name, generate a default name
      const savedQueries = state.queries.filter((q) => q.saved);
      const defaultName = getNextUntitledName(savedQueries);
      setState("queries", (q) => q.id === id, {
        name: defaultName,
        saved: true,
      });
    },

    getNextUntitledName: () => {
      const savedQueries = state.queries.filter((q) => q.saved);
      return getNextUntitledName(savedQueries);
    },

    updateQuery: (id: string, updates: Partial<Query>) => {
      setState("queries", (query) => query.id === id, updates);
    },

    deleteQuery: (id: string) => {
      updateActiveTabOnTabRemoved(id);

      // Remove from openQueryIds
      setState("openQueryIds", (ids) =>
        ids.filter((queryId) => queryId !== id)
      );

      // Remove the query entirely
      setState("queries", (queries) => queries.filter((q) => q.id !== id));
    },

    openQuery: (queryId: string) => {
      // Check if query exists
      const query = state.queries.find((q) => q.id === queryId);
      if (!query) return;

      // Add to openQueryIds if not already open
      if (!state.openQueryIds.includes(queryId)) {
        setState("openQueryIds", (ids) => [...ids, queryId]);
      }

      // Switch to this query
      setState("activeTab", queryId);
    },

    closeQuery: (queryId: string) => {
      updateActiveTabOnTabRemoved(queryId);
      setState("openQueryIds", (ids) => ids.filter((id) => id !== queryId));
    },

    // Data source actions
    addDataSource: (dataSource: DataSource) => {
      setState("dataSources", (dataSources) => [...dataSources, dataSource]);
    },

    updateDataSource: (id: string, updates: Partial<DataSource>) => {
      setState("dataSources", (ds) => ds.id === id, updates);
    },

    deleteDataSource: (id: string) => {
      setState("dataSources", (dataSources) =>
        dataSources.filter((ds) => ds.id !== id)
      );
    },
  };

  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  );
};

// Hook to use the store
export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
