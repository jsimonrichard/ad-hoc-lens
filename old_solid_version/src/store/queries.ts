import { type Store, type SetStoreFunction, produce } from "solid-js/store";
import type { AppState, Query } from "./types.js";
import { useStoreContext } from "./index.jsx";

// Must be called before the tab is actually removed from the openQueryIds list
function updateActiveTabOnTabRemoved(
  state: Store<AppState>,
  setState: SetStoreFunction<AppState>,
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
      setState("activeTab", "");
    } else {
      setState("activeTab", state.openQueryIds[1]);
    }
  } else {
    setState("activeTab", state.openQueryIds[pos - 1]);
  }
}

export function useActiveTabSetter() {
  const { setState } = useStoreContext();
  return (tabId: string) => {
    setState("activeTab", tabId);
  };
}

export function useQueryActions() {
  const { state, setState } = useStoreContext();

  return {
    closeQuery: (queryId: string) => {
      updateActiveTabOnTabRemoved(state, setState, queryId);
      setState("openQueryIds", (ids) => ids.filter((id) => id !== queryId));
    },
  };
}

export function useCloseQueryTab() {
  const { state, setState } = useStoreContext();
  const deleteQuery = useDeleteQuery();

  return (queryId: string) => {
    updateActiveTabOnTabRemoved(state, setState, queryId);
    if (!state.queries[queryId].saved) {
      deleteQuery(queryId);
    }
    setState("openQueryIds", (ids) => ids.filter((id) => id !== queryId));
  };
}

export function useDeleteQuery() {
  const { setState } = useStoreContext();

  return (queryId: string) => {
    setState(
      "queries",
      produce((queries) => {
        delete queries[queryId];
      })
    );
  };
}

export function useQuery(id: string | undefined) {
  const { state } = useStoreContext();
  return () => (id ? state.queries[id] : null);
}

export function useUpdateQuery() {
  const { setState } = useStoreContext();
  return (id: string, updates: Partial<Query>) => {
    setState("queries", id, (query) => ({ ...query, ...updates }));
  };
}

export function useOpenQueryIds() {
  const { state } = useStoreContext();
  return () => state.openQueryIds;
}

export function useActiveTab(): [
  () => string | undefined,
  (tabId: string) => void
] {
  const { state, setState } = useStoreContext();
  return [
    () => state.activeTab,
    (tabId: string) => setState("activeTab", tabId),
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
    setState("queries", newId, () => ({
      name: getUntitledName(),
      content: "",
      saved: false,
    }));
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
      setState("openQueryIds", (ids) => [...ids, queryId]);
    }

    // Switch to this query
    setState("activeTab", queryId);
  };
}

export function useQueries() {
  const { state } = useStoreContext();
  return () => state.queries;
}
