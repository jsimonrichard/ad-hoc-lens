## UI/UX

- Sidebar
  - Add data source form with open file dialog
  - Data source stats (they're schema-less, at least for now)\
  - Resizable
- Main window
  - Drag-n-Drop tabs
  - [x] Use codemirror for SQL editor
  - Markdown output view
  - Drag-n-Drop table names (into codemirror editor)
- [/] Tutorial pop-up
- Queries sidebar should scroll
- No need for data source drop down
- Create new `select * from ...` query when clicking on a data source
- Make UI more compact

## DB stuff

- Set up DuckDB with the markdown function and "rehydrating" from IndexedDB (idb package?)
- Load tables into the DB, maintaining a map of table names
- Use codemirror to provide autocomplete for the tables

## Immediate

- [x] Way to reset state during dev
- [x] Dialog asking about starting with demo data
- Way to retrieve demo data separately
- Better demo data?

- Switch to React :( for the sake of velocity
