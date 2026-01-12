import React from "react";
import type { AppState, Query } from "./types.js";
import { useStoreContext } from "./index.jsx";

// Must be called before the tab is actually removed from the openQueryIds list
function updateActiveTabOnTabRemoved(
  state: AppState,
  setState: React.Dispatch<React.SetStateAction<AppState>>,
  removedQueryId: string
) {
  if (state.activeTab !== removedQueryId) {
    return;
  }
  const pos = state.openQueryIds.indexOf(removedQueryId);

  if (pos === -1) {
    throw new Error(
      `Query not found in openQueryIds. \
      Make sure to call this function before the tab is actually \
      removed from the openQueryIds list.`
    );
  } else if (pos === 0) {
    if (state.openQueryIds.length <= 1) {
      setState((prev) => ({ ...prev, activeTab: "" }));
    } else {
      setState((prev) => ({ ...prev, activeTab: prev.openQueryIds[1] }));
    }
  } else {
    setState((prev) => ({ ...prev, activeTab: prev.openQueryIds[pos - 1] }));
  }
}

export function useActiveTabSetter() {
  const { setState } = useStoreContext();
  return (tabId: string) => {
    setState((prev) => ({ ...prev, activeTab: tabId }));
  };
}

export function useQueryActions() {
  const { state, setState } = useStoreContext();

  return {
    closeQuery: (queryId: string) => {
      updateActiveTabOnTabRemoved(state, setState, queryId);
      setState((prev) => ({
        ...prev,
        openQueryIds: prev.openQueryIds.filter((id) => id !== queryId),
      }));
    },
  };
}

export function useCloseQueryTab() {
  const { state, setState } = useStoreContext();
  const deleteQuery = useDeleteQuery();

  return (queryId: string) => {
    updateActiveTabOnTabRemoved(state, setState, queryId);
    if (!state.queries[queryId]?.saved) {
      deleteQuery(queryId);
    }
    setState((prev) => ({
      ...prev,
      openQueryIds: prev.openQueryIds.filter((id) => id !== queryId),
    }));
  };
}

export function useDeleteQuery() {
  const { setState } = useStoreContext();

  return (queryId: string) => {
    setState((prev) => {
      const queries = { ...prev.queries };
      delete queries[queryId];
      return { ...prev, queries };
    });
  };
}

export function useQuery(id: string | undefined) {
  const { state } = useStoreContext();
  return id ? state.queries[id] : null;
}

export function useUpdateQuery() {
  const { setState } = useStoreContext();
  return (id: string, updates: Partial<Query>) => {
    setState((prev) => ({
      ...prev,
      queries: {
        ...prev.queries,
        [id]: { ...prev.queries[id], ...updates },
      },
    }));
  };
}

export function useOpenQueryIds() {
  const { state } = useStoreContext();
  return state.openQueryIds;
}

export function useActiveTab(): [string | undefined, (tabId: string) => void] {
  const { state, setState } = useStoreContext();
  return [
    state.activeTab,
    (tabId: string) => setState((prev) => ({ ...prev, activeTab: tabId })),
  ];
}

export function useGetUntitledName() {
  const { state } = useStoreContext();
  return () => {
    const untitledPattern = /^Untitled( (\d+))?$/;
    let maxNum = -1;

    for (const queryId in state.queries) {
      const query = state.queries[queryId];
      if (!query.saved) continue;

      const match = query.name.match(untitledPattern);
      if (match) {
        const num = match[1] ? parseInt(match[1], 10) : 0;
        maxNum = Math.max(maxNum, num);
      }
    }

    return maxNum === -1 ? "Untitled" : `Untitled ${maxNum + 1}`;
  };
}

export function useCreateUnsavedQuery() {
  const { setState } = useStoreContext();
  const getUntitledName = useGetUntitledName();

  return () => {
    const newId = `query${Date.now()}`;
    setState((prev) => ({
      ...prev,
      queries: {
        ...prev.queries,
        [newId]: {
          name: getUntitledName(),
          content: "",
          saved: false,
        },
      },
    }));
    return newId;
  };
}

export function useCreateAndOpenUnsavedQuery() {
  const { setState } = useStoreContext();

  return () => {
    const newId = `query${Date.now()}`;
    setState((prev) => {
      // Calculate untitled name from previous state
      const untitledPattern = /^Untitled( (\d+))?$/;
      let maxNum = -1;

      for (const queryId in prev.queries) {
        const query = prev.queries[queryId];
        if (!query.saved) continue;

        const match = query.name.match(untitledPattern);
        if (match) {
          const num = match[1] ? parseInt(match[1], 10) : 0;
          maxNum = Math.max(maxNum, num);
        }
      }

      const untitledName =
        maxNum === -1 ? "Untitled" : `Untitled ${maxNum + 1}`;

      // Create the query and open it in a single state update
      const newOpenQueryIds = prev.openQueryIds.includes(newId)
        ? prev.openQueryIds
        : [...prev.openQueryIds, newId];

      return {
        ...prev,
        queries: {
          ...prev.queries,
          [newId]: {
            name: untitledName,
            content: "",
            saved: false,
          },
        },
        openQueryIds: newOpenQueryIds,
        activeTab: newId,
      };
    });
    return newId;
  };
}

export function useOpenQuery() {
  const { state, setState } = useStoreContext();
  return (queryId: string) => {
    // Check if query exists
    const query = state.queries[queryId];
    if (!query) return;

    // Add to openQueryIds if not already open
    if (!state.openQueryIds.includes(queryId)) {
      setState((prev) => ({
        ...prev,
        openQueryIds: [...prev.openQueryIds, queryId],
      }));
    }

    // Switch to this query
    setState((prev) => ({ ...prev, activeTab: queryId }));
  };
}

export function useQueries() {
  const { state } = useStoreContext();
  return state.queries;
}
