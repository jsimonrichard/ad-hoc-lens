export type DataSource =
  | {
      type: "regular";
      name: string;
    }
  | {
      type: "sqlite";
      name: string;
      tables: string[];
      schemaName: string;
    };

export interface Query {
  name: string;
  content: string;
  saved?: boolean;
}

export interface AppState {
  activeTab?: string;
  queries: Record<string, Query>;
  openQueryIds: string[];
  dataSources: Record<string, DataSource>;
}
