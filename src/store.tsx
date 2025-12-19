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
}

export interface Query {
  id: string;
  name: string;
  content: string;
  dataSourceId?: string;
}

export interface AppState {
  activeTab: string;
  queries: Query[];
  openQueryIds: string[];
  dataSources: DataSource[];
}

export interface StoreContextValue {
  state: Store<AppState>;
  setActiveTab: (tabId: string) => void;
  addQuery: () => void;
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
    { id: "query1", name: "Query 1", content: "", dataSourceId: "1" },
    {
      id: "saved-1",
      name: "Top 10 Records",
      content: "SELECT * FROM data LIMIT 10",
    },
    {
      id: "saved-2",
      name: "Aggregate Statistics",
      content: "SELECT COUNT(*) as total, AVG(value) as avg_value FROM dataset",
    },
    {
      id: "saved-3",
      name: "Filter by Date Range",
      content:
        "SELECT * FROM data WHERE date >= '2024-01-01' AND date <= '2024-12-31'",
    },
    {
      id: "saved-4",
      name: "Group by Category",
      content:
        "SELECT category, COUNT(*) as count FROM items GROUP BY category ORDER BY count DESC",
    },
  ],
  openQueryIds: ["query1"],
  dataSources: [
    { id: "1", name: "rayon_dataset.jsonl" },
    { id: "2", name: "example_data.json" },
  ],
};

// Load state from localStorage (non-reactive helper function)
function loadState(): AppState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure openQueryIds exists
      if (!parsed.openQueryIds) {
        parsed.openQueryIds =
          parsed.queries?.length > 0 ? [parsed.queries[0].id] : [];
      }
      // Merge with defaults to handle new fields
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
      const newId = `query${Date.now()}`;
      const defaultDataSourceId =
        state.dataSources.length > 0 ? state.dataSources[0].id : undefined;
      setState("queries", (queries) => [
        ...queries,
        {
          id: newId,
          name: `Query ${queries.length + 1}`,
          content: "",
          dataSourceId: defaultDataSourceId,
        },
      ]);
      setState("openQueryIds", (ids) => [...ids, newId]);
      setState("activeTab", newId);
    },

    updateQuery: (id: string, updates: Partial<Query>) => {
      setState("queries", (query) => query.id === id, updates);
    },

    deleteQuery: (id: string) => {
      // Remove from openQueryIds
      setState("openQueryIds", (ids) =>
        ids.filter((queryId) => queryId !== id)
      );

      // If deleted query was active, switch to first remaining open query
      if (state.activeTab === id) {
        const remainingOpenIds = state.openQueryIds.filter(
          (queryId) => queryId !== id
        );
        if (remainingOpenIds.length > 0) {
          setState("activeTab", remainingOpenIds[0]);
        }
      }

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
      // Remove from openQueryIds
      setState("openQueryIds", (ids) => ids.filter((id) => id !== queryId));

      // If closed query was active, switch to first remaining open query
      if (state.activeTab === queryId) {
        const remainingOpenIds = state.openQueryIds.filter(
          (id) => id !== queryId
        );
        if (remainingOpenIds.length > 0) {
          setState("activeTab", remainingOpenIds[0]);
        }
      }
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
