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
  return (
    id: string,
    name: string,
    metadata?: {
      type?: "sqlite" | "regular";
      tables?: string[];
      schemaName?: string;
    }
  ) => {
    setState((prev) => {
      let dataSource: DataSource;
      if (
        metadata?.type === "sqlite" &&
        metadata.tables &&
        metadata.schemaName
      ) {
        dataSource = {
          type: "sqlite",
          name,
          tables: metadata.tables,
          schemaName: metadata.schemaName,
        };
      } else {
        dataSource = {
          type: "regular",
          name,
        };
      }
      return {
        ...prev,
        dataSources: {
          ...prev.dataSources,
          [id]: dataSource,
        },
      };
    });
  };
}

export function useUpdateDataSource() {
  const { setState } = useStoreContext();
  return (id: string, updates: { name: string }) => {
    setState((prev) => {
      const existing = prev.dataSources[id];
      if (!existing) return prev;

      // For discriminated unions, preserve the type and only update the name
      if (existing.type === "sqlite") {
        return {
          ...prev,
          dataSources: {
            ...prev.dataSources,
            [id]: {
              type: "sqlite",
              name: updates.name,
              tables: existing.tables,
              schemaName: existing.schemaName,
            },
          },
        };
      } else {
        return {
          ...prev,
          dataSources: {
            ...prev.dataSources,
            [id]: {
              type: "regular",
              name: updates.name,
            },
          },
        };
      }
    });
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
