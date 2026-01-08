import type { DataSource } from "./types.js";
import { useStoreContext } from "./index.jsx";
import { produce } from "solid-js/store";

export function useDataSource(id: string | undefined) {
  const { state } = useStoreContext();
  return () => (id ? state.dataSources[id] : undefined);
}

export function useDataSources() {
  const { state } = useStoreContext();
  return () => state.dataSources;
}

export function useAddDataSource() {
  const { setState } = useStoreContext();
  return (id: string, name: string) => {
    setState("dataSources", id, () => ({ name }));
  };
}

export function useUpdateDataSource() {
  const { setState } = useStoreContext();
  return (id: string, updates: Partial<DataSource>) => {
    setState("dataSources", id, () => updates);
  };
}

export function useDeleteDataSource() {
  const { setState } = useStoreContext();
  return (id: string) => {
    setState(
      "dataSources",
      produce((dataSources) => {
        delete dataSources[id];
      })
    );
  };
}
