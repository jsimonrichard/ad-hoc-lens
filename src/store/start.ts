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
    "saved-1": {
      name: "Select all",
      content: "SELECT * FROM rayon_rs_rayon_dataset",
      saved: true,
    },
    "saved-2": {
      name: "Markdown rendering",
      content: `SELECT md('# ' || item.title), md(item.body) AS rendered
          FROM rayon_rs_rayon_dataset, UNNEST(resolved_issues) AS t(item);`,
      saved: true,
    },
  },
  openQueryIds: ["saved-1", "saved-2"],
  dataSources: {
    "1": { name: "rayon_rs_rayon_dataset" },
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
