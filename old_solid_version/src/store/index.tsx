import { createStore, type Store, type SetStoreFunction } from "solid-js/store";
import {
  createEffect,
  createContext,
  useContext,
  type Component,
  type ParentProps,
} from "solid-js";
import type { AppState } from "./types";
import { loadState, STORAGE_KEY } from "./start";

export type { AppState, Query, DataSource } from "./types";

// Internal context that exposes state and setState
interface StoreContextValue {
  state: Store<AppState>;
  setState: SetStoreFunction<AppState>;
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
        console.log(
          "Effect: Setting activeTab to first open tab",
          openIds[0],
          "from",
          activeTabValue
        );
        setState("activeTab", openIds[0]);
      }
    } else if (activeTabValue) {
      // If there are no open tabs but activeTab is set, clear it
      console.log("Effect: Clearing activeTab (no open tabs)");
      setState("activeTab", "");
    }
  });

  return (
    <StoreContext.Provider value={{ state, setState }}>
      {props.children}
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
