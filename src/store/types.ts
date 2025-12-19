export interface DataSource {
  name: string;
}

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
