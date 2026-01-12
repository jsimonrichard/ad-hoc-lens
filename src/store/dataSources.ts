import type { DataSource } from "./types.js";
import { useStoreContext } from "./index.jsx";

export function useDataSource(id: string | undefined) {
  const { state } = useStoreContext();
  return id ? state.dataSources[id] : undefined;
}

export function useDataSources() {
  const { state } = useStoreContext();
  return state.dataSources;
}

export function useAddDataSource() {
  const { setState } = useStoreContext();
  return (id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      dataSources: {
        ...prev.dataSources,
        [id]: { name },
      },
    }));
  };
}

export function useUpdateDataSource() {
  const { setState } = useStoreContext();
  return (id: string, updates: Partial<DataSource>) => {
    setState((prev) => ({
      ...prev,
      dataSources: {
        ...prev.dataSources,
        [id]: { ...prev.dataSources[id], ...updates },
      },
    }));
  };
}

export function useDeleteDataSource() {
  const { setState } = useStoreContext();
  return (id: string) => {
    setState((prev) => {
      const dataSources = { ...prev.dataSources };
      delete dataSources[id];
      return { ...prev, dataSources };
    });
  };
}
