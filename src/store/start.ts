import type { AppState } from "./types";

export const STORAGE_KEY = "ad-hoc-lens-state";
const FIRST_TIME_KEY = "ad-hoc-lens-first-time";

// Empty default state (non-reactive constant)
export const defaultState: AppState = {
  activeTab: undefined,
  queries: {},
  openQueryIds: [],
  dataSources: {},
};

// Demo state with example values
export const demoState: AppState = {
  activeTab: "query1",
  queries: {
    query1: {
      name: "Untitled",
      content: "",
      saved: false,
    },
    "saved-1": {
      name: "Top 10 Records",
      content: "SELECT * FROM data LIMIT 10",
      saved: true,
    },
    "saved-2": {
      name: "Aggregate Statistics",
      content: "SELECT COUNT(*) as total, AVG(value) as avg_value FROM dataset",
      saved: true,
    },
    "saved-3": {
      name: "Filter by Date Range",
      content:
        "SELECT * FROM data WHERE date >= '2024-01-01' AND date <= '2024-12-31'",
      saved: true,
    },
    "saved-4": {
      name: "Group by Category",
      content:
        "SELECT category, COUNT(*) as count FROM items GROUP BY category ORDER BY count DESC",
      saved: true,
    },
  },
  openQueryIds: ["query1"],
  dataSources: {
    "1": { name: "rayon_dataset.jsonl" },
  },
};

// Check if this is the first time the app is opened
export function isFirstTimeAppOpened(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return localStorage.getItem(FIRST_TIME_KEY) === null;
}

// Mark that the first time dialog has been shown
export function markFirstTimeAppOpenedComplete(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(FIRST_TIME_KEY, "false");
  }
}

// Load state from localStorage (non-reactive helper function)
export function loadState(): AppState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      // TODO: I know this is n^2, but I'll worry about it later
      parsed.openQueryIds = parsed.openQueryIds.filter(
        (id: string) => !!parsed.queries[id]
      );

      return { ...defaultState, ...parsed };
    }
  } catch (error) {
    console.error("Failed to load state from localStorage:", error);
  }

  return defaultState;
}

